export interface AccessoryCategory {
  id: number;
  code: string;
  name: string;
  sortOrder?: number;
  description?: string | null;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccessoryCategoryCreate {
  code: string;
  name: string;
  sortOrder?: number;
  description?: string;
  isActive?: boolean;
}

export interface AccessoryCategoryUpdate {
  code?: string;
  name?: string;
  sortOrder?: number;
  description?: string | null;
  isActive?: boolean;
}

export interface AccessoryCategoryQueryParams {
  search?: string;
  code?: string;
  offset?: number;
  limit?: number;
}
