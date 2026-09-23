import { DOOR_TYPE_MAP } from './formula';
import { DoorSeries } from './door-series';

export interface DoorTypeConfig {
  label: string;
  className: string;
}

export const DOOR_TYPE_CONFIG: Record<string, DoorTypeConfig> = {
  cd: {
    label: 'Cửa đi',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  },
  cs: {
    label: 'Cửa sổ',
    className: 'bg-blue-50 text-blue-700 border-blue-200/70',
  },
  ck: {
    label: 'Cửa kính',
    className: 'bg-amber-50 text-amber-700 border-amber-200/70',
  },
};

export const getDoorTypeConfig = (type: string | null | undefined): DoorTypeConfig => {
  if (!type) {
    return {
      label: '—',
      className: 'bg-gray-50 text-gray-600 border-gray-200/70',
    };
  }
  const key = type.toLowerCase().trim();
  if (DOOR_TYPE_CONFIG[key]) {
    return DOOR_TYPE_CONFIG[key];
  }
  const mappedLabel = (DOOR_TYPE_MAP as Record<string, string>)[key] || type;
  return {
    label: mappedLabel,
    className: 'bg-gray-50 text-gray-700 border-gray-200/70',
  };
};

export const formatDoorType = (type: string | null | undefined): string => {
  if (!type) return '';
  return getDoorTypeConfig(type).label;
};

export interface DoorImage {
  id: number;
  doorId: number;
  imagePath: string;
  name?: string | null;
  isPrimary: boolean;
  createdAt: string;
}

export interface Door {
  id: number;
  doorSeriesId?: number | null;
  doorSeries?: DoorSeries | null;
  type: string | null;
  code: string | null;
  name: string;
  imagePath: string | null;
  images?: DoorImage[];
  specification: string | null;
  systemConfig?: Record<string, any> | null;
  imageB64?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileBarCut {
  name: string;
  side?: number | null;
  length: number;
  goc1: number;
  goc2: number;
  formula?: string | null;
  category: string;
  frameEdge?: string | null;
  qty: number;
  weightPerM: number;
  profileId?: number | null;
  profileCode?: string | null;
  profileName?: string | null;
}

export interface BeadCut {
  name: string;
  length: number;
  goc1: number;
  goc2: number;
  formula?: string | null;
  thicknessMm: number;
  category: string;
  qty: number;
  profileId?: number | null;
  profileCode?: string | null;
}

export interface GlassCellBOM {
  path: string;
  w: number;
  h: number;
  glassW: number;
  glassH: number;
  areaM2: number;
  pricingAreaM2: number;
  openType?: string | null;
  glassName?: string | null;
  glassPrice?: number | null;
}

export interface DoorCalculateResponse {
  w: number;
  h: number;
  bars: ProfileBarCut[];
  groupedBars: ProfileBarCut[];
  beads: BeadCut[];
  groupedBeads: BeadCut[];
  cells: GlassCellBOM[];
  sashCounts: Record<string, number>;
  totalAluminumWeightKg: number;
  totalGlassAreaM2: number;
}

export interface DoorCalculateRequest {
  doorId?: number;
  systemConfig?: Record<string, any>;
  width?: number;
  height?: number;
  glassPrice?: number;
}

export interface DoorCreate {
  name: string;
  doorSeriesId?: number | null;
  type?: string;
  code?: string;
  imagePath?: string;
  specification?: string;
  systemConfig?: Record<string, any>;
  imageB64?: string;
}

export interface DoorUpdate {
  name?: string;
  doorSeriesId?: number | null;
  type?: string;
  code?: string;
  imagePath?: string;
  specification?: string;
  systemConfig?: Record<string, any>;
  imageB64?: string;
}

export interface DoorQueryParams {
  search?: string;
  type?: string;
  code?: string;
  doorSeriesId?: number;
  brandId?: number;
  offset?: number;
  limit?: number;
}

export interface DoorAssignAccessories {
  accessoryIds: number[];
}

export interface DoorUnassignAccessories {
  accessoryIds: number[];
}
