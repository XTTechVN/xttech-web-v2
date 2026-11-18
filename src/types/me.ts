export interface MeRole {
  id: string;
  code: string;
  name: string;
}

export interface MePermission {
  code: string;
  scope: 'own' | 'dept' | 'org';
}

export interface Me {
  user: { id: string; username: string; fullName?: string | null; email: string; avatar?: string | null };
  org: { id: number; code: string; name: string; kind: string };
  roles: MeRole[];
  permissions: MePermission[];
  mustChangePassword: boolean;
  isPlatformAdmin: boolean;
}
