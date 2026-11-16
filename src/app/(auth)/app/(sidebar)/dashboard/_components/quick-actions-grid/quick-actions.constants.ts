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
import { UserRole } from '@/config';

export type QuickActionBadgeKey =
  | 'pendingLeavesCount'
  | 'pendingAdjustmentsCount'
  | 'pendingTasksCount';

export interface QuickActionConfig {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  roles?: UserRole[];
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
    title: 'Công việc',
    href: '/app/tasks',
    icon: ClipboardCheck,
    bgColor: 'bg-teal-50 group-hover:bg-teal-100/80',
    textColor: 'text-primary',
    badgeKey: 'pendingTasksCount',
  },
  {
    id: 'live-map',
    title: 'Bản đồ Live',
    href: '/app/live-map',
    icon: MapPin,
    bgColor: 'bg-emerald-50 group-hover:bg-emerald-100/80',
    textColor: 'text-emerald-600',
  },
  {
    id: 'leave-requests',
    title: 'Nghỉ phép',
    href: '/app/leave-requests',
    icon: CalendarOff,
    bgColor: 'bg-amber-50 group-hover:bg-amber-100/80',
    textColor: 'text-amber-600',
    badgeKey: 'pendingLeavesCount',
  },
  {
    id: 'adjustments',
    title: 'Khiếu nại',
    href: '/app/attendances/adjustments',
    icon: ClockAlert,
    bgColor: 'bg-blue-50 group-hover:bg-blue-100/80',
    textColor: 'text-blue-600',
    badgeKey: 'pendingAdjustmentsCount',
  },
  {
    id: 'payroll',
    title: 'Bảng công',
    href: '/app/attendances/payroll',
    icon: CalendarCheck,
    bgColor: 'bg-purple-50 group-hover:bg-purple-100/80',
    textColor: 'text-purple-600',
  },
  {
    id: 'roster',
    title: 'Lịch đi làm',
    href: '/app/attendances/roster',
    icon: CalendarDays,
    bgColor: 'bg-teal-50 group-hover:bg-teal-100/80',
    textColor: 'text-teal-700',
  },
  {
    id: 'projects',
    title: 'Dự án',
    href: '/app/projects',
    icon: Building2,
    bgColor: 'bg-cyan-50 group-hover:bg-cyan-100/80',
    textColor: 'text-cyan-600',
    roles: ['super', 'admin', 'sale', 'technician'],
  },
  {
    id: 'employees',
    title: 'Nhân sự',
    href: '/app/employees',
    icon: Users,
    bgColor: 'bg-indigo-50 group-hover:bg-indigo-100/80',
    textColor: 'text-indigo-600',
    roles: ['super', 'admin', 'hr', 'accountant'],
  },
  {
    id: 'suggestions',
    title: 'Góp ý',
    href: '/app/suggestions',
    icon: Lightbulb,
    bgColor: 'bg-rose-50 group-hover:bg-rose-100/80',
    textColor: 'text-rose-600',
  },
  {
    id: 'reports',
    title: 'Báo cáo',
    href: '/app/attendances/reports',
    icon: BarChart3,
    bgColor: 'bg-orange-50 group-hover:bg-orange-100/80',
    textColor: 'text-orange-600',
    roles: ['super', 'admin', 'hr', 'accountant'],
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
