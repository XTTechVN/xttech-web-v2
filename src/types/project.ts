import type { Customer } from './customer';

export interface Project {
  id: number;
  name: string;
  customerId: number;
  note: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetail extends Project {
  customer: Customer | null;
  user: Record<string, unknown> | null;
}

export interface ProjectCreate {
  name: string;
  customerId: number;
  note?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface ProjectUpdate {
  name?: string;
  customerId?: number;
  note?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface ProjectQueryParams {
  search?: string;
  customerId?: number;
  userId?: string;
  offset?: number;
  limit?: number;
}
