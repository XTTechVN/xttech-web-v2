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
}

export const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({ pendingLeavesCount, pendingAdjustmentsCount, recentLeaves = [] }) => {
  const totalPending = pendingLeavesCount + pendingAdjustmentsCount;

  if (totalPending === 0) {
    return (
      <div className="bg-emerald-50/70 border border-emerald-100 rounded-block p-4 flex items-center gap-3">
        <div className="p-2 rounded-block bg-emerald-100 text-emerald-600 shrink-0">
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
    <div className="bg-white rounded-block p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col gap-3.5">
      {/* Header cảnh báo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-block bg-primary/10 text-primary shrink-0">
            <AlertCircle size={18} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight">Yêu cầu chờ bạn phê duyệt</h3>
            <span className="text-[11px] text-gray-500 font-medium">
              Có tổng cộng <strong className="text-gray-900 font-semibold">{totalPending}</strong> yêu cầu đang chờ xử lý
            </span>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">{totalPending}</span>
      </div>

      {/* Danh sách 2 nút tắt xử lý nhanh chuẩn nhận diện & tối giản */}
      <div className="grid grid-cols-2 gap-2.5 pt-0.5">
        <Link
          href="/app/leave-requests"
          className="p-2.5 rounded-block bg-gray-50/80 hover:bg-gray-100/90 border border-gray-100/90 flex items-center justify-between transition cursor-pointer active:scale-98 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-control bg-white border border-gray-100 shadow-2xs flex items-center justify-center text-primary shrink-0">
              <CalendarOff size={15} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-gray-900 group-hover:text-primary transition-colors">Đơn nghỉ phép</span>
              <span className="text-[11px] text-gray-500 font-medium">{pendingLeavesCount} đơn chờ</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
        </Link>

        <Link
          href="/app/attendances/adjustments"
          className="p-2.5 rounded-block bg-gray-50/80 hover:bg-gray-100/90 border border-gray-100/90 flex items-center justify-between transition cursor-pointer active:scale-98 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-control bg-white border border-gray-100 shadow-2xs flex items-center justify-center text-primary shrink-0">
              <ClockAlert size={15} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-gray-900 group-hover:text-primary transition-colors">Giải trình công</span>
              <span className="text-[11px] text-gray-500 font-medium">{pendingAdjustmentsCount} yêu cầu</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
        </Link>
      </div>

      {/* Danh sách preview 2-3 đơn gần nhất */}
      {recentLeaves.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-400">Đơn nghỉ gần nhất</span>
          {recentLeaves.slice(0, 2).map((leave) => (
            <Link
              key={leave.id}
              href="/app/leave-requests"
              className="p-2 rounded-control bg-gray-50 hover:bg-gray-100/80 flex items-center justify-between transition text-xs"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">{leave.userFullName}</span>
                <span className="text-[11px] text-gray-500">
                  {leave.leaveType === 'annual' ? 'Phép năm' : 'Nghỉ phép'} ({leave.totalDays} ngày): {leave.startDate}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">Chờ duyệt</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApprovalsCard;
