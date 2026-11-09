'use client';

import React from 'react';
import { Clock, MapPin, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components';
import {
  DAY_LABEL_MAP,
  SHIFT_TYPE_BADGE_MAP,
  WORK_SHIFT_STATUS_MAP,
} from '@/config';
import type { WorkShift } from '@/types';

export interface ShiftCardProps {
  shift: WorkShift;
  onEdit: (shift: WorkShift) => void;
  onDelete: (shift: WorkShift) => void;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({
  shift,
  onEdit,
  onDelete,
}) => {
  const shiftTypeCode = shift.shiftType || '';
  const typeInfo = SHIFT_TYPE_BADGE_MAP[shiftTypeCode] || {
    label: shiftTypeCode || 'Khác',
    variant: 'default' as const,
  };

  const statusInfo = WORK_SHIFT_STATUS_MAP[shift.status] || {
    label: shift.status,
    variant: 'default' as const,
  };

  const startTime = (shift.startTime || '--:--').slice(0, 5);
  const endTime = (shift.endTime || '--:--').slice(0, 5);

  const workDays = (shift.workDays || '')
    .split(',')
    .map((day) => day.trim())
    .filter(Boolean);

  const optionalWorkDays = (shift.optionalWorkDays || '')
    .split(',')
    .map((day) => day.trim())
    .filter(Boolean);

  const latitude = shift.workLatitude;
  const longitude = shift.workLongitude;
  const allowedDistance = shift.allowedDistance ?? 200;
  const exceptions = shift.exceptions ?? [];

  return (
    <div className="group p-3 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-2xs transition-all duration-200 flex flex-col justify-between gap-2.5">
      {/* Top: Name & Badges */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-sm text-slate-900 line-clamp-1">
            {shift.name}
          </span>
          <Badge variant={statusInfo.variant} size="sm">
            {statusInfo.label}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant={typeInfo.variant} size="sm">
            {typeInfo.label}
          </Badge>
          {exceptions.length > 0 && (
            <Badge variant="warning" size="sm">
              {exceptions.length} ngoại lệ
            </Badge>
          )}
        </div>
      </div>

      {/* Middle: Time & Days */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium font-mono tabular-nums">
          <Clock size={13} className="text-slate-400 shrink-0" />
          <span>
            {startTime} - {endTime}
          </span>
        </div>

        {/* Days */}
        <div className="flex items-center gap-1 flex-wrap">
          {workDays.length > 0 || optionalWorkDays.length > 0 ? (
            <>
              {workDays.map((day) => (
                <span
                  key={`m-${day}`}
                  title="Bắt buộc"
                  className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  {DAY_LABEL_MAP[day] || day}
                </span>
              ))}
              {optionalWorkDays.map((day) => (
                <span
                  key={`o-${day}`}
                  title="Tùy chọn"
                  className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"
                >
                  {DAY_LABEL_MAP[day] || day}*
                </span>
              ))}
            </>
          ) : (
            <span className="text-[11px] text-slate-400 italic">
              Chưa chọn ngày
            </span>
          )}
        </div>
      </div>

      {/* Bottom: GPS & Actions */}
      <div className="flex items-center justify-between gap-2 text-[11px] pt-2 border-t border-slate-100/70 text-slate-500">
        {latitude !== null &&
        latitude !== undefined &&
        longitude !== null &&
        longitude !== undefined ? (
          <div className="flex items-center gap-1 text-emerald-600 font-medium font-mono tabular-nums">
            <MapPin size={12} className="shrink-0" />
            <span>≤ {allowedDistance}m</span>
          </div>
        ) : (
          <span className="text-slate-400">Không GPS</span>
        )}

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            title="Sửa ca làm việc"
            onClick={() => onEdit(shift)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-colors cursor-pointer"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            title="Xóa ca làm việc"
            onClick={() => onDelete(shift)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
