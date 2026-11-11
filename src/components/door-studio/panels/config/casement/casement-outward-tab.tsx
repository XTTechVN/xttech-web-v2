'use client';

import React from 'react';
import { ProfileBar } from '@/types';
import { Select } from '@/components/select';

interface CasementOutwardTabProps {
  leftProfileId?: number | string | null;
  topProfileId?: number | string | null;
  rightProfileId?: number | string | null;
  bottomProfileId?: number | string | null;
  selectedLeftSash?: ProfileBar;
  sashOptions: { value: number | string; label: string }[];
  inheritOptions: { value: number | string; label: string }[];
  inheritLabel: string;
  onLeftChange: (val: string) => void;
  onEdgeChange: (edgeKey: 'topProfileId' | 'rightProfileId' | 'bottomProfileId', val: string) => void;
}

export const CasementOutwardTab: React.FC<CasementOutwardTabProps> = ({
  leftProfileId,
  topProfileId,
  rightProfileId,
  bottomProfileId,
  selectedLeftSash,
  sashOptions,
  inheritOptions,
  inheritLabel,
  onLeftChange,
  onEdgeChange,
}) => {
  return (
    <div className="space-y-3">
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-slate-800">Cạnh đứng trái (Gốc mở ra)</span>
          <span className="text-[10px] text-primary font-medium">Đồng bộ sang cạnh khác</span>
        </div>
        <Select
          fullWidth
          value={leftProfileId || ''}
          onChange={(e) => onLeftChange(e.target.value)}
          options={[{ value: '', label: 'Chọn profile...' }, ...sashOptions]}
          placeholder="Chọn profile..."
          className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800"
        />
        {selectedLeftSash && (
          <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono text-slate-600">
            {Boolean(selectedLeftSash.sectionHeightMm) && (
              <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">
                Bản cánh: <b className="text-primary">{selectedLeftSash.sectionHeightMm}</b>mm
              </span>
            )}
            {Boolean(selectedLeftSash.deductMullionMm) && (
              <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">
                Trừ đố: <b>{selectedLeftSash.deductMullionMm}</b>mm
              </span>
            )}
            {Boolean(selectedLeftSash.deductBeadMm) && (
              <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">
                Trừ nẹp: <b>{selectedLeftSash.deductBeadMm}</b>mm
              </span>
            )}
            {Boolean(selectedLeftSash.deductGlassMm) && (
              <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">
                Trừ kính: <b>{selectedLeftSash.deductGlassMm}</b>mm
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
          <span className="font-semibold text-xs text-slate-800">Cạnh trên</span>
          <Select
            fullWidth
            value={topProfileId || ''}
            onChange={(e) => onEdgeChange('topProfileId', e.target.value)}
            options={inheritOptions}
            placeholder={inheritLabel}
            className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800"
          />
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
          <span className="font-semibold text-xs text-slate-800">Cạnh đứng phải</span>
          <Select
            fullWidth
            value={rightProfileId || ''}
            onChange={(e) => onEdgeChange('rightProfileId', e.target.value)}
            options={inheritOptions}
            placeholder={inheritLabel}
            className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800"
          />
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
        <span className="font-semibold text-xs text-slate-800">Cạnh dưới</span>
        <Select
          fullWidth
          value={bottomProfileId || ''}
          onChange={(e) => onEdgeChange('bottomProfileId', e.target.value)}
          options={inheritOptions}
          placeholder={inheritLabel}
          className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800"
        />
      </div>
    </div>
  );
};

