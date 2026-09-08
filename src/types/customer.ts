export interface Customer {
  id: number;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  identifyCode: string | null;
  email: string | null;
  phone: string | null;
  staffId: string | null;
  staff?: {
    id: string;
    fullName?: string;
    username?: string;
    email?: string;
  } | null;
  type: string;
  images: any[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CustomerCreate {
  name: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  identifyCode?: string;
  email?: string;
  phone?: string;
  staffId?: string;
}

export interface CustomerUpdate {
  name?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
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
  staffId?: string;
  type?: string;
}

export interface CustomerExportQueryParams {
  fromDate?: string;
  from_date?: string;
  toDate?: string;
  to_date?: string;
  staffId?: string;
  staff_id?: string;
}


export interface CustomerLog {
  id: number;
  customerId: number;
  index: number;
  channel: string;
  type: string;
  status: string;
  note: string;
  nextFollowDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerLogCreate {
  index: number;
  channel: string;
  type: string;
  status: string;
  note: string;
  nextFollowDate?: string | null;
}
