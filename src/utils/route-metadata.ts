export interface RouteMeta {
  title: string;
  subtitle?: string;
  iconName?: string;
}

export const ROUTE_METADATA_MAP: Record<string, RouteMeta> = {
  '/app/dashboard': {
    title: 'Tổng quan hệ thống',
    subtitle: 'XTTech Management',
    iconName: 'LayoutDashboard',
  },
  '/app/live-map': {
    title: 'Bản đồ trực tiếp',
    subtitle: 'Định vị & Giám sát nhân sự',
    iconName: 'Compass',
  },
  '/app/attendances': {
    title: 'Chấm công & Điểm danh',
    subtitle: 'Quản lý vào / ra ca làm việc',
    iconName: 'CalendarCheck',
  },
  '/app/leave-requests': {
    title: 'Đơn xin nghỉ phép',
    subtitle: 'Tạo và duyệt đơn nghỉ',
    iconName: 'CalendarOff',
  },
  '/app/employees': {
    title: 'Danh sách nhân sự',
    subtitle: 'Hồ sơ cán bộ công nhân viên',
    iconName: 'Users',
  },
  '/app/departments': {
    title: 'Phòng ban & Cơ cấu',
    subtitle: 'Quản lý phòng ban tổ chức',
    iconName: 'Building2',
  },
  '/app/roles': {
    title: 'Phân quyền hệ thống',
    subtitle: 'Quản lý vai trò & Quyền hạn',
    iconName: 'Sliders',
  },
  '/app/shifts': {
    title: 'Ca làm việc',
    subtitle: 'Lịch trình & Khung giờ ca',
    iconName: 'Clock',
  },
  '/app/projects': {
    title: 'Quản lý dự án',
    subtitle: 'Tiến độ & Nhiệm vụ công việc',
    iconName: 'FolderKanban',
  },
  '/app/customers': {
    title: 'Quản lý khách hàng',
    subtitle: 'Thông tin đối tác & Khách hàng',
    iconName: 'Users',
  },
  '/app/suggestions': {
    title: 'Góp ý & Khiếu nại',
    subtitle: 'Đóng góp ý kiến cải tiến hệ thống',
    iconName: 'MessageSquarePlus',
  },
  '/app/app-versions': {
    title: 'Cập nhật ứng dụng',
    subtitle: 'Thông tin phiên bản & Phát hành',
    iconName: 'Smartphone',
  },
  '/app/profile': {
    title: 'Hồ sơ cá nhân',
    subtitle: 'Thông tin tài khoản của bạn',
    iconName: 'UserCircle',
  },
};

/**
 * Tìm kiếm metadata của trang theo đường dẫn (pathname).
 * Hỗ trợ khớp chính xác hoặc khớp tiền tố (ví dụ: /app/employees/123 -> Nhân sự).
 */
export function getRouteMetadata(pathname: string): RouteMeta {
  // 1. Khớp chính xác
  if (ROUTE_METADATA_MAP[pathname]) {
    return ROUTE_METADATA_MAP[pathname];
  }

  // 2. Khớp tiền tố (Prefix match)
  const matchingKey = Object.keys(ROUTE_METADATA_MAP).find(
    (key) => key !== '/app' && pathname.startsWith(key)
  );

  if (matchingKey && ROUTE_METADATA_MAP[matchingKey]) {
    return ROUTE_METADATA_MAP[matchingKey];
  }

  // 3. Fallback mặc định
  return {
    title: 'Đang tải dữ liệu',
    subtitle: 'Vui lòng chờ trong giây lát...',
    iconName: 'Loader2',
  };
}
