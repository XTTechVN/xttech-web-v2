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
  Sliders,
  ClockAlert,
} from 'lucide-react';
import { SidebarItemProps as SidebarItemType, SidebarSectionProps as SidebarSectionType } from '@/components';

export type UserRole = 'super' | 'admin' | 'hr' | 'sale' | 'technician' | 'accountant' | 'employee';

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
  'customers',
  'customers-root',
  'providers',
  'customer-providers',
  'configurations',
  'doors',
  'accessories',
  'materials',
  'quotations',
  'extra-options',
  'formulas',
  'shifts',
  'attendances-reports',
  'live-map',
  'app-versions',
  'leave-request',
];

export interface SidebarItemWithRoles extends Omit<SidebarItemType, 'subItems'> {
  roles?: UserRole[];
  subItems?: (Omit<SidebarItemType, 'subItems'> & { roles?: UserRole[] })[];
}

export interface SidebarSectionWithRoles extends Omit<SidebarSectionType, 'items'> {
  items: SidebarItemWithRoles[];
}

export const rawSidebarSections: SidebarSectionWithRoles[] = [
  // 1. Điều hành
  {
    title: 'Điều hành',
    items: [
      {
        id: 'dashboard',
        label: 'Tổng quan',
        icon: React.createElement(LayoutDashboard, { size: 18 }),
        href: '/app/dashboard',
        roles: ['super', 'admin', 'hr', 'sale', 'technician', 'accountant', 'employee'],
      },
      {
        id: 'live-map',
        label: 'Bản đồ trực tiếp',
        icon: React.createElement(Compass, { size: 18 }),
        href: '/app/live-map',
        roles: ['super', 'admin', 'hr', 'sale', 'technician', 'accountant', 'employee'],
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
        roles: ['super', 'admin', 'hr', 'accountant'],
        subItems: [
          {
            id: 'departments',
            label: 'Danh sách phòng ban',
            href: '/app/departments',
            roles: ['super', 'admin', 'hr'],
          },
          {
            id: 'employees',
            label: 'Danh sách nhân viên',
            href: '/app/employees',
            roles: ['super', 'admin', 'hr'],
          },
          {
            id: 'roles',
            label: 'Danh sách vai trò',
            href: '/app/roles',
            roles: ['super'],
          },
        ],
      },
      {
        id: 'attendances-root',
        label: 'Chấm công',
        icon: React.createElement(CalendarCheck, { size: 18 }),
        href: '/app/attendances',
        roles: ['super', 'admin', 'hr', 'sale', 'technician', 'accountant', 'employee'],
        subItems: [
          {
            id: 'attendances',
            label: 'Quản lý chấm công',
            href: '/app/attendances',
            roles: ['super', 'admin', 'hr'],
          },
          {
            id: 'attendances-payroll',
            label: 'Lịch sử chấm công',
            href: '/app/attendances/payroll',
            roles: ['super', 'admin', 'hr', 'sale', 'technician', 'accountant', 'employee'],
          },
          {
            id: 'attendances-reports',
            label: 'Báo cáo thống kê',
            href: '/app/attendances/reports',
            roles: ['super', 'admin', 'hr'],
          },
          {
            id: 'shifts',
            label: 'Ca làm việc',
            href: '/app/shifts',
            roles: ['super', 'admin', 'hr'],
          },
        ],
      },
      {
        id: 'leave-request',
        label: 'Nghỉ phép & Đơn từ',
        icon: React.createElement(FileText, { size: 18 }),
        href: '/app/leave-requests',
        roles: ['super', 'admin', 'hr', 'sale', 'technician', 'accountant', 'employee'],
      },
      {
        id: 'attendances-adjustments',
        label: 'Khiếu nại công',
        icon: React.createElement(ClockAlert, { size: 18 }),
        href: '/app/attendances/adjustments',
        roles: ['super', 'admin', 'hr', 'sale', 'technician', 'accountant', 'employee'],
      },
      {
        id: 'suggestions',
        label: 'Góp ý & Đề xuất',
        icon: React.createElement(MessageSquarePlus, { size: 18 }),
        href: '/app/suggestions',
        roles: ['super', 'admin', 'hr', 'sale', 'technician', 'accountant', 'employee'],
      },
    ],
  },
  // 3. Dự án & Đối tác
  {
    title: 'Dự án & Đối tác',
    items: [
      {
        id: 'projects-root',
        label: 'Quản lý dự án',
        icon: React.createElement(FolderKanban, { size: 18 }),
        href: '/app/projects',
        roles: ['super', 'admin', 'sale', 'accountant', 'hr'],
        subItems: [
          {
            id: 'projects',
            label: 'Danh sách dự án',
            href: '/app/projects',
            roles: ['super', 'admin', 'sale', 'accountant', 'hr'],
          },
          {
            id: 'configurations',
            label: 'Cấu hình dự án',
            href: '/app/projects/configuration',
            roles: ['super', 'admin', 'accountant', 'hr', 'sale'],
          },
        ],
      },
      {
        id: 'customers-root',
        label: 'Khách hàng & Đối tác',
        icon: React.createElement(Building2, { size: 18 }),
        href: '/app/customers',
        roles: ['super', 'admin', 'sale', 'hr'],
        subItems: [
          {
            id: 'customers',
            label: 'Danh sách khách hàng',
            href: '/app/customers',
            roles: ['super', 'admin', 'sale', 'hr'],
          },
          {
            id: 'providers',
            label: 'Nhà cung cấp',
            href: '/app/customers/providers',
            roles: ['super', 'admin', 'sale', 'hr'],
          },
        ],
      },
    ],
  },
  // 4. Tiện ích & Hệ thống
  {
    title: 'Hệ thống',
    items: [
      {
        id: 'app-versions',
        label: 'Quản trị hệ thống',
        icon: React.createElement(Sliders, { size: 18 }),
        href: '/app/app-versions',
        roles: ['super', 'admin'],
      },
    ],
  },
];

export function getSidebarSectionsForRole(role: UserRole): SidebarSectionType[] {
  return rawSidebarSections
    .map((section) => {
      const filteredItems = section.items
        .filter((item) => !item.roles || item.roles.includes(role))
        .map((item) => {
          const filteredSubItems = item.subItems ? item.subItems.filter((sub) => !sub.roles || sub.roles.includes(role)) : undefined;

          return { ...item, subItems: filteredSubItems } as SidebarItemType;
        });

      return { ...section, items: filteredItems } as SidebarSectionType;
    })
    .filter((section) => section.items.length > 0);
}

export function isRouteAllowedForRole(path: string, role: UserRole): boolean {
  if (path === '/app' || path === '/app/') return true;

  let hasMatchedRoute = false;
  let isAllowed = false;

  for (const section of rawSidebarSections) {
    for (const item of section.items) {
      if (item.href === path) {
        hasMatchedRoute = true;
        if (!item.roles || item.roles.includes(role)) {
          isAllowed = true;
        }
      }
      if (item.subItems) {
        for (const sub of item.subItems) {
          if (sub.href === path) {
            hasMatchedRoute = true;
            if (!sub.roles || sub.roles.includes(role)) {
              isAllowed = true;
            }
          }
        }
      }
    }
  }

  if (!hasMatchedRoute) return true;
  return isAllowed;
}
