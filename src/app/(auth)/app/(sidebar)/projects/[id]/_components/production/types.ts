import type { CuttingBar, EvidenceMediaItem, ProgressStepCode } from '@/types';

export type ProductionTab = 'orders' | 'daily';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface StepSectionConfig {
  label: string;
  badgeClass: string;
}

export interface CuttingBarGroup {
  key: string;
  profileCode: string;
  profileName: string;
  colorName: string;
  bars: CuttingBar[];
}

export interface CombinedSheetAccessory {
  code: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface AdvanceVariables {
  positionIds: number[];
  targetStep: ProgressStepCode;
  note?: string;
  evidenceMedia?: EvidenceMediaItem[];
}

