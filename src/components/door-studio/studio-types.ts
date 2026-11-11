export type ProfileIdRef = number | string;

export type FrameShapeCategory = 'all' | 'basic' | 'arch' | 'corner' | 'special_arch';

export type FrameShape =
  | 'rect'
  | 'arch_half'
  | 'arch_segment'
  | 'arch_semicircle'
  | 'arch_semicircle_open'
  | 'arch_segment_leg'
  | 'arch_segment_leg_open'
  | 'arch_pointed'
  | 'arch_pointed_leg'
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
  | 'sliding'
  | (string & {});

export type PaneType = 'glass' | 'screen' | 'louver' | 'panel';
export type BeadType = 'square' | 'bevel' | 'round';
export type BeadJointType = '90' | '45';

export interface CustomEdgeBeads {
  bottom?: ProfileIdRef | null;
  top?: ProfileIdRef | null;
  left?: ProfileIdRef | null;
  right?: ProfileIdRef | null;
}

export interface GlassGrilleMotif {
  id: string;
  motifType: 'flower_classic' | 'rhombus' | 'lotus' | string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  price?: number;
  accessoryId?: number;
  accessoryCode?: string;
  gridCol?: number; // Chỉ số cột nan liên kết (0, 1...)
  gridRow?: number; // Chỉ số hàng nan liên kết (0, 1...)
}

export const MOTIF_ROTATION_OPTIONS = [
  { value: 0, label: '0° (Đứng)', shortLabel: '0°' },
  { value: 90, label: '90° (Ngang)', shortLabel: '90°' },
  { value: 180, label: '180° (Ngược)', shortLabel: '180°' },
  { value: 270, label: '270° (Ngang trái)', shortLabel: '270°' },
] as const;

export interface GlassGrilleConfig {
  enabled: boolean;
  applyToAllSashes?: boolean;
  glassW: number;
  glassH: number;
  installedW: number;
  installedH: number;
  hasGrid: boolean;
  hasBorder: boolean;
  hasCorner: boolean;
  barWidth: number;
  barColor: string;
  cols: number;
  rows: number;
  borderOffset: number;
  cornerSize: number;
  colPositions?: number[]; // Tọa độ x (mm) của từng thanh nan dọc
  rowPositions?: number[]; // Tọa độ y (mm) của từng thanh nan ngang
  isSymmetric?: boolean;   // Khóa đối xứng nan
  motifs: GlassGrilleMotif[];
  templateName?: string;
  unitPricePerM?: number;
  motifUnitPrice?: number;
}

export const GRILLE_COLORS: ColorSwatch[] = [
  { name: 'Vàng Đồng', colorHex: '#D4AF37', code: 'gold' },
  { name: 'Bạc Kim Loại', colorHex: '#CBD5E1', code: 'silver' },
  { name: 'Trắng Sứ', colorHex: '#FFFFFF', code: 'white' },
  { name: 'Đen Nhám', colorHex: '#1E293B', code: 'black' },
  { name: 'Đồng Cổ / Nâu', colorHex: '#78350F', code: 'brown' },
];

export interface SashMullionConfig {
  count: number;
  direction: 'vertical' | 'horizontal';
  positions?: number[];
}

export interface SceneCellNode {
  id: string;
  name?: string;
  w: number;
  h: number;
  sashType: SashOpenType;
  paneType: PaneType;
  glassName?: string;
  glassThickness?: number;
  glassSplitCount?: number;
  customBeads?: CustomEdgeBeads;
  beadType?: BeadType;
  beadJoint?: BeadJointType;
  splitDirection?: 'vertical' | 'horizontal';
  splitType?: 'mullion' | 'coupling' | 'sash_pair' | 'sash_mullion';
  children?: SceneCellNode[];
  hasLock?: boolean;
  handleHeight?: number;
  handleType?: 'lever' | 'pull' | 'crescent' | 'multipoint' | 'khoa-sap' | 'd-trai' | 'd-phai' | (string & {});
  mullionProfileId?: ProfileIdRef;
  mullionCutType?: MullionCutType;
  grilleConfig?: GlassGrilleConfig;
  sashMullions?: SashMullionConfig;
  sashLayout?: string;
  sashZIndex?: number;
  sashArrow?: string;
  sashJoiner?: boolean;
  sashJoinerPair?: boolean;
  sashHingeSymbol?: string;
  isHydraulic?: boolean;
  hoNenMm?: number;
  ngamNgangMm?: number;
  ngamDocMm?: number;
  slidingOverlapMm?: number;
  /** Ghi đè Đảo vách / Đảo cánh riêng cho ô (mặc định 'inherit' = theo FrameConfig toàn cục) */
  reversalOverride?: CellReversalOverride;
  hasFrameReversalOverride?: boolean;
  /** Ghi đè mã thanh REVERSAL riêng cho ô */
  reversalProfileIdOverride?: ProfileIdRef | null;
  /** Ghi đè khoảng hở/ngậm đảo riêng cho ô (mm) */
  reversalOffsetMmOverride?: number | null;
  /** Ghi đè Hở/Kín cạnh đáy riêng cho ô chạm sàn (mặc định 'inherit') */
  openBottomOverride?: CellOpenBottomOverride;
  hasBottomFrameOverride?: boolean;
  /** Mã kính đã chọn cho ô (null/undefined = dùng kính mặc định) */
  glassId?: number | null;
  /** Hiệu ứng thị giác của kính (chỉ để hiển thị 2D/3D) */
  glassVisualEffect?: GlassVisualEffect;
  /** true: người dùng tự chọn hiệu ứng, không theo vật liệu kính */
  glassVisualEffectOverride?: boolean;
  /** Màu kính (hex) cho hiệu ứng 'tinted' */
  glassVisualColor?: string;
  /** Đánh dấu node con là một Khối khung bao độc lập (tạo bởi Ghép Khung Bao) */
  isFrameUnit?: boolean;
  /** Ghi đè Hệ nhôm (cùng Brand) cho Khối khung hoặc Ô lá */
  seriesIdOverride?: number | null;
  /** Ghi đè cấp Khối khung (Frame Unit) */
  frameProfileIdOverride?: ProfileIdRef | null;
  frameLeftProfileIdOverride?: ProfileIdRef | null;
  frameTopProfileIdOverride?: ProfileIdRef | null;
  frameRightProfileIdOverride?: ProfileIdRef | null;
  frameBottomProfileIdOverride?: ProfileIdRef | null;
  mullionProfileIdOverride?: ProfileIdRef | null;
  frameCornerJointOverride?: FrameCornerJoint | null;
  /** Ghi đè cấp Ô lá / Cánh (Leaf Cell) */
  sashProfileIdOverride?: ProfileIdRef | null;
  sashLeftProfileIdOverride?: ProfileIdRef | null;
  sashTopProfileIdOverride?: ProfileIdRef | null;
  sashRightProfileIdOverride?: ProfileIdRef | null;
  sashBottomProfileIdOverride?: ProfileIdRef | null;
  sashCornerJointOverride?: SashCornerJoint | null;
  beadProfileIdOverride?: ProfileIdRef | null;
}

export type GlassVisualEffect = 'clear' | 'tinted' | 'frosted' | 'striped' | 'rain' | 'pattern';

export type CellReversalOverride = 'inherit' | 'none' | 'wall' | 'sash';
export type CellOpenBottomOverride = 'inherit' | 'open' | 'closed';

/** Khoảng ngang (px/mm theo hệ tọa độ layout) của ô chạm sàn đang Hở cạnh đáy */
export interface BottomOpenRange {
  x0: number;
  x1: number;
  floorGapMm: number;
  cellId: string;
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
  label?: string;
  category: FrameShapeCategory;
  svgPath: string;
  viewBox?: string;
}

export const FRAME_SHAPE_ITEMS: FrameShapeItem[] = [
  // Cơ bản
  {
    id: 'rect',
    name: 'Chữ nhật',
    label: 'Chữ nhật',
    category: 'basic',
    svgPath: 'M 4 4 H 36 V 36 H 4 Z',
  },
  // Vòm (Đủ 8 mẫu chuẩn)
  {
    id: 'arch_half',
    name: 'Nửa tròn',
    label: 'Nửa tròn',
    category: 'arch',
    svgPath: 'M 4 34 A 16 16 0 0 1 36 34 Z',
  },
  {
    id: 'arch_segment',
    name: 'Cung tròn',
    label: 'Cung tròn',
    category: 'arch',
    svgPath: 'M 4 32 A 22 22 0 0 1 36 32 Z',
  },
  {
    id: 'arch_semicircle',
    name: 'Vòm bán nguyệt',
    label: 'Vòm bán nguyệt',
    category: 'arch',
    svgPath: 'M 4 36 V 20 A 16 16 0 0 1 36 20 V 36 Z',
  },
  {
    id: 'arch_semicircle_open',
    name: 'Vòm bán nguyệt - hở chân',
    label: 'Vòm bán nguyệt - hở chân',
    category: 'arch',
    svgPath: 'M 4 36 V 20 A 16 16 0 0 1 36 20 V 36',
  },
  {
    id: 'arch_segment_leg',
    name: 'Vòm cung',
    label: 'Vòm cung',
    category: 'arch',
    svgPath: 'M 4 36 V 16 A 22 22 0 0 1 36 16 V 36 Z',
  },
  {
    id: 'arch_segment_leg_open',
    name: 'Vòm cung - hở chân',
    label: 'Vòm cung - hở chân',
    category: 'arch',
    svgPath: 'M 4 36 V 16 A 22 22 0 0 1 36 16 V 36',
  },
  {
    id: 'arch_pointed',
    name: 'Vòm nhọn 2 cung',
    label: 'Vòm nhọn 2 cung',
    category: 'arch',
    svgPath: 'M 4 36 A 28 28 0 0 1 20 6 A 28 28 0 0 1 36 36 Z',
  },
  {
    id: 'arch_pointed_leg',
    name: 'Vòm nhọn 2 cung có chân',
    label: 'Vòm nhọn 2 cung có chân',
    category: 'arch',
    svgPath: 'M 4 36 V 22 A 24 24 0 0 1 20 4 A 24 24 0 0 1 36 22 V 36 Z',
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

export type StudioMainTab = 'info' | 'draw' | 'config' | 'bom' | 'accessories' | 'view3d';

export type FrameCornerJoint = '45' | '90_horiz' | '90_vert' | '45_top_90_bot' | '63';
export type SashCornerJoint = '45' | '90_vert' | '45_top_90_bot' | '90_horiz' | 'd_left' | 'd_right';
export type BeadCornerJoint = '45' | '90_horiz' | '90_vert';

export type SlidingSashRole = 'left_sliding' | 'right_sliding' | 'center_sliding';
export type SashOffsetScope = 'all' | SlidingSashRole;

export interface SashOffsetValues {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface SashVariantProfiles {
  leftProfileId?: ProfileIdRef;
  topProfileId?: ProfileIdRef;
  rightProfileId?: ProfileIdRef;
  bottomProfileId?: ProfileIdRef;
}

export type CasementOpenTypeKey = 'outward' | 'inward';

export interface CasementVariants {
  outward?: SashVariantProfiles;
  inward?: SashVariantProfiles;
}

export const OPEN_DIRECTION_LABELS: Record<string, string> = {
  outward: 'Mở ra',
  inward: 'Mở vào',
  sliding: 'Trượt lùa',
  fixed: 'Cố định',
};

export const OPEN_DIRECTION_BADGES: Record<string, { label: string; className: string }> = {
  outward: { label: 'Mở ra', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  inward: { label: 'Mở vào', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

export interface SlidingSashJoints {
  leftSliding: SashCornerJoint;
  rightSliding: SashCornerJoint;
  centerSliding: SashCornerJoint;
}

export interface FrameEdgeProfile {
  profileId?: ProfileIdRef;
  profileCode?: string;
  coverProfileId?: ProfileIdRef;
  coverProfileCode?: string;
  offsetMm: number;
}

export type SafetyBarsPreset = 'equal_frame' | 'inset' | 'no_frame';
export type SafetyBarsCornerJoint = '45' | '90_vert';

export interface SafetyBarsConfig {
  isEnabled: boolean;
  preset: SafetyBarsPreset;
  profileId?: ProfileIdRef;
  cornerJoint: SafetyBarsCornerJoint;
  insetGapMm: number;
  mullionVertProfileId?: ProfileIdRef;
  mullionHorizProfileId?: ProfileIdRef;
}

export const DEFAULT_SAFETY_BARS_CONFIG: SafetyBarsConfig = {
  isEnabled: false,
  preset: 'equal_frame',
  cornerJoint: '45',
  insetGapMm: 3,
};

export type GasketMeasureType =
  | 'bead'            // Theo nẹp kính
  | 'glass_perimeter' // Theo chu vi kính
  | 'glass_width'     // Theo chiều rộng kính
  | 'glass_height'    // Theo chiều cao kính
  | 'frame_perimeter' // Theo chu vi khung
  | 'frame_width'     // Theo chiều rộng khung
  | 'frame_height'    // Theo chiều cao khung
  | 'sash_perimeter'  // Theo chu vi cánh
  | 'sash_width'      // Theo chiều rộng cánh
  | 'sash_height';    // Theo chiều cao cánh

export interface DoorGasketConfigItem {
  id: string;
  gasketId?: number;
  gasketCode?: string;
  gasketName?: string;
  measure: GasketMeasureType;
  countPerCell: number; // Số lần/ô, mặc định 1
  note?: string;
  target: 'frame' | 'sash';
}

export interface DoorCustomExtraItem {
  id: string;
  profileId?: ProfileIdRef;
  profileCode?: string;
  profileName?: string;
  note?: string;
  formulaLen: string; // Công thức dài (vd: W-47.6, H0, Ws-61...)
  angle1: number;     // Góc trái, mặc định 90
  angle2: number;     // Góc phải, mặc định 90
  qty: number;        // Số lượng thanh, mặc định 1
  fixedQty?: boolean; // Cố định/bộ (true) hoặc nhân theo số cánh/ô (false)
  target: 'frame' | 'sash';
}

export interface FrameConfig {
  isOpenBottom: boolean;
  cornerJoint: FrameCornerJoint;
  leftEdge: FrameEdgeProfile;
  topEdge: FrameEdgeProfile;
  rightEdge: FrameEdgeProfile;
  bottomEdge: FrameEdgeProfile;
  mullionMode: 'none' | 'single' | 'separate';
  mullionProfileId?: ProfileIdRef;
  mullionVertProfileId?: ProfileIdRef;
  mullionHorizProfileId?: ProfileIdRef;
  hasSafetyBars: boolean;
  safetyBarsConfig?: SafetyBarsConfig;
  beadProfileId?: ProfileIdRef;
  beadCornerJoint: BeadCornerJoint;
  couplingProfileId?: ProfileIdRef;
  reversalMode?: 'none' | 'wall' | 'sash';
  reversalProfileId?: ProfileIdRef;
  reversalProfileCode?: string;
  reversalOffsetMm?: number;
  isReversedWall: boolean;
  isReversedSash: boolean;
  archConfig?: ArchConfig;
  gaskets?: DoorGasketConfigItem[];
  extras?: DoorCustomExtraItem[];
}

export interface ArchConfig {
  radiusMm?: number;                        // Bán kính R (mm), mặc định tự động theo công thức
  isCutAtApex?: boolean;                    // Cắt vòm tại đỉnh: chia thanh vòm và nẹp vòm thành hai phần trái, phải
  bendingClampingMm?: number;               // Kẹp đầu uốn vòm (mm), mặc định 250
  legJoinMode?: 'continuous' | 'separate';  // 'continuous' (Phương án B - Mặc định) | 'separate' (Phương án A)
}

export const DEFAULT_ARCH_CONFIG: ArchConfig = {
  radiusMm: undefined,
  isCutAtApex: false,
  bendingClampingMm: 250,
  legJoinMode: 'continuous',
};

export type DoorSystemFamily =
  | 'Cửa đi mở quay'
  | 'Cửa sổ mở quay/Hất'
  | 'Cửa đi lùa'
  | 'Cửa sổ lùa'
  | 'Cửa xếp trượt'
  | 'Cửa trượt quay'
  | (string & {});

export const DOOR_SYSTEM_FAMILIES: DoorSystemFamily[] = [
  'Cửa đi lùa',
  'Cửa sổ lùa',
  'Cửa đi mở quay',
  'Cửa sổ mở quay/Hất',
  'Cửa xếp trượt',
  'Cửa trượt quay',
];

export interface SashConfig {
  hasScreenSash: boolean;
  family: DoorSystemFamily;
  sashStyle: 'standard' | 'slim';
  voCucProfileId?: ProfileIdRef;
  isHydraulic?: boolean;
  hoNenMm: number;
  hoLeMm?: number;
  ngamNgangMm: number;
  ngamDocMm: number;
  truDoDongMm: number;
  offsetMm: SashOffsetValues;
  offsetApplyTo?: SashOffsetScope;
  slidingOffsets?: Partial<Record<SashOffsetScope, SashOffsetValues>>;
  cornerJoint: SashCornerJoint;
  slidingJoints?: SlidingSashJoints;
  beadCornerJoint: BeadCornerJoint;
  isNhomCo: boolean;
  slidingOverlapMm?: number;
  profileId?: ProfileIdRef;
  leftProfileId?: ProfileIdRef;
  topProfileId?: ProfileIdRef;
  rightProfileId?: ProfileIdRef;
  bottomProfileId?: ProfileIdRef;
  bottomRailProfileId?: ProfileIdRef;
  edges?: {
    bottom?: {
      profileId?: ProfileIdRef;
      enabled?: boolean;
    };
    [key: string]: unknown;
  };
  slidingVariants?: Partial<Record<SlidingSashRole, SashVariantProfiles>>;
  casementVariants?: CasementVariants;
  mullionProfileId?: ProfileIdRef;
  beadProfileId?: ProfileIdRef;
  dynamicMullionProfileId?: ProfileIdRef;
  opNoiProfileId?: ProfileIdRef;
  interlockProfileId?: ProfileIdRef;
  rawDodong?: string;
  rawVariants?: Record<string, unknown>;
  gaskets?: DoorGasketConfigItem[];
  extras?: DoorCustomExtraItem[];
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
  safetyBarsConfig: DEFAULT_SAFETY_BARS_CONFIG,
  beadCornerJoint: '45',
  reversalMode: 'none',
  reversalOffsetMm: 0,
  isReversedWall: false,
  isReversedSash: false,
  archConfig: DEFAULT_ARCH_CONFIG,
  gaskets: [],
  extras: [],
};

export const DEFAULT_SASH_CONFIG: SashConfig = {
  hasScreenSash: false,
  family: 'Cửa sổ mở quay/Hất',
  sashStyle: 'standard',
  isHydraulic: false,
  hoNenMm: 8,
  ngamNgangMm: 5,
  ngamDocMm: 5,
  truDoDongMm: 0,
  offsetMm: { left: 0, top: 0, right: 0, bottom: 0 },
  cornerJoint: '45',
  beadCornerJoint: '45',
  isNhomCo: false,
  slidingOverlapMm: undefined,
  gaskets: [],
  extras: [],
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

/** Kiểu cắt đố khung chuẩn Windova: lọt khung, cắt cả 2 đầu khung, cắt đầu trái/trên, cắt đầu phải/dưới */
export type MullionCutType = 'inside_frame' | 'cut_both' | 'cut_left' | 'cut_right';

export const MULLION_CUT_ORDER: readonly MullionCutType[] = [
  'inside_frame',
  'cut_both',
  'cut_left',
  'cut_right',
] as const;

export const MULLION_CUT_LABELS: Record<MullionCutType, string> = {
  inside_frame: 'Lọt khung →',
  cut_both: 'Cắt cả 2 →',
  cut_left: 'Cắt trái →',
  cut_right: 'Cắt phải →',
};

export function normalizeMullionCutType(raw?: string | null): MullionCutType {
  if (raw === 'cut_both' || raw === 'cut_left' || raw === 'cut_right') {
    return raw;
  }
  return 'inside_frame';
}

export function resolveMullionCutEnds(
  cutType?: string | null,
  touchesStartFrame = true,
  touchesEndFrame = true
): { cutStart: boolean; cutEnd: boolean } {
  const norm = normalizeMullionCutType(cutType);
  return {
    cutStart: (norm === 'cut_left' || norm === 'cut_both') && touchesStartFrame,
    cutEnd: (norm === 'cut_right' || norm === 'cut_both') && touchesEndFrame,
  };
}

export interface MullionInfo {
  id: string;
  parentNodeId: string;
  mullionIndex: number;
  direction: 'vertical' | 'horizontal';
  dimension: number;
  totalDimension: number;
  profileId?: ProfileIdRef;
  cutType?: MullionCutType;
  cutStart?: boolean;
  cutEnd?: boolean;
  childId: string;
  nextChildId?: string;
}
