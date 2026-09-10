export interface CustomerProvider {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CustomerProviderCreate {
  code?: string;
  name: string;
}

export interface CustomerProviderUpdate {
  code?: string;
  name?: string;
}

export interface CustomerProviderQueryParams {
  search?: string;
  offset?: number;
  limit?: number;
}
