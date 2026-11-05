export type AluminumSurfaceType = 'powder_coat' | 'anodize';
export type AluminumFinishPreset = 'matte' | 'satin' | 'glossy';
export type DisplayEnvMode = 'studio' | 'technical';
export type FloorMaterialType = 'tile_60x60' | 'tile_80x80' | 'tile_60x120' | 'wood';

export interface Door3DCustomSettings {
  // 1. Kích thước Sâu (mm)
  frameDepthMm: number;
  sashDepthMm: number;
  glassThicknessMm: number;
  mullionDepthMm: number;
  handleDepthMm: number;
  multiplyByZLayers: boolean;

  // 2. Hiệu chỉnh vị trí Tay nắm
  handleOffsetXMm: number;
  handleOffsetYMm: number;
  bothSidesHandle: boolean;

  // 3. Vật liệu Nhôm & Tay nắm
  surfaceType: AluminumSurfaceType;
  finishPreset: AluminumFinishPreset;
  roughness: number; // 0.0 -> 1.0
  metalness: number; // 0.0 -> 1.0
  handleColorMode: 'design' | string;

  // 4. Kính
  glassColorHex: string;
  glassTransparency: number; // 0.0 -> 1.0
  glassRoughness: number; // 0.0 -> 1.0
  glassFrost: number; // 0.0 -> 1.0

  // 5. Không gian hiển thị & Mặt sàn
  displayMode: DisplayEnvMode;
  floorType: FloorMaterialType;
}

export const DEFAULT_DOOR_3D_SETTINGS: Door3DCustomSettings = {
  frameDepthMm: 105,
  sashDepthMm: 49,
  glassThicknessMm: 8,
  mullionDepthMm: 105,
  handleDepthMm: 47,
  multiplyByZLayers: true,

  handleOffsetXMm: 0,
  handleOffsetYMm: 0,
  bothSidesHandle: true,

  surfaceType: 'powder_coat',
  finishPreset: 'matte',
  roughness: 0.25,
  metalness: 0.24,
  handleColorMode: 'design',

  glassColorHex: '#88ccff',
  glassTransparency: 0.34,
  glassRoughness: 0.3,
  glassFrost: 0.16,

  displayMode: 'studio',
  floorType: 'wood',
};

export const FINISH_PRESET_VALUES: Record<
  AluminumFinishPreset,
  { roughness: number; metalness: number }
> = {
  matte: { roughness: 0.55, metalness: 0.22 },
  satin: { roughness: 0.28, metalness: 0.42 },
  glossy: { roughness: 0.06, metalness: 0.65 },
};
