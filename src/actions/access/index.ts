import api from '@/utils/api';
import type {
  AccessMember,
  AccessRole,
  AccessRoleDetail,
  EffectivePermission,
  Grant,
  Invitation,
  InvitationCreated,
  MemberSecret,
  PermissionCatalogItem,
} from '@/types';

const BASE = '/api/v1/access';

export const getPermissionCatalog = async (): Promise<PermissionCatalogItem[]> => (await api.get(`${BASE}/permissions`)).data;

export const getAccessRoles = async (): Promise<AccessRole[]> => (await api.get(`${BASE}/roles`)).data;
export const getAccessRole = async (id: string): Promise<AccessRoleDetail> => (await api.get(`${BASE}/roles/${id}`)).data;
export const createAccessRole = async (data: { name: string; description?: string }): Promise<AccessRoleDetail> =>
  (await api.post(`${BASE}/roles`, data)).data;
export const renameAccessRole = async (id: string, data: { name: string; description?: string }): Promise<AccessRoleDetail> =>
  (await api.patch(`${BASE}/roles/${id}`, data)).data;
export const cloneAccessRole = async (id: string, name: string): Promise<AccessRoleDetail> =>
  (await api.post(`${BASE}/roles/${id}/clone`, { name })).data;
export const deleteAccessRole = async (id: string): Promise<void> => {
  await api.delete(`${BASE}/roles/${id}`);
};
export const saveAccessRoleGrants = async (id: string, grants: Grant[]): Promise<{ role: AccessRoleDetail; warnings: string[] }> =>
  (await api.put(`${BASE}/roles/${id}/permissions`, { grants })).data;

export const getAccessMembers = async (): Promise<AccessMember[]> => (await api.get(`${BASE}/members`)).data;
export const createAccessMember = async (data: {
  username: string;
  email: string;
  fullName: string;
  roleIds: string[];
}): Promise<MemberSecret> => (await api.post(`${BASE}/members`, data)).data;
export const setAccessMemberRoles = async (id: string, roleIds: string[]): Promise<AccessMember> =>
  (await api.put(`${BASE}/members/${id}/roles`, { roleIds })).data;
export const lockAccessMember = async (id: string, locked: boolean): Promise<AccessMember> =>
  (await api.post(`${BASE}/members/${id}/${locked ? 'lock' : 'unlock'}`)).data;
export const resetAccessMemberPassword = async (id: string): Promise<MemberSecret> =>
  (await api.post(`${BASE}/members/${id}/reset-password`)).data;
export const getMemberEffectivePermissions = async (id: string): Promise<EffectivePermission[]> =>
  (await api.get(`${BASE}/members/${id}/effective-permissions`)).data;

export const getInvitations = async (): Promise<Invitation[]> => (await api.get(`${BASE}/invitations`)).data;
export const createInvitation = async (data: { email: string; roleId: string }): Promise<InvitationCreated> =>
  (await api.post(`${BASE}/invitations`, data)).data;
export const resendInvitation = async (id: string): Promise<InvitationCreated> => (await api.post(`${BASE}/invitations/${id}/resend`)).data;
export const revokeInvitation = async (id: string): Promise<void> => {
  await api.delete(`${BASE}/invitations/${id}`);
};

export const acceptInvitation = async (data: { token: string; username: string; fullName: string; password: string }) =>
  (await api.post('/api/v1/auth/invitations/accept', data)).data;

export const checkOrganizationCode = async (code: string): Promise<{ code: string; available: boolean; reason?: string | null }> =>
  (await api.get('/api/v1/auth/organizations/code-available', { params: { code } })).data;

export const registerOrganization = async (data: {
  name: string;
  code: string;
  adminFullName: string;
  adminEmail: string;
  adminUsername: string;
  adminPassword: string;
}): Promise<{ id: number; code: string; name: string }> => (await api.post('/api/v1/auth/organizations', data)).data;
