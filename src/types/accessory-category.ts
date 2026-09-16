export interface AccessoryCategory {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccessoryCategoryCreate {
  code: string;
  name: string;
}

export interface AccessoryCategoryUpdate {
  code?: string;
  name?: string;
}

export interface AccessoryCategoryQueryParams {
  search?: string;
  code?: string;
  offset?: number;
  limit?: number;
}
