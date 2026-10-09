import type { Customer } from './customer';
import type { User } from './user';
import type { Brand, BrandColor } from './brand';
import type { DoorSeries } from './door-series';

export type ProjectStatus =
  | 'draft'
  | 'surveying'
  | 'designing'
  | 'quotation'
  | 'contract'
  | 'producing'
  | 'installing'
  | 'completed'
  | 'cancelled';

export interface ProjectFloorItem {
  id: number;
  projectId: number;
  name: string;
  orderIndex: number;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: number;
  code: string;
  name: string;
  customerId: number;
  status: ProjectStatus;
  note: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  defaultBrandId: number | null;
  defaultSeriesId: number | null;
  defaultColorId: number | null;
  startDate: string | null;
  targetDate: string | null;
  handoverDate: string | null;
  warrantyEndDate: string | null;
  totalPositions: number;
  totalAreaM2: number;
  totalAluminumKg: number;
  customer?: Pick<Customer, 'id' | 'name' | 'phone'> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetail extends Project {
  customer: Customer | null;
  user: User | null;
  defaultBrand: Brand | null;
  defaultSeries: DoorSeries | null;
  defaultColor: BrandColor | null;
  floors: ProjectFloorItem[];
}

export interface ProjectCreate {
  code?: string;
  name: string;
  customerId: number;
  status?: ProjectStatus;
  note?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  defaultBrandId?: number;
  defaultSeriesId?: number;
  defaultColorId?: number;
  startDate?: string;
  targetDate?: string;
  handoverDate?: string;
  warrantyEndDate?: string;
}

export interface ProjectUpdate {
  name?: string;
  customerId?: number;
  status?: ProjectStatus;
  note?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  defaultBrandId?: number;
  defaultSeriesId?: number;
  defaultColorId?: number;
  startDate?: string;
  targetDate?: string;
  handoverDate?: string;
  warrantyEndDate?: string;
}

export interface ProjectQueryParams {
  search?: string;
  customerId?: number;
  userId?: string;
  status?: ProjectStatus;
  code?: string;
  offset?: number;
  limit?: number;
}

export interface ProjectActivity {
  id: number;
  projectId: number;
  userId: string | null;
  actorType: string;
  actionType: string;
  actionCategory: string;
  actionTitle: string;
  targetType: string | null;
  targetId: number | null;
  targetName: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  user?: Pick<User, 'id' | 'fullName' | 'email'> | null;
}


export interface ProjectActivityQueryParams {
  projectId?: number;
  actionCategory?: string;
  actionType?: string;
  userId?: string;
  offset?: number;
  limit?: number;
}

