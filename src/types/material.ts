export interface Material {
  id: number;
  code: string | null;
  name: string;
  specification: string | null;
  description: string | null;
  price: number;
  unit: 'set' | 'area' | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialCreate {
  name: string;
  code?: string;
  specification?: string;
  description?: string;
  price?: number;
  unit?: 'set' | 'area';
}

export interface MaterialUpdate {
  name?: string;
  code?: string;
  specification?: string;
  description?: string;
  price?: number;
  unit?: 'set' | 'area';
}

export interface MaterialQueryParams {
  search?: string;
  code?: string;
  offset?: number;
  limit?: number;
}

export interface MaterialAssignAccessories {
  accessoryIds: number[];
}

export interface MaterialUnassignAccessories {
  accessoryIds: number[];
}
