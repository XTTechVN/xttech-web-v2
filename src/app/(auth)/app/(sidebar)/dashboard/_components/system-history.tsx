'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '@/actions';
import type { AuditLog } from '@/types';
import { Skeleton, Button } from '@/components';
import {
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  Edit3,
  Trash2,
  LogIn,
  LogOut,
  Layers,
  XCircle,
  Clock,
} from 'lucide-react';

// Bảng chuyển đổi tên tài nguyên sang tiếng Việt thân thiện
const RESOURCE_LABELS: Record<string, string> = {
  LEAVE_REQUESTS: 'đơn xin nghỉ phép',
  'LEAVE-REQUESTS': 'đơn xin nghỉ phép',
  LEAVE_REQUEST: 'đơn xin nghỉ phép',
  'LEAVE-REQUEST': 'đơn xin nghỉ phép',
  LEAVEREQUEST: 'đơn xin nghỉ phép',
  ATTENDANCE_ADJUSTMENT_REQUESTS: 'khiếu nại chấm công',
  'ATTENDANCE-ADJUSTMENT-REQUESTS': 'khiếu nại chấm công',
  ATTENDANCE_REQUESTS: 'khiếu nại chấm công',
  'ATTENDANCE-REQUESTS': 'khiếu nại chấm công',
  ATTENDANCE_REQUEST: 'khiếu nại chấm công',
  'ATTENDANCE-REQUEST': 'khiếu nại chấm công',
  ATTENDANCEADJUSTMENTREQUEST: 'khiếu nại chấm công',
  ATTENDANCES: 'chấm công',
  ATTENDANCE: 'chấm công',
  ATTENDANCE_LOCATION_LOGS: 'vị trí GPS thực địa',
  'ATTENDANCE-LOCATION-LOGS': 'vị trí GPS thực địa',
  WORK_SHIFTS: 'ca làm việc',
  'WORK-SHIFTS': 'ca làm việc',
  WORK_SHIFT: 'ca làm việc',
  'WORK-SHIFT': 'ca làm việc',
  WORKSHIFT: 'ca làm việc',
  WORK_SHIFT_EXCEPTIONS: 'lịch nghỉ ngoại lệ',
  'WORK-SHIFT-EXCEPTIONS': 'lịch nghỉ ngoại lệ',
  USERS: 'nhân sự',
  USER: 'nhân sự',
  ROLES: 'vai trò phân quyền',
  ROLE: 'vai trò phân quyền',
  DEPARTMENTS: 'phòng ban',
  DEPARTMENT: 'phòng ban',
  POSITIONS: 'chức danh vị trí',
  POSITION: 'chức danh vị trí',
  MATERIALS: 'vật liệu nhôm kính',
  MATERIAL: 'vật liệu nhôm kính',
  MATERIAL_PRICES: 'giá vật tư',
  'MATERIAL-PRICES': 'giá vật tư',
  DOORS: 'mẫu cửa',
  DOOR: 'mẫu cửa',
  ACCESSORIES: 'phụ kiện',
  ACCESSORY: 'phụ kiện',
  ACCESSORY_CATEGORIES: 'danh mục phụ kiện',
  'ACCESSORY-CATEGORIES': 'danh mục phụ kiện',
  'EXTRA-OPTIONS': 'tùy chọn phát sinh',
  EXTRA_OPTIONS: 'tùy chọn phát sinh',
  EXTRA_OPTION: 'tùy chọn phát sinh',
  FORMULAS: 'công thức tính giá',
  FORMULA: 'công thức tính giá',
  QUOTATIONS: 'bảng báo giá',
  QUOTATION: 'bảng báo giá',
  PROJECTS: 'dự án',
  PROJECT: 'dự án',
  CUSTOMERS: 'khách hàng',
  CUSTOMER: 'khách hàng',
  CUSTOMER_LOGS: 'nhật ký chăm sóc khách',
  'CUSTOMER-LOGS': 'nhật ký chăm sóc khách',
  CUSTOMER_PROVIDERS: 'nhà cung cấp',
  'CUSTOMER-PROVIDERS': 'nhà cung cấp',
  SUGGESTIONS: 'góp ý đề xuất',
  SUGGESTION: 'góp ý đề xuất',
  COURSES: 'khóa đào tạo',
  COURSE: 'khóa đào tạo',
  COURSE_LESSONS: 'bài giảng nội bộ',
  'COURSE-LESSONS': 'bài giảng nội bộ',
  COURSE_USERS: 'học viên khóa học',
  'COURSE-USERS': 'học viên khóa học',
  LESSONS: 'bài giảng nội bộ',
  LESSON: 'bài giảng nội bộ',
  CANDIDATES: 'hồ sơ ứng viên',
  CANDIDATE: 'hồ sơ ứng viên',
  CANDIDATE_EVALUATIONS: 'đánh giá ứng viên',
  'CANDIDATE-EVALUATIONS': 'đánh giá ứng viên',
  APP_VERSIONS: 'phiên bản ứng dụng',
  'APP-VERSIONS': 'phiên bản ứng dụng',
  AUTH: 'tài khoản',
};

// Từ điển loại nghỉ phép
const LEAVE_TYPE_LABELS: Record<string, string> = {
  annual: 'phép năm',
  sick: 'nghỉ ốm',
  unpaid: 'nghỉ không lương',
  maternity: 'thai sản',
  wedding: 'cưới hỏi',
  bereavement: 'nghỉ tang',
  other: 'việc riêng',
};

interface ParsedEventDetail {
  actionText: string;
  resourceText: string;
  targetName: string | null;
  subDetail: string | null;
  actionType: 'create' | 'update' | 'delete' | 'auth' | 'approve' | 'reject' | 'other';
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  accentColor: string;
}

// Hàm trích xuất thông tin nghiệp vụ toàn diện từ Audit Log (Hỗ trợ cả CamelCase và Snake_case)
const parseAuditLogDetail = (log: AuditLog): ParsedEventDetail => {
  const act = (log.action || '').toUpperCase().trim();
  const res = (log.resource || '').toUpperCase().trim();
  const rawResourceText = RESOURCE_LABELS[res] || (res ? res.toLowerCase().replace(/_/g, ' ') : 'dữ liệu');

  // Lấy dữ liệu payload hỗ trợ cả camelCase và snake_case
  const oldVal = log.changes?.oldValue || log.changes?.old_value;
  const newVal = log.changes?.newValue || log.changes?.new_value;
  const targetId = log.targetId || log.target_id;
  const errorMsg = log.changes?.error;
  const isFailed = log.status?.toUpperCase() !== 'SUCCESS';

  // 1. Nếu hành động THẤT BẠI
  if (isFailed) {
    let failTarget = null;
    if (newVal?.name || oldVal?.name) {
      failTarget = newVal?.name || oldVal?.name;
    } else if (targetId && targetId !== '0') {
      failTarget = `#${targetId}`;
    }
    return {
      actionType: 'reject',
      actionText: 'thao tác không thành công trên',
      resourceText: rawResourceText,
      targetName: failTarget,
      subDetail: errorMsg ? `Lỗi: ${errorMsg}` : null,
      icon: <XCircle size={15} />,
      iconBg: 'bg-rose-50 border-rose-200/80',
      iconColor: 'text-rose-600',
      accentColor: 'text-rose-600',
    };
  }

  // 2. Đăng nhập / Đăng xuất
  if (act.includes('LOGIN') || act.includes('SIGNIN')) {
    return {
      actionType: 'auth',
      actionText: 'đã đăng nhập vào hệ thống',
      resourceText: rawResourceText,
      targetName: null,
      subDetail: null,
      icon: <LogIn size={15} />,
      iconBg: 'bg-blue-50 border-blue-200/80',
      iconColor: 'text-blue-600',
      accentColor: 'text-blue-600',
    };
  }
  if (act.includes('LOGOUT') || act.includes('SIGNOUT')) {
    return {
      actionType: 'auth',
      actionText: 'đã đăng xuất khỏi hệ thống',
      resourceText: rawResourceText,
      targetName: null,
      subDetail: null,
      icon: <LogOut size={15} />,
      iconBg: 'bg-slate-50 border-slate-200/80',
      iconColor: 'text-slate-600',
      accentColor: 'text-slate-600',
    };
  }

  // 3. Nghiệp vụ Đơn xin nghỉ phép (leave_requests)
  const isLeaveRequest =
    res.includes('LEAVE') || act.includes('LEAVEREQUEST') || act.includes('LEAVE_REQUEST');
  if (isLeaveRequest) {
    const leaveTypeKey = (newVal?.leave_type || oldVal?.leave_type || '') as string;
    const leaveTypeName = LEAVE_TYPE_LABELS[leaveTypeKey] || 'nghỉ phép';
    const totalDays = newVal?.total_days ?? oldVal?.total_days;
    const daysText = totalDays ? ` (${totalDays} ngày)` : '';
    const reason = newVal?.reason || oldVal?.reason;
    const reviewNote = newVal?.review_note;

    // Phê duyệt hoặc Từ chối đơn
    const oldStatus = oldVal?.status;
    const newStatus = newVal?.status;
    if (newStatus === 'rejected' || act.includes('REJECT')) {
      return {
        actionType: 'reject',
        actionText: 'đã từ chối',
        resourceText: 'đơn xin nghỉ phép',
        targetName: `${leaveTypeName}${daysText}`,
        subDetail: reason ? `Lý do: "${reason}"${reviewNote ? ` • Phản hồi: "${reviewNote}"` : ''}` : (reviewNote ? `Phản hồi: "${reviewNote}"` : null),
        icon: <XCircle size={15} />,
        iconBg: 'bg-rose-50 border-rose-200/80',
        iconColor: 'text-rose-600',
        accentColor: 'text-rose-600',
      };
    }
    if (newStatus === 'approved' || act.includes('APPROVE')) {
      return {
        actionType: 'approve',
        actionText: 'đã phê duyệt',
        resourceText: 'đơn xin nghỉ phép',
        targetName: `${leaveTypeName}${daysText}`,
        subDetail: reason ? `Lý do: "${reason}"${reviewNote ? ` • Ghi chú: "${reviewNote}"` : ''}` : null,
        icon: <CheckCircle2 size={15} />,
        iconBg: 'bg-teal-50 border-teal-200/80',
        iconColor: 'text-teal-600',
        accentColor: 'text-teal-700',
      };
    }
    if (act.startsWith('POST') || act.includes('CREATE')) {
      return {
        actionType: 'create',
        actionText: 'đã gửi',
        resourceText: 'đơn xin nghỉ phép',
        targetName: `${leaveTypeName}${daysText}`,
        subDetail: reason ? `Lý do: "${reason}"` : null,
        icon: <PlusCircle size={15} />,
        iconBg: 'bg-emerald-50 border-emerald-200/80',
        iconColor: 'text-emerald-600',
        accentColor: 'text-emerald-700',
      };
    }
    if (act.startsWith('DELETE') || act.includes('REMOVE')) {
      return {
        actionType: 'delete',
        actionText: 'đã xóa',
        resourceText: 'đơn xin nghỉ phép',
        targetName: `${leaveTypeName}${daysText}`,
        subDetail: reason ? `Lý do: "${reason}"` : null,
        icon: <Trash2 size={15} />,
        iconBg: 'bg-rose-50 border-rose-200/80',
        iconColor: 'text-rose-600',
        accentColor: 'text-rose-600',
      };
    }
    return {
      actionType: 'update',
      actionText: 'đã cập nhật',
      resourceText: 'đơn xin nghỉ phép',
      targetName: `${leaveTypeName}${daysText}`,
      subDetail: reason ? `Lý do: "${reason}"` : null,
      icon: <Edit3 size={15} />,
      iconBg: 'bg-amber-50 border-amber-200/80',
      iconColor: 'text-amber-600',
      accentColor: 'text-amber-700',
    };
  }

  // 4. Nghiệp vụ Khách hàng (customers)
  const isCustomer = res.includes('CUSTOMER') || act.includes('CUSTOMER');
  if (isCustomer) {
    const customerName = newVal?.name || oldVal?.name;
    const phone = newVal?.phone || oldVal?.phone;
    const address = newVal?.address || oldVal?.address;
    const target = customerName ? customerName : (targetId && targetId !== '0' ? `#${targetId}` : null);
    const sub = phone ? `SĐT: ${phone}${address ? ` • ${address}` : ''}` : (address || null);

    if (act.startsWith('DELETE') || act.includes('REMOVE')) {
      return {
        actionType: 'delete',
        actionText: 'đã xóa',
        resourceText: 'khách hàng',
        targetName: target,
        subDetail: sub,
        icon: <Trash2 size={15} />,
        iconBg: 'bg-rose-50 border-rose-200/80',
        iconColor: 'text-rose-600',
        accentColor: 'text-rose-600',
      };
    }
    if (act.startsWith('POST') || act.includes('CREATE')) {
      return {
        actionType: 'create',
        actionText: 'đã thêm mới',
        resourceText: 'khách hàng',
        targetName: target,
        subDetail: sub,
        icon: <PlusCircle size={15} />,
        iconBg: 'bg-emerald-50 border-emerald-200/80',
        iconColor: 'text-emerald-600',
        accentColor: 'text-emerald-700',
      };
    }
    return {
      actionType: 'update',
      actionText: 'đã cập nhật thông tin',
      resourceText: 'khách hàng',
      targetName: target,
      subDetail: sub,
      icon: <Edit3 size={15} />,
      iconBg: 'bg-amber-50 border-amber-200/80',
      iconColor: 'text-amber-600',
      accentColor: 'text-amber-700',
    };
  }

  // 5. Nghiệp vụ Nhân sự (users)
  const isUser = res.includes('USER') || act.includes('USER');
  if (isUser) {
    const fullName =
      newVal?.fullName ||
      newVal?.full_name ||
      oldVal?.fullName ||
      oldVal?.full_name ||
      newVal?.username ||
      oldVal?.username;
    const email = newVal?.email || oldVal?.email;
    const target = fullName || (targetId && targetId !== '0' ? `#${targetId}` : null);

    if (act.startsWith('DELETE') || act.includes('REMOVE')) {
      return {
        actionType: 'delete',
        actionText: 'đã xóa',
        resourceText: 'nhân sự',
        targetName: target,
        subDetail: email || null,
        icon: <Trash2 size={15} />,
        iconBg: 'bg-rose-50 border-rose-200/80',
        iconColor: 'text-rose-600',
        accentColor: 'text-rose-600',
      };
    }
    if (act.startsWith('POST') || act.includes('CREATE')) {
      return {
        actionType: 'create',
        actionText: 'đã thêm mới',
        resourceText: 'nhân sự',
        targetName: target,
        subDetail: email || null,
        icon: <PlusCircle size={15} />,
        iconBg: 'bg-emerald-50 border-emerald-200/80',
        iconColor: 'text-emerald-600',
        accentColor: 'text-emerald-700',
      };
    }
    return {
      actionType: 'update',
      actionText: 'đã cập nhật hồ sơ',
      resourceText: 'nhân sự',
      targetName: target,
      subDetail: email || null,
      icon: <Edit3 size={15} />,
      iconBg: 'bg-amber-50 border-amber-200/80',
      iconColor: 'text-amber-600',
      accentColor: 'text-amber-700',
    };
  }

  // 6. Trích xuất đối tượng chung cho các tài nguyên khác (Dự án, Báo giá, Vật tư, Ca làm việc...)
  const generalName =
    newVal?.name ||
    newVal?.fullName ||
    newVal?.full_name ||
    newVal?.customer_name ||
    newVal?.customerName ||
    newVal?.projectName ||
    newVal?.project_name ||
    newVal?.title ||
    newVal?.code ||
    oldVal?.name ||
    oldVal?.fullName ||
    oldVal?.full_name ||
    oldVal?.customer_name ||
    oldVal?.customerName ||
    oldVal?.projectName ||
    oldVal?.project_name ||
    oldVal?.title ||
    oldVal?.code;

  const targetName = generalName && typeof generalName === 'string' && generalName.trim()
    ? generalName.trim()
    : (targetId && targetId !== '0' ? `#${targetId}` : null);

  if (act.startsWith('DELETE') || act.includes('REMOVE')) {
    return {
      actionType: 'delete',
      actionText: 'đã xóa',
      resourceText: rawResourceText,
      targetName,
      subDetail: null,
      icon: <Trash2 size={15} />,
      iconBg: 'bg-rose-50 border-rose-200/80',
      iconColor: 'text-rose-600',
      accentColor: 'text-rose-600',
    };
  }

  if (act.startsWith('POST') || act.includes('CREATE') || act.includes('ADD')) {
    return {
      actionType: 'create',
      actionText: 'đã thêm mới',
      resourceText: rawResourceText,
      targetName,
      subDetail: null,
      icon: <PlusCircle size={15} />,
      iconBg: 'bg-emerald-50 border-emerald-200/80',
      iconColor: 'text-emerald-600',
      accentColor: 'text-emerald-700',
    };
  }

  if (act.startsWith('PUT') || act.startsWith('PATCH') || act.includes('UPDATE') || act.includes('EDIT')) {
    return {
      actionType: 'update',
      actionText: 'đã cập nhật',
      resourceText: rawResourceText,
      targetName,
      subDetail: null,
      icon: <Edit3 size={15} />,
      iconBg: 'bg-amber-50 border-amber-200/80',
      iconColor: 'text-amber-600',
      accentColor: 'text-amber-700',
    };
  }

  return {
    actionType: 'other',
    actionText: 'đã thao tác trên',
    resourceText: rawResourceText,
    targetName,
    subDetail: null,
    icon: <Layers size={15} />,
    iconBg: 'bg-slate-50 border-slate-200/80',
    iconColor: 'text-slate-600',
    accentColor: 'text-slate-700',
  };
};

// Định dạng thời gian tương đối thân thiện (VD: Vừa xong, 5 phút trước, Hôm nay lúc 15:05...)
const formatFriendlyTime = (isoString?: string) => {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 12 && date.getDate() === now.getDate()) {
      return `${diffHours} giờ trước`;
    }

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes()
    ).padStart(2, '0')}`;

    if (isToday) return `Hôm nay lúc ${timeStr}`;
    if (isYesterday) return `Hôm qua lúc ${timeStr}`;

    const dayStr = `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;
    return `${timeStr} • ${dayStr}`;
  } catch {
    return isoString;
  }
};

export const SystemHistory: React.FC = () => {
  const {
    data: auditLogData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => getAuditLogs({ limit: 15 }),
    refetchInterval: 30000,
  });

  const logs: AuditLog[] = auditLogData?.items ?? [];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <Activity size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">
              Hoạt động gần đây
            </h2>
            <p className="text-[11px] text-gray-500 font-medium">
              Nhật ký và biến động thao tác trên hệ thống
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-primary p-2 h-8 w-8 rounded-lg cursor-pointer active:scale-95"
          onClick={() => refetch()}
          title="Làm mới hoạt động"
          disabled={isLoading || isRefetching}
        >
          <RefreshCw
            size={15}
            className={isLoading || isRefetching ? 'animate-spin text-primary' : ''}
          />
        </Button>
      </div>

      {/* Danh sách nhật ký dạng Activity Feed */}
      <div className="flex flex-col max-h-96 overflow-y-auto pr-1 gap-2.5 scrollbar-hide">
        {isLoading ? (
          <div className="flex flex-col gap-2.5 py-1">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex gap-3 items-center p-2 rounded-xl bg-gray-50/60">
                <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-2 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <Activity size={20} />
            </div>
            <p className="text-xs font-semibold text-gray-600">Chưa có hoạt động nào được ghi nhận</p>
            <p className="text-[11px] text-gray-400">
              Các thao tác trên hệ thống sẽ tự động cập nhật tại đây
            </p>
          </div>
        ) : (
          logs.map((item) => {
            const isSuccess = item.status?.toUpperCase() === 'SUCCESS';
            const actorName = item.actor?.userName || item.actor?.user_name || 'Hệ thống';
            const detail = parseAuditLogDetail(item);
            const timeFormatted = formatFriendlyTime(item.timestamp);

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50/70 hover:bg-gray-100/70 border border-gray-100/80 transition"
              >
                {/* Icon phân loại hành động trực quan */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs mt-0.5 ${detail.iconBg} ${detail.iconColor}`}
                >
                  {detail.icon}
                </div>

                {/* Nội dung câu văn tự nhiên & Đối tượng */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs leading-relaxed text-gray-700">
                    <span className="font-bold text-gray-900">{actorName}</span>{' '}
                    <span>{detail.actionText}</span>{' '}
                    {detail.actionType !== 'auth' && (
                      <span className="font-medium text-gray-800">{detail.resourceText}</span>
                    )}
                    {detail.targetName && (
                      <>
                        {' '}
                        <span className={`font-semibold ${detail.accentColor}`}>
                          &ldquo;{detail.targetName}&rdquo;
                        </span>
                      </>
                    )}
                  </div>

                  {/* Dòng mô tả chi tiết bổ sung (Lý do, SĐT, Phản hồi...) */}
                  {detail.subDetail && (
                    <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5 italic">
                      {detail.subDetail}
                    </div>
                  )}

                  {/* Dòng thời gian & Cảnh báo lỗi */}
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={10} className="text-gray-400" />
                      {timeFormatted}
                    </span>
                    {!isSuccess && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-rose-50 text-rose-600 font-semibold border border-rose-200/60 text-[10px]">
                        <AlertCircle size={10} /> Thất bại
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SystemHistory;
