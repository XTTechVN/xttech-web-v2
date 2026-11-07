import { SceneCellNode } from '../studio-types';
import { CadReversalMode } from './cad-types';

/**
 * Bộ phân giải cấu hình theo từng ô (pure): Đảo vách/Đảo cánh và Hở/Kín cạnh đáy.
 * 'inherit' (hoặc không có trường) = theo cấu hình toàn cục -> hành vi cũ giữ nguyên 100%.
 */

export type BottomOpenMode = 'global' | 'all_open' | 'all_closed' | 'partial';

export interface BottomOpenPlan {
  mode: BottomOpenMode;
  /** Giá trị Hở đáy hiệu lực ở cấp khung bao (true: bỏ hẳn thanh khung đáy) */
  isOpenBottom: boolean;
  /** Id các ô lá chạm đáy */
  bottomLeafIds: Set<string>;
  /** Id các ô lá chạm đáy đang Hở */
  openLeafIds: Set<string>;
}

const isLeafNode = (node: SceneCellNode): boolean =>
  !node.children || node.children.length === 0 || node.splitType === 'sash_mullion';

const hasCouplingNode = (node: SceneCellNode): boolean =>
  node.splitType === 'coupling' || Boolean(node.children?.some(hasCouplingNode));

const hasOpenBottomOverride = (node: SceneCellNode): boolean =>
  node.openBottomOverride === 'open' ||
  node.openBottomOverride === 'closed' ||
  Boolean(node.children?.some(hasOpenBottomOverride));

/** Ô lá đang Hở cạnh đáy hiệu lực: override 'open'/'closed' thắng, ngược lại theo cấu hình chung */
export const resolveIsCellOpenBottom = (node: SceneCellNode, isGlobalOpen: boolean): boolean => {
  if (node.openBottomOverride === 'open') return true;
  if (node.openBottomOverride === 'closed') return false;
  return isGlobalOpen;
};

/** Đảo riêng của ô: undefined = kế thừa; 'wall' chỉ áp cho ô fix, 'sash' chỉ áp cho ô cánh */
export const resolveCellReversal = (node: SceneCellNode): CadReversalMode | undefined => {
  const override = node.reversalOverride;
  if (override === undefined || override === 'inherit') return undefined;
  if (override === 'none') return 'none';
  const isFixed = node.sashType === 'fixed';
  if (override === 'wall') return isFixed ? 'wall' : 'none';
  return isFixed ? 'none' : 'sash';
};

/** Lập kế hoạch Hở/Kín đáy theo từng ô lá chạm đáy (cửa ghép khung coupling: giữ nguyên theo cấu hình chung) */
export const resolveBottomOpenPlan = (rootCell: SceneCellNode, isGlobalOpen: boolean): BottomOpenPlan => {
  const bottomLeafIds = new Set<string>();
  const openLeafIds = new Set<string>();
  const legacyPlan: BottomOpenPlan = { mode: 'global', isOpenBottom: isGlobalOpen, bottomLeafIds, openLeafIds };
  if (hasCouplingNode(rootCell) || !hasOpenBottomOverride(rootCell)) return legacyPlan;

  const walk = (node: SceneCellNode, inheritedOpen: boolean, isTouchingBottom: boolean): void => {
    const isOpen =
      node.openBottomOverride === 'open' ? true : node.openBottomOverride === 'closed' ? false : inheritedOpen;
    if (isLeafNode(node)) {
      if (!isTouchingBottom) return;
      bottomLeafIds.add(node.id);
      if (isOpen) openLeafIds.add(node.id);
      return;
    }
    const children = node.children ?? [];
    const isVertical = node.splitDirection === 'vertical';
    children.forEach((child, idx) => walk(child, isOpen, isTouchingBottom && (isVertical || idx === children.length - 1)));
  };
  walk(rootCell, isGlobalOpen, true);

  if (bottomLeafIds.size === 0) return legacyPlan;
  if (openLeafIds.size === bottomLeafIds.size) return { mode: 'all_open', isOpenBottom: true, bottomLeafIds, openLeafIds };
  if (openLeafIds.size === 0) return { mode: 'all_closed', isOpenBottom: false, bottomLeafIds, openLeafIds };
  return { mode: 'partial', isOpenBottom: false, bottomLeafIds, openLeafIds };
};

/** Ô lá chạm đáy ở mép trái/phải của một nhánh (dùng cho đố đứng ranh giới Hở/Kín) */
export const findEdgeBottomLeafId = (node: SceneCellNode, side: 'first' | 'last'): string => {
  if (isLeafNode(node)) return node.id;
  const children = node.children ?? [];
  const isVertical = node.splitDirection === 'vertical';
  const target = isVertical && side === 'first' ? children[0] : children[children.length - 1];
  return findEdgeBottomLeafId(target, side);
};

/** Ô có chạm đáy cửa không (tính theo cây, dùng cho UI Thuộc tính ô) */
export const isNodeTouchingBottom = (rootCell: SceneCellNode, targetId: string): boolean => {
  const walk = (node: SceneCellNode, isTouchingBottom: boolean): boolean | undefined => {
    if (node.id === targetId) return isTouchingBottom;
    const children = node.children ?? [];
    const isVertical = node.splitDirection === 'vertical';
    for (let idx = 0; idx < children.length; idx++) {
      const found = walk(children[idx], isTouchingBottom && (isVertical || idx === children.length - 1));
      if (found !== undefined) return found;
    }
    return undefined;
  };
  return walk(rootCell, true) ?? false;
};
