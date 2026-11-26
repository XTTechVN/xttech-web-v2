'use client';

import React from 'react';
import { ProfileBar } from '@/types';
import { Select } from '@/components/select';
import { parseStudioProfileId, StudioProfileId } from '../../../utils/profile-combine-utils';

interface CasementSlimSectionProps {
  voCucId: string | number;
  selectedVoCucSash?: ProfileBar;
  sashOptions: { value: number | string; label: string }[];
  onVoCucChange: (nextId?: StudioProfileId) => void;
}

export const CasementSlimSection: React.FC<CasementSlimSectionProps> = ({
  voCucId,
  selectedVoCucSash,
  sashOptions,
  onVoCucChange,
}) => {
  return (
    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
      <div>
        <div className="font-semibold text-xs text-slate-800">Profile cánh vô cực</div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          Profile này chính là toàn bộ cánh. Bề rộng render = sectionHeightMm, sản xuất trả đúng 1 thanh.
        </div>
      </div>
      <Select
        fullWidth
        value={voCucId}
        onChange={(e) => onVoCucChange(parseStudioProfileId(e.target.value))}
        options={[{ value: '', label: 'Chọn profile cánh vô cực...' }, ...sashOptions]}
        placeholder="Chọn profile cánh vô cực..."
        className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800"
      />
      {selectedVoCucSash && Boolean(selectedVoCucSash.sectionHeightMm) && (
        <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-600">
          <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">
            Bản cánh (sectionHeightMm): <b className="text-primary">{selectedVoCucSash.sectionHeightMm}</b>mm
          </span>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600 text-center font-medium">
        <div className="py-1.5 px-2 bg-white border border-slate-200 rounded-md">1 thanh</div>
        <div className="py-1.5 px-2 bg-white border border-slate-200 rounded-md">Góc 90° / 90°</div>
        <div className="py-1.5 px-2 bg-white border border-slate-200 rounded-md">Không tay nắm</div>
      </div>
    </div>
  );
};

