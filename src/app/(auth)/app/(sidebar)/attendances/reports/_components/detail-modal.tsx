'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal, Button, Badge, Avatar } from '@/components';
import { getAttendances } from '@/actions';
import { BASE_MINIO_URL } from '@/config';
import type { AttendanceReportItem, Attendance } from '@/types';
import { getAttendanceStatusLabel, getAttendanceStatusVariant } from '@/types';

interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: AttendanceReportItem | null;
  fromDate: string;
  toDate: string;
}

export function ReportDetailModal({
  isOpen,
  onClose,
  employee,
  fromDate,
  toDate,
}: ReportDetailModalProps) {
  // Lấy chi tiết lịch sử chấm công của nhân viên
  const { data: empAttendanceData, isLoading } = useQuery({
    queryKey: ['employee-attendance-detail', employee?.userId, fromDate, toDate],
    queryFn: () =>
      getAttendances({
        userId: employee?.userId,
        startDate: fromDate,
        endDate: toDate,
        limit: 100,
      }),
    enabled: Boolean(isOpen && employee?.userId),
  });

  const attendances: Attendance[] = empAttendanceData?.items || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi tiết chấm công - ${employee?.fullName || employee?.username || ''}`}
      size="lg"
      footer={
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-4 py-2">
        {/* Thông tin nhân sự */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <Avatar
              src={
                employee?.avatar
                  ? employee.avatar.startsWith('http')
                    ? employee.avatar
                    : `${BASE_MINIO_URL}${employee.avatar}`
                  : undefined
              }
              name={employee?.fullName || 'NV'}
              size="md"
            />
            <div>
              <span className="font-bold text-gray-900 block text-sm">
                {employee?.fullName || employee?.username}
              </span>
              <span className="text-xs font-medium text-primary block">
                {employee?.departmentName || 'Chưa gán'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-gray-500 block">Kỳ báo cáo</span>
            <span className="text-xs font-bold text-primary">
              {fromDate} → {toDate}
            </span>
          </div>
        </div>

        {/* Danh sách các ngày chấm công */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-800">
            Lịch sử các ngày chấm công
          </h4>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-gray-400">
              Đang tải lịch sử chấm công...
            </div>
          ) : attendances.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              Không tìm thấy bản ghi chấm công chi tiết nào.
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-xl bg-white">
              {attendances.map((att) => (
                <div
                  key={att.id}
                  className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">{att.workDate}</span>
                      <span className="text-[11px] text-gray-400">
                        Vào: {att.checkIn ? att.checkIn.slice(0, 5) : '--:--'} — Ra:{' '}
                        {att.checkOut ? att.checkOut.slice(0, 5) : '--:--'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-700">
                      {att.totalHours ? `${att.totalHours}h` : '0h'}
                    </span>
                    <Badge variant={getAttendanceStatusVariant(att.status)} size="sm">
                      {att.status === 'late' && att.lateMinutes
                        ? `Muộn (${att.lateMinutes}p)`
                        : att.status === 'early_leave' && att.earlyLeaveMinutes
                        ? `Sớm (${att.earlyLeaveMinutes}p)`
                        : getAttendanceStatusLabel(att.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
