'use client';

import React from 'react';
import { ProfileBar } from '@/types';
import { Select } from '@/components/select';
import { parseStudioProfileId, StudioProfileId } from '../../../utils/profile-combine-utils';

interface CasementSharedProfilesProps {
  mullionProfileId?: StudioProfileId;
  beadProfileId?: StudioProfileId;
  dynamicMullionProfileId?: StudioProfileId;
  mullionProfiles: ProfileBar[];
  beadProfiles: ProfileBar[];
  dynamicMullionProfiles: ProfileBar[];
  selectedSashMullion?: ProfileBar;
  selectedSashBead?: ProfileBar;
  selectedDynamicMullion?: ProfileBar;
  onChangeMullion: (id?: StudioProfileId) => void;
  onChangeBead: (id?: StudioProfileId) => void;
  onChangeDynamicMullion: (id?: StudioProfileId) => void;
}

export const CasementSharedProfiles: React.FC<CasementSharedProfilesProps> = ({
  mullionProfileId,
  beadProfileId,
  dynamicMullionProfileId,
  mullionProfiles,
  beadProfiles,
  dynamicMullionProfiles,
  selectedSashMullion,
  selectedSashBead,
  selectedDynamicMullion,
  onChangeMullion,
  onChangeBead,
  onChangeDynamicMullion,
}) => {
  return (
    <div className="pt-2 border-t border-slate-200 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
          <span className="font-semibold text-xs text-slate-800">Đố chia cánh</span>
          <Select
            fullWidth
            value={mullionProfileId || ''}
            onChange={(e) => onChangeMullion(parseStudioProfileId(e.target.value))}
            options={[{ value: '', label: 'Chọn profile...' }, ...mullionProfiles.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` }))]}
            placeholder="Chọn profile..."
            className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800"
          />
          {selectedSashMullion && (
            <div className="flex flex-wrap gap-1 pt-0.5 text-[10px] font-mono text-slate-600">
              {Boolean(selectedSashMullion.sectionHeightMm) && <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">Bản: <b>{selectedSashMullion.sectionHeightMm}</b>mm</span>}
              {Boolean(selectedSashMullion.deductBeadMm) && <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">Trừ nẹp: <b>{selectedSashMullion.deductBeadMm}</b>mm</span>}
              {Boolean(selectedSashMullion.deductGlassMm) && <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">Trừ kính: <b>{selectedSashMullion.deductGlassMm}</b>mm</span>}
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
          <span className="font-semibold text-xs text-slate-800">Nẹp kính cánh</span>
          <Select
            fullWidth
            value={beadProfileId || ''}
            onChange={(e) => onChangeBead(parseStudioProfileId(e.target.value))}
            options={[{ value: '', label: 'Chọn profile...' }, ...beadProfiles.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` }))]}
            placeholder="Chọn profile..."
            className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800"
          />
          {selectedSashBead && Boolean(selectedSashBead.sectionHeightMm) && (
            <div className="flex flex-wrap gap-1 pt-0.5 text-[10px] font-mono text-slate-600">
              <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">Bản nẹp: <b>{selectedSashBead.sectionHeightMm}</b>mm</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-slate-800">Đố động (Astragal)</span>
          <span className="text-[11px] text-slate-400">Dành cho 2 cánh</span>
        </div>
        <Select
          fullWidth
          value={dynamicMullionProfileId || ''}
          onChange={(e) => onChangeDynamicMullion(parseStudioProfileId(e.target.value))}
          options={[
            { value: '', label: dynamicMullionProfiles.length > 0 ? 'Chọn profile đố động...' : '(Hệ này không có đố động)' },
            ...dynamicMullionProfiles.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` })),
          ]}
          placeholder={dynamicMullionProfiles.length > 0 ? 'Chọn profile đố động...' : '(Hệ này không có đố động)'}
          className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800"
        />
        {selectedDynamicMullion && Boolean(selectedDynamicMullion.sectionHeightMm) && (
          <div className="flex flex-wrap gap-1.5 pt-0.5 text-[10px] font-mono text-slate-600">
            <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">
              Khe hở đố động (sectionHeight): <b className="text-primary">{selectedDynamicMullion.sectionHeightMm}</b>mm
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

