'use client';

import React from 'react';
import { DAYS_OF_WEEK_OPTIONS } from '@/config';

export interface ShiftDaysSelectorProps {
  selectedDays: string[];
  selectedOptionalDays: string[];
  onToggleMandatoryDay: (day: string) => void;
  onToggleOptionalDay: (day: string) => void;
}

export const ShiftDaysSelector: React.FC<ShiftDaysSelectorProps> = ({
  selectedDays,
  selectedOptionalDays,
  onToggleMandatoryDay,
  onToggleOptionalDay,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Cột 1: Ngày làm việc bắt buộc */}
      <div className="flex flex-col justify-between gap-2.5 p-4 bg-slate-50/80 border border-slate-200 rounded-xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-semibold text-slate-800 select-none flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              Ngày làm việc bắt buộc *
            </label>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Nhân viên vắng mặt không phép nếu không đi làm
          </p>
        </div>
        <div className="grid grid-cols-7 gap-2 pt-1">
          {DAYS_OF_WEEK_OPTIONS.map((dayOption) => {
            const isSelected = selectedDays.includes(dayOption.value);
            return (
              <button
                type="button"
                key={dayOption.value}
                onClick={() => onToggleMandatoryDay(dayOption.value)}
                className={`py-2 text-center rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 border cursor-pointer select-none ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {dayOption.label}
              </button>
            );
          })}
        </div>
        {selectedDays.length === 0 && selectedOptionalDays.length === 0 && (
          <span className="text-xs text-red-500">
            Vui lòng chọn ít nhất 1 ngày làm việc
          </span>
        )}
      </div>

      {/* Cột 2: Ngày làm việc tùy chọn */}
      <div className="flex flex-col justify-between gap-2.5 p-4 bg-slate-50/80 border border-slate-200 rounded-xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-semibold text-slate-800 select-none flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              Ngày làm việc tùy chọn
            </label>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Đi làm vẫn tính công, không đi làm không bị phạt
          </p>
        </div>
        <div className="grid grid-cols-7 gap-2 pt-1">
          {DAYS_OF_WEEK_OPTIONS.map((dayOption) => {
            const isSelected = selectedOptionalDays.includes(dayOption.value);
            return (
              <button
                type="button"
                key={dayOption.value}
                onClick={() => onToggleOptionalDay(dayOption.value)}
                className={`py-2 text-center rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 border cursor-pointer select-none ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {dayOption.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
