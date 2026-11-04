'use client';

import React from 'react';
import { SashConfig } from '../../studio-types';
import { ProfileBar } from '@/types';

interface CasementSashProfilesSectionProps {
  config: SashConfig;
  onChangeConfig: (updates: Partial<SashConfig>) => void;
  profiles: ProfileBar[];
}

export const CasementSashProfilesSection: React.FC<CasementSashProfilesSectionProps> = ({
  config,
  onChangeConfig,
  profiles,
}) => {
  const sashProfiles = profiles.filter(
    (p) => p.barType === 'SASH' || p.barType === 'SCREEN_SASH'
  );
  const mullionProfiles = profiles.filter((p) => p.barType === 'MULLION');
  const beadProfiles = profiles.filter((p) => p.barType === 'BEAD');
  const dynamicMullionProfiles = profiles.filter(
    (p) => p.barType === 'DYNAMIC_MULLION'
  );

  const selectedLeftSash = profiles.find((p) => p.id === config.leftProfileId);
  const selectedSashMullion = profiles.find((p) => p.id === config.mullionProfileId);
  const selectedSashBead = profiles.find((p) => p.id === config.beadProfileId);
  const selectedDynamicMullion = profiles.find((p) => p.id === config.dynamicMullionProfileId);

  const handleLeftProfileChange = (profileId: number) => {
    onChangeConfig({
      leftProfileId: profileId,
      topProfileId: config.topProfileId || profileId,
      rightProfileId: config.rightProfileId || profileId,
      bottomProfileId: config.bottomProfileId || profileId,
    });
  };

  return (
    <div className="space-y-3">
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-slate-800">Cạnh đứng trái (Gốc)</span>
          <span className="text-[10px] text-primary font-medium">Đồng bộ sang cạnh khác</span>
        </div>
        <select
          value={config.leftProfileId || ''}
          onChange={(e) => handleLeftProfileChange(Number(e.target.value))}
          className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
        >
          <option value="">Chọn profile...</option>
          {sashProfiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} - {p.name}
            </option>
          ))}
        </select>
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
          <select
            value={config.topProfileId || ''}
            onChange={(e) => onChangeConfig({ topProfileId: Number(e.target.value) })}
            className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
          >
            <option value="">{config.leftProfileId ? '↑ Kế thừa (Cạnh trái)' : 'Chọn profile...'}</option>
            {sashProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
          <span className="font-semibold text-xs text-slate-800">Cạnh đứng phải</span>
          <select
            value={config.rightProfileId || ''}
            onChange={(e) => onChangeConfig({ rightProfileId: Number(e.target.value) })}
            className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
          >
            <option value="">{config.leftProfileId ? '↑ Kế thừa (Cạnh trái)' : 'Chọn profile...'}</option>
            {sashProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
        <span className="font-semibold text-xs text-slate-800">Cạnh dưới</span>
        <select
          value={config.bottomProfileId || ''}
          onChange={(e) => onChangeConfig({ bottomProfileId: Number(e.target.value) })}
          className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
        >
          <option value="">{config.leftProfileId ? '↑ Kế thừa (Cạnh trái)' : 'Chọn profile...'}</option>
          {sashProfiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} - {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
          <span className="font-semibold text-xs text-slate-800">Đố chia cánh</span>
          <select
            value={config.mullionProfileId || ''}
            onChange={(e) =>
              onChangeConfig({ mullionProfileId: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
          >
            <option value="">Chọn profile...</option>
            {mullionProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
          {selectedSashMullion && (
            <div className="flex flex-wrap gap-1 pt-0.5 text-[10px] font-mono text-slate-600">
              {Boolean(selectedSashMullion.sectionHeightMm) && (
                <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">
                  Bản: <b>{selectedSashMullion.sectionHeightMm}</b>mm
                </span>
              )}
              {Boolean(selectedSashMullion.deductBeadMm) && (
                <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">
                  Trừ nẹp: <b>{selectedSashMullion.deductBeadMm}</b>mm
                </span>
              )}
              {Boolean(selectedSashMullion.deductGlassMm) && (
                <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">
                  Trừ kính: <b>{selectedSashMullion.deductGlassMm}</b>mm
                </span>
              )}
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
          <span className="font-semibold text-xs text-slate-800">Nẹp kính cánh</span>
          <select
            value={config.beadProfileId || ''}
            onChange={(e) =>
              onChangeConfig({ beadProfileId: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
          >
            <option value="">Chọn profile...</option>
            {beadProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
          {selectedSashBead && Boolean(selectedSashBead.sectionHeightMm) && (
            <div className="flex flex-wrap gap-1 pt-0.5 text-[10px] font-mono text-slate-600">
              <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">
                Bản nẹp: <b>{selectedSashBead.sectionHeightMm}</b>mm
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-slate-800">Đố động (Astragal)</span>
          <span className="text-[11px] text-slate-400">Dành cho 2 cánh</span>
        </div>
        <select
          value={config.dynamicMullionProfileId || ''}
          onChange={(e) =>
            onChangeConfig({ dynamicMullionProfileId: e.target.value ? Number(e.target.value) : undefined })
          }
          className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
        >
          <option value="">
            {dynamicMullionProfiles.length > 0 ? 'Chọn profile đố động...' : '(Hệ này không có đố động)'}
          </option>
          {dynamicMullionProfiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} - {p.name}
            </option>
          ))}
        </select>
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

