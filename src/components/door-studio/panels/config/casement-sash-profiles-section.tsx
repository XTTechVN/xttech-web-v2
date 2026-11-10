'use client';

import React from 'react';
import { SashConfig } from '../../studio-types';
import { ProfileBar } from '@/types';
import { Select } from '@/components/select';
import {
  findStudioProfile,
  parseStudioProfileId,
  type StudioProfileId,
} from '../../utils/profile-combine-utils';

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
  const sashProfiles = profiles.filter((p) => p.barType === 'SASH' || p.barType === 'SCREEN_SASH');
  const mullionProfiles = profiles.filter((p) => p.barType === 'MULLION');
  const beadProfiles = profiles.filter((p) => p.barType === 'BEAD');
  const dynamicMullionProfiles = profiles.filter((p) => p.barType === 'DYNAMIC_MULLION');

  const selectedLeftSash = findStudioProfile(profiles, config.leftProfileId);
  const selectedVoCucSash = findStudioProfile(profiles, config.voCucProfileId ?? config.leftProfileId);
  const selectedSashMullion = findStudioProfile(profiles, config.mullionProfileId);
  const selectedSashBead = findStudioProfile(profiles, config.beadProfileId);
  const selectedDynamicMullion = findStudioProfile(profiles, config.dynamicMullionProfileId);
  const sashOptions = sashProfiles.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` }));

  if (config.sashStyle === 'slim') {
    const voCucId = config.voCucProfileId ?? config.leftProfileId ?? '';
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
          onChange={(e) => {
            const nextId = parseStudioProfileId(e.target.value);
            onChangeConfig({
              voCucProfileId: nextId,
              ...(config.leftProfileId ? {} : { profileId: nextId, leftProfileId: nextId }),
            });
          }}
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
  }

  const buildSyncedRawVariants = (
    leftId?: StudioProfileId,
    topId?: StudioProfileId,
    rightId?: StudioProfileId,
    bottomId?: StudioProfileId
  ): Record<string, unknown> | undefined => {
    if (!config.rawVariants) return undefined;
    const nextRawVariants: Record<string, unknown> = { ...config.rawVariants };
    let hasSwingBranch = false;
    for (const key of ['mo-ra', 'mo-vao', 'mo-hat', 'mo-lat']) {
      if (key in nextRawVariants) {
        hasSwingBranch = true;
        const existingBranch =
          nextRawVariants[key] && typeof nextRawVariants[key] === 'object'
            ? (nextRawVariants[key] as Record<string, unknown>)
            : {};
        nextRawVariants[key] = {
          ...existingBranch,
          '1': leftId ? String(leftId) : '',
          '2': topId && topId !== leftId ? String(topId) : '',
          '3': rightId && rightId !== leftId ? String(rightId) : '',
          '4': bottomId && bottomId !== (topId || leftId) ? String(bottomId) : '',
        };
      }
    }
    return hasSwingBranch ? nextRawVariants : config.rawVariants;
  };

  const handleLeftProfileChange = (rawValue: string) => {
    const profileId = parseStudioProfileId(rawValue);
    onChangeConfig({
      profileId,
      leftProfileId: profileId,
      topProfileId: profileId,
      rightProfileId: profileId,
      bottomProfileId: profileId,
      bottomRailProfileId: profileId,
      edges: { ...(config.edges || {}), bottom: { ...(config.edges?.bottom || {}), profileId, enabled: false } },
      rawVariants: buildSyncedRawVariants(profileId, profileId, profileId, profileId),
    });
  };

  const handleEdgeProfileChange = (
    edgeKey: 'topProfileId' | 'rightProfileId' | 'bottomProfileId',
    rawValue: string
  ) => {
    const resolvedId = parseStudioProfileId(rawValue) ?? config.leftProfileId;
    const nextTopId = edgeKey === 'topProfileId' ? resolvedId : config.topProfileId;
    const nextRightId = edgeKey === 'rightProfileId' ? resolvedId : config.rightProfileId;
    const nextBottomId = edgeKey === 'bottomProfileId' ? resolvedId : config.bottomProfileId;
    const updates: Partial<SashConfig> = {
      [edgeKey]: resolvedId,
      rawVariants: buildSyncedRawVariants(config.leftProfileId, nextTopId, nextRightId, nextBottomId),
    };
    if (edgeKey === 'bottomProfileId') {
      updates.bottomRailProfileId = resolvedId;
      updates.edges = {
        ...(config.edges || {}),
        bottom: { ...(config.edges?.bottom || {}), profileId: resolvedId, enabled: Boolean(resolvedId && resolvedId !== config.leftProfileId) },
      };
    }
    onChangeConfig(updates);
  };

  const inheritLabel = config.leftProfileId ? '↑ Kế thừa (Cạnh trái)' : 'Chọn profile...';
  const inheritOptions = [{ value: '', label: inheritLabel }, ...sashOptions];

  return (
    <div className="space-y-3">
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-slate-800">Cạnh đứng trái (Gốc)</span>
          <span className="text-[10px] text-primary font-medium">Đồng bộ sang cạnh khác</span>
        </div>
        <Select
          fullWidth
          value={config.leftProfileId || ''}
          onChange={(e) => handleLeftProfileChange(e.target.value)}
          options={[{ value: '', label: 'Chọn profile...' }, ...sashOptions]}
          placeholder="Chọn profile..."
          className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800"
        />
        {selectedLeftSash && (
          <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono text-slate-600">
            {Boolean(selectedLeftSash.sectionHeightMm) && <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">Bản cánh: <b className="text-primary">{selectedLeftSash.sectionHeightMm}</b>mm</span>}
            {Boolean(selectedLeftSash.deductMullionMm) && <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">Trừ đố: <b>{selectedLeftSash.deductMullionMm}</b>mm</span>}
            {Boolean(selectedLeftSash.deductBeadMm) && <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">Trừ nẹp: <b>{selectedLeftSash.deductBeadMm}</b>mm</span>}
            {Boolean(selectedLeftSash.deductGlassMm) && <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">Trừ kính: <b>{selectedLeftSash.deductGlassMm}</b>mm</span>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
          <span className="font-semibold text-xs text-slate-800">Cạnh trên</span>
          <Select fullWidth value={config.topProfileId || ''} onChange={(e) => handleEdgeProfileChange('topProfileId', e.target.value)} options={inheritOptions} placeholder={inheritLabel} className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800" />
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
          <span className="font-semibold text-xs text-slate-800">Cạnh đứng phải</span>
          <Select fullWidth value={config.rightProfileId || ''} onChange={(e) => handleEdgeProfileChange('rightProfileId', e.target.value)} options={inheritOptions} placeholder={inheritLabel} className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800" />
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
        <span className="font-semibold text-xs text-slate-800">Cạnh dưới</span>
        <Select fullWidth value={config.bottomProfileId || ''} onChange={(e) => handleEdgeProfileChange('bottomProfileId', e.target.value)} options={inheritOptions} placeholder={inheritLabel} className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
          <span className="font-semibold text-xs text-slate-800">Đố chia cánh</span>
          <Select
            fullWidth
            value={config.mullionProfileId || ''}
            onChange={(e) => onChangeConfig({ mullionProfileId: parseStudioProfileId(e.target.value) })}
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
            value={config.beadProfileId || ''}
            onChange={(e) => onChangeConfig({ beadProfileId: parseStudioProfileId(e.target.value) })}
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
          value={config.dynamicMullionProfileId || ''}
          onChange={(e) => onChangeConfig({ dynamicMullionProfileId: parseStudioProfileId(e.target.value) })}
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

