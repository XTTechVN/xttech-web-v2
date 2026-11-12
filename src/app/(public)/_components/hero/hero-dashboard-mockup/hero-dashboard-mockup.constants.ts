import {
  AlertCircle,
  BarChart3,
  Building2,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FolderKanban,
  Lightbulb,
  MapPin,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface DashboardKpi {
  label: string;
  value: string;
  icon: LucideIcon;
}

// 4 thẻ KPI đầu trang dashboard
export const DASHBOARD_KPIS: DashboardKpi[] = [
  { label: 'Tổng nhân sự', value: '16', icon: Users },
  { label: 'Chuyên cần hôm nay', value: '24', icon: CheckCircle2 },
  { label: 'Hồ sơ chờ phê duyệt', value: '1', icon: Clock },
  { label: 'Dự án đang triển khai', value: '4', icon: FolderKanban },
];

// Giai đoạn công trình trong thẻ báo cáo dự án
export const PROJECT_STAGES: string[] = [
  'Thiết kế bóc tách: 1',
  'Lập báo giá: 1',
  'Đã ký hợp đồng: 1',
  'Đang sản xuất: 1',
];

export interface GpsStaffItem {
  name: string;
  coords: string;
  time: string;
  bg: string;
  init: string;
}

// Nhân sự thực địa (Live GPS)
export const GPS_STAFF: GpsStaffItem[] = [
  { name: 'Bùi Xuân Đức', coords: '20.7704, 106.7349', time: '17:52', bg: 'bg-rose-100 text-rose-700', init: 'Đ' },
  { name: 'Cao Đắc Lăng', coords: '20.7252, 106.7462', time: '17:55', bg: 'bg-amber-100 text-amber-700', init: 'L' },
  { name: 'Hoàng Văn Tuấn', coords: '20.7255, 106.7461', time: '17:55', bg: 'bg-slate-200 text-slate-700', init: 'T' },
  { name: 'Lê Trọng Thái', coords: '20.7253, 106.7462', time: '17:55', bg: 'bg-teal-50 text-primary', init: 'L' },
];

export interface MobileUtilityItem {
  label: string;
  icon: LucideIcon;
  bg: string;
  badge?: string;
}

// Tiện ích doanh nghiệp trên mockup điện thoại
export const MOBILE_UTILITIES: MobileUtilityItem[] = [
  { label: 'Công việc', icon: ClipboardCheck, bg: 'bg-teal-50 text-primary' },
  { label: 'Bản đồ Live', icon: MapPin, bg: 'bg-emerald-50 text-emerald-600' },
  { label: 'Nghỉ phép', icon: Calendar, bg: 'bg-amber-50 text-amber-600' },
  { label: 'Khiếu nại', icon: AlertCircle, bg: 'bg-blue-50 text-blue-600', badge: '1' },
  { label: 'Bảng công', icon: CalendarCheck, bg: 'bg-purple-50 text-purple-600' },
  { label: 'Lịch đi làm', icon: Clock, bg: 'bg-teal-50 text-teal-600' },
  { label: 'Dự án', icon: Building2, bg: 'bg-sky-50 text-sky-600' },
  { label: 'Nhân sự', icon: Users, bg: 'bg-indigo-50 text-indigo-600' },
  { label: 'Góp ý', icon: Lightbulb, bg: 'bg-rose-50 text-rose-500' },
  { label: 'Báo cáo', icon: BarChart3, bg: 'bg-emerald-50 text-emerald-600' },
];
