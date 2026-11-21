import {
  LayoutDashboard,
  Compass,
  MessageSquarePlus,
  Building2,
  Handshake,
  FolderKanban,
  FileText,
  Warehouse,
  SlidersHorizontal,
  CalendarCheck,
  History,
  CalendarOff,
  ClockAlert,
  CalendarRange,
  BarChart3,
  Users,
  Network,
  Folder,
  Share2,
  ScrollText,
  Trash2,
  ShieldCheck,
  UserCog,
  Server,
} from 'lucide-react';
import type { SidebarSectionProps } from '@/components';
import type { Access } from '@/config';

interface Entry {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  permissions?: string[];
  platformOnly?: boolean;
  // chỉ hiện khi quyền đầu tiên có phạm vi rộng hơn "own" (phòng ban / toàn tổ chức)
  wideOnly?: boolean;
}

interface Group {
  title: string;
  items: Entry[];
}

const ICON = { size: 18 };

// Menu của /remake theo "Tính năng hệ thống → 0. Sidebar". Mục hiện khi có MỘT trong các quyền;
// chỉ liệt kê mục đã có trang thật (trang trỏ về /app cho tới khi làm lại).
const GROUPS: Group[] = [
  {
    title: 'Điều hành',
    items: [
      { id: 'dashboard', label: 'Tổng quan', href: '/remake/dashboard', icon: <LayoutDashboard {...ICON} />, permissions: ['dashboard:read'] },
      { id: 'live-map', label: 'Bản đồ trực tiếp', href: '/remake/live-map', icon: <Compass {...ICON} />, permissions: ['live_map:read'] },
      { id: 'suggestions', label: 'Sáng kiến', href: '/remake/suggestions', icon: <MessageSquarePlus {...ICON} />, permissions: ['suggestion:read'] },
    ],
  },
  {
    title: 'Khách hàng',
    items: [
      { id: 'customers-root', label: 'Khách hàng', href: '/remake/customers', icon: <Building2 {...ICON} />, permissions: ['customer:read'] },
      { id: 'providers', label: 'Nhà cung cấp', href: '/remake/suppliers', icon: <Handshake {...ICON} />, permissions: ['customer_provider:read'] },
    ],
  },
  {
    title: 'Dự án',
    items: [
      { id: 'projects', label: 'Dự án', href: '/remake/projects', icon: <FolderKanban {...ICON} />, permissions: ['project:read'] },
      { id: 'quotations', label: 'Duyệt báo giá', href: '/remake/quotations', icon: <FileText {...ICON} />, permissions: ['quotation:approve'] },
    ],
  },
  {
    title: 'Sản xuất & kho',
    items: [
      { id: 'warehouse', label: 'Kho vật tư', href: '/remake/warehouse', icon: <Warehouse {...ICON} />, permissions: ['warehouse_item:read'] },
      { id: 'catalog', label: 'Danh mục vật tư', href: '/remake/catalog', icon: <SlidersHorizontal {...ICON} />, permissions: ['catalog:read'] },
    ],
  },
  {
    title: 'Nhân sự',
    items: [
      {
        id: 'attendances-root',
        label: 'Chấm công',
        href: '/remake/attendances',
        icon: <CalendarCheck {...ICON} />,
        permissions: ['attendance:read'],
        wideOnly: true,
      },
      {
        id: 'attendance-history',
        label: 'Lịch sử chấm công',
        href: '/remake/attendance-history',
        icon: <History {...ICON} />,
        permissions: ['attendance:read'],
      },
      { id: 'leave', label: 'Nghỉ phép', href: '/remake/leave-requests', icon: <CalendarOff {...ICON} />, permissions: ['leave_request:read'] },
      {
        id: 'adjustments',
        label: 'Khiếu nại công',
        href: '/remake/adjustments',
        icon: <ClockAlert {...ICON} />,
        permissions: ['attendance_request:read'],
      },
      { id: 'roster', label: 'Ca làm việc', href: '/remake/work-shifts', icon: <CalendarRange {...ICON} />, permissions: ['work_shift:read'] },
      {
        id: 'reports',
        label: 'Báo cáo chấm công',
        href: '/remake/attendance-reports',
        icon: <BarChart3 {...ICON} />,
        permissions: ['attendance_report:read'],
      },
      { id: 'employees', label: 'Nhân sự', href: '/remake/employees', icon: <Users {...ICON} />, permissions: ['user:read'] },
      { id: 'departments', label: 'Phòng ban', href: '/remake/departments', icon: <Network {...ICON} />, permissions: ['department:read'] },
    ],
  },
  {
    title: 'Tài liệu',
    items: [
      { id: 'documents', label: 'Tài liệu', href: '/remake/documents', icon: <Folder {...ICON} />, permissions: ['document:read'] },
      { id: 'inbox', label: 'Được chia sẻ', href: '/remake/inbox', icon: <Share2 {...ICON} />, permissions: ['document:read'] },
      { id: 'rules', label: 'Văn bản ban hành', href: '/remake/rules', icon: <ScrollText {...ICON} />, permissions: ['rule:read'] },
      { id: 'trash', label: 'Thùng rác', href: '/remake/trash', icon: <Trash2 {...ICON} />, permissions: ['trash:read'] },
    ],
  },
  {
    title: 'Quản trị',
    items: [
      { id: 'access-roles', label: 'Vai trò & quyền', href: '/remake/access/roles', icon: <ShieldCheck {...ICON} />, permissions: ['role:read'] },
      {
        id: 'access-members',
        label: 'Thành viên',
        href: '/remake/access/members',
        icon: <UserCog {...ICON} />,
        permissions: ['user:assign_role', 'user:create'],
      },
      { id: 'platform', label: 'Quản trị hệ thống', href: '/app/app-versions', icon: <Server {...ICON} />, platformOnly: true },
    ],
  },
];

export function getRemakeSections(access: Access): SidebarSectionProps[] {
  return GROUPS.map(({ title, items }) => ({
    title,
    items: items
      .filter((i) => (i.platformOnly ? access.isPlatformAdmin : !i.permissions || access.canAny(i.permissions)))
      .filter((i) => !i.wideOnly || (access.scopeOf?.(i.permissions![0]) ?? 'org') !== 'own')
      .map(({ id, label, href, icon }) => ({ id, label, href, icon })),
  })).filter((g) => g.items.length > 0);
}
