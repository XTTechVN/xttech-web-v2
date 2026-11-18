import api from '@/utils/api';
import type { AuditLog, PlatformGlobalUser, PlatformOrganization, PlatformPermission, PlatformRole, PlatformUser } from '@/types';

const BASE = '/api/v1/platform';

export interface PlatformPage<T> {
  items: T[];
  meta: { total: number; offset: number; limit: number; next: boolean };
}

export const getPlatformOrganizations = async (): Promise<PlatformOrganization[]> => (await api.get(`${BASE}/organizations`)).data;

export const getPlatformOrgUsers = async (orgId: number, offset = 0, limit = 20): Promise<PlatformPage<PlatformUser>> =>
  (await api.get(`${BASE}/organizations/${orgId}/users`, { params: { offset, limit } })).data;

export const getPlatformOrgAuditLogs = async (orgId: number, offset = 0, limit = 20): Promise<PlatformPage<AuditLog>> =>
  (await api.get(`${BASE}/organizations/${orgId}/audit-logs`, { params: { offset, limit } })).data;

export const getPlatformPermissions = async (): Promise<PlatformPermission[]> => (await api.get(`${BASE}/permissions`)).data;

export const getPlatformOrgRoles = async (orgId: number): Promise<PlatformRole[]> => (await api.get(`${BASE}/organizations/${orgId}/roles`)).data;

export const searchPlatformUsers = async (search: string, offset = 0, limit = 20): Promise<PlatformPage<PlatformGlobalUser>> =>
  (await api.get(`${BASE}/users`, { params: { search: search || undefined, offset, limit } })).data;
