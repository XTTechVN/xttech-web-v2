import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  Compass,
  Users,
  FolderKanban,
  Building2,
  MessageSquarePlus,
  SlidersHorizontal,
  ClockAlert,
  Folder,
  Warehouse,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import { SidebarItemProps as SidebarItemType, SidebarSectionProps as SidebarSectionType } from '@/components';

export const acceptedSections = [
  'dashboard',
  'attendances',
  'attendances-root',
  'attendances-adjustments',
  'attendances-payroll',
  'adjustments',
  'employees',
  'employees-root',
  'roles',
  'suggestions',
  'departments',
  'projects',
  'projects-root',
  'quotations',
  'warehouse',
  'customers',
  'customers-root',
  'providers',
  'customer-providers',
  'configurations',
  'configurations-root',
  'brand',
  'series',
  'profile-bars',
  'glass-gaskets',
  'aluminum',
  'doors',
  'door-templates',
  'accessories',
  'accessory-combos',
  'materials',
  'quotations',
  'extra-options',
  'formulas',
  'attendances-reports',
  'live-map',
  'app-versions',
  'access-roles',
  'access-members',
  'leave-request',
  'attendances-roster',
  'documents-root',
  'document-categories',
  'documents-list',
  'documents-my',
  'documents-shared',
  'documents-rule',
  'documents-trash',
  'rules',
  'trash',
  'inbox',
];

// Mục menu hiện khi người dùng có MỘT trong các quyền (lấy từ /me); `platformOnly` chỉ cho quản trị nền tảng
interface AccessGate {
  permissions?: string[];
  platformOnly?: boolean;
}

export interface SidebarItemWithAccess extends Omit<SidebarItemType, 'subItems'>, AccessGate {
  subItems?: (Omit<SidebarItemType, 'subItems'> & AccessGate)[];
}

export interface SidebarSectionWithAccess extends Omit<SidebarSectionType, 'items'> {
  items: SidebarItemWithAccess[];
}

export interface Access {
  canAny: (codes: string[]) => boolean;
  isPlatformAdmin: boolean;
  scopeOf?: (code: string) => string | null;
}

const isAllowed = (gate: AccessGate, access: Access) =>
  gate.platformOnly ? access.isPlatformAdmin : !gate.permissions || access.canAny(gate.permissions);

export const rawSidebarSections: SidebarSectionWithAccess[] = [
  // 1. Điều hành
  {
    title: 'Điều hành',
    items: [
      {
        id: 'dashboard',
        label: 'Tổng quan',
        icon: React.createElement(LayoutDashboard, { size: 18 }),
        href: '/app/dashboard',
        permissions: ['dashboard:read'],
      },
      {
        id: 'live-map',
        label: 'Bản đồ trực tiếp',
        icon: React.createElement(Compass, { size: 18 }),
        href: '/app/live-map',
        permissions: ['live_map:read'],
      },
    ],
  },
  // 2. Nhân sự & Chấm công
  {
    title: 'Nhân sự & Chấm công',
    items: [
      {
        id: 'employees-root',
        label: 'Nhân sự',
        icon: React.createElement(Users, { size: 18 }),
        href: '/app/employees',
        permissions: ['user:update'],
      },
      {
        id: 'attendances-root',
        label: 'Chấm công',
        icon: React.createElement(CalendarCheck, { size: 18 }),
        href: '/app/attendances',
        permissions: ['attendance:read'],
        subItems: [
          {
            id: 'attendances',
            label: 'Quản lý chấm công',
            href: '/app/attendances',
            permissions: ['attendance:update'],
          },
          {
            id: 'attendances-payroll',
            label: 'Lịch sử chấm công',
            href: '/app/attendances/payroll',
            permissions: ['attendance:read'],
          },
          {
            id: 'attendances-roster',
            label: 'Lịch làm việc phòng ban',
            href: '/app/attendances/roster',
            permissions: ['attendance_report:read'],
          },
          {
            id: 'attendances-reports',
            label: 'Báo cáo thống kê',
            href: '/app/attendances/reports',
            permissions: ['attendance:update'],
          },
        ],
      },
      {
        id: 'leave-request',
        label: 'Nghỉ phép & Đơn từ',
        icon: React.createElement(FileText, { size: 18 }),
        href: '/app/leave-requests',
        permissions: ['leave_request:read'],
      },
      {
        id: 'attendances-adjustments',
        label: 'Khiếu nại công',
        icon: React.createElement(ClockAlert, { size: 18 }),
        href: '/app/attendances/adjustments',
        permissions: ['attendance_request:read'],
      },
      {
        id: 'suggestions',
        label: 'Sáng kiến & Đề xuất',
        icon: React.createElement(MessageSquarePlus, { size: 18 }),
        href: '/app/suggestions',
        permissions: ['suggestion:read'],
      },
    ],
  },
  // 3. Dự án & Đối tác
  {
    title: 'Dự án & Đối tác',
    items: [
      {
        id: 'projects',
        label: 'Dự án',
        icon: React.createElement(FolderKanban, { size: 18 }),
        href: '/app/projects',
        permissions: ['project:read'],
      },
      {
        id: 'quotations',
        label: 'Duyệt báo giá',
        icon: React.createElement(FileText, { size: 18 }),
        href: '/app/quotations',
        permissions: ['quotation:approve'],
      },
      {
        id: 'warehouse',
        label: 'Quản lý kho',
        icon: React.createElement(Warehouse, { size: 18 }),
        href: '/app/warehouse',
        permissions: ['warehouse_item:create', 'warehouse_receipt:approve'],
      },
      {
        id: 'configurations-root',
        label: 'Cấu hình dự án',
        icon: React.createElement(SlidersHorizontal, { size: 18 }),
        href: '/app/projects/configuration',
        permissions: ['catalog:read'],
        subItems: [
          {
            id: 'brand',
            label: 'Hãng cung cấp',
            href: '/app/projects/configuration?tab=brand',
            permissions: ['catalog:read'],
          },
          {
            id: 'series',
            label: 'Hệ nhôm',
            href: '/app/projects/configuration?tab=series',
            permissions: ['catalog:read'],
          },
          {
            id: 'profile-bars',
            label: 'Thanh profile',
            href: '/app/projects/configuration?tab=profile-bars',
            permissions: ['catalog:read'],
          },
          {
            id: 'glass-gaskets',
            label: 'Kính & Gioăng keo',
            href: '/app/projects/configuration?tab=glass-gaskets',
            permissions: ['catalog:read'],
          },
          {
            id: 'accessories',
            label: 'Phụ kiện',
            href: '/app/projects/configuration?tab=accessories',
            permissions: ['catalog:read'],
          },
          {
            id: 'accessory-combos',
            label: 'Combo phụ kiện',
            href: '/app/projects/configuration?tab=accessory-combos',
            permissions: ['catalog:read'],
          },
          {
            id: 'door-templates',
            label: 'Mẫu cửa',
            href: '/app/projects/configuration?tab=door-templates',
            permissions: ['catalog:read'],
          },
        ],
      },
      {
        id: 'customers-root',
        label: 'Khách hàng & Đối tác',
        icon: React.createElement(Building2, { size: 18 }),
        href: '/app/customers',
        permissions: ['customer:read'],
        subItems: [
          {
            id: 'customers',
            label: 'Danh sách khách hàng',
            href: '/app/customers',
            permissions: ['customer:read'],
          },
          {
            id: 'providers',
            label: 'Nhà cung cấp',
            href: '/app/customers/providers',
            permissions: ['customer_provider:read'],
          },
        ],
      },
    ],
  },
  // 4. Tiện ích & Hệ thống
  {
    title: 'Cơ chế và tài liệu',
    items: [
      {
        id: 'documents-root',
        label: 'Cơ chế & Tài liệu',
        icon: React.createElement(Folder, { size: 18 }),
        href: '/app/documents',
        permissions: ['document:read'],
        subItems: [
          {
            id: 'documents-my',
            label: 'Tài liệu của tôi',
            href: '/app/documents?tab=my',
            permissions: ['document:read'],
          },
          {
            id: 'documents-shared',
            label: 'Được chia sẻ',
            href: '/app/inbox',
            permissions: ['document:read'],
          },
          {
            id: 'documents-rule',
            label: 'Tài liệu ban hành',
            href: '/app/rules',
            permissions: ['rule:read'],
          },
          {
            id: 'documents-trash',
            label: 'Thùng rác',
            href: '/app/trash',
            permissions: ['trash:read'],
          },
        ],
      },
    ],
  },
  // 5. Hệ thống
  {
    title: 'Hệ thống',
    items: [
      {
        id: 'access-roles',
        label: 'Vai trò & quyền',
        icon: React.createElement(ShieldCheck, { size: 18 }),
        href: '/app/access/roles',
        permissions: ['role:assign_permission', 'role:create', 'role:update'],
      },
      {
        id: 'access-members',
        label: 'Thành viên',
        icon: React.createElement(UserCog, { size: 18 }),
        href: '/app/access/members',
        permissions: ['user:assign_role', 'user:create'],
      },
    ],
  },
];

export function getSidebarSections(access: Access): SidebarSectionType[] {
  return rawSidebarSections
    .map((section) => {
      const items = section.items
        .filter((item) => isAllowed(item, access))
        .map((item) => ({ ...item, subItems: item.subItems?.filter((sub) => isAllowed(sub, access)) }) as SidebarItemType);
      return { ...section, items } as SidebarSectionType;
    })
    .filter((section) => section.items.length > 0);
}

// Đường dẫn có trong menu mà người dùng không đủ quyền -> false; đường dẫn ngoài menu -> true
export function isRouteAllowed(path: string, access: Access): boolean {
  if (path === '/app' || path === '/app/') return true;
  let matched = false;
  let allowed = false;
  for (const section of rawSidebarSections) {
    for (const item of section.items) {
      if (item.href === path) {
        matched = true;
        allowed = allowed || isAllowed(item, access);
      }
      for (const sub of item.subItems ?? []) {
        if (sub.href === path) {
          matched = true;
          allowed = allowed || isAllowed(sub, access);
        }
      }
    }
  }
  return !matched || allowed;
}
