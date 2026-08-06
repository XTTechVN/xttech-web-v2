export interface Quotation {
  id: number;
  title: string;
  code: string | null;
  discountPercentage: number;
  status: string;
  projectId: number;
  reviewBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationCreate {
  title: string;
  projectId: number;
  code?: string;
  discountPercentage?: number;
}

export interface QuotationUpdate {
  title?: string;
  code?: string;
  discountPercentage?: number;
  status?: string;
  projectId?: number;
}

export interface QuotationQueryParams {
  search?: string;
  projectId?: number;
  status?: string;
  reviewBy?: string;
  offset?: number;
  limit?: number;
}
