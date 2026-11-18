export type Scope = 'own' | 'dept' | 'org';
export type Effect = 'allow' | 'deny';

export interface PermissionCatalogItem {
  code: string;
  nameVi: string;
  module: string;
  scopes: Scope[];
}

export interface AccessRole {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  memberCount: number;
  permissionCount: number;
}

export interface Grant {
  code: string;
  scope: Scope;
  effect: Effect;
}

export interface AccessRoleDetail extends AccessRole {
  grants: Grant[];
}

export interface MemberRole {
  id: string;
  code: string;
  name: string;
}

export interface AccessMember {
  id: string;
  username: string;
  fullName?: string | null;
  email: string;
  status: 'active' | 'locked';
  mustChangePassword: boolean;
  roles: MemberRole[];
}

export interface MemberSecret {
  member: AccessMember;
  generatedPassword: string;
}

export interface EffectivePermission {
  code: string;
  nameVi: string;
  module: string;
  scope: Scope;
}

export interface Invitation {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface InvitationCreated {
  invitation: Invitation;
  inviteLink: string;
  emailSent: boolean;
}
