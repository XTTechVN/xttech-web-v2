import { MullionInfo, SceneCellNode } from '../studio-types';
import { ensureRootCellDimensions, findEnclosingFrameUnit, findNode, hasFrameMullionBetween, isSlidingClusterNode, resolveFlatSashMullionPositions } from './door-tree-utils';

export type MullionReferenceMode = 'from_start' | 'from_ref_mullion' | 'from_end';

export interface MullionReferenceCandidate {
  id: string; coord: number; label: string; segmentCount: number;
  spansFullPerp: boolean; perpIntervals: Array<{ start: number; end: number }>;
}

export interface MullionReferenceContext {
  scopeType: 'frame_unit' | 'sash'; scopeLabel: string;
  scopeSpan: number; scopePerpSpan: number; direction: 'vertical' | 'horizontal';
  isSashMullion: boolean; isFlatSashMullion: boolean;
  leftCellStart: number; rightCellEnd: number;
  leftDim: number; rightDim: number; pairTotal: number; minDim: number;
  currentPos: number; absMinPos: number; absMaxPos: number;
  targetPerpStart: number; targetPerpEnd: number;
  refMullions: MullionReferenceCandidate[];
  defaultMode: MullionReferenceMode; defaultRefId: string | null;
}

export interface MullionReferenceRange { minInput: number; maxInput: number; anchorPos: number; isAlignedZeroPossible: boolean; }

interface BoxRect { x: number; y: number; w: number; h: number; }
interface RawBarSample { id: string; coord: number; perpStart: number; perpEnd: number; }
interface TargetGeometry { leftCellStart: number; leftDim: number; rightDim: number; perpStart: number; perpEnd: number; }

export function formatReferenceValue(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const rounded = Math.round(value * 100) / 100;
  return Math.abs(rounded) < 1e-9 ? 0 : rounded;
}

function findNodePath(curr: SceneCellNode, targetId: string, path: SceneCellNode[] = []): SceneCellNode[] | null {
  const nextPath = [...path, curr];
  if (curr.id === targetId) return nextPath;
  for (const child of curr.children || []) {
    const found = findNodePath(child, targetId, nextPath);
    if (found) return found;
  }
  return null;
}

function resolveChildBoxes(node: SceneCellNode, box: BoxRect): BoxRect[] {
  const children = node.children || [];
  if (children.length === 0) return [];
  const isVert = node.splitDirection === 'vertical';
  if (!isVert && node.splitDirection !== 'horizontal') return children.map(() => ({ ...box }));

  const boxSpan = isVert ? box.w : box.h;
  const rawSpans = children.map((c) => { const v = isVert ? c.w : c.h; return Number.isFinite(v) && v > 0 ? v : 1; });
  const total = rawSpans.reduce((s, v) => s + v, 0);
  const needsScale = total > 0 && Math.abs(total - boxSpan) >= 1e-6;
  const scale = needsScale ? boxSpan / total : 1;
  let cursor = isVert ? box.x : box.y;
  return children.map((_, idx) => {
    const span = needsScale && idx === children.length - 1
      ? Math.max(0.01, (isVert ? box.x : box.y) + boxSpan - cursor) : rawSpans[idx] * scale;
    const childBox = isVert ? { x: cursor, y: box.y, w: span, h: box.h } : { x: box.x, y: cursor, w: box.w, h: span };
    cursor += span;
    return childBox;
  });
}

function collectScopeBarsAndTarget(
  scopeRoot: SceneCellNode, parentNodeId: string, mullionIndex: number,
  targetDir: 'vertical' | 'horizontal', isSashMullion: boolean, isFlatSashMullion: boolean
): { bars: RawBarSample[]; target: TargetGeometry | null } {
  const isVert = targetDir === 'vertical';
  const bars: RawBarSample[] = [];
  let target: TargetGeometry | null = null;

  const visit = (curr: SceneCellNode, box: BoxRect) => {
    const perpStart = isVert ? box.y : box.x;
    const perpEnd = perpStart + (isVert ? box.h : box.w);
    const hasChildren = Boolean(curr.children && curr.children.length > 0);
    const childBoxes = hasChildren ? resolveChildBoxes(curr, box) : [];

    if (curr.id === parentNodeId) {
      if (isFlatSashMullion && !hasChildren && curr.sashMullions && curr.sashMullions.count > 1) {
        const flatPos = resolveFlatSashMullionPositions(curr);
        if (mullionIndex >= 0 && mullionIndex + 1 < flatPos.length) {
          const offset = flatPos.slice(0, mullionIndex).reduce((s, v) => s + v, 0);
          target = { leftCellStart: (isVert ? box.x : box.y) + offset, leftDim: flatPos[mullionIndex], rightDim: flatPos[mullionIndex + 1], perpStart, perpEnd };
        }
      } else if (hasChildren && curr.children && mullionIndex >= 0 && mullionIndex + 1 < curr.children.length) {
        const c1 = childBoxes[mullionIndex], c2 = childBoxes[mullionIndex + 1];
        target = { leftCellStart: isVert ? c1.x : c1.y, leftDim: isVert ? c1.w : c1.h, rightDim: isVert ? c2.w : c2.h, perpStart, perpEnd };
      }
    }

    if (isSashMullion) {
      if (curr.splitType === 'sash_mullion' && hasChildren && curr.children) {
        if (curr.splitDirection === targetDir) {
          for (let i = 0; i < curr.children.length - 1; i++) {
            const coord = isVert ? childBoxes[i].x + childBoxes[i].w : childBoxes[i].y + childBoxes[i].h;
            bars.push({ id: `${curr.id}-sm-${i}`, coord: formatReferenceValue(coord), perpStart, perpEnd });
          }
        }
        curr.children.forEach((child, idx) => visit(child, childBoxes[idx]));
      } else if (!hasChildren && curr.sashMullions && curr.sashMullions.count > 1 && (curr.sashMullions.direction || 'vertical') === targetDir) {
        const flatPos = resolveFlatSashMullionPositions(curr);
        let acc = isVert ? box.x : box.y;
        for (let i = 0; i < flatPos.length - 1; i++) {
          acc += flatPos[i];
          bars.push({ id: `${curr.id}-sm-bar-${i}`, coord: formatReferenceValue(acc), perpStart, perpEnd });
        }
      }
      return;
    }

    if (!hasChildren || !curr.children || curr.splitType === 'coupling' || curr.splitType === 'sash_mullion' || curr.splitType === 'sash_pair' || curr.sashType === 'swing_double' || isSlidingClusterNode(curr)) return;
    if (curr.splitDirection === targetDir) {
      for (let i = 0; i < curr.children.length - 1; i++) {
        if (hasFrameMullionBetween(curr, curr.children[i], curr.children[i + 1])) {
          const coord = isVert ? childBoxes[i].x + childBoxes[i].w : childBoxes[i].y + childBoxes[i].h;
          bars.push({ id: `${curr.id}-mullion-${i}`, coord: formatReferenceValue(coord), perpStart, perpEnd });
        }
      }
    }
    curr.children.forEach((child, idx) => visit(child, childBoxes[idx]));
  };

  visit(scopeRoot, { x: 0, y: 0, w: scopeRoot.w, h: scopeRoot.h });
  return { bars, target };
}

function mergePerpIntervals(intervals: Array<{ start: number; end: number }>): Array<{ start: number; end: number }> {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const merged = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const prev = merged[merged.length - 1];
    if (sorted[i].start <= prev.end + 1) prev.end = Math.max(prev.end, sorted[i].end);
    else merged.push({ ...sorted[i] });
  }
  return merged;
}

function clusterReferenceCandidates(
  bars: RawBarSample[], target: TargetGeometry, currentPos: number,
  direction: 'vertical' | 'horizontal', isSashMullion: boolean, scopePerpSpan: number
): MullionReferenceCandidate[] {
  const clusters: RawBarSample[][] = [];
  for (const bar of bars.filter((b) => b.coord < currentPos - 0.5).sort((a, b) => b.coord - a.coord)) {
    const lastCluster = clusters[clusters.length - 1];
    if (lastCluster && Math.abs(bar.coord - lastCluster[0].coord) < 1) lastCluster.push(bar);
    else clusters.push([bar]);
  }
  const noun = isSashMullion ? 'Đố cánh' : 'Đố';
  return clusters.map((cluster) => {
    const rep = [...cluster].sort((a, b) => {
      const matchDiff = (Math.abs(b.coord - target.leftCellStart) < 1 ? 1 : 0) - (Math.abs(a.coord - target.leftCellStart) < 1 ? 1 : 0);
      if (matchDiff !== 0) return matchDiff;
      const ovDiff = Math.max(0, Math.min(b.perpEnd, target.perpEnd) - Math.max(b.perpStart, target.perpStart))
        - Math.max(0, Math.min(a.perpEnd, target.perpEnd) - Math.max(a.perpStart, target.perpStart));
      return Math.abs(ovDiff) > 1e-6 ? ovDiff : (b.perpEnd - b.perpStart) - (a.perpEnd - a.perpStart);
    })[0];
    const perpIntervals = mergePerpIntervals(cluster.map((b) => ({ start: formatReferenceValue(b.perpStart), end: formatReferenceValue(b.perpEnd) })));
    const spansFullPerp = perpIntervals.reduce((s, iv) => s + (iv.end - iv.start), 0) >= scopePerpSpan - 2;
    const spanText = spansFullPerp ? (direction === 'vertical' ? 'suốt chiều cao' : 'suốt chiều rộng')
      : cluster.length > 1 ? `${cluster.length} đoạn` : `${perpIntervals[0].start}–${perpIntervals[perpIntervals.length - 1].end} mm`;
    const edgeTag = Math.abs(rep.coord - target.leftCellStart) < 1 ? ' • Biên ô' : '';
    return { id: rep.id, coord: rep.coord, label: `${noun} tại ${rep.coord} mm (${spanText})${edgeTag}`, segmentCount: cluster.length, spansFullPerp, perpIntervals };
  });
}

export function computeMullionReferenceContext(
  rootCell: SceneCellNode, w: number, h: number, mullion: MullionInfo
): MullionReferenceContext | null {
  const normalizedRoot = ensureRootCellDimensions(rootCell, w, h);
  const parentNode = findNode(normalizedRoot, mullion.parentNodeId);
  if (!parentNode) return null;

  const hasChildren = Boolean(parentNode.children && parentNode.children.length > 0);
  const isFlatSashMullion = !hasChildren && parentNode.splitType !== 'sash_mullion' && Boolean(parentNode.sashMullions && parentNode.sashMullions.count > 1);
  const isSash = parentNode.splitType === 'sash_mullion' || isFlatSashMullion || mullion.id.includes('-sm-');
  const path = findNodePath(normalizedRoot, parentNode.id);
  if (!path) return null;

  let scopeRoot: SceneCellNode, scopeLabel: string;
  if (isSash) {
    let idx = path.length - 1;
    while (idx > 0 && path[idx - 1].splitType === 'sash_mullion') idx -= 1;
    scopeRoot = path[idx];
    scopeLabel = `Cánh cửa (${formatReferenceValue(scopeRoot.w)}×${formatReferenceValue(scopeRoot.h)} mm)`;
  } else {
    const unitInfo = findEnclosingFrameUnit(normalizedRoot, parentNode.id);
    if (!unitInfo) return null;
    scopeRoot = unitInfo.unitNode;
    scopeLabel = unitInfo.unitLabel;
  }

  const isVert = mullion.direction === 'vertical';
  const scopeSpan = formatReferenceValue(isVert ? scopeRoot.w : scopeRoot.h);
  const scopePerpSpan = formatReferenceValue(isVert ? scopeRoot.h : scopeRoot.w);
  const { bars, target } = collectScopeBarsAndTarget(scopeRoot, parentNode.id, mullion.mullionIndex, mullion.direction, isSash, isFlatSashMullion);
  if (!target) return null;

  const leftCellStart = formatReferenceValue(target.leftCellStart);
  const leftDim = formatReferenceValue(target.leftDim), rightDim = formatReferenceValue(target.rightDim);
  const pairTotal = formatReferenceValue(target.leftDim + target.rightDim);
  const rightCellEnd = formatReferenceValue(target.leftCellStart + target.leftDim + target.rightDim);
  const currentPos = formatReferenceValue(target.leftCellStart + target.leftDim);
  const minDim = Math.min(Math.floor(pairTotal / 2), Math.min(50, Math.max(20, Math.floor(pairTotal * 0.15))));
  const absMinPos = formatReferenceValue(leftCellStart + minDim), absMaxPos = formatReferenceValue(rightCellEnd - minDim);
  const refMullions = clusterReferenceCandidates(bars, target, currentPos, mullion.direction, isSash, scopePerpSpan);
  const matchedEdgeRef = leftCellStart > 0.5 ? refMullions.find((c) => Math.abs(c.coord - leftCellStart) < 1) : undefined;
  return {
    scopeType: isSash ? 'sash' : 'frame_unit', scopeLabel, scopeSpan, scopePerpSpan, direction: mullion.direction,
    isSashMullion: isSash, isFlatSashMullion, leftCellStart, rightCellEnd, leftDim, rightDim, pairTotal, minDim, currentPos,
    absMinPos, absMaxPos, targetPerpStart: formatReferenceValue(target.perpStart), targetPerpEnd: formatReferenceValue(target.perpEnd),
    refMullions, defaultMode: matchedEdgeRef ? 'from_ref_mullion' : 'from_start', defaultRefId: matchedEdgeRef ? matchedEdgeRef.id : (refMullions[0]?.id ?? null),
  };
}
const findSelectedRef = (ctx: MullionReferenceContext, refId?: string | null) =>
  (refId ? ctx.refMullions.find((c) => c.id === refId) : undefined) ?? ctx.refMullions[0];
export function computeDistanceForMode(pos: number, mode: MullionReferenceMode, ctx: MullionReferenceContext, refId?: string | null): number {
  if (mode === 'from_start') return formatReferenceValue(pos);
  if (mode === 'from_end') return formatReferenceValue(ctx.scopeSpan - pos);
  return formatReferenceValue(pos - (findSelectedRef(ctx, refId)?.coord ?? 0));
}
export function computeRangeForMode(mode: MullionReferenceMode, ctx: MullionReferenceContext, refId?: string | null): MullionReferenceRange {
  if (mode === 'from_start') return { minInput: formatReferenceValue(ctx.absMinPos), maxInput: formatReferenceValue(ctx.absMaxPos), anchorPos: 0, isAlignedZeroPossible: false };
  if (mode === 'from_end') return { minInput: formatReferenceValue(Math.max(0, ctx.scopeSpan - ctx.absMaxPos)), maxInput: formatReferenceValue(Math.max(0, ctx.scopeSpan - ctx.absMinPos)), anchorPos: ctx.scopeSpan, isAlignedZeroPossible: false };
  const ref = findSelectedRef(ctx, refId);
  const anchorPos = ref ? ref.coord : 0;
  const rawMin = Math.max(0, ctx.absMinPos - anchorPos), rawMax = Math.max(0, ctx.absMaxPos - anchorPos);
  return { minInput: formatReferenceValue(Math.min(rawMin, rawMax)), maxInput: formatReferenceValue(rawMax), anchorPos, isAlignedZeroPossible: Boolean(ref && anchorPos >= ctx.absMinPos - 1e-6 && anchorPos <= ctx.absMaxPos + 1e-6) };
}
export function resolveRawTargetPosFromInput(inputVal: number, mode: MullionReferenceMode, ctx: MullionReferenceContext, refId?: string | null): number {
  if (mode === 'from_start') return formatReferenceValue(inputVal);
  if (mode === 'from_end') return formatReferenceValue(ctx.scopeSpan - inputVal);
  return formatReferenceValue((findSelectedRef(ctx, refId)?.coord ?? 0) + inputVal);
}
export function resolveTargetPosFromInput(inputVal: number, mode: MullionReferenceMode, ctx: MullionReferenceContext, refId?: string | null): number {
  return formatReferenceValue(Math.max(ctx.absMinPos, Math.min(ctx.absMaxPos, resolveRawTargetPosFromInput(inputVal, mode, ctx, refId))));
}
