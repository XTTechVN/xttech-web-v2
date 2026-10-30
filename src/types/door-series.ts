import type { Brand } from './brand';

export interface DoorSeries {
  id: number;
  brandId: number;
  code: string;
  name: string;
  origin?: string;
  catalogOrigin?: string | null;
  doorCount?: number;
  aluminumThickness?: number | null;
  cornerJointType?: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  brand?: Brand | null;
}

export interface DoorSeriesCreate {
  brandId: number;
  code: string;
  name: string;
  origin?: string;
  catalogOrigin?: string | null;
  aluminumThickness?: number | null;
  cornerJointType?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface DoorSeriesUpdate {
  brandId?: number;
  code?: string;
  name?: string;
  origin?: string;
  catalogOrigin?: string | null;
  aluminumThickness?: number | null;
  cornerJointType?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface DoorSeriesQueryParams {
  search?: string;
  brandId?: number;
  isActive?: boolean;
  offset?: number;
  limit?: number;
}
