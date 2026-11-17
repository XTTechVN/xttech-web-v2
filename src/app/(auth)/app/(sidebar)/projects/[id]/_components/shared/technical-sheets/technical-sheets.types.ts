import type { DoorFulfillmentType } from '@/types';
import type { FrameConfig, FrameShape, SashConfig, SceneCellNode } from '@/components';

export interface CombinedSheetAccessory {
  code: string;
  name: string;
  quantity: number;
  unit: string;
}

export type FulfillmentFilter = 'all' | DoorFulfillmentType;

export interface SheetCadProps {
  w: number;
  h: number;
  aluminumColor: string;
  hardwareColor: string;
  frameShape: FrameShape;
  frameConfig: FrameConfig;
  sashConfig: SashConfig;
  rootCell: SceneCellNode | null;
}
