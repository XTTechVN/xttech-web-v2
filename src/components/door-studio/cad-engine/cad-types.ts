import {
  SceneCellNode,
  FrameShape,
  FrameConfig,
  SashConfig,
  MullionInfo,
  MullionCutType,
  SlidingSashRole,
  FrameCornerJoint,
  SashCornerJoint,
} from '../studio-types';
import { ProfileBar } from '@/types/profile';

export interface ResizeSplitParams {
  parentNodeId: string;
  splitIndex: number;
  direction: 'vertical' | 'horizontal';
  childId: string;
  nextChildId?: string;
  newDimension: number;
  isFinal: boolean;
}

export interface DoorCadRendererProps {
  id?: string;
  hideDimensions?: boolean;
  w: number;
  h: number;
  aluminumColor: string;
  hardwareColor: string;
  frameShape: FrameShape;
  rootCell: SceneCellNode;
  selectedCellId: string | null;
  onSelectCell: (cellId: string | null) => void;
  onSelectMullion?: (mullion: MullionInfo) => void;
  selectedMullionId?: string | null;
  onEditDimension?: (
    target: 'w' | 'h' | 'cell' | 'cell-w' | 'cell-h' | 'handleHeight',
    cellId?: string,
    displayedVal?: number
  ) => void;
  onUpdateDimension?: (
    target: 'w' | 'h' | 'cell' | 'cell-w' | 'cell-h' | 'handleHeight',
    value: number,
    cellId?: string,
    isFinal?: boolean
  ) => void;
  onResizeSplit?: (params: ResizeSplitParams) => void;
  frameConfig?: FrameConfig;
  sashConfig?: SashConfig;
  availableProfiles?: ProfileBar[];
}

export interface LeafCell {
  node: SceneCellNode;
  x: number;
  y: number;
  w: number;
  h: number;
  rawX?: number;
  rawY?: number;
  rawW?: number;
  rawH?: number;
  touchesFloor?: boolean;
  /** Chế độ đảo riêng của ô (chỉ có khi ô ghi đè reversalOverride; không có = theo metrics.reversalMode) */
  effectiveReversalMode?: 'none' | 'wall' | 'sash';
  /** Bề rộng thanh đảo riêng của ô (px, chỉ có khi ô ghi đè đảo) */
  reversalD?: number;
  /** Độ dày 4 cạnh cánh riêng của ô (px) */
  sashEdges?: EdgeThickness;
  /** Độ dày 4 cạnh cánh riêng của ô (mm, dùng cho 3D) */
  sashMmEdges?: EdgeThickness;
  /** Kiểu ghép góc cánh riêng của ô */
  sashCornerJoint?: SashCornerJoint;
  /** Bề rộng nẹp kính riêng của ô (px) */
  beadW?: number;
  /** Bề rộng nẹp kính riêng của ô (mm, dùng cho 3D) */
  beadMm?: number;
}

/** Đoạn thanh khung đáy còn lại khi cửa Hở đáy từng phần (cùng hệ tọa độ với layout) */
export interface BottomBarSegment {
  x0: number;
  x1: number;
  /** Đầu trái chạm khung đứng trái (ghép góc theo cấu hình khung) - ngược lại đâm 90° vào đố đứng */
  isFrameStart: boolean;
  /** Đầu phải chạm khung đứng phải */
  isFrameEnd: boolean;
}

export interface MullionBar {
  x: number;
  y: number;
  w: number;
  h: number;
  direction?: 'vertical' | 'horizontal';
  cutType?: MullionCutType;
  cutStart?: boolean;
  cutEnd?: boolean;
  isSashMullion?: boolean;
  isCoupling?: boolean;
  info: MullionInfo;
}

export interface CouplingSeamBar {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  direction: 'vertical' | 'horizontal';
  parentNodeId: string;
  splitIndex: number;
  childId: string;
  nextChildId: string;
  dimension: number;
  nextDimension: number;
  totalDimension: number;
}

export interface FrameBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  frameEdges?: EdgeThickness;
  frameMmEdges?: EdgeThickness;
  cornerJoint?: FrameCornerJoint;
  isOpenBottom?: boolean;
  isPartialBottomOpen?: boolean;
  isLeftBottomOpen?: boolean;
  isRightBottomOpen?: boolean;
  bottomBarSegments?: BottomBarSegment[];
  bottomOpenRanges?: Array<{ startX: number; endX: number; cellId: string }>;
}

export interface CurvedFramePaths {
  outerPath: string;
  innerPath: string;
}

export interface VerticalSlice {
  id: string;
  w: number;
  xStart: number;
  xEnd: number;
  isHybrid?: boolean;
  editableCellId?: string;
}

/** Äá»™ dÃ y tá»«ng cáº¡nh (px, sá»‘ thá»±c) cá»§a khung bao / khung cÃ¡nh */
export interface EdgeThickness {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type CadReversalMode = 'none' | 'wall' | 'sash';

/**
 * Sá»‘ Ä‘o thá»±c cá»§a báº£n váº½ (px, sá»‘ thá»±c, = mm Ã— scale): Ä‘á»™ dÃ y tá»«ng cáº¡nh khung bao / khung cÃ¡nh,
 * náº¹p, Ä‘á»‘, Ä‘áº£o khung, Ä‘á»™ ngáº­m cÃ¡nh lÃ¹a. Nguá»“n duy nháº¥t cho má»i sub-renderer.
 */
export interface CadMetrics {
  scale: number;
  frame: EdgeThickness;
  sash: EdgeThickness;
  /** Äá»™ dÃ y cÃ¡nh lÃ¹a theo vai trÃ² (khi cáº¥u hÃ¬nh biáº¿n thá»ƒ profile riÃªng cho cÃ¡nh lÃ¹a) */
  slidingSash: Partial<Record<SlidingSashRole, EdgeThickness>>;
  bead: number;
  reversal: number;
  reversalMode: CadReversalMode;
  vertMullion: number;
  horizMullion: number;
  /** Äá»‘ cÃ¡nh (chia Ã´ bÃªn trong 1 cÃ¡nh) */
  sashMullion: number;
  /** Äá»‘ Ä‘á»™ng (astragal) giá»¯a 2 cÃ¡nh má»Ÿ quay */
  astragal: number;
  slidingOverlap: number;
}
