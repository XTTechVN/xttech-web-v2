import React from 'react';
import { Layout, CalendarCheck, Clock, FileText, ShieldCheck, ListChecks, User } from 'lucide-react';
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
  'configurations',
  'doors',
  'accessories',
  'materials',
  'quotations',
  'extra-options',
  'formulas',
  'shifts',
  'attendances-reports',
];

export interface SidebarItemWithRoles extends Omit<SidebarItemType, 'subItems'> {
  roles?: UserRole[];
  subItems?: (Omit<SidebarItemType, 'subItems'> & { roles?: UserRole[] })[];
}

export interface SidebarSectionWithRoles extends Omit<SidebarSectionType, 'items'> {
  items: SidebarItemWithRoles[];
}

export const rawSidebarSections: SidebarSectionWithRoles[] = [
  // Điều hành
  {
    title: 'Doanh nghiệp',
    items: [
      {
        id: 'dashboard',
        label: 'Tổng quan',
        icon: React.createElement(Layout, { size: 18 }),
        href: '/app/dashboard',
        roles: ['super', 'admin', 'hr', 'sale', 'technician', 'accountant', 'employee'],
      },
    ],
  },
  // Quản lý nhân sự
  {
    title: 'Quản lý nhân sự',
    items: [
      {
        id: 'employees-root',
        label: 'Nhân viên',
        icon: React.createElement(User, { size: 18 }),
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
            id: 'attendances-reports',
            label: 'Báo cáo thống kê',
            href: '/app/attendances/reports',
            roles: ['super', 'admin', 'hr'],
          },
          {
            id: 'attendances-payroll',
            label: 'Lịch sử chấm công',
            href: '/app/attendances/payroll',
            roles: ['super', 'admin', 'hr', 'sale', 'technician', 'accountant', 'employee'],
          },
          {
            id: 'attendances-adjustments',
            label: 'Danh sách khiếu nại',
            href: '/app/attendances/adjustments',
            roles: ['super', 'admin', 'hr', 'sale', 'technician', 'accountant', 'employee'],
          },
        ],
      },
      {
        id: 'shifts',
        label: 'Ca làm việc',
        icon: React.createElement(Clock, { size: 18 }),
        href: '/app/shifts',
        roles: ['super', 'admin', 'hr'],
      },
      {
        id: 'leave-request',
        label: 'Nghỉ phép & Đơn từ',
        icon: React.createElement(FileText, { size: 18 }),
        href: '/app/leave-requests',
        roles: ['super', 'admin', 'hr'],
      },
      {
        id: 'attendances-policy',
        label: 'Chính sách chấm công',
        icon: React.createElement(ShieldCheck, { size: 18 }),
        href: '/app/attendances-policy',
        roles: ['super', 'admin', 'hr'],
      },
      {
        id: 'attendances-summary',
        label: 'Bảng tổng hợp',
        icon: React.createElement(ListChecks, { size: 18 }),
        href: '/app/attendances-summary',
        roles: ['super', 'admin', 'hr'],
      },
    ],
  },
  // Quản lý dự án
  {
    title: 'Dự án',
    items: [
      {
        id: 'projects-root',
        label: 'Quản lý dự án',
        icon: React.createElement(CalendarCheck, { size: 18 }),
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
        id: 'customers',
        label: 'Khách hàng',
        icon: React.createElement(User, { size: 18 }),
        href: '/app/customers',
        roles: ['super', 'admin', 'sale', 'hr'],
      },
      {
        id: 'project-tasks',
        label: 'Công việc',
        icon: React.createElement(Clock, { size: 18 }),
        href: '/app/project-tasks',
        roles: ['super', 'admin', 'sale', 'technician', 'accountant'],
      },
    ],
  },
  // Góp ý đề xuất
  {
    title: 'Góp ý đề xuất',
    items: [
      {
        id: 'suggestions',
        label: 'Danh sách góp ý',
        icon: React.createElement(CalendarCheck, { size: 18 }),
        href: '/app/suggestions',
        roles: ['super', 'admin', 'hr', 'sale', 'technician', 'accountant', 'employee'],
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
