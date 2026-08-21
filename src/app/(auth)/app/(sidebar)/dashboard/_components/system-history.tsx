'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '@/actions';
import type { AuditLog } from '@/types';
import { Avatar, Skeleton, Button } from '@/components';
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
} from 'lucide-react';

// Bảng chuyển đổi tên tài nguyên sang tiếng Việt thân thiện
const RESOURCE_LABELS: Record<string, string> = {
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
  DOORS: 'mẫu cửa',
  DOOR: 'mẫu cửa',
  ACCESSORIES: 'phụ kiện',
  ACCESSORY: 'phụ kiện',
  'EXTRA-OPTIONS': 'tùy chọn phát sinh',
  'EXTRA_OPTIONS': 'tùy chọn phát sinh',
  EXTRA_OPTION: 'tùy chọn phát sinh',
  FORMULAS: 'công thức tính giá',
  FORMULA: 'công thức tính giá',
  QUOTATIONS: 'bảng báo giá',
  QUOTATION: 'bảng báo giá',
  PROJECTS: 'dự án',
  PROJECT: 'dự án',
  CUSTOMERS: 'khách hàng',
  CUSTOMER: 'khách hàng',
  ATTENDANCES: 'chấm công',
  ATTENDANCE: 'chấm công',
  'ATTENDANCE-REQUEST': 'khiếu nại công',
  'ATTENDANCE_REQUEST': 'khiếu nại công',
  'WORK-SHIFTS': 'ca làm việc',
  'WORK_SHIFTS': 'ca làm việc',
  WORK_SHIFT: 'ca làm việc',
  SUGGESTIONS: 'góp ý đề xuất',
  SUGGESTION: 'góp ý đề xuất',
  COURSES: 'khóa đào tạo',
  COURSE: 'khóa đào tạo',
  LESSONS: 'bài giảng nội bộ',
  LESSON: 'bài giảng nội bộ',
  CANDIDATES: 'hồ sơ ứng viên',
  CANDIDATE: 'hồ sơ ứng viên',
  AUTH: 'tài khoản',
};

// Hàm chuyển đổi hành động thô thành câu tiếng Việt dễ hiểu
const parseHumanAction = (rawAction?: string, rawResource?: string) => {
  const act = (rawAction || '').toUpperCase().trim();
  const res = (rawResource || '').toUpperCase().trim();

  const resourceText = RESOURCE_LABELS[res] || (res ? res.toLowerCase() : 'dữ liệu');

  // 1. Đăng nhập / Đăng xuất
  if (act.includes('LOGIN') || act.includes('SIGNIN')) {
    return {
      title: 'Đăng nhập vào hệ thống',
      icon: <LogIn size={13} className="text-blue-500" />,
      tag: 'Đăng nhập',
    };
  }
  if (act.includes('LOGOUT') || act.includes('SIGNOUT')) {
    return {
      title: 'Đăng xuất khỏi hệ thống',
      icon: <LogOut size={13} className="text-gray-500" />,
      tag: 'Đăng xuất',
    };
  }

  // 2. Thêm mới
  if (
    act.startsWith('POST') ||
    act.includes('CREATE') ||
    act.includes('ADD') ||
    act.includes('INSERT')
  ) {
    return {
      title: `Thêm mới ${resourceText}`,
      icon: <PlusCircle size={13} className="text-emerald-500" />,
      tag: 'Thêm mới',
    };
  }

  // 3. Cập nhật / Chỉnh sửa
  if (
    act.startsWith('PUT') ||
    act.startsWith('PATCH') ||
    act.includes('UPDATE') ||
    act.includes('EDIT')
  ) {
    return {
      title: `Cập nhật thông tin ${resourceText}`,
      icon: <Edit3 size={13} className="text-amber-500" />,
      tag: 'Cập nhật',
    };
  }

  // 4. Xóa
  if (act.startsWith('DELETE') || act.includes('REMOVE')) {
    return {
      title: `Xóa ${resourceText}`,
      icon: <Trash2 size={13} className="text-rose-500" />,
      tag: 'Xóa',
    };
  }

  // 5. Duyệt / Từ chối
  if (act.includes('APPROVE')) {
    return {
      title: `Phê duyệt ${resourceText}`,
      icon: <CheckCircle2 size={13} className="text-emerald-500" />,
      tag: 'Phê duyệt',
    };
  }
  if (act.includes('REJECT')) {
    return {
      title: `Từ chối ${resourceText}`,
      icon: <AlertCircle size={13} className="text-rose-500" />,
      tag: 'Từ chối',
    };
  }

  return {
    title: `Thao tác trên ${resourceText}`,
    icon: <Layers size={13} className="text-slate-500" />,
    tag: 'Hệ thống',
  };
};

// Định dạng thời gian thân thiện (VD: Hôm nay lúc 15:05, Hôm qua lúc 09:14...)
const formatFriendlyTime = (isoString?: string) => {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const now = new Date();
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

    if (isToday) return `Hôm nay, ${timeStr}`;
    if (isYesterday) return `Hôm qua, ${timeStr}`;

    const dayStr = `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;
    return `${timeStr} • ${dayStr}`;
  } catch {
    return isoString;
  }
};

const SystemHistory = () => {
  const {
    data: auditLogData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => getAuditLogs({ limit: 15 }),
    refetchInterval: 30000, // Tự động làm mới dữ liệu mỗi 30 giây
  });

  const logs: AuditLog[] = auditLogData?.items ?? [];

  return (
    <div className="flex flex-col gap-4 bg-white border border-gray-100 rounded-xl p-4 shadow-xs">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Activity size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800 tracking-tight">
              Hoạt động gần đây
            </h2>
            <p className="text-xs text-gray-400">
              Nhật ký và diễn biến thao tác trên hệ thống
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-primary p-2 h-8 w-8 rounded-lg"
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

      {/* Danh sách nhật ký */}
      <div className="flex flex-col max-h-[380px] overflow-y-auto pr-1 divide-y divide-gray-100">
        {isLoading ? (
          <div className="flex flex-col gap-3 py-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex gap-3 items-center py-2.5">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              <Activity size={20} />
            </div>
            <p className="text-sm font-medium text-gray-500">Chưa có hoạt động nào được ghi nhận</p>
            <p className="text-xs text-gray-400">
              Các thao tác của người dùng sẽ hiển thị tự động tại đây
            </p>
          </div>
        ) : (
          logs.map((item) => {
            const isSuccess = item.status?.toUpperCase() === 'SUCCESS';
            const actorName = item.actor?.user_name || 'Hệ thống';
            const { title, icon, tag } = parseHumanAction(item.action, item.resource);
            const timeFormatted = formatFriendlyTime(item.timestamp);

            return (
              <div
                key={item.id}
                className="py-3 px-1.5 hover:bg-slate-50/70 rounded-lg transition-colors"
              >
                <div className="flex gap-3 items-start">
                  <Avatar
                    name={actorName}
                    size="sm"
                    className="shrink-0 mt-0.5 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    {/* Hàng 1: Tên người dùng & Thời gian */}
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-semibold text-gray-800 text-xs truncate">
                        {actorName}
                      </span>
                      <span className="text-[11px] text-gray-400 shrink-0 font-medium">
                        {timeFormatted}
                      </span>
                    </div>

                    {/* Hàng 2: Hành động bằng ngôn ngữ tự nhiên */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="shrink-0">{icon}</span>
                      <p className="font-medium text-gray-700 text-xs truncate">
                        {title}
                      </p>
                    </div>

                    {/* Hàng 3: Trạng thái & Tag phân loại */}
                    <div className="flex items-center gap-2 mt-1 text-[11px]">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                        {tag}
                      </span>

                      <span
                        className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          isSuccess
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}
                      >
                        {isSuccess ? (
                          <>
                            <CheckCircle2 size={10} className="shrink-0" /> Thành công
                          </>
                        ) : (
                          <>
                            <AlertCircle size={10} className="shrink-0" /> Thất bại
                          </>
                        )}
                      </span>
                    </div>
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
