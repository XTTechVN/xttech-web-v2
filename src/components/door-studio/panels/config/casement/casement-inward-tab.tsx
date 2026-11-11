'use client';

import React from 'react';
import { ProfileBar } from '@/types';
import { Select } from '@/components/select';
import { SashVariantProfiles } from '../../../studio-types';

interface CasementInwardTabProps {
  hasCustomInward: boolean;
  currentInward?: SashVariantProfiles;
  selectedLeftSash?: ProfileBar;
  sashOptions: { value: number | string; label: string }[];
  inwardInheritOptions: { value: number | string; label: string }[];
  inwardInheritLabel: string;
  onToggleCustomInward: (enabled: boolean) => void;
  onLeftChange: (val: string) => void;
  onEdgeChange: (edgeKey: 'topProfileId' | 'rightProfileId' | 'bottomProfileId', val: string) => void;
}

export const CasementInwardTab: React.FC<CasementInwardTabProps> = ({
  hasCustomInward,
  currentInward,
  selectedLeftSash,
  sashOptions,
  inwardInheritOptions,
  inwardInheritLabel,
  onToggleCustomInward,
  onLeftChange,
  onEdgeChange,
}) => {
  return (
    <div className="space-y-3">
      <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-center justify-between">
        <div>
          <span className="font-semibold text-xs text-slate-800 block">Cấu hình riêng cho cánh mở vào</span>
          <span className="text-[11px] text-slate-500">
            {hasCustomInward
              ? 'Đang sử dụng profile riêng biệt cho các ô cửa mở vào'
              : 'Tự động kế thừa cùng mã profile với cánh mở ra'}
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={hasCustomInward}
            onChange={(e) => onToggleCustomInward(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {hasCustomInward ? (
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-800">Cạnh đứng trái (Gốc mở vào)</span>
              <span className="text-[10px] text-indigo-600 font-medium">Đồng bộ sang cạnh khác</span>
            </div>
            <Select
              fullWidth
              value={currentInward?.leftProfileId || ''}
              onChange={(e) => onLeftChange(e.target.value)}
              options={[{ value: '', label: 'Chọn profile mở vào...' }, ...sashOptions]}
              placeholder="Chọn profile mở vào..."
              className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <span className="font-semibold text-xs text-slate-800">Cạnh trên (Mở vào)</span>
              <Select
                fullWidth
                value={currentInward?.topProfileId || ''}
                onChange={(e) => onEdgeChange('topProfileId', e.target.value)}
                options={inwardInheritOptions}
                placeholder={inwardInheritLabel}
                className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800"
              />
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <span className="font-semibold text-xs text-slate-800">Cạnh đứng phải (Mở vào)</span>
              <Select
                fullWidth
                value={currentInward?.rightProfileId || ''}
                onChange={(e) => onEdgeChange('rightProfileId', e.target.value)}
                options={inwardInheritOptions}
                placeholder={inwardInheritLabel}
                className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <span className="font-semibold text-xs text-slate-800">Cạnh dưới (Mở vào)</span>
            <Select
              fullWidth
              value={currentInward?.bottomProfileId || ''}
              onChange={(e) => onEdgeChange('bottomProfileId', e.target.value)}
              options={inwardInheritOptions}
              placeholder={inwardInheritLabel}
              className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800"
            />
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center text-xs text-slate-500">
          Cánh mở vào đang sử dụng cùng profile với cánh mở ra ({selectedLeftSash ? `${selectedLeftSash.code} - ${selectedLeftSash.name}` : 'Mặc định'}).
        </div>
      )}
    </div>
  );
};

