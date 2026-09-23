export interface AccessoryComboItem {
  accessoryId: number;
  quantity: number;
  note?: string;
  accessoryName?: string;
  accessoryCode?: string;
}

export interface AccessoryCombo {
  id: number;
  code: string;
  name: string;
  doorTypeId?: number | null;
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
  comboItems: AccessoryComboItem[];
  totalComboPrice: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface AccessoryComboUpdate {
  code?: string;
  name?: string;
  doorTypeId?: number | null;
  comboItems?: AccessoryComboItem[];
  totalComboPrice?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface AccessoryComboQueryParams {
  search?: string;
  doorTypeId?: number;
  isActive?: boolean;
  offset?: number;
  limit?: number;
}

