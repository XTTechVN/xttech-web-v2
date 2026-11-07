import type { Brand } from './brand';

export interface AccessoryComboItem {
  accessoryId: number;
  quantity: number;
  note?: string | null;
  accessoryName?: string | null;
  accessoryCode?: string | null;
  unit?: string | null;
  unitPrice?: number | null;
  brandId?: number | null;
  brandName?: string | null;
  category?: string | null;
}

export interface AccessoryCombo {
  id: number;
  code: string;
  name: string;
  doorTypeId?: number | null;
  doorTypes?: string[];
  applyFor?: string | null;
  openingType?: string | null;
  description?: string | null;
  brandId?: number | null;
  brand?: Brand | null;
  comboItems: AccessoryComboItem[];
  totalComboPrice: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccessoryComboCreate {
  code: string;
  name: string;
  doorTypeId?: number | null;
  doorTypes?: string[];
  applyFor?: string | null;
  openingType?: string | null;
  description?: string | null;
  brandId?: number | null;
  comboItems: AccessoryComboItem[];
  totalComboPrice: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface AccessoryComboUpdate {
  code?: string;
  name?: string;
  doorTypeId?: number | null;
  doorTypes?: string[];
  applyFor?: string | null;
  openingType?: string | null;
  description?: string | null;
  brandId?: number | null;
  comboItems?: AccessoryComboItem[];
  totalComboPrice?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface AccessoryComboQueryParams {
  search?: string;
  doorTypeId?: number;
  doorType?: string;
  brandId?: number;
  applyFor?: string;
  isActive?: boolean;
  offset?: number;
  limit?: number;
}

export const COMBO_APPLY_FOR_OPTIONS: { value: string; label: string }[] = [
  { value: 'khung', label: 'Khung' },
  { value: 'canh', label: 'Cánh' },
  { value: 'huong_mo', label: 'Hướng mở' },
  { value: 'khac', label: 'Khác' },
];

export const COMBO_DOOR_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'casement_door', label: 'Cửa đi mở quay' },
  { value: 'sliding_door', label: 'Cửa đi lùa' },
  { value: 'casement_window', label: 'Cửa sổ mở quay' },
  { value: 'sliding_window', label: 'Cửa sổ lùa' },
  { value: 'folding_door', label: 'Cửa gấp xếp' },
  { value: 'sliding_casement_door', label: 'Cửa trượt quay' },
  { value: 'glass_wall', label: 'Vách kính' },
  { value: 'curtain_wall', label: 'Mặt dựng' },
  { value: 'composite', label: 'Tổng hợp' },
];
