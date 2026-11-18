export interface PlatformOrganization {
  id: number;
  code: string;
  name: string;
  kind: string;
  status: string;
  createdAt: string;
  userCount: number;
}

export interface PlatformUser {
  id: string;
  username: string;
  fullName?: string | null;
  email: string;
  createdAt?: string | null;
  deletedAt?: string | null;
  roles: string[];
}

export interface PlatformGlobalUser extends PlatformUser {
  orgId: number;
  orgCode: string;
  orgName: string;
}

export interface PlatformPermission {
  code: string;
  nameVi: string;
  module: string;
  scopes: string[];
  platformOnly: boolean;
}

export interface PlatformGrant {
  code: string;
  scope: 'own' | 'dept' | 'org';
  effect: 'allow' | 'deny';
}

export interface PlatformRole {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  memberCount: number;
  grants: PlatformGrant[];
}
