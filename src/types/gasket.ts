export const GASKET_UNIT_MAP: Record<string, string> = {
  m: 'Mét (m)',
  meter: 'Mét (m)',
  bottle: 'Chai',
  chai: 'Chai',
  pcs: 'Cái',
  cai: 'Cái',
  roll: 'Cuộn',
  set: 'Bộ',
};

export interface Gasket {
  id: number;
  code: string;
  name: string;
  unit: string;
  pricePerUnit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GasketCreate {
  code: string;
  name: string;
  unit?: string;
  pricePerUnit: number;
  isActive?: boolean;
}

export interface GasketUpdate {
  code?: string;
  name?: string;
  unit?: string;
  pricePerUnit?: number;
  isActive?: boolean;
}

export interface GasketQueryParams {
  search?: string;
  isActive?: boolean;
  offset?: number;
  limit?: number;
}
