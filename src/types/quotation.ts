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
  floors?: QuotationFloorCreate[];
}

export interface QuotationDoorCreate {
  code?: string;
  doorId: number;
  width?: number;
  height?: number;
  quantity: number;
  accessoryIds?: number[];
  extraOptionIds?: number[];
}

export interface QuotationMaterialCreate {
  materialId: number;
  initPrice: number;
  doors: QuotationDoorCreate[];
}

export interface QuotationFloorCreate {
  name: string;
  index: number;
  materials: QuotationMaterialCreate[];
}

export interface QuotationQueryParams {
  search?: string;
  projectId?: number;
  status?: string;
  reviewBy?: string;
  offset?: number;
  limit?: number;
}

export interface QuotationDoorResponse {
  id: number;
  quotationMaterialId: number;
  doorId: number;
  code?: string;
  width?: number;
  height?: number;
  quantity: number;
  totalArea: number;
}

export interface QuotationMaterialResponse {
  id: number;
  quotationFloorId: number;
  materialId: number;
  initPrice: number;
  doors: QuotationDoorResponse[];
  quantity: number;
  totalArea: number;
  totalAmount: number;
}

export interface QuotationFloorResponse {
  id: number;
  quotationId: number;
  name: string;
  index: number;
  materials: QuotationMaterialResponse[];
  quantity: number;
  totalArea: number;
  totalAmount: number;
}

export interface QuotationDetail extends Quotation {
  floors: QuotationFloorResponse[];
  totalQuantity: number;
  totalArea: number;
  subtotalAmount: number;
  finalAmount: number;
}

export interface PreviewDoor {
  id?: number;
  code?: string;
  doorId: number;
  width?: number;
  height?: number;
  quantity: number;
  totalArea?: number;
  accessoryIds?: number[];
  extraOptionIds?: number[];
  accessories?: {
    id?: number;
    accessoryId: number;
    name: string;
    unit: string;
    initPrice: number;
    quantityPerDoor: number;
    totalPrice: number;
  }[];
  extraOptions?: {
    id?: number;
    extraOptionId: number;
    name: string;
    initPrice: number;
    totalPrice: number;
  }[];
}

export interface PreviewMaterial {
  id?: number;
  materialId: number;
  initPrice: number;
  quantity?: number;
  totalArea?: number;
  totalAmount?: number;
  doors: PreviewDoor[];
  accessories?: {
    accessoryId: number;
    name: string;
    code: string;
    unit: string;
    initPrice: number;
    totalQuantity: number;
    totalPrice: number;
  }[];
  extraOptions?: {
    id?: number;
    quotationDoorId?: number;
    optionId?: number;
    name: string;
    code?: string;
    initPrice: number;
    quantityPerDoor?: number;
    doorQuantity?: number;
    calculatedQuantity?: number;
    totalPrice: number;
  }[];
}

export interface PreviewFloor {
  id?: number;
  name: string;
  quantity?: number;
  totalArea?: number;
  totalAmount?: number;
  materials: PreviewMaterial[];
}

