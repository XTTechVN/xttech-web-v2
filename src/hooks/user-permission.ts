import { useAuthStore } from '@/stores';
import { useCan } from './use-can';

// Nhóm việc suy từ MỘT quyền mà bộ role mặc định chỉ cấp đúng cho nhóm đó (giống `permissions/probes.py` ở backend).
// Không đọc tên role của người dùng.
const ADMIN_PROBE = 'role:assign_permission';
const HR_PROBE = 'user:update';
const SALE_PROBE = 'quotation:submit';

export function usePermission() {
  const user = useAuthStore((state) => state.user);
  const { can } = useCan();

  const isAdmin = can(ADMIN_PROBE);
  const isSuper = isAdmin;
  const isHR = can(HR_PROBE);
  const isSale = can(SALE_PROBE);

  const isManager = isAdmin || isHR;
  const isSaleOnly = isSale && !isManager;

  // Quyền hạn nghiệp vụ (Capabilities)
  const canViewAll = isManager;
  const canAssignStaff = isManager;
  const canManageTasks = isManager;

  return {
    user,
    isSuper,
    isAdmin,
    isHR,
    isSale,
    isSaleOnly,
    isManager,
    canViewAll,
    canAssignStaff,
    canManageTasks,
  };
}
