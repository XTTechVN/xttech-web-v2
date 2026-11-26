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
  ClockAlert,
  Folder,
  Warehouse,
  ShieldCheck,
  ClipboardCheck,
  CalendarDays,
  Handshake,
  Tag,
  Layers,
  Ruler,
  PanelTop,
  Puzzle,
  Boxes,
  DoorOpen,
  Truck,
  Share2,
  ScrollText,
  Trash2,
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
  'supplier-doors',
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
  'tasks',
];

// Mục menu hiện khi người dùng có MỘT trong các quyền (lấy từ /me); `platformOnly` chỉ cho quản trị nền tảng
interface AccessGate {
  permissions?: string[];
  platformOnly?: boolean;
}

export interface SidebarItemWithAccess extends Omit<SidebarItemType, 'subItems'>, AccessGate {}

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
  {
    title: 'Nhân sự & Chấm công',
    items: [
      {
        id: 'tasks',
        label: 'Công việc',
        icon: React.createElement(ClipboardCheck, { size: 18 }),
        href: '/app/tasks',
        permissions: ['staff_task:read'],
      },
      {
        id: 'employees-root',
        label: 'Nhân sự',
        icon: React.createElement(Users, { size: 18 }),
        href: '/app/employees',
        permissions: ['user:read'],
      },
      {
        id: 'departments',
        label: 'Phòng ban',
        icon: React.createElement(Building2, { size: 18 }),
        href: '/app/departments',
        permissions: ['department:read'],
      },
      {
        id: 'access-roles',
        label: 'Vai trò & quyền',
        icon: React.createElement(ShieldCheck, { size: 18 }),
        href: '/app/access/roles',
        permissions: ['role:read'],
      },
      {
        id: 'attendances',
        label: 'Chấm công',
        icon: React.createElement(CalendarCheck, { size: 18 }),
        href: '/app/attendances',
        permissions: ['attendance:update'],
      },
      {
        id: 'attendances-roster',
        label: 'Lịch làm việc',
        icon: React.createElement(CalendarDays, { size: 18 }),
        href: '/app/attendances/roster',
        permissions: ['attendance_report:read'],
      },
      {
        id: 'leave-request',
        label: 'Nghỉ phép',
        icon: React.createElement(FileText, { size: 18 }),
        href: '/app/leave-requests',
        permissions: ['leave_request:read'],
      },
      {
        id: 'attendances-adjustments',
        label: 'Khiếu nại',
        icon: React.createElement(ClockAlert, { size: 18 }),
        href: '/app/attendances/adjustments',
        permissions: ['attendance_request:read'],
      },
      {
        id: 'suggestions',
        label: 'Đề xuất',
        icon: React.createElement(MessageSquarePlus, { size: 18 }),
        href: '/app/suggestions',
        permissions: ['suggestion:read'],
      },
    ],
  },
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
        permissions: ['warehouse_item:read', 'warehouse_receipt:read', 'offcut:read', 'glass_order:read', 'warehouse_supplier:read'],
      },
      {
        id: 'customers',
        label: 'Khách hàng',
        icon: React.createElement(Building2, { size: 18 }),
        href: '/app/customers',
        permissions: ['customer:read'],
      },
      {
        id: 'providers',
        label: 'Nhà cung cấp',
        icon: React.createElement(Handshake, { size: 18 }),
        href: '/app/customers/providers',
        permissions: ['customer_provider:read'],
      },
    ],
  },
  {
    title: 'Cấu hình dự án',
    items: [
      {
        id: 'brand',
        label: 'Hãng cung cấp',
        icon: React.createElement(Tag, { size: 18 }),
        href: '/app/projects/configuration?tab=brand',
        permissions: ['catalog:read'],
      },
      {
        id: 'series',
        label: 'Hệ nhôm',
        icon: React.createElement(Layers, { size: 18 }),
        href: '/app/projects/configuration?tab=series',
        permissions: ['catalog:read'],
      },
      {
        id: 'profile-bars',
        label: 'Thanh profile',
        icon: React.createElement(Ruler, { size: 18 }),
        href: '/app/projects/configuration?tab=profile-bars',
        permissions: ['catalog:read'],
      },
      {
        id: 'glass-gaskets',
        label: 'Kính, Panel & Lưới muỗi',
        icon: React.createElement(PanelTop, { size: 18 }),
        href: '/app/projects/configuration?tab=glass-gaskets',
        permissions: ['catalog:read'],
      },
      {
        id: 'accessories',
        label: 'Phụ kiện',
        icon: React.createElement(Puzzle, { size: 18 }),
        href: '/app/projects/configuration?tab=accessories',
        permissions: ['catalog:read'],
      },
      {
        id: 'accessory-combos',
        label: 'Combo phụ kiện',
        icon: React.createElement(Boxes, { size: 18 }),
        href: '/app/projects/configuration?tab=accessory-combos',
        permissions: ['catalog:read'],
      },
      {
        id: 'door-templates',
        label: 'Mẫu cửa',
        icon: React.createElement(DoorOpen, { size: 18 }),
        href: '/app/projects/configuration?tab=door-templates',
        permissions: ['catalog:read'],
      },
      {
        id: 'supplier-doors',
        label: 'Cửa nhập nguyên bộ (NCC)',
        icon: React.createElement(Truck, { size: 18 }),
        href: '/app/projects/configuration?tab=supplier-doors',
        permissions: ['catalog:read'],
      },
    ],
  },
  {
    title: 'Cơ chế và tài liệu',
    items: [
      {
        id: 'documents-my',
        label: 'Tài liệu của tôi',
        icon: React.createElement(Folder, { size: 18 }),
        href: '/app/documents?tab=my',
        permissions: ['document:read'],
      },
      {
        id: 'documents-shared',
        label: 'Được chia sẻ',
        icon: React.createElement(Share2, { size: 18 }),
        href: '/app/inbox',
        permissions: ['document:read'],
      },
      {
        id: 'documents-rule',
        label: 'Tài liệu ban hành',
        icon: React.createElement(ScrollText, { size: 18 }),
        href: '/app/rules',
        permissions: ['rule:read'],
      },
      {
        id: 'documents-trash',
        label: 'Thùng rác',
        icon: React.createElement(Trash2, { size: 18 }),
        href: '/app/trash',
        permissions: ['trash:read'],
      },
    ],
  },
];

export function getSidebarSections(access: Access): SidebarSectionType[] {
  return rawSidebarSections
    .map((section) => {
      const items = section.items.filter((item) => isAllowed(item, access));
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
    }
  }
  return !matched || allowed;
}
