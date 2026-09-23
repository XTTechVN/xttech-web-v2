export type FrameShapeCategory = 'all' | 'basic' | 'arch' | 'corner' | 'special_arch';

export type FrameShape =
  | 'rect'
  | 'arch_half'
  | 'arch_segment'
  | 'arch_semicircle'
  | 'arch_semicircle_open'
  | 'arch_pointed'
  | 'round_top_2'
  | 'round_top_2_open'
  | 'round_top_right'
  | 'round_top_open'
  | 'round_top_rw'
  | 'round_4_corner'
  | 'quad_circle'
  | 'circle'
  | 'ellipse';

export type SashOpenType =
  | 'fixed'
  | 'swing_left'
  | 'swing_right'
  | 'swing_double'
  | 'awning'
  | 'tilt'
  | 'tilt_down'
  | 'tilt_turn'
  | 'sliding';

export type PaneType = 'glass' | 'screen' | 'louver' | 'panel';
export type BeadType = 'square' | 'bevel' | 'round';
export type BeadJointType = '90' | '45';

export interface SceneCellNode {
  id: string;
  name?: string;
  w: number;
  h: number;
  sashType: SashOpenType;
  paneType: PaneType;
  glassName?: string;
  glassThickness?: number;
  beadType?: BeadType;
  beadJoint?: BeadJointType;
  splitDirection?: 'vertical' | 'horizontal';
  splitType?: 'mullion' | 'coupling' | 'sash_pair';
  children?: SceneCellNode[];
  hasLock?: boolean;
  handleHeight?: number;
  handleType?: 'lever' | 'pull' | 'crescent' | 'multipoint';
  mullionProfileId?: number;
  mullionCutType?: MullionCutType;
}

export interface ColorSwatch {
  name: string;
  colorHex: string;
  code: string;
}

export const ALUMINUM_PALETTE: ColorSwatch[] = [
  { name: 'Vàng Sâm panh', colorHex: '#C6A869', code: 'champagne' },
  { name: 'Đen Tuyền', colorHex: '#222629', code: 'black' },
  { name: 'Vân Gỗ Hoàng Gia', colorHex: '#955F20', code: 'wood_grain' },
  { name: 'Nâu Cà Phê', colorHex: '#4A3525', code: 'coffee_bronze' },
  { name: 'Trắng Sứ Nano', colorHex: '#F3F4F6', code: 'white_nano' },
  { name: 'Xám Ghi Metalic', colorHex: '#475569', code: 'dark_grey' },
  { name: 'Xám Bạc', colorHex: '#94A3B8', code: 'silver_grey' },
];

export const HARDWARE_PALETTE: ColorSwatch[] = [
  { name: 'Đen Mờ', colorHex: '#1E293B', code: 'black' },
  { name: 'Trắng', colorHex: '#F8FAFC', code: 'white' },
  { name: 'Bạc Kim Loại', colorHex: '#CBD5E1', code: 'silver' },
  { name: 'Ghi Xám', colorHex: '#64748B', code: 'grey' },
  { name: 'Đồng Cổ', colorHex: '#854D0E', code: 'bronze' },
];

export interface FrameShapeItem {
  id: FrameShape;
  name: string;
  category: FrameShapeCategory;
  svgPath: string;
  viewBox?: string;
}

export const FRAME_SHAPE_ITEMS: FrameShapeItem[] = [
  // Cơ bản
  {
    id: 'rect',
    name: 'Chữ nhật',
    category: 'basic',
    svgPath: 'M 4 4 H 36 V 36 H 4 Z',
  },
  // Vòm
  {
    id: 'arch_half',
    name: 'Nửa tròn',
    category: 'arch',
    svgPath: 'M 4 36 A 16 16 0 0 1 36 36 Z',
  },
  {
    id: 'arch_segment',
    name: 'Cung tròn',
    category: 'arch',
    svgPath: 'M 4 36 Q 20 18 36 36 Z',
  },
  {
    id: 'arch_semicircle',
    name: 'Vòm bán nguyệt',
    category: 'arch',
    svgPath: 'M 4 36 V 18 A 16 16 0 0 1 36 18 V 36 Z',
  },
  {
    id: 'arch_semicircle_open',
    name: 'Vòm hở chân',
    category: 'arch',
    svgPath: 'M 4 36 V 18 A 16 16 0 0 1 36 18 V 36',
  },
  {
    id: 'arch_pointed',
    name: 'Vòm nhọn (Gothic)',
    category: 'arch',
    svgPath: 'M 4 36 V 20 Q 8 6 20 2 Q 32 6 36 20 V 36 Z',
  },
  // Bo góc
  {
    id: 'round_top_2',
    name: 'Bo 2 góc trên',
    category: 'corner',
    svgPath: 'M 4 36 V 14 Q 4 4 14 4 H 26 Q 36 4 36 14 V 36 Z',
  },
  {
    id: 'round_top_2_open',
    name: 'Bo trên hở chân',
    category: 'corner',
    svgPath: 'M 4 36 V 14 Q 4 4 14 4 H 26 Q 36 4 36 14 V 36',
  },
  {
    id: 'round_top_right',
    name: 'Bo góc trên phải',
    category: 'corner',
    svgPath: 'M 4 36 V 4 H 24 Q 36 4 36 16 V 36 Z',
  },
  {
    id: 'round_4_corner',
    name: 'Bo tròn 4 góc',
    category: 'corner',
    svgPath: 'M 4 14 Q 4 4 14 4 H 26 Q 36 4 36 14 V 26 Q 36 36 26 36 H 14 Q 4 36 4 26 Z',
  },
  // Vòm đặc biệt
  {
    id: 'quad_circle',
    name: '1/4 hình tròn',
    category: 'special_arch',
    svgPath: 'M 4 36 V 4 A 32 32 0 0 1 36 36 Z',
  },
  {
    id: 'circle',
    name: 'Hình tròn',
    category: 'special_arch',
    svgPath: 'M 20 4 A 16 16 0 1 1 19.99 4 Z',
  },
  {
    id: 'ellipse',
    name: 'Hình elip',
    category: 'special_arch',
    svgPath: 'M 20 6 A 16 12 0 1 1 19.99 6 Z',
  },
];

export interface SashTypeItem {
  id: SashOpenType;
  name: string;
  description: string;
}

export const SASH_TYPE_ITEMS: SashTypeItem[] = [
  { id: 'fixed', name: 'Ô kính cố định (Fix)', description: 'Vách kính không mở' },
  { id: 'swing_left', name: 'Mở quay trái', description: 'Bản lề cánh nằm bên trái' },
  { id: 'swing_right', name: 'Mở quay phải', description: 'Bản lề cánh nằm bên phải' },
  { id: 'swing_double', name: 'Mở quay 2 cánh', description: 'Cặp cánh mở quay đối xứng' },
  { id: 'awning', name: 'Mở hất (Awning - Khóa dưới)', description: 'Đẩy góc ra ngoài che mưa, khóa ở cạnh dưới' },
  { id: 'tilt', name: 'Mở lật (Tilt - Khóa dưới)', description: 'Lật cánh lấy thoáng, khóa ở cạnh dưới' },
  { id: 'tilt_down', name: 'Lật xuống (Hopper - Khóa trên)', description: 'Lật cánh từ trên xuống, khóa ở cạnh trên' },
  { id: 'tilt_turn', name: 'Mở quay lật', description: 'Kết hợp quay và lật 2 chế độ' },
  { id: 'sliding', name: 'Trượt lùa', description: 'Cánh trượt ngang tiết kiệm diện tích' },
];

export type StudioMainTab = 'info' | 'draw' | 'config' | 'bom' | 'accessories';

export type FrameCornerJoint = '45' | '90_horiz' | '90_vert' | '45_top_90_bot' | '63';
export type SashCornerJoint = '45' | '90_vert' | '45_top_90_bot' | '90_horiz';
export type BeadCornerJoint = '45' | '90_horiz' | '90_vert';

export interface FrameEdgeProfile {
  profileId?: number;
  profileCode?: string;
  offsetMm: number;
}

export interface FrameConfig {
  isOpenBottom: boolean;
  cornerJoint: FrameCornerJoint;
  leftEdge: FrameEdgeProfile;
  topEdge: FrameEdgeProfile;
  rightEdge: FrameEdgeProfile;
  bottomEdge: FrameEdgeProfile;
  mullionMode: 'none' | 'single' | 'separate';
  mullionProfileId?: number;
  mullionVertProfileId?: number;
  mullionHorizProfileId?: number;
  hasSafetyBars: boolean;
  beadProfileId?: number;
  beadCornerJoint: BeadCornerJoint;
  couplingProfileId?: number;
  isReversedWall: boolean;
  isReversedSash: boolean;
}

export interface SashConfig {
  hasScreenSash: boolean;
  family: string;
  sashStyle: 'standard' | 'slim';
  ngamNgangMm: number;
  ngamDocMm: number;
  truDoDongMm: number;
  offsetMm: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  cornerJoint: SashCornerJoint;
  beadCornerJoint: BeadCornerJoint;
  isNhomCo: boolean;
  leftProfileId?: number;
  topProfileId?: number;
  rightProfileId?: number;
  bottomProfileId?: number;
  mullionProfileId?: number;
  beadProfileId?: number;
  dynamicMullionProfileId?: number;
}

export const DEFAULT_FRAME_CONFIG: FrameConfig = {
  isOpenBottom: false,
  cornerJoint: '45',
  leftEdge: { offsetMm: 0 },
  topEdge: { offsetMm: 0 },
  rightEdge: { offsetMm: 0 },
  bottomEdge: { offsetMm: 0 },
  mullionMode: 'none',
  hasSafetyBars: false,
  beadCornerJoint: '45',
  isReversedWall: false,
  isReversedSash: false,
};

export const DEFAULT_SASH_CONFIG: SashConfig = {
  hasScreenSash: false,
  family: 'Cửa sổ mở quay/Hất',
  sashStyle: 'standard',
  ngamNgangMm: 0,
  ngamDocMm: 0,
  truDoDongMm: 0,
  offsetMm: { left: 0, top: 0, right: 0, bottom: 0 },
  cornerJoint: '45',
  beadCornerJoint: '45',
  isNhomCo: false,
};

export interface DoorStudioState {
  name: string;
  code: string;
  type: string;
  seriesId?: number;
  specification: string;
  w: number;
  h: number;
  frameShape: FrameShape;
  aluminumColor: string;
  hardwareColor: string;
  selectedCellId: string | null;
  activeMainTab: StudioMainTab;
  activeLeftTab: 'frame' | 'sash';
  frameShapeCategory: FrameShapeCategory;
  rootCell: SceneCellNode;
  frameConfig: FrameConfig;
  sashConfig: SashConfig;
  zoomLevel: number;
}

export type MullionCutType = 'inside_frame' | 'overlap' | 'miter' | 'square';

export interface MullionInfo {
  id: string;
  parentNodeId: string;
  mullionIndex: number;
  direction: 'vertical' | 'horizontal';
  dimension: number;
  totalDimension: number;
  profileId?: number;
  cutType?: MullionCutType;
  childId: string;
  nextChildId?: string;
}
