import type { Customer } from './customer';

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
  fomulas?: {
    fomulaId: number;
    width?: number;
    salary?: number;
  }[];
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
  effectiveWidth?: number;
  effectiveHeight?: number;
  quantity: number;
  totalArea: number;
  initPrice?: number;
  totalPrice?: number;
  formulaIds?: number[];
  formulas?: any[];
}

export interface QuotationAccessoryResponse {
  id?: number;
  accessoryId: number;
  name?: string;
  code?: string;
  unit?: string;
  initPrice?: number;
  totalQuantity?: number;
  totalPrice?: number;
}

export interface QuotationExtraOptionResponse {
  id?: number;
  optionId: number;
  name?: string;
  code?: string;
  initPrice?: number;
  calculatedQuantity?: number;
  totalPrice?: number;
  unit?: string;
  totalArea?: number;
}

export interface QuotationArchResponse {
  id?: number;
  formulaId: number;
  code?: string;
  name?: string;
  unit?: string;
  type?: string;
  salary?: number;
  totalQuantity?: number;
  totalPrice?: number;
  totalArea?: number;
  coefficientWidth?: number;
  coefficientHeight?: number;
}

export interface QuotationMaterialResponse {
  id: number;
  quotationFloorId: number;
  materialId: number;
  initPrice: number;
  doors: QuotationDoorResponse[];
  accessories?: QuotationAccessoryResponse[];
  extraOptions?: QuotationExtraOptionResponse[];
  archs?: QuotationArchResponse[];
  quantity: number;
  totalArea: number;
  totalAmount: number;
  totalPrice?: number;
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
  totalPrice?: number;
}

export interface QuotationDetail extends Quotation {
  floors: QuotationFloorResponse[];
  totalQuantity: number;
  totalArea: number;
  subtotalAmount: number;
  finalAmount: number;
  subtotalPrice?: number;
  totalPrice?: number;
  customer?: Customer | null;
}

export interface PreviewDoor {
  id?: number;
  code?: string;
  doorId: number;
  width?: number;
  height?: number;
  effectiveWidth?: number;
  effectiveHeight?: number;
  quantity: number;
  totalArea?: number;
  initPrice?: number;
  totalPrice?: number;
  imagePath?: string | null;
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
  formulas?: {
    id?: number;
    quotationDoorId?: number;
    formulaId: number;
    code?: string;
    name?: string;
    unit?: string;
    type?: string;
    width?: number;
    height?: number;
    salary?: number;
    wastageRate?: number;
    widthAdd?: number;
    heightAdd?: number;
    totalAmount?: number;
  }[];
}

export interface PreviewMaterial {
  id?: number;
  materialId: number;
  name?: string;
  initPrice: number;
  quantity?: number;
  totalArea?: number;
  totalAmount?: number;
  totalPrice?: number;
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
    unit?: string;
    totalArea?: number;
  }[];
  archs?: {
    formulaId: number;
    code?: string;
    name?: string;
    unit?: string;
    type?: string;
    salary: number;
    totalQuantity: number;
    totalPrice: number;
    totalArea?: number;
    coefficientWidth?: number;
    coefficientHeight?: number;
  }[];
}

export interface PreviewFloor {
  id?: number;
  name: string;
  quantity?: number;
  totalArea?: number;
  totalAmount?: number;
  totalPrice?: number;
  materials: PreviewMaterial[];
}

export interface DraftFormula {
  fomulaId: number;
  width?: number;
  salary?: number;
}

export interface DraftDoor {
  doorId: number;
  code: string;
  width: number;
  height: number;
  quantity: number;
  accessoryIds: number[];
  extraOptionIds: number[];
  fomulas: DraftFormula[];
}

export interface DraftMaterial {
  materialId: number;
  initPrice: number;
  doors: DraftDoor[];
}

export interface DraftFloor {
  name: string;
  index: number;
  materials: DraftMaterial[];
}

