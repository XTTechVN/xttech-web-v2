import { SashCornerJoint, SashConfig, SceneCellNode, SlidingSashRole } from '../studio-types';
import { CadMetrics, EdgeThickness, LeafCell } from './cad-types';

export interface CadRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Hình học thực của 1 ô lá: nguồn DUY NHẤT cho hình vẽ cánh, đố cánh và vùng kéo-thả tay nắm,
 * để cả 3 khớp tuyệt đối với nhau.
 */
export interface LeafGeometry {
  isFixed: boolean;
  isDouble: boolean;
  hasReversalWall: boolean;
  hasReversalSash: boolean;
  /** Độ dày thanh đảo khung thực tế đã áp (0 nếu không có đảo) */
  reversalD: number;
  /** Hộp khung cánh (đã trừ đảo khung cánh); với ô Fix là chính ô đó */
  sashBox: CadRect;
  /** Độ dày từng cạnh khung cánh (0 với ô Fix) */
  thickness: EdgeThickness;
  /** Vùng lòng trong để đặt nẹp & kính (đã tính đảo vách) */
  inner: CadRect;
  /** Kiểu ghép góc áp dụng cho cánh này (cánh lùa theo vai trò) */
  sashJoint: SashCornerJoint;
}

const ZERO_THICKNESS: EdgeThickness = { top: 0, right: 0, bottom: 0, left: 0 };
const MIN_INNER_PX = 4;
const MIN_CLEAR_MARGIN_PX = 6;

/** Chặn độ dày để không vượt quá nửa ô (tránh âm diện tích kính ở ô cực nhỏ) — không ảnh hưởng ô bình thường */
export const clampEdgeThickness = (edge: EdgeThickness, boxW: number, boxH: number): EdgeThickness => {
  const maxSafe = Math.max(0.5, (Math.min(boxW, boxH) - MIN_CLEAR_MARGIN_PX) / 2);
  return {
    top: Math.min(edge.top, maxSafe),
    right: Math.min(edge.right, maxSafe),
    bottom: Math.min(edge.bottom, maxSafe),
    left: Math.min(edge.left, maxSafe),
  };
};

const isSlidingNode = (node: SceneCellNode): boolean =>
  node.sashZIndex !== undefined || node.sashType === 'sliding' || Boolean(node.sashType?.includes('lua'));

/** Vai trò cánh lùa theo thứ tự trong cụm (khớp quy ước 3D: đầu = trái, cuối = phải, còn lại = giữa) */
export const resolveSlidingRole = (leaf: LeafCell, allLeaves: LeafCell[]): SlidingSashRole | null => {
  if (!isSlidingNode(leaf.node)) return null;
  const slidingLeaves = allLeaves.filter((item) => isSlidingNode(item.node));
  const index = slidingLeaves.findIndex((item) => item.node.id === leaf.node.id);
  if (index < 0) return null;
  if (index === 0) return 'left_sliding';
  if (index === slidingLeaves.length - 1) return 'right_sliding';
  return 'center_sliding';
};

const resolveSashJoint = (role: SlidingSashRole | null, sashConfig: SashConfig | undefined): SashCornerJoint => {
  const baseJoint: SashCornerJoint = sashConfig?.cornerJoint ?? '45';
  const slidingJoints = sashConfig?.slidingJoints;
  if (!role || !slidingJoints) return baseJoint;
  if (role === 'left_sliding') return slidingJoints.leftSliding || baseJoint;
  if (role === 'right_sliding') return slidingJoints.rightSliding || baseJoint;
  return slidingJoints.centerSliding || baseJoint;
};

const resolveBaseThickness = (role: SlidingSashRole | null, metrics: CadMetrics): EdgeThickness =>
  (role && metrics.slidingSash[role]) || metrics.sash;

const DEFAULT_HANDLE_SASH_TYPES: readonly string[] = [
  'swing_double',
  'swing_left',
  'swing_right',
  'tilt_turn',
  'awning',
  'tilt',
  'tilt_down',
  'le-trai-mo-ra',
  'le-trai-mo-vao',
  'le-phai-mo-ra',
  'le-phai-mo-vao',
  'mo-hat',
  'mo-lat',
  'gap-xep-le-trai',
  'gap-xep-le-phai',
  'lua-trai',
  'lua-phai',
  'canh-truot',
  'sliding',
];

/** Kiểu cánh mặc định có lắp tay nắm / khóa (khi chưa chỉ định `hasLock`) — nguồn duy nhất cho hình vẽ, vùng kéo và thước */
export const hasDefaultLeafHandle = (sashType: string | undefined): boolean =>
  DEFAULT_HANDLE_SASH_TYPES.includes(sashType || '');

/** Cao độ tay nắm / khóa (mm, tính từ đáy cửa) */export const resolveHandleHeightMm = (node: SceneCellNode, isGlobalHydraulic: boolean): number =>
  node.handleHeight || (isGlobalHydraulic || node.isHydraulic ? 1050 : Math.round(node.h / 2));

/** Tọa độ Y (px) của tâm tay nắm, kẹp trong lòng cánh */
export const resolveHandleY = (
  geometry: LeafGeometry,
  handleHeightMm: number,
  view: { doorHeightMm: number; originY: number; frameHeightPx: number }
): number => {
  const { doorHeightMm, originY, frameHeightPx } = view;
  const targetY = originY + frameHeightPx - Math.round((handleHeightMm / (doorHeightMm || 1)) * frameHeightPx);
  const { sashBox, thickness } = geometry;
  const bottomBound = sashBox.y + sashBox.h - thickness.bottom - 10;
  const topBound = sashBox.y + thickness.top + 20;
  return Math.max(topBound, Math.min(bottomBound, targetY));
};

const resolveDoubleGeometry = (
  leaf: LeafCell,
  metrics: CadMetrics,
  hasReversalSash: boolean,
  sashJoint: SashCornerJoint
): LeafGeometry => {
  const { x: cx, y: cy, w: cw, h: ch } = leaf;
  const reversalD = hasReversalSash
    ? Math.max(0, Math.min(metrics.reversal, (Math.min(cw, ch) - 20) / 2))
    : 0;
  const sashBox: CadRect = {
    x: cx + reversalD,
    y: cy + reversalD,
    w: Math.max(10, cw - 2 * reversalD),
    h: Math.max(10, ch - 2 * reversalD),
  };
  const halfW = (sashBox.w - metrics.astragal) / 2;
  const thickness = clampEdgeThickness(metrics.sash, halfW, sashBox.h);
  return {
    isFixed: false,
    isDouble: true,
    hasReversalWall: false,
    hasReversalSash,
    reversalD,
    sashBox,
    thickness,
    inner: {
      x: sashBox.x + thickness.left,
      y: sashBox.y + thickness.top,
      w: Math.max(MIN_INNER_PX, sashBox.w - thickness.left - thickness.right),
      h: Math.max(MIN_INNER_PX, sashBox.h - thickness.top - thickness.bottom),
    },
    sashJoint,
  };
};

/**
 * Tính hình học thực của ô lá (hộp cánh, độ dày từng cạnh, lòng trong, đảo khung).
 * Dùng chung cho CadRectangularLeaf, collectSashMullions và vùng kéo-thả tay nắm.
 */
export const resolveLeafGeometry = (
  leaf: LeafCell,
  allLeaves: LeafCell[],
  metrics: CadMetrics,
  sashConfig?: SashConfig
): LeafGeometry => {
  const { node, x: cx, y: cy, w: cw, h: ch } = leaf;
  const isFixed = node.sashType === 'fixed';
  const isDouble = node.sashType === 'swing_double';
  const role = resolveSlidingRole(leaf, allLeaves);
  const sashJoint = resolveSashJoint(role, sashConfig);
  const hasReversalWall = isFixed && metrics.reversalMode === 'wall';
  const hasReversalSash = !isFixed && metrics.reversalMode === 'sash';

  if (isDouble) return resolveDoubleGeometry(leaf, metrics, hasReversalSash, sashJoint);

  const hasReversal = hasReversalWall || hasReversalSash;
  const reversalD = hasReversal ? Math.max(0, Math.min(metrics.reversal, (Math.min(cw, ch) - 10) / 2)) : 0;

  if (isFixed) {
    return {
      isFixed,
      isDouble,
      hasReversalWall,
      hasReversalSash,
      reversalD,
      sashBox: { x: cx, y: cy, w: cw, h: ch },
      thickness: ZERO_THICKNESS,
      inner: {
        x: cx + reversalD,
        y: cy + reversalD,
        w: Math.max(MIN_INNER_PX, cw - 2 * reversalD),
        h: Math.max(MIN_INNER_PX, ch - 2 * reversalD),
      },
      sashJoint,
    };
  }

  const sashBox: CadRect = {
    x: cx + reversalD,
    y: cy + reversalD,
    w: Math.max(MIN_INNER_PX, cw - 2 * reversalD),
    h: Math.max(MIN_INNER_PX, ch - 2 * reversalD),
  };
  const thickness = clampEdgeThickness(resolveBaseThickness(role, metrics), sashBox.w, sashBox.h);
  return {
    isFixed,
    isDouble,
    hasReversalWall,
    hasReversalSash,
    reversalD,
    sashBox,
    thickness,
    inner: {
      x: sashBox.x + thickness.left,
      y: sashBox.y + thickness.top,
      w: Math.max(MIN_INNER_PX, sashBox.w - thickness.left - thickness.right),
      h: Math.max(MIN_INNER_PX, sashBox.h - thickness.top - thickness.bottom),
    },
    sashJoint,
  };
};
