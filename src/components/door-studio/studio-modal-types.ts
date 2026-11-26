import type { Door } from '@/types';
import type { StudioMainTab } from './studio-types';

export interface DoorStudioModalSaveData {
  name: string;
  code: string;
  type: string;
  doorSeriesId?: number | null;
  width: number;
  height: number;
  systemConfig: Record<string, unknown>;
  imageB64?: string;
}

export interface DoorStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  door?: Door | null;
  defaultBrandId?: number | null;
  initialTab?: StudioMainTab;
  sketchMode?: boolean;
  templateDoorName?: string | null;
  onOpenTemplatePicker?: () => void;
  onSaveSuccess?: (savedDoor: Door) => void;
  onCustomSave?: (data: DoorStudioModalSaveData) => Promise<void>;
}
