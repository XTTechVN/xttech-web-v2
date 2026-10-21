// Kế hoạch cắt thanh nhôm theo lệnh sản xuất (khớp CuttingPlanResponse của backend)
export type CuttingPlanStatus = 'draft' | 'issued' | 'cancelled';
export type CuttingBarSource = 'standard' | 'offcut';

export interface CuttingPiece {
  positionId?: number | null;
  positionCode?: string | null;
  lengthMm: number;
  angle?: string | null;
  barType?: string | null;
  seq: number;
}

export interface CuttingBar {
  id: number;
  profileCode: string;
  profileName?: string | null;
  colorId?: number | null;
  colorName?: string | null;
  sourceType: CuttingBarSource;
  offcutId?: number | null;
  location?: string | null;
  stockLengthMm: number;
  usedMm: number;
  wasteMm: number;
  isOffcutReturnSuggested: boolean;
  isOffcutReturned: boolean;
  pieces: CuttingPiece[];
}

export interface CuttingPlanSummary {
  totalBars: number;
  standardBars: number;
  offcutBars: number;
  totalPieces: number;
  wastePercent: number;
  suggestedOffcutReturns: number;
}

export interface CuttingPlan {
  id: number;
  productionOrderId: number;
  version: number;
  status: CuttingPlanStatus;
  kerfMm: number;
  isEstimated: boolean;
  summary: CuttingPlanSummary;
  createdAt: string;
  bars: CuttingBar[];
}

export interface ReturnOffcutsResult {
  returnedCount: number;
  skippedBarIds: number[];
}

// Tiến độ từng cửa (khớp ProgressStepCode của backend)
export type ProgressStepCode =
  | 'surveyed'
  | 'producing'
  | 'factory_done'
  | 'delivered'
  | 'installed'
  | 'accepted';

export interface EvidenceMediaItem {
  url: string;
  name?: string;
  type?: 'image' | 'video' | string;
}

export interface AdvanceProgressPayload {
  positionIds: number[];
  targetStep?: ProgressStepCode;
  note?: string;
  evidenceMedia?: EvidenceMediaItem[];
}

