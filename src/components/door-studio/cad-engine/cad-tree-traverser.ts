import { ProfileBar } from '@/types/profile';
import {
  SceneCellNode,
  MullionInfo,
  FrameConfig,
  SashConfig,
  ProfileIdRef,
  normalizeMullionCutType,
  resolveMullionCutEnds,
} from '../studio-types';
import { FrameBox, MullionBar, LeafCell, CouplingSeamBar, VerticalSlice, EdgeThickness, CadMetrics, BottomBarSegment } from './cad-types';
import { BottomOpenRange } from '../studio-types';
import {
  BottomOpenPlan,
  resolveBottomOpenPlan,
  resolveCellReversal,
  findEdgeBottomLeafId,
  resolveFrameUnitOverrideMetrics,
  resolveLeafOverrideMetrics,
} from './cad-cell-config-resolver';
import { computeSlidingSashes } from './cad-geometry';
import { resolveLeafGeometry } from './cad-leaf-geometry';
import { buildSashSubPanes } from './cad-leaf-subpanes';

export interface BottomSill {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CadLayoutResult {
  frames: FrameBox[];
  mullions: MullionBar[];
  couplingSeams: CouplingSeamBar[];
  leaves: LeafCell[];
  bottomSills?: BottomSill[];
  /** Hở đáy hiệu lực ở cấp khung bao (đã tính ghi đè từng ô) */
  isOpenBottom?: boolean;
  /** Cửa Hở đáy từng phần: chỉ dựng các đoạn thanh khung đáy trong `bottomBarSegments` */
  isPartialBottomOpen?: boolean;
  isLeftBottomOpen?: boolean;
  isRightBottomOpen?: boolean;
  bottomOpenRanges?: BottomOpenRange[];
  bottomBarSegments?: BottomBarSegment[];
}

/**
 * Trích xuất danh sách các phân đoạn dọc (cột) trong cây layout
 * Phục vụ đo kích thước phụ từng cánh/ô ở cạnh đáy
 */
export const getVerticalSlices = (rootCell: SceneCellNode): VerticalSlice[] => {
  const totalW = rootCell.w || 1;
  const markers: { x: number; type: 'mullion' | 'sash' | 'sash_mullion'; nodeId?: string }[] = [];
  const knownNodes: {
    id: string;
    xStart: number;
    xEnd: number;
    w: number;
    isVertSplitChild: boolean;
    depth: number;
  }[] = [];

  const traverse = (
    node: SceneCellNode,
    xStart: number,
    xEnd: number,
    isVertSplitChild = false,
    depth = 0
  ) => {
    const span = xEnd - xStart;
    if (span <= 0) return;

    // Ghi nhận phạm vi tọa độ của ô này (lưu span thực tế và cờ con trực tiếp của phép chia dọc)
    knownNodes.push({
      id: node.id,
      xStart,
      xEnd,
      w: span,
      isVertSplitChild,
      depth,
    });

    // 1. Phân chia đố khung theo phương dọc
    if (node.splitDirection === 'vertical' && node.children && node.children.length > 1) {
      const count = node.children.length;
      const totalWeight = node.children.reduce((sum, c) => sum + (c.w || 1), 0);
      let cur = xStart;

      node.children.forEach((child, idx) => {
        const isLast = idx === count - 1;
        const weight = child.w || 1;
        const ratio = totalWeight > 0 ? weight / totalWeight : 1 / count;
        const cw = isLast ? xEnd - cur : Math.round(span * ratio);

        if (idx < count - 1) {
          markers.push({ x: cur + cw, type: 'mullion', nodeId: child.id });
        }

        traverse(child, cur, cur + cw, true, depth + 1);
        cur += cw;
      });
      return;
    }

    // 2. Phân chia đố khung theo phương ngang: các con chia sẻ cùng dải [xStart, xEnd]
    if (node.splitDirection === 'horizontal' && node.children && node.children.length > 1) {
      for (const child of node.children) {
        traverse(child, xStart, xEnd, false, depth + 1);
      }
      return;
    }

    // 3. Phân chia đố cánh (sash_mullion)
    if (node.splitType === 'sash_mullion' && node.children && node.children.length > 1) {
      if (node.splitDirection === 'vertical') {
        const count = node.children.length;
        const totalWeight = node.children.reduce((sum, c) => sum + (c.w || 1), 0);
        let cur = xStart;

        node.children.forEach((child, idx) => {
          const isLast = idx === count - 1;
          const weight = child.w || 1;
          const ratio = totalWeight > 0 ? weight / totalWeight : 1 / count;
          const cw = isLast ? xEnd - cur : Math.round(span * ratio);

          if (idx < count - 1) {
            markers.push({ x: cur + cw, type: 'sash_mullion', nodeId: child.id });
          }

          traverse(child, cur, cur + cw, true, depth + 1);
          cur += cw;
        });
        return;
      }
    }

    // 4. Các kiểu cánh có nhiều cánh (sash boundaries)
    // 4.1 Cửa 2 cánh mở quay / lùa 2 cánh / sash_pair
    if (
      node.sashType === 'swing_double' ||
      node.sashType === 'sliding_2' ||
      node.splitType === 'sash_pair'
    ) {
      const mid = xStart + Math.round(span / 2);
      markers.push({ x: mid, type: 'sash', nodeId: node.id });
    } else if (node.sashType === 'sliding_4' || node.sashType === 'folding_4') {
      // 4.2 Cửa 4 cánh (lùa 4 cánh, xếp trượt 4 cánh)
      markers.push({ x: xStart + Math.round(span * 0.25), type: 'sash', nodeId: node.id });
      markers.push({ x: xStart + Math.round(span * 0.5), type: 'sash', nodeId: node.id });
      markers.push({ x: xStart + Math.round(span * 0.75), type: 'sash', nodeId: node.id });
    } else if (node.sashType === 'folding_6') {
      for (let i = 1; i <= 5; i++) {
        markers.push({ x: xStart + Math.round((span * i) / 6), type: 'sash', nodeId: node.id });
      }
    }

    // 4.3 Đố cánh bên trong cánh đơn (sashMullions)
    if (node.sashMullions?.direction === 'vertical' && node.sashMullions.count > 1) {
      const count = node.sashMullions.count;
      const positions = node.sashMullions.positions;
      let cur = xStart;
      for (let i = 0; i < count - 1; i++) {
        const segW = positions && positions.length === count ? positions[i] : Math.round(span / count);
        cur += segW;
        markers.push({ x: cur, type: 'sash_mullion', nodeId: node.id });
      }
    }

    // 5. Nếu có con thông thường khác
    if (node.children && node.children.length > 0) {
      const childIsVert = node.splitDirection === 'vertical';
      for (const child of node.children) {
        traverse(child, xStart, xEnd, childIsVert, depth + 1);
      }
    }
  };

  traverse(rootCell, 0, totalW, false, 0);

  // Thu thập và loại bỏ các mốc trùng lặp (hoặc chênh lệch <= 3mm)
  const rawCoords = [0, totalW, ...markers.map((m) => m.x)];
  rawCoords.sort((a, b) => a - b);

  const cleanCoords: number[] = [0];
  for (const c of rawCoords) {
    const prev = cleanCoords[cleanCoords.length - 1];
    if (c - prev > 3) {
      cleanCoords.push(c);
    }
  }
  if (cleanCoords[cleanCoords.length - 1] !== totalW) {
    if (totalW - cleanCoords[cleanCoords.length - 1] <= 3) {
      cleanCoords[cleanCoords.length - 1] = totalW;
    } else {
      cleanCoords.push(totalW);
    }
  }

  if (cleanCoords.length <= 1) return [];

  // Tạo các phân đoạn (slices)
  const slices: VerticalSlice[] = [];
  for (let i = 0; i < cleanCoords.length - 1; i++) {
    const sStart = cleanCoords[i];
    const sEnd = cleanCoords[i + 1];
    const segW = sEnd - sStart;

    // Tìm ô khớp trọn vẹn với phân đoạn [sStart, sEnd]:
    // Ưu tiên node là con trực tiếp của phép chia dọc (isVertSplitChild = true)
    // để không chọn nhầm các hàng con chia ngang bên trong cột đó.
    const matchingNodes = knownNodes.filter(
      (n) => Math.abs(n.xStart - sStart) <= 2 && Math.abs(n.xEnd - sEnd) <= 2
    );
    matchingNodes.sort((a, b) => {
      if (a.isVertSplitChild !== b.isVertSplitChild) {
        return a.isVertSplitChild ? -1 : 1;
      }
      if (a.depth !== b.depth) {
        return a.depth - b.depth;
      }
      return a.w - b.w;
    });
    const bestNode = matchingNodes[0];

    slices.push({
      id: bestNode ? bestNode.id : `${rootCell.id}-slice-${i}`,
      w: segW,
      xStart: sStart,
      xEnd: sEnd,
      isHybrid: !bestNode,
      editableCellId: bestNode ? bestNode.id : undefined,
    });
  }

  return slices;
};

export const getHorizontalSlices = (node: SceneCellNode): SceneCellNode[] => {
  // 1. Phân chia ngang trực tiếp (horizontal split)
  if (node.splitDirection === 'horizontal' && node.children && node.children.length > 1) {
    const result: SceneCellNode[] = [];
    for (const c of node.children) {
      const sub = getHorizontalSlices(c);
      if (sub.length > 0) {
        result.push(...sub);
      } else if (c.sashMullions?.direction === 'horizontal' && c.sashMullions.count > 1) {
        const count = c.sashMullions.count;
        const positions = c.sashMullions.positions;
        let sum = 0;
        for (let i = 0; i < count; i++) {
          const sh = positions && positions.length === count ? positions[i] : (i === count - 1 ? c.h - sum : Math.round(c.h / count));
          sum += sh;
          result.push({ ...c, id: `${c.id}-sm-${i}`, h: sh });
        }
      } else {
        result.push(c);
      }
    }
    return result;
  }

  // 2. Nếu nút này chia dọc, tìm nhánh con có nhiều phân chia ngang nhất
  if (node.splitDirection === 'vertical' && node.children && node.children.length > 1) {
    let best: SceneCellNode[] = [];
    for (const c of node.children) {
      const sub = getHorizontalSlices(c);
      if (sub.length > best.length) {
        best = sub;
      }
    }
    if (best.length > 0) return best;
  }

  // 3. Nếu nút này có chia đố cánh theo phương ngang
  if (node.sashMullions?.direction === 'horizontal' && node.sashMullions.count > 1) {
    const count = node.sashMullions.count;
    const positions = node.sashMullions.positions;
    let sum = 0;
    const result: SceneCellNode[] = [];
    for (let i = 0; i < count; i++) {
      const sh = positions && positions.length === count ? positions[i] : (i === count - 1 ? node.h - sum : Math.round(node.h / count));
      sum += sh;
      result.push({ ...node, id: `${node.id}-sm-${i}`, h: sh });
    }
    return result;
  }

  if (node.children) {
    for (const c of node.children) {
      const found = getHorizontalSlices(c);
      if (found.length > 0) return found;
    }
  }

  return [];
};

/**
 * Duyệt đệ quy cây SceneCellNode để tính toán tọa độ SVG cho khung (Frame), đố (Mullion) và ô lá (Leaf)
 */
export const buildCadLayout = (
  rootCell: SceneCellNode,
  ox: number,
  oy: number,
  fw: number,
  fh: number,
  frameD: number,
  mullionT: number,
  options?: {
    /** Độ dày thật từng cạnh khung bao (bản vẽ 2D tỉ lệ thực). Không truyền = dùng `frameD` đồng nhất (hành vi cũ, dùng cho 3D) */
    frameEdges?: EdgeThickness;
    isOpenBottom?: boolean;
    isHydraulic?: boolean;
    vertMullionT?: number;
    horizMullionT?: number;
    frameConfig?: FrameConfig;
    sashConfig?: SashConfig;
    slidingOverlapPx?: number;
    availableProfiles?: ProfileBar[];
    scale?: number;
    /** Quy đổi mã thanh REVERSAL của ô (ghi đè) sang bề rộng px; không truyền = ô không có reversalD riêng */
    resolveReversalPx?: (profileId?: ProfileIdRef | null) => number;
  }
): CadLayoutResult => {
  const frames: FrameBox[] = [];
  const mullions: MullionBar[] = [];
  const couplingSeams: CouplingSeamBar[] = [];
  const leaves: LeafCell[] = [];
  const bottomSills: BottomSill[] = [];

  const isDoorHydraulic = Boolean(options?.isHydraulic || rootCell.isHydraulic);
  const isGlobalOpenBottom = options?.isOpenBottom !== undefined ? Boolean(options.isOpenBottom) : Boolean(isDoorHydraulic);
  const bottomPlan = resolveBottomOpenPlan(rootCell, isGlobalOpenBottom);
  const isOpenBottomDoor = bottomPlan.isOpenBottom;
  const isPartialBottomOpen = bottomPlan.mode === 'partial';

  // Tỉ lệ thực (2D): độ dày từng cạnh khung + số thực. Không truyền frameEdges: giữ hành vi cũ (đồng nhất, làm tròn) cho 3D.
  const isRealProportion = options?.frameEdges !== undefined;
  const frameEdges: EdgeThickness = options?.frameEdges ?? { top: frameD, right: frameD, bottom: frameD, left: frameD };
  const layoutScale = options?.scale ?? (isRealProportion ? fw / Math.max(1, rootCell.w || fw) : 1);
  const snap = (value: number): number => (isRealProportion ? value : Math.round(value));

  interface FrameUnitBounds {
    unitNode: SceneCellNode;
    x: number;
    y: number;
    w: number;
    h: number;
    fLeft: number;
    fRight: number;
    fTop: number;
    fBot: number;
    unitEdges: EdgeThickness;
    unitBottomPlan: BottomOpenPlan;
    mullionProfileIdOverride?: ProfileIdRef;
    vertMullionPx?: number;
    horizMullionPx?: number;
  }

  const unitLeafMap = new Map<string, LeafCell[]>();

  const traverse = (
    node: SceneCellNode,
    x: number,
    y: number,
    wBox: number,
    hBox: number,
    isFrameUnit: boolean,
    frameBounds?: FrameUnitBounds,
    refBox?: { x: number; y: number; w: number; h: number }
  ) => {
    // 1. Frame Coupling: Mỗi nhánh con là 1 module khung độc lập ghép lại
    if (node.splitType === 'coupling' && node.children && node.children.length > 0) {
      const isVert = node.splitDirection === 'vertical';
      const count = node.children.length;
      const totalWeight = node.children.reduce((sum, c) => sum + ((isVert ? c.w : c.h) || 1), 0);

      let cur = 0;
      node.children.forEach((child, idx) => {
        const isLast = idx === count - 1;
        const weight = (isVert ? child.w : child.h) || 1;
        const ratio = totalWeight > 0 ? weight / totalWeight : 1 / count;

        const cw = isVert ? (isLast ? wBox - cur : snap(wBox * ratio)) : wBox;
        const ch = isVert ? hBox : isLast ? hBox - cur : snap(hBox * ratio);
        const cx = isVert ? x + cur : x;
        const cy = isVert ? y : y + cur;

        traverse(child, cx, cy, cw, ch, true, undefined, { x: cx, y: cy, w: cw, h: ch });
        cur += isVert ? cw : ch;

        // Bổ sung vách giáp ranh tách khung (coupling seam) để hỗ trợ kéo thả điều chỉnh
        if (idx < count - 1) {
          const nextChild = node.children?.[idx + 1];
          if (nextChild) {
            couplingSeams.push({
              id: `${node.id}-coupling-${idx}`,
              x: isVert ? cx + cw - 4 : cx,
              y: isVert ? cy : cy + ch - 4,
              w: isVert ? 8 : cw,
              h: isVert ? ch : 8,
              direction: isVert ? 'vertical' : 'horizontal',
              parentNodeId: node.id,
              splitIndex: idx,
              childId: child.id,
              nextChildId: nextChild.id,
              dimension: isVert ? child.w : child.h,
              nextDimension: isVert ? nextChild.w : nextChild.h,
              totalDimension: (isVert ? child.w : child.h) + (isVert ? nextChild.w : nextChild.h),
            });
          }
        }
      });
      return;
    }

    // 2. Khung bao độc lập: Đẩy vào danh sách frames với thông số ghi đè riêng
    let innerX = x;
    let innerY = y;
    let innerW = wBox;
    let innerH = hBox;
    const curRefBox = isFrameUnit ? { x, y, w: wBox, h: hBox } : (refBox ?? { x, y, w: wBox, h: hBox });
    let activeFrameBounds: FrameUnitBounds = frameBounds || {
      unitNode: node,
      x,
      y,
      w: wBox,
      h: hBox,
      fLeft: frameEdges.left,
      fRight: frameEdges.right,
      fTop: frameEdges.top,
      fBot: isOpenBottomDoor ? 0 : frameEdges.bottom,
      unitEdges: frameEdges,
      unitBottomPlan: bottomPlan,
    };

    if (isFrameUnit) {
      const unitMetrics = resolveFrameUnitOverrideMetrics(
        node,
        options?.frameConfig,
        options?.availableProfiles,
        frameEdges,
        layoutScale,
        isGlobalOpenBottom
      );
      const uEdges = unitMetrics.frameEdges;
      const uPlan = unitMetrics.unitBottomPlan;
      const isUnitOpenBot = uPlan.isOpenBottom;
      const isLegacyBot90 = !isRealProportion && unitMetrics.cornerJoint === '45_top_90_bot';
      const botFrameD = isUnitOpenBot
        ? 0
        : isLegacyBot90
        ? Math.max(6, Math.round(uEdges.bottom * 0.65))
        : uEdges.bottom;

      frames.push({
        id: node.id,
        x,
        y,
        w: wBox,
        h: hBox,
        frameEdges: uEdges,
        frameMmEdges: unitMetrics.frameMmEdges,
        cornerJoint: unitMetrics.cornerJoint,
        isOpenBottom: isUnitOpenBot,
        isPartialBottomOpen: uPlan.mode === 'partial',
      });
      unitLeafMap.set(node.id, []);

      innerX = x + uEdges.left;
      innerY = y + uEdges.top;
      innerW = Math.max(10, wBox - uEdges.left - uEdges.right);
      innerH = Math.max(10, hBox - uEdges.top - botFrameD);
      activeFrameBounds = {
        unitNode: node,
        x,
        y,
        w: wBox,
        h: hBox,
        fLeft: uEdges.left,
        fRight: uEdges.right,
        fTop: uEdges.top,
        fBot: botFrameD,
        unitEdges: uEdges,
        unitBottomPlan: uPlan,
        mullionProfileIdOverride: unitMetrics.mullionProfileIdOverride,
        vertMullionPx: unitMetrics.vertMullionPx,
        horizMullionPx: unitMetrics.horizMullionPx,
      };
    }

    const activePlan = activeFrameBounds.unitBottomPlan;
    const isUnitPartialOpen = activePlan.mode === 'partial';
    const isOpenLeafInUnit = (nodeId: string): boolean =>
      isUnitPartialOpen && activePlan.openLeafIds.has(nodeId);

    // 3. Phân chia đố T 90° hoặc cặp cánh đối xứng
    if (node.children && node.children.length > 0 && node.splitType !== 'sash_mullion') {
      // 3.0 Cụm cánh cửa lùa (Sliding cluster) chồng đè thực tế (Overlap/Đè gối)
      const isSlidingCluster = Boolean(
        node.splitType === 'sash_pair' &&
        (
          node.sashLayout?.includes('lua') ||
          node.sashLayout?.includes('sliding') ||
          node.sashType?.includes('lua') ||
          node.sashType?.includes('sliding') ||
          node.children.some((c) =>
            c.sashType?.includes('lua') ||
            c.sashType === 'sliding' ||
            Boolean(c.sashArrow?.includes('lua')) ||
            c.sashZIndex !== undefined
          )
        )
      );

      if (isSlidingCluster && node.children) {
        const count = node.children.length;
        const activeOverlap = options?.slidingOverlapPx ?? Math.max(12, Math.round(frameD * 1.1));
        const slidingLayout = computeSlidingSashes(innerX, innerW, count, activeOverlap, node.sashLayout);

        node.children.forEach((child, idx) => {
          const pos = slidingLayout[idx] || { x: innerX, w: innerW, trackIndex: 0, zIndex: 0 };
          const leafChild: SceneCellNode = {
            ...child,
            sashZIndex: child.sashZIndex ?? pos.zIndex,
          };
          traverse(leafChild, pos.x, innerY, pos.w, innerH, false, activeFrameBounds, {
            x: pos.x,
            y: curRefBox.y,
            w: pos.w,
            h: curRefBox.h,
          });
        });
        return;
      }
      const isVert = node.splitDirection === 'vertical';
      const count = node.children.length;

      // Cặp cánh mở quay đối xứng (swing_left + swing_right) khép vào nhau bằng đố động, KHÔNG có đố tĩnh ở giữa
      const hasMullionBetween = (c1: SceneCellNode, c2: SceneCellNode): boolean => {
        if (node.splitType === 'sash_pair' || node.sashType === 'swing_double') return false;
        if (isVert && c1.sashType === 'swing_left' && c2.sashType === 'swing_right') return false;
        return true;
      };

      const activeMullionT = isVert
        ? (activeFrameBounds.vertMullionPx ?? options?.vertMullionT ?? mullionT)
        : (activeFrameBounds.horizMullionPx ?? options?.horizMullionT ?? mullionT);
      const hasMullionAt: boolean[] = [];
      let mullionCount = 0;
      for (let i = 0; i < count - 1; i++) {
        const hasM = hasMullionBetween(node.children[i], node.children[i + 1]);
        hasMullionAt.push(hasM);
        if (hasM) mullionCount += 1;
      }
      const totalMullions = mullionCount * activeMullionT;

      const weights = node.children.map((c) => (isVert ? c.w : c.h) || 1);
      const totalWeight = weights.reduce((sum, v) => sum + v, 0);

      // Hệ tọa độ tham chiếu danh nghĩa (mép phủ bì khung ↔ tim đố ↔ tim đố), khớp 100% với BOM Backend
      const refStart = isVert ? curRefBox.x : curRefBox.y;
      const refSpan = isVert ? curRefBox.w : curRefBox.h;
      const childRefStarts: number[] = [];
      const childRefSpans: number[] = [];
      let refAcc = 0;
      for (let i = 0; i < count; i++) {
        const isLast = i === count - 1;
        const ratio = totalWeight > 0 ? weights[i] / totalWeight : 1 / count;
        const rSpan = isLast ? refSpan - refAcc : snap(refSpan * ratio);
        childRefStarts.push(refStart + refAcc);
        childRefSpans.push(rSpan);
        refAcc += rSpan;
      }

      const innerStart = isVert ? innerX : innerY;
      const innerSpan = isVert ? innerW : innerH;
      const innerEnd = innerStart + innerSpan;
      const minLeafClear = isRealProportion ? Math.max(0.4, 4 * layoutScale) : 4;

      const childClearStarts = new Array<number>(count).fill(0);
      const childClearSpans = new Array<number>(count).fill(0);
      const mullionPositions = new Array<number>(Math.max(0, count - 1)).fill(0);

      if (mullionCount > 0 && innerSpan > totalMullions + count * minLeafClear) {
        let prevBoundEnd = innerStart;
        let prevBoundIdx = -1;
        let remMullions = mullionCount;

        for (let b = 0; b < count - 1; b++) {
          if (!hasMullionAt[b]) continue;
          remMullions -= 1;
          const leftRunCount = b - prevBoundIdx;
          const rightChildCount = count - 1 - b;
          const nominalCenter = childRefStarts[b] + childRefSpans[b];
          const minCenter = prevBoundEnd + leftRunCount * minLeafClear + activeMullionT / 2;
          const maxCenter =
            innerEnd - remMullions * activeMullionT - rightChildCount * minLeafClear - activeMullionT / 2;
          const clampedCenter = Math.max(minCenter, Math.min(maxCenter, nominalCenter));
          const mStart = snap(clampedCenter - activeMullionT / 2);
          mullionPositions[b] = mStart;
          prevBoundEnd = mStart + activeMullionT;
          prevBoundIdx = b;
        }

        let runStart = 0;
        while (runStart < count) {
          let runEnd = runStart;
          while (runEnd < count - 1 && !hasMullionAt[runEnd]) {
            runEnd += 1;
          }
          const runClearStart = runStart === 0 ? innerStart : mullionPositions[runStart - 1] + activeMullionT;
          const runClearEnd = runEnd === count - 1 ? innerEnd : mullionPositions[runEnd];
          const runSpan = Math.max(1, runClearEnd - runClearStart);

          if (runStart === runEnd) {
            childClearStarts[runStart] = runClearStart;
            childClearSpans[runStart] = runSpan;
          } else {
            const runCount = runEnd - runStart + 1;
            let runWeight = 0;
            for (let k = runStart; k <= runEnd; k++) runWeight += weights[k];
            let runAcc = 0;
            for (let k = runStart; k <= runEnd; k++) {
              const isRunLast = k === runEnd;
              const rRatio = runWeight > 0 ? weights[k] / runWeight : 1 / runCount;
              const cSpan = isRunLast ? Math.max(1, runSpan - runAcc) : snap(runSpan * rRatio);
              childClearStarts[k] = runClearStart + runAcc;
              childClearSpans[k] = cSpan;
              runAcc += cSpan;
            }
          }
          runStart = runEnd + 1;
        }
      } else {
        const availSpace = Math.max(10, innerSpan - totalMullions);
        let cur = 0;
        let spanCur = 0;
        for (let i = 0; i < count; i++) {
          const isLast = i === count - 1;
          const ratio = totalWeight > 0 ? weights[i] / totalWeight : 1 / count;
          const cSpan = isLast ? availSpace - spanCur : snap(availSpace * ratio);
          childClearStarts[i] = innerStart + cur;
          childClearSpans[i] = cSpan;
          cur += cSpan;
          spanCur += cSpan;
          if (i < count - 1 && hasMullionAt[i]) {
            mullionPositions[i] = innerStart + cur;
            cur += activeMullionT;
          }
        }
      }

      node.children.forEach((child, idx) => {
        const cw = isVert ? childClearSpans[idx] : innerW;
        const ch = isVert ? innerH : childClearSpans[idx];
        const cx = isVert ? childClearStarts[idx] : innerX;
        const cy = isVert ? innerY : childClearStarts[idx];
        const childRefBox = isVert
          ? { x: childRefStarts[idx], y: curRefBox.y, w: childRefSpans[idx], h: curRefBox.h }
          : { x: curRefBox.x, y: childRefStarts[idx], w: curRefBox.w, h: childRefSpans[idx] };

        traverse(child, cx, cy, cw, ch, false, activeFrameBounds, childRefBox);

        if (idx < count - 1) {
          const nextChild = node.children?.[idx + 1];
          const shouldAddMullion = Boolean(nextChild && hasMullionAt[idx]);

          if (shouldAddMullion && nextChild) {
            const isSeparate = options?.frameConfig?.mullionMode === 'separate';
            const globalDefaultPid = isSeparate
              ? (isVert
                  ? (options?.frameConfig?.mullionVertProfileId || options?.frameConfig?.mullionProfileId)
                  : (options?.frameConfig?.mullionHorizProfileId || options?.frameConfig?.mullionProfileId))
              : options?.frameConfig?.mullionProfileId;
            const defaultPid = activeFrameBounds.mullionProfileIdOverride ?? globalDefaultPid;

            const isFloorMullion =
              isUnitPartialOpen &&
              isVert &&
              Math.abs(innerY + innerH - (activeFrameBounds.y + activeFrameBounds.h - activeFrameBounds.fBot)) < 1.5 &&
              (isOpenLeafInUnit(findEdgeBottomLeafId(child, 'last')) ||
                isOpenLeafInUnit(findEdgeBottomLeafId(nextChild, 'first')));
            const rawCutType = child.mullionCutType;
            const normCutType = normalizeMullionCutType(rawCutType);
            const touchesStartFrame = isVert
              ? Math.abs(innerY - (activeFrameBounds.y + activeFrameBounds.fTop)) < 1.5
              : Math.abs(innerX - (activeFrameBounds.x + activeFrameBounds.fLeft)) < 1.5;
            const touchesEndFrame = isVert
              ? Math.abs(
                  innerY + innerH - (activeFrameBounds.y + activeFrameBounds.h - activeFrameBounds.fBot)
                ) < 1.5
              : Math.abs(
                  innerX + innerW - (activeFrameBounds.x + activeFrameBounds.w - activeFrameBounds.fRight)
                ) < 1.5;
            const { cutStart, cutEnd } = resolveMullionCutEnds(
              normCutType,
              touchesStartFrame,
              touchesEndFrame
            );

            const childDim = (isVert ? child.w : child.h) || 1;
            const nextChildDim = (isVert ? nextChild.w : nextChild.h) || 1;
            const mullionInfo: MullionInfo = {
              id: `${node.id}-mullion-${idx}`,
              parentNodeId: node.id,
              mullionIndex: idx,
              direction: isVert ? 'vertical' : 'horizontal',
              childId: child.id,
              nextChildId: nextChild.id,
              dimension: childDim,
              totalDimension: childDim + nextChildDim,
              profileId: child.mullionProfileId ?? (node as SceneCellNode).mullionProfileId ?? defaultPid,
              cutType: normCutType,
              cutStart,
              cutEnd,
            };

            if (isVert) {
              const mY = cutStart ? activeFrameBounds.y : innerY;
              const mH =
                innerH +
                (cutStart ? activeFrameBounds.fTop : 0) +
                (cutEnd || isFloorMullion ? activeFrameBounds.fBot : 0);
              mullions.push({
                x: mullionPositions[idx],
                y: mY,
                w: activeMullionT,
                h: mH,
                direction: 'vertical',
                cutType: normCutType,
                cutStart,
                cutEnd,
                info: mullionInfo,
              });
            } else {
              const mX = cutStart ? activeFrameBounds.x : innerX;
              const mW =
                innerW +
                (cutStart ? activeFrameBounds.fLeft : 0) +
                (cutEnd ? activeFrameBounds.fRight : 0);
              mullions.push({
                x: mX,
                y: mullionPositions[idx],
                w: mW,
                h: activeMullionT,
                direction: 'horizontal',
                cutType: normCutType,
                cutStart,
                cutEnd,
                info: mullionInfo,
              });
            }
            // Đố đứng ranh giới Hở/Kín chạy xuống sàn: chân cắt 90°, đồng thời cắt thanh khung đáy
            if (isFloorMullion) mullions[mullions.length - 1].cutEnd = true;
          }
        }
      });
      return;
    }

    // 4. Ô lá cuối cùng (Leaf Cell)
    // Ô Hở đáy trong cửa Hở đáy từng phần: cộng bù chiều dày khung đáy để ô kéo xuống sàn
    const isOpenLeaf = isOpenLeafInUnit(node.id);
    if (isOpenLeaf) innerH += activeFrameBounds.fBot;
    const unitBottomY = activeFrameBounds.y + activeFrameBounds.h;
    const touchesFloor =
      (activePlan.isOpenBottom || isOpenLeaf) && Math.abs((innerY + innerH) - unitBottomY) < 2;
    const cellReversalMode = resolveCellReversal(node);
    const leafReversalFields: Pick<LeafCell, 'effectiveReversalMode' | 'reversalD'> =
      cellReversalMode === undefined
        ? {}
        : {
            effectiveReversalMode: cellReversalMode,
            reversalD:
              cellReversalMode !== 'none' && options?.resolveReversalPx
                ? options.resolveReversalPx(node.reversalProfileIdOverride)
                : undefined,
          };

    const leafOverrideMetrics = resolveLeafOverrideMetrics(
      node,
      activeFrameBounds.unitNode,
      options?.sashConfig,
      options?.frameConfig,
      options?.availableProfiles,
      layoutScale
    );

    const pushLeaf = (leafItem: LeafCell) => {
      leaves.push(leafItem);
      unitLeafMap.get(activeFrameBounds.unitNode.id)?.push(leafItem);
    };

    const activeEdges = activeFrameBounds.unitEdges;

    if (touchesFloor && isDoorHydraulic && node.sashType === 'fixed') {
      const sillH = activeEdges.bottom;
      bottomSills.push({
        x: innerX,
        y: innerY + innerH - sillH,
        w: innerW,
        h: sillH,
      });
      pushLeaf({
        node,
        x: innerX,
        y: innerY,
        w: innerW,
        h: Math.max(10, innerH - sillH),
        rawX: innerX,
        rawY: innerY,
        rawW: innerW,
        rawH: innerH,
        touchesFloor,
        ...leafReversalFields,
        ...leafOverrideMetrics,
      });
    } else if (node.sashType !== 'fixed') {
      const isLeafHydraulic = Boolean(isDoorHydraulic || node.isHydraulic);
      const hoNenMm = node.hoNenMm ?? options?.sashConfig?.hoNenMm ?? 8;
      const ngamNgangMm = node.ngamNgangMm ?? options?.sashConfig?.ngamNgangMm ?? 5;
      const ngamDocMm = node.ngamDocMm ?? options?.sashConfig?.ngamDocMm ?? 5;
      const scaleX = fw / (rootCell.w || 1);
      const scaleY = fh / (rootCell.h || 1);

      const maxHoNenPx = Math.floor(innerH * 0.6);
      const dHoNen = touchesFloor ? Math.max(-maxHoNenPx, Math.min(maxHoNenPx, snap(hoNenMm * scaleY))) : 0;

      // Cánh chỉ được ngậm vào khung tối đa bằng bản rộng khung bao của cạnh đó (trừ 2 đơn vị)
      const maxNgamNgangPx = Math.max(0, Math.min(activeEdges.left, activeEdges.right) - 2);
      const maxNgamDocPx = Math.max(0, activeEdges.top - 2);
      const dNgamNgang =
        isLeafHydraulic || ngamNgangMm < 0
          ? Math.max(-Math.floor(innerW * 0.35), Math.min(maxNgamNgangPx, snap(ngamNgangMm * scaleX)))
          : 0;
      const dNgamDoc =
        isLeafHydraulic || ngamDocMm < 0
          ? Math.max(-Math.floor(innerH * 0.35), Math.min(maxNgamDocPx, snap(ngamDocMm * scaleY)))
          : 0;

      const leafX = innerX - dNgamNgang;
      const leafW = Math.max(10, innerW + 2 * dNgamNgang);
      const leafY = innerY - dNgamDoc;
      const vertNgamDelta = touchesFloor ? dNgamDoc : 2 * dNgamDoc;
      const leafH = Math.max(10, innerH - dHoNen + vertNgamDelta);

      pushLeaf({
        node,
        x: leafX,
        y: leafY,
        w: leafW,
        h: leafH,
        rawX: innerX,
        rawY: innerY,
        rawW: innerW,
        rawH: innerH,
        touchesFloor,
        ...leafReversalFields,
        ...leafOverrideMetrics,
      });
    } else {
      pushLeaf({
        node,
        x: innerX,
        y: innerY,
        w: innerW,
        h: innerH,
        rawX: innerX,
        rawY: innerY,
        rawW: innerW,
        rawH: innerH,
        touchesFloor,
        ...leafReversalFields,
        ...leafOverrideMetrics,
      });
    }
  };

  traverse(rootCell, ox, oy, fw, fh, true);

  // Tính phân đoạn thanh khung đáy riêng cho từng FrameBox có Hở đáy từng phần
  const allBottomOpenRanges: BottomOpenRange[] = [];
  let firstFrameSegments: BottomBarSegment[] | undefined;
  let firstFrameLeftOpen = false;
  let firstFrameRightOpen = false;

  frames.forEach((fBox, idx) => {
    const unitNode = fBox.id === rootCell.id ? rootCell : undefined;
    const uLeaves = unitLeafMap.get(fBox.id) || [];
    const uEdges = fBox.frameEdges ?? frameEdges;
    if (!fBox.isPartialBottomOpen) {
      fBox.isLeftBottomOpen = Boolean(fBox.isOpenBottom);
      fBox.isRightBottomOpen = Boolean(fBox.isOpenBottom);
      return;
    }

    const findUnitById = (curr: SceneCellNode): SceneCellNode | undefined => {
      if (curr.id === fBox.id) return curr;
      for (const ch of curr.children || []) {
        const found = findUnitById(ch);
        if (found) return found;
      }
      return undefined;
    };
    const targetUnitNode = unitNode ?? findUnitById(rootCell) ?? rootCell;
    const uPlan = resolveBottomOpenPlan(targetUnitNode, isGlobalOpenBottom);

    const bottomLeaves = uLeaves
      .filter((leaf) => uPlan.bottomLeafIds.has(leaf.node.id))
      .sort((a, b) => (a.rawX ?? a.x) - (b.rawX ?? b.x));
    const unitSegments: BottomBarSegment[] = [];
    const unitOpenRanges: Array<{ startX: number; endX: number; cellId: string }> = [];
    const edgeTolerance = 1.5;
    const closedRun = { x0: 0, x1: 0, isActive: false };

    const flushSegment = (): void => {
      if (!closedRun.isActive) return;
      unitSegments.push({
        x0: closedRun.x0,
        x1: closedRun.x1,
        isFrameStart: Math.abs(closedRun.x0 - (fBox.x + uEdges.left)) < edgeTolerance,
        isFrameEnd: Math.abs(closedRun.x1 - (fBox.x + fBox.w - uEdges.right)) < edgeTolerance,
      });
      closedRun.isActive = false;
    };

    bottomLeaves.forEach((leaf) => {
      const leafX0 = leaf.rawX ?? leaf.x;
      const leafX1 = leafX0 + (leaf.rawW ?? leaf.w);
      if (uPlan.openLeafIds.has(leaf.node.id)) {
        flushSegment();
        unitOpenRanges.push({ startX: leafX0, endX: leafX1, cellId: leaf.node.id });
        allBottomOpenRanges.push({
          x0: leafX0,
          x1: leafX1,
          floorGapMm: leaf.node.hoNenMm ?? options?.sashConfig?.hoNenMm ?? 8,
          cellId: leaf.node.id,
        });
        return;
      }
      closedRun.x0 = closedRun.isActive ? closedRun.x0 : leafX0;
      closedRun.x1 = leafX1;
      closedRun.isActive = true;
    });
    flushSegment();

    const firstLeafId = bottomLeaves[0]?.node.id;
    const lastLeafId = bottomLeaves[bottomLeaves.length - 1]?.node.id;
    fBox.isLeftBottomOpen = firstLeafId !== undefined && uPlan.openLeafIds.has(firstLeafId);
    fBox.isRightBottomOpen = lastLeafId !== undefined && uPlan.openLeafIds.has(lastLeafId);
    fBox.bottomBarSegments = unitSegments;
    fBox.bottomOpenRanges = unitOpenRanges;

    if (idx === 0) {
      firstFrameSegments = unitSegments;
      firstFrameLeftOpen = fBox.isLeftBottomOpen;
      firstFrameRightOpen = fBox.isRightBottomOpen;
    }
  });

  if (!isPartialBottomOpen && !frames.some((f) => f.isPartialBottomOpen)) {
    return { frames, mullions, couplingSeams, leaves, bottomSills, isOpenBottom: isOpenBottomDoor };
  }

  return {
    frames,
    mullions,
    couplingSeams,
    leaves,
    bottomSills,
    isOpenBottom: false,
    isPartialBottomOpen: true,
    isLeftBottomOpen: firstFrameLeftOpen,
    isRightBottomOpen: firstFrameRightOpen,
    bottomOpenRanges: allBottomOpenRanges,
    bottomBarSegments: firstFrameSegments,
  };
};

/**
 * Thu thập tất cả các thanh đố cánh (Sash Mullions) từ các ô lá (leaves)
 * bao gồm cả phân chia phân tầng đệ quy nhiều cấp.
 * Phiên bản đơn vị đồng nhất (mm) dùng cho mô hình 3D; bản vẽ 2D dùng `collectLeafSashMullions`.
 */
// legacy - chỉ dành cho 3D (sashD × 0.85 cho cánh lùa, kẹp 12%/18%, 14–32): 2D dùng collectLeafSashMullions
export const collectSashMullions = (leaves: LeafCell[], sashD: number): MullionBar[] => {
  const result: MullionBar[] = [];

  for (const leaf of leaves) {
    const { node, x: cx, y: cy, w: cw, h: ch } = leaf;
    const isFixed = node.sashType === 'fixed';
    const isDouble = node.sashType === 'swing_double';
    const isSliding = node.sashType === 'sliding';
    if (isDouble) continue;

    // Tính độ dày khung cánh thích ứng
    const ratioW = isSliding ? 0.12 : 0.18;
    const maxAllowedW = Math.max(8, Math.floor(cw * ratioW));
    const maxAllowedH = Math.max(8, Math.floor(ch * 0.12));
    const maxAllowed = Math.min(maxAllowedW, maxAllowedH);
    const candidate = isSliding ? Math.round(sashD * 0.85) : sashD;
    const dSash = Math.max(8, Math.min(candidate, maxAllowed));

    const smT = Math.max(14, Math.min(32, Math.round(dSash * 0.7)));
    const innerX = isFixed ? cx : cx + dSash;
    const innerY = isFixed ? cy : cy + dSash;
    const innerW = Math.max(4, isFixed ? cw : cw - 2 * dSash);
    const innerH = Math.max(4, isFixed ? ch : ch - 2 * dSash);

    const traverseSashSubTree = (
      currNode: SceneCellNode,
      bx: number,
      by: number,
      bw: number,
      bh: number
    ) => {
      if (
        currNode.children &&
        currNode.children.length > 0 &&
        currNode.splitType === 'sash_mullion'
      ) {
        const isVert = currNode.splitDirection === 'vertical';
        const count = currNode.children.length;
        const mullionSpace = (count - 1) * smT;
        const availSpace = Math.max(10, (isVert ? bw : bh) - mullionSpace);
        const totalWeight = currNode.children.reduce(
          (sum: number, c: SceneCellNode) => sum + ((isVert ? c.w : c.h) || 1),
          0
        );

        let cur = 0;
        let spanCur = 0;
        currNode.children.forEach((child: SceneCellNode, idx: number) => {
          const isLast = idx === count - 1;
          const weight = (isVert ? child.w : child.h) || 1;
          const ratio = totalWeight > 0 ? weight / totalWeight : 1 / count;
          const childSpan = isLast ? availSpace - spanCur : Math.round(availSpace * ratio);
          const cwChild = isVert ? childSpan : bw;
          const chChild = isVert ? bh : childSpan;
          const cxChild = isVert ? bx + cur : bx;
          const cyChild = isVert ? by : by + cur;

          traverseSashSubTree(child, cxChild, cyChild, cwChild, chChild);
          cur += isVert ? cwChild : chChild;
          spanCur += isVert ? cwChild : chChild;

          if (idx < count - 1) {
            const nextChild = currNode.children![idx + 1];
            const childDim = (isVert ? child.w : child.h) || 1;
            const nextChildDim = (isVert ? nextChild.w : nextChild.h) || 1;

            const barInfo: MullionInfo = {
              id: `${currNode.id}-sm-${idx}`,
              parentNodeId: currNode.id,
              mullionIndex: idx,
              direction: isVert ? 'vertical' : 'horizontal',
              childId: child.id,
              nextChildId: nextChild.id,
              dimension: childDim,
              totalDimension: childDim + nextChildDim,
              cutType: 'inside_frame',
            };

            result.push({
              x: isVert ? bx + cur : bx,
              y: isVert ? by : by + cur,
              w: isVert ? smT : bw,
              h: isVert ? bh : smT,
              info: barInfo,
            });
            cur += smT;
          }
        });
      }
    };

    if (node.children && node.children.length > 0 && node.splitType === 'sash_mullion') {
      traverseSashSubTree(node, innerX, innerY, innerW, innerH);
    }
  }

  return result;
};

/**
 * Thu thập tất cả các thanh đố cánh (Sash Mullions) từ các ô lá (leaves)
 * bao gồm cả phân chia phân tầng đệ quy nhiều cấp.
 * Dùng chung `resolveLeafGeometry` + `buildSashSubPanes` với hình vẽ cánh để vùng kéo thả khớp tuyệt đối.
 */
export const collectLeafSashMullions = (leaves: LeafCell[], metrics: CadMetrics, sashConfig?: SashConfig): MullionBar[] => {
  const result: MullionBar[] = [];

  for (const leaf of leaves) {
    const { node } = leaf;
    const hasSashTree = Boolean(node.children && node.children.length > 0 && node.splitType === 'sash_mullion');
    if (node.sashType === 'swing_double' || !hasSashTree) continue;

    const geometry = resolveLeafGeometry(leaf, leaves, metrics, sashConfig);
    const { mullionBars } = buildSashSubPanes({
      node,
      inner: geometry.inner,
      isFixed: geometry.isFixed,
      mullionThickness: metrics.sashMullion,
      beadWidth: leaf.beadW ?? metrics.bead,
      aluminumColor: '',
    });

    for (const bar of mullionBars) {
      if (!bar.info) continue;
      result.push({ x: bar.x, y: bar.y, w: bar.w, h: bar.h, info: bar.info });
    }
  }

  return result;
};
