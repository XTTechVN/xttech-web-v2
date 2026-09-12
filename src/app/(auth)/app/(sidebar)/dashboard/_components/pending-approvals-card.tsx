'use client';

import React from 'react';
import Link from 'next/link';
import type { DashboardPendingLeave, DashboardPendingAdjustment } from '@/types';
import { AlertCircle, CalendarOff, ClockAlert, ChevronRight, CheckCircle2 } from 'lucide-react';

interface PendingApprovalsCardProps {
  pendingLeavesCount: number;
  pendingAdjustmentsCount: number;
  recentLeaves?: DashboardPendingLeave[];
  recentAdjustments?: DashboardPendingAdjustment[];
  isAdminOrHr?: boolean;
}

export const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({
  pendingLeavesCount,
  pendingAdjustmentsCount,
  recentLeaves = [],
  isAdminOrHr = false,
}) => {
  const totalPending = pendingLeavesCount + pendingAdjustmentsCount;

  if (!isAdminOrHr) {
    return null;
  }

  if (totalPending === 0) {
    return (
      <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
          <CheckCircle2 size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-emerald-900">Mọi hồ sơ đã được xử lý</span>
          <span className="text-[11px] text-emerald-700">Hiện không có đơn nghỉ phép hoặc khiếu nại nào chờ phê duyệt.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs flex flex-col gap-3">
      {/* Header cảnh báo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
            <AlertCircle size={16} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Yêu cầu chờ bạn phê duyệt
            </h3>
            <span className="text-[11px] text-amber-700 font-medium">
              Có tổng cộng <strong className="text-amber-900">{totalPending}</strong> yêu cầu đang chờ xử lý
            </span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
          {totalPending}
        </span>
      </div>

      {/* Danh sách 2 nút tắt xử lý nhanh */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Link
          href="/app/leave-requests"
          className="p-2.5 rounded-xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-100 flex items-center justify-between transition cursor-pointer active:scale-98"
        >
          <div className="flex items-center gap-2">
            <CalendarOff size={16} className="text-amber-600" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-gray-800">Đơn nghỉ phép</span>
              <span className="text-[10px] text-amber-700 font-medium">{pendingLeavesCount} đơn chờ</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-amber-600" />
        </Link>

        <Link
          href="/app/attendances/adjustments"
          className="p-2.5 rounded-xl bg-blue-50/60 hover:bg-blue-100/70 border border-blue-100 flex items-center justify-between transition cursor-pointer active:scale-98"
        >
          <div className="flex items-center gap-2">
            <ClockAlert size={16} className="text-blue-600" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-gray-800">Giải trình công</span>
              <span className="text-[10px] text-blue-700 font-medium">{pendingAdjustmentsCount} yêu cầu</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-blue-600" />
        </Link>
      </div>

      {/* Danh sách preview 2-3 đơn gần nhất */}
      {recentLeaves.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1 border-t border-gray-100">
          <span className="text-[10px] uppercase font-bold text-gray-400">Đơn nghỉ gần nhất</span>
          {recentLeaves.slice(0, 2).map((leave) => (
            <Link
              key={leave.id}
              href="/app/leave-requests"
              className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100/80 flex items-center justify-between transition text-xs"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">{leave.userFullName}</span>
                <span className="text-[11px] text-gray-500">
                  {leave.leaveType === 'annual' ? 'Phép năm' : 'Nghỉ phép'} ({leave.totalDays} ngày): {leave.startDate}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-medium">
                Chờ duyệt
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApprovalsCard;
