import { useMemo } from 'react';
import { useAuthStore } from '@/stores';

export const ROLE_CODES = {
  SUPER: 'super',
  ADMIN: 'admin',
  HR: 'hr',
  SALE: 'sale',
  TECHNICIAN: 'technician',
  EMPLOYEE: 'employee',
  ACCOUNTANT: 'accountant',
};

export function usePermission() {
  const user = useAuthStore((state) => state.user);
  const roleSet = useMemo(() => {
    const set = new Set<string>();
    user?.roles?.forEach((r) => {
      if (r.code) set.add(r.code.toLowerCase().trim());
      if (r.name) set.add(r.name.toLowerCase().trim());
    });
    return set;
  }, [user?.roles]);

  const hasRole = (roles: string | string[]) => {
    if (Array.isArray(roles)) {
      return roles.some((role) => roleSet.has(role.toLowerCase()));
    }
    return roleSet.has(roles.toLowerCase());
  };

  // Định nghĩa các vai trò cụ thể
  const isSuper = roleSet.has(ROLE_CODES.SUPER);
  const isAdmin = isSuper || roleSet.has(ROLE_CODES.ADMIN);
  const isHR = roleSet.has(ROLE_CODES.HR);
  const isSale = roleSet.has(ROLE_CODES.SALE);

  const isManager = hasRole([ROLE_CODES.ADMIN, ROLE_CODES.SUPER, ROLE_CODES.HR]);
  const isSaleOnly = isSale && !isManager;

  // Quyền hạn nghiệp vụ (Capabilities)
  const canViewAll = isManager;
  const canAssignStaff = isManager;

  return {
    user,
    roleSet,
    hasRole,
    isSuper,
    isAdmin,
    isHR,
    isSale,
    isSaleOnly,
    isManager,
    canViewAll,
    canAssignStaff,
  };
}
