import { SupplierType } from './warehouse';

export type DoorFulfillmentType = 'in_house' | 'outsourced';
export type PositionCostStatus = 'estimated' | 'confirmed';
export type PositionVisualMode = 'cad' | 'catalog_image' | 'custom_image';

export interface SupplierBrief {
  id: number;
  code: string;
  name: string;
  supplierType: SupplierType;
  phone: string | null;
}

export interface SupplierDoorBrief {
  id: number;
  supplierId: number;
  code: string;
  name: string;
  doorType: string;
  specification: string | null;
  imagePath: string | null;
  referenceCostPerSqm: number;
}

export interface SupplierDoorImage {
  id: number;
  supplierDoorId: number;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface SupplierDoor {
  id: number;
  supplierId: number;
  supplier: SupplierBrief | null;
  code: string;
  name: string;
  doorType: string;
  specification: string | null;
  imagePath: string | null;
  images: SupplierDoorImage[];
  referenceCostPerSqm: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SupplierDoorResponse = SupplierDoor;

export interface SupplierDoorQueryParams {
  offset?: number;
  limit?: number;
  search?: string;
  supplierId?: number;
  doorType?: string;
  isActive?: boolean;
}

export interface SupplierDoorCreatePayload {
  supplierId: number;
  code: string;
  name: string;
  doorType?: string;
  specification?: string | null;
  referenceCostPerSqm?: number;
  isActive?: boolean;
}

export type SupplierDoorUpdatePayload = Partial<SupplierDoorCreatePayload>;

export interface SupplierQuoteUpdatePayload {
  supplierId?: number | null;
  supplierCostPrice: number;
  costStatus: PositionCostStatus;
  isInstallationIncluded: boolean;
  visualMode?: PositionVisualMode | null;
  removeCustomImage?: boolean;
  description?: string | null;
  measureNote?: string | null;
}

export interface OutsourcedRfqExportParams {
  supplierId?: number;
  positionIds?: number[];
  designOptionId?: number;
}
