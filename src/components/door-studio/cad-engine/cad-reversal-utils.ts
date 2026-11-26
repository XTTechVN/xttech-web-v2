import { FrameConfig, ProfileIdRef, SceneCellNode } from '../studio-types';
import { hasFrameMullionBetween, updateNode } from '../utils/door-tree-utils';
import { resolveCellReversal } from './cad-cell-config-resolver';
import { CadReversalMode, LeafCell, ReversalBox } from './cad-types';

export interface ClusterReversalConfig {
  effectiveMode: 'sash';
  reversalPx: number;
}

export interface ClusterReversalBoxResult {
  reversalBox: ReversalBox;
  innerRect: { x: number; y: number; w: number; h: number };
}

/** Chế độ đảo khung toàn cục từ FrameConfig (hỗ trợ trường legacy isReversedWall / isReversedSash) */
export const resolveGlobalCadReversalMode = (frameConfig?: FrameConfig): CadReversalMode =>
  frameConfig?.reversalMode ??
  (frameConfig?.isReversedWall ? 'wall' : frameConfig?.isReversedSash ? 'sash' : 'none');

const getRawClusterReversal = (cell?: SceneCellNode): 'none' | 'wall' | 'sash' | undefined => {
  if (!cell) return undefined;
  const ov = cell.reversalOverride;
  if (ov !== undefined && ov !== 'inherit') {
    return ov === 'wall' || ov === 'sash' ? ov : 'none';
  }
  if (cell.hasFrameReversalOverride === false) return 'none';
  if (cell.hasFrameReversalOverride === true) return 'sash';
  return undefined;
};

/**
 * Phân giải cấu hình Đảo cánh cho cụm nhiều cánh mở không có đố tĩnh ở giữa.
 * Ưu tiên: clusterNode -> sibling có reversalOverride khác 'inherit' -> unitNode -> globalMode.
 */
export const resolveClusterReversalConfig = (
  clusterNode: SceneCellNode | undefined,
  children: SceneCellNode[],
  unitNode: SceneCellNode | undefined,
  globalMode: CadReversalMode,
  resolveReversalPx?: (profileId?: ProfileIdRef | null) => number
): ClusterReversalConfig | undefined => {
  if (children.length < 2 || children.some((c) => c.sashType === 'fixed')) return undefined;
  const distinctCluster = clusterNode && clusterNode.id !== unitNode?.id ? clusterNode : undefined;
  const siblingExplicit = getRawClusterReversal(children.find((c) => getRawClusterReversal(c) !== undefined));
  const rawMode = getRawClusterReversal(distinctCluster) ?? siblingExplicit ?? getRawClusterReversal(unitNode) ?? globalMode;
  if (rawMode !== 'sash') return undefined;

  const profileSource =
    children.find((c) => c.reversalProfileIdOverride !== undefined && c.reversalProfileIdOverride !== null) ??
    distinctCluster ??
    unitNode;
  const reversalPx = resolveReversalPx ? resolveReversalPx(profileSource?.reversalProfileIdOverride) : 0;
  return reversalPx > 0 ? { effectiveMode: 'sash', reversalPx } : undefined;
};

/** Tạo 1 ReversalBox bao ngoài cụm cánh mở và hình chữ nhật lòng trong đã trừ độ dày thanh đảo */
export const buildClusterReversalBox = (params: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  reversalPx: number;
  isOpenBottom: boolean;
}): ClusterReversalBoxResult => {
  const { id, x, y, w, h, reversalPx, isOpenBottom } = params;
  const d = Math.max(0, Math.min(reversalPx, Math.max(0, (Math.min(w, h) - 20) / 2)));
  const revBot = isOpenBottom ? 0 : d;
  return {
    reversalBox: { id, x, y, w, h, thickness: d, isOpenBottom },
    innerRect: { x: x + d, y: y + d, w: Math.max(4, w - 2 * d), h: Math.max(4, h - d - revBot) },
  };
};

/** Hình chữ nhật neo thanh đảo cho 1 ô lá (ô chạm sàn dùng rawRect để chân thanh đảo chạm đúng mặt sàn) */
export const resolveLeafReversalBoxRect = (
  leaf: LeafCell,
  isHydraulicDoor: boolean
): { x: number; y: number; w: number; h: number } => {
  if (leaf.touchesFloor && (leaf.node.sashType !== 'fixed' || !isHydraulicDoor)) {
    return {
      x: leaf.rawX ?? leaf.x,
      y: leaf.rawY ?? leaf.y,
      w: leaf.rawW ?? leaf.w,
      h: leaf.rawH ?? leaf.h,
    };
  }
  return { x: leaf.x, y: leaf.y, w: leaf.w, h: leaf.h };
};

/** Thanh đảo của ô lá có hở cạnh đáy hay không (ô fix trên cửa thủy lực ngồi trên sill nên vẫn kín đáy) */
export const isLeafReversalOpenBottom = (leaf: LeafCell, isHydraulicDoor: boolean): boolean =>
  Boolean(leaf.touchesFloor && !(leaf.node.sashType === 'fixed' && isHydraulicDoor));

/** Tính bề rộng thanh đảo (px) hiệu lực cho cửa vòm 1 cánh / 2 cánh */
export const resolveCurvedDoorReversalPx = (params: {
  nodes: SceneCellNode[];
  unitNode?: SceneCellNode;
  frameConfig?: FrameConfig;
  resolveReversalPx: (profileId?: ProfileIdRef | null) => number;
}): number => {
  const nodes = params.nodes.filter(Boolean);
  if (nodes.length === 0) return 0;
  const globalMode = resolveGlobalCadReversalMode(params.frameConfig);
  if (nodes.length >= 2) {
    return (
      resolveClusterReversalConfig(undefined, nodes, params.unitNode, globalMode, params.resolveReversalPx)
        ?.reversalPx ?? 0
    );
  }
  const leafNode = nodes[0];
  const cellMode = resolveCellReversal(leafNode, params.unitNode) ?? globalMode;
  const isActive = leafNode.sashType === 'fixed' ? cellMode === 'wall' : cellMode === 'sash';
  if (!isActive) return 0;
  return params.resolveReversalPx(leafNode.reversalProfileIdOverride ?? params.unitNode?.reversalProfileIdOverride);
};

const buildReversalSyncPatch = (updates: Partial<SceneCellNode>): Partial<SceneCellNode> | null => {
  const hasReversal =
    'reversalOverride' in updates ||
    'reversalProfileIdOverride' in updates ||
    'reversalOffsetMmOverride' in updates;
  if (!hasReversal) return null;

  const patch: Partial<SceneCellNode> = {};
  if ('reversalOverride' in updates) {
    patch.reversalOverride = updates.reversalOverride;
    if (updates.reversalOverride === undefined) {
      patch.hasFrameReversalOverride = undefined;
    }
  }
  if ('reversalProfileIdOverride' in updates) {
    patch.reversalProfileIdOverride = updates.reversalProfileIdOverride;
  }
  if ('reversalOffsetMmOverride' in updates) {
    patch.reversalOffsetMmOverride = updates.reversalOffsetMmOverride;
  }
  return patch;
};

const findNoMullionSashRun = (
  parent: SceneCellNode,
  targetIdx: number
): [number, number] | null => {
  const children = parent.children ?? [];
  if (children.length < 2 || parent.splitType === 'coupling' || parent.splitType === 'sash_mullion') {
    return null;
  }
  if (parent.splitType === 'sash_pair' && children.every((c) => c.sashType !== 'fixed')) {
    return [0, children.length - 1];
  }
  if (parent.splitDirection !== 'vertical' || children[targetIdx]?.sashType === 'fixed') {
    return null;
  }
  let runStart = targetIdx;
  while (
    runStart > 0 &&
    children[runStart - 1].sashType !== 'fixed' &&
    !hasFrameMullionBetween(parent, children[runStart - 1], children[runStart])
  ) {
    runStart -= 1;
  }
  let runEnd = targetIdx;
  while (
    runEnd < children.length - 1 &&
    children[runEnd + 1].sashType !== 'fixed' &&
    !hasFrameMullionBetween(parent, children[runEnd], children[runEnd + 1])
  ) {
    runEnd += 1;
  }
  return runEnd > runStart ? [runStart, runEnd] : null;
};

/**
 * Đồng bộ thuộc tính Đảo khung lên toàn bộ cánh con cùng cụm không đố tĩnh (và parent nếu phủ trọn cụm).
 */
export const syncClusterReversalUpdate = (
  rootCell: SceneCellNode,
  targetCellId: string,
  updates: Partial<SceneCellNode>
): SceneCellNode => {
  const reversalPatch = buildReversalSyncPatch(updates);
  if (!reversalPatch) {
    return updateNode(rootCell, targetCellId, updates);
  }

  const walk = (curr: SceneCellNode): SceneCellNode => {
    const children = curr.children;
    if (!children || children.length === 0) {
      return curr.id === targetCellId ? { ...curr, ...updates } : curr;
    }

    const targetIdx = children.findIndex((c) => c.id === targetCellId);
    if (targetIdx >= 0) {
      const targetFullUpdates: Partial<SceneCellNode> =
        'reversalOverride' in updates && updates.reversalOverride === undefined
          ? { ...updates, hasFrameReversalOverride: undefined }
          : updates;
      const run = findNoMullionSashRun(curr, targetIdx);
      if (!run) {
        return {
          ...curr,
          children: children.map((c, idx) => (idx === targetIdx ? { ...c, ...targetFullUpdates } : c)),
        };
      }
      const [runStart, runEnd] = run;
      const shouldSyncParent =
        curr.splitType === 'sash_pair' || (runStart === 0 && runEnd === children.length - 1);
      return {
        ...curr,
        ...(shouldSyncParent ? reversalPatch : {}),
        children: children.map((c, idx) => {
          if (idx === targetIdx) return { ...c, ...targetFullUpdates };
          if (idx >= runStart && idx <= runEnd) return { ...c, ...reversalPatch };
          return c;
        }),
      };
    }

    return { ...curr, children: children.map(walk) };
  };

  return walk(rootCell);
};
