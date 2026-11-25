import { BarChart3, Box, FileText, PenTool, Sliders, Wrench } from 'lucide-react';
import type { StudioMainTab } from './studio-types';

export interface StudioNavTabItem {
  id: StudioMainTab;
  label: string;
  icon: typeof FileText;
}

export const STUDIO_NAV_TABS: StudioNavTabItem[] = [
  { id: 'info', label: 'Thông tin', icon: FileText },
  { id: 'draw', label: 'Vẽ cửa', icon: PenTool },
  { id: 'config', label: 'Cấu hình', icon: Sliders },
  { id: 'bom', label: 'Kết quả', icon: BarChart3 },
  { id: 'accessories', label: 'Phụ kiện', icon: Wrench },
  { id: 'view3d', label: '3D', icon: Box },
];

export const TYPE_TO_FAMILY_MAP: Record<string, string> = {
  casement_door: 'Cửa đi mở quay',
  cd: 'Cửa đi mở quay',
  sliding_door: 'Cửa đi lùa',
  sliding_casement_door: 'Cửa đi lùa',
  casement_window: 'Cửa sổ mở quay/Hất',
  cs: 'Cửa sổ mở quay/Hất',
  sliding_window: 'Cửa sổ lùa',
  folding_door: 'Cửa xếp trượt',
};

export const FAMILY_TO_TYPE_MAP: Record<string, string> = {
  'Cửa đi mở quay': 'casement_door',
  'Cửa đi lùa': 'sliding_door',
  'Cửa sổ mở quay/Hất': 'casement_window',
  'Cửa sổ lùa': 'sliding_window',
  'Cửa xếp trượt': 'folding_door',
};
