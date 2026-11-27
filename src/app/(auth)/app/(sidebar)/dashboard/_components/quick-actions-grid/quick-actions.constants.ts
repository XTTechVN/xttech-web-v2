import {
  BarChart3,
  Building2,
  CalendarCheck,
  CalendarDays,
  CalendarOff,
  ClipboardCheck,
  ClockAlert,
  Lightbulb,
  LucideIcon,
  MapPin,
  Users,
} from 'lucide-react';

export type QuickActionBadgeKey =
  | 'pendingLeavesCount'
  | 'pendingAdjustmentsCount'
  | 'pendingTasksCount';

export interface QuickActionConfig {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  // Hiện khi có MỘT trong các quyền này (cùng quyền với mục menu tương ứng)
  permissions: string[];
  badgeKey?: QuickActionBadgeKey;
}

export const QUICK_ACTIONS_COLLAPSED_LIMIT = 8;
export const QUICK_ACTIONS_PINNED_COUNT = QUICK_ACTIONS_COLLAPSED_LIMIT - 1;
export const QUICK_ACTIONS_STORAGE_PREFIX = 'xttech_quick_actions_order_v1';
export const QUICK_ACTIONS_ORDER_EVENT = 'xttech-quick-actions-order-change';

/**
 * Danh mục tiện ích mở rộng tập trung.
 * Khi hệ thống bổ sung tính năng mới, chỉ cần thêm 1 mục vào danh sách này.
 */
export const QUICK_ACTIONS_REGISTRY: QuickActionConfig[] = [
  {
    id: 'tasks',
    permissions: ['staff_task:read'],
    title: 'Công việc',
    href: '/app/tasks',
    icon: ClipboardCheck,
    badgeKey: 'pendingTasksCount',
  },
  {
    id: 'live-map',
    permissions: ['live_map:read'],
    title: 'Bản đồ Live',
    href: '/app/live-map',
    icon: MapPin,
  },
  {
    id: 'leave-requests',
    permissions: ['leave_request:read'],
    title: 'Nghỉ phép',
    href: '/app/leave-requests',
    icon: CalendarOff,
    badgeKey: 'pendingLeavesCount',
  },
  {
    id: 'adjustments',
    permissions: ['attendance_request:read'],
    title: 'Khiếu nại',
    href: '/app/attendances/adjustments',
    icon: ClockAlert,
    badgeKey: 'pendingAdjustmentsCount',
  },
  {
    id: 'payroll',
    permissions: ['attendance:read'],
    title: 'Bảng công',
    href: '/app/attendances/payroll',
    icon: CalendarCheck,
  },
  {
    id: 'roster',
    permissions: ['attendance_report:read'],
    title: 'Lịch đi làm',
    href: '/app/attendances/roster',
    icon: CalendarDays,
  },
  {
    id: 'projects',
    permissions: ['project:read'],
    title: 'Dự án',
    href: '/app/projects',
    icon: Building2,
  },
  {
    id: 'employees',
    permissions: ['user:create'],
    title: 'Nhân sự',
    href: '/app/employees',
    icon: Users,
  },
  {
    id: 'suggestions',
    permissions: ['suggestion:read'],
    title: 'Góp ý',
    href: '/app/suggestions',
    icon: Lightbulb,
  },
  {
    id: 'reports',
    permissions: ['attendance:update'],
    title: 'Báo cáo',
    href: '/app/attendances/reports',
    icon: BarChart3,
  },
];

export const parseSavedOrder = (raw: string): string[] => {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
};

export const applyQuickActionsOrder = (
  actions: QuickActionConfig[],
  savedOrder: string[]
): QuickActionConfig[] => {
  if (savedOrder.length === 0) return actions;

  const orderIndex = new Map<string, number>();
  savedOrder.forEach((id, index) => orderIndex.set(id, index));

  return [...actions].sort((a, b) => {
    const idxA = orderIndex.get(a.id);
    const idxB = orderIndex.get(b.id);
    if (idxA !== undefined && idxB !== undefined) return idxA - idxB;
    if (idxA !== undefined) return -1;
    if (idxB !== undefined) return 1;
    return 0;
  });
};
