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
  brandId?: number;
  applyFor?: string;
  isActive?: boolean;
  offset?: number;
  limit?: number;
}
