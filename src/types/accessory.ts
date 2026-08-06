export interface Accessory {
  id: number;
  code: string | null;
  name: string;
  specification: string | null;
  unit: string | null;
  price: number;
  imagePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccessoryCreate {
  name: string;
  code?: string;
  specification?: string;
  unit?: string;
  price?: number;
  imagePath?: string;
}

export interface AccessoryUpdate {
  name?: string;
  code?: string;
  specification?: string;
  unit?: string;
  price?: number;
  imagePath?: string;
}

export interface AccessoryQueryParams {
  search?: string;
  code?: string;
  unit?: string;
  offset?: number;
  limit?: number;
}

export interface AccessoryAssignDoors {
  doorIds: number[];
}

export interface AccessoryUnassignDoors {
  doorIds: number[];
}

export interface AccessoryAssignMaterials {
  materialIds: number[];
}

export interface AccessoryUnassignMaterials {
  materialIds: number[];
}
