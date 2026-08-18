import React from 'react';
import { Layout, CalendarCheck, Clock, FileText, ShieldCheck, ListChecks, User, Settings, Calculator } from 'lucide-react';
import { SidebarItemProps as SidebarItemType, SidebarSectionProps as SidebarSectionType } from '@/components';

export type UserRole = 'super' | 'admin' | 'hr' | 'sale' | 'technician';

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
  'doors',
  'accessories',
  'materials',
  'quotations',
  'extra-options',
  'formulas'
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
    title: 'Điều hành doanh nghiệp',
    items: [
      {
        id: 'dashboard',
        label: 'Tổng quan',
        icon: React.createElement(Layout, { size: 18 }),
        href: '/app/dashboard',
        roles: ['super', 'admin'],
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
        roles: ['super', 'admin', 'hr'],
        subItems: [
          {
            id: 'departments',
            label: 'Danh sách phòng ban',
            href: '/app/departments',
            roles: ['admin', 'hr'],
          },
          {
            id: 'employees',
            label: 'Danh sách nhân viên',
            href: '/app/employees',
            roles: ['admin', 'hr'],
          },
          {
            id: 'roles',
            label: 'Danh sách vai trò',
            href: '/app/roles',
            roles: ['admin'],
          },
        ],
      },
      {
        id: 'attendances-root',
        label: 'Chấm công & Thời gian',
        icon: React.createElement(CalendarCheck, { size: 18 }),
        href: '/app/attendances',
        roles: ['super', 'admin', 'hr', 'sale', 'technician'],
        subItems: [
          {
            id: 'attendances',
            label: 'Bảng công tháng (Admin)',
            href: '/app/attendances',
            roles: ['super', 'admin', 'hr'],
          },
          // {
          //   id: 'attendances-policy',
          //   label: 'Chính sách chấm công',
          //   href: '/app/attendances/policy',
          //   roles: ['super', 'admin', 'hr'],
          // },
          // {
          //   id: 'shifts',
          //   label: 'Ca làm việc',
          //   href: '/app/shifts',
          //   roles: ['super', 'admin', 'hr', 'sale', 'technician'],
          // },
          {
            id: 'attendances-payroll',
            label: 'Tính công & Dữ liệu lương',
            href: '/app/attendances/payroll',
            roles: ['super', 'admin', 'hr', 'sale', 'technician'],
          },
          {
            id: 'attendances-adjustments',
            label: 'Danh sách khiếu nại',
            href: '/app/attendances/adjustments',
            roles: ['super', 'admin', 'hr', 'sale', 'technician'],
          },
        ],
      },
      {
        id: 'shifts',
        label: 'Ca làm việc',
        icon: React.createElement(Clock, { size: 18 }),
        href: '/app/shifts',
        roles: ['admin', 'hr', 'technician'],
      },
      {
        id: 'leave-request',
        label: 'Nghỉ phép & Đơn từ',
        icon: React.createElement(FileText, { size: 18 }),
        href: '/app/leave-requests',
        roles: ['admin', 'hr'],
      },
      {
        id: 'attendances-policy',
        label: 'Chính sách chấm công',
        icon: React.createElement(ShieldCheck, { size: 18 }),
        href: '/app/attendances-policy',
        roles: ['admin', 'hr'],
      },
      {
        id: 'attendances-summary',
        label: 'Bảng tổng hợp',
        icon: React.createElement(ListChecks, { size: 18 }),
        href: '/app/attendances-summary',
        roles: ['admin', 'hr'],
      },
    ],
  },
  // Quản lý dự án
  {
    title: 'Quản lý dự án',
    items: [
      {
        id: 'projects',
        label: 'Danh sách dự án',
        icon: React.createElement(CalendarCheck, { size: 18 }),
        href: '/app/projects',
        roles: ['admin', 'sale'],
      },
      {
        id: 'quotations',
        label: 'Báo giá',
        icon: React.createElement(FileText, { size: 18 }),
        href: '/app/quotations',
        roles: ['admin', 'sale'],
      },
      {
        id: 'customers',
        label: 'Khách hàng',
        icon: React.createElement(User, { size: 18 }),
        href: '/app/customers',
        roles: ['admin', 'sale'],
      },
      {
        id: 'doors',
        label: 'Cửa',
        icon: React.createElement(Layout, { size: 18 }),
        href: '/app/doors',
        roles: ['admin', 'sale'],
      },
      {
        id: 'formulas',
        label: 'Công thức',
        icon: React.createElement(Calculator, { size: 18 }),
        href: '/app/formulas',
        roles: ['admin', 'sale'],
      },
      {
        id: 'accessories',
        label: 'Phụ kiện',
        icon: React.createElement(ListChecks, { size: 18 }),
        href: '/app/accessories',
        roles: ['admin', 'sale'],
      },
      {
        id: 'materials',
        label: 'Hệ nhôm',
        icon: React.createElement(ListChecks, { size: 18 }),
        href: '/app/materials',
        roles: ['admin', 'sale'],
      },
      {
        id: 'extra-options',
        label: 'Tùy chọn phát sinh',
        icon: React.createElement(Settings, { size: 18 }),
        href: '/app/extra-options',
        roles: ['admin', 'sale'],
      },
      {
        id: 'project-tasks',
        label: 'Công việc',
        icon: React.createElement(Clock, { size: 18 }),
        href: '/app/project-tasks',
        roles: ['admin', 'sale', 'technician'],
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
        roles: ['admin', 'hr', 'sale', 'technician'],
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
