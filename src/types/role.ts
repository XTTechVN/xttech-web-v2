export interface Role {
  id: number | string;
  name: string;
  description: string | null;
  code: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleCreate {
  name: string;
  description?: string | null;
  code?: string | null;
}

export interface RoleUpdate {
  name?: string;
  description?: string | null;
  code?: string | null;
}

export interface RoleQueryParams {
  offset?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}
