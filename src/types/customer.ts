export interface Customer {
  id: number;
  name: string;
  address: string | null;
  identifyCode: string | null;
  email: string | null;
  phone: string | null;
  staffId: string | null;
  type: string;
  images: any[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CustomerCreate {
  name: string;
  address?: string;
  identifyCode?: string;
  email?: string;
  phone?: string;
  staffId?: string;
}

export interface CustomerUpdate {
  name?: string;
  address?: string;
  identifyCode?: string;
  email?: string;
  phone?: string;
  staffId?: string;
  type?: string;
}

export interface CustomerQueryParams {
  search?: string;
  phone?: string;
  identifyCode?: string;
  offset?: number;
  limit?: number;
}
