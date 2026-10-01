export interface AccessoryComboItem {
  accessoryId: number;
  quantity: number;
  note?: string;
  accessoryName?: string;
  accessoryCode?: string;
  unit?: string;
  unitPrice?: number;
  brandId?: number;
  brandName?: string;
  category?: string;
}

export interface AccessoryCombo {
  id: number;
  code: string;
  name: string;
  doorTypeId?: number | null;
  description?: string | null;
  brandId?: number | null;
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
  isActive?: boolean;
  offset?: number;
  limit?: number;
}

