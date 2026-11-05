'use client';

import React from 'react';
import {
  SashConfig,
  SlidingSashRole,
  SashVariantProfiles,
} from '../../studio-types';
import { ProfileBar } from '@/types';
import { Select } from '@/components/select';

interface SlidingSashVariantsSectionProps {
  config: SashConfig;
  onChangeConfig: (updates: Partial<SashConfig>) => void;
  profiles: ProfileBar[];
}

const VARIANT_CARDS: {
  role: SlidingSashRole;
  title: string;
  canInheritFromLeft: boolean;
}[] = [
  { role: 'left_sliding', title: '▸ Cánh lùa trái', canInheritFromLeft: false },
  { role: 'right_sliding', title: '▸ Cánh lùa phải', canInheritFromLeft: true },
  { role: 'center_sliding', title: '▸ Cánh lùa giữa (2 chiều)', canInheritFromLeft: true },
];

export const SlidingSashVariantsSection: React.FC<SlidingSashVariantsSectionProps> = ({
  config,
  onChangeConfig,
  profiles,
}) => {
  const sashProfiles = profiles.filter(
    (p) => p.barType === 'SASH' || p.barType === 'SCREEN_SASH'
  );
  const mullionProfiles = profiles.filter((p) => p.barType === 'MULLION');
  const beadProfiles = profiles.filter((p) => p.barType === 'BEAD');

  // Ốp móc (Interlock) và Ốp nối cánh có thể mang barType INTERLOCK, DYNAMIC_MULLION, SASH, MULLION hoặc phụ kiện nhôm trong hệ
  const interlockCandidates = profiles.filter(
    (p) =>
      p.barType === 'INTERLOCK' ||
      p.name.toLowerCase().includes('móc') ||
      p.name.toLowerCase().includes('interlock') ||
      p.id === config.interlockProfileId
  );
  const interlockOptions = interlockCandidates.length > 0 ? interlockCandidates : profiles;

  const opNoiCandidates = profiles.filter(
    (p) =>
      p.barType === 'SASH_JOINER' ||
      p.barType === 'DYNAMIC_MULLION' ||
      p.barType === 'INTERLOCK' ||
      p.name.toLowerCase().includes('ốp nối') ||
      p.name.toLowerCase().includes('đố động') ||
      p.id === config.opNoiProfileId
  );
  const opNoiOptions = opNoiCandidates.length > 0 ? opNoiCandidates : profiles;

  const isValidSashId = (pid?: number) =>
    Boolean(pid && sashProfiles.some((p) => p.id === pid));

  const fallbackLeftSashId = isValidSashId(config.leftProfileId)
    ? config.leftProfileId
    : sashProfiles[0]?.id;

  const getVariant = (role: SlidingSashRole): SashVariantProfiles => {
    const existing = config.slidingVariants?.[role];
    if (
      existing &&
      (isValidSashId(existing.leftProfileId) ||
        isValidSashId(existing.topProfileId) ||
        isValidSashId(existing.rightProfileId) ||
        isValidSashId(existing.bottomProfileId))
    ) {
      return {
        leftProfileId: isValidSashId(existing.leftProfileId)
          ? existing.leftProfileId
          : fallbackLeftSashId,
        topProfileId: isValidSashId(existing.topProfileId) ? existing.topProfileId : undefined,
        rightProfileId: isValidSashId(existing.rightProfileId)
          ? existing.rightProfileId
          : undefined,
        bottomProfileId: isValidSashId(existing.bottomProfileId)
          ? existing.bottomProfileId
          : undefined,
      };
    }
    return {
      leftProfileId: fallbackLeftSashId,
      topProfileId:
        isValidSashId(config.topProfileId) && config.topProfileId !== fallbackLeftSashId
          ? config.topProfileId
          : undefined,
      rightProfileId:
        isValidSashId(config.rightProfileId) && config.rightProfileId !== fallbackLeftSashId
          ? config.rightProfileId
          : undefined,
      bottomProfileId:
        isValidSashId(config.bottomProfileId) &&
        config.bottomProfileId !== (config.topProfileId || fallbackLeftSashId)
          ? config.bottomProfileId
          : undefined,
    };
  };

  const handleVariantChange = (
    role: SlidingSashRole,
    edgeUpdates: Partial<SashVariantProfiles>
  ) => {
    const current = getVariant(role);
    const updatedVariant: SashVariantProfiles = {
      ...current,
      ...edgeUpdates,
    };
    const nextVariants = {
      left_sliding: getVariant('left_sliding'),
      right_sliding: getVariant('right_sliding'),
      center_sliding: getVariant('center_sliding'),
      ...(config.slidingVariants || {}),
      [role]: updatedVariant,
    };

    const extraUpdates: Partial<SashConfig> = {
      slidingVariants: nextVariants,
    };

    if (role === 'left_sliding') {
      const leftId = updatedVariant.leftProfileId;
      const topId = updatedVariant.topProfileId || leftId;
      const rightId = updatedVariant.rightProfileId || leftId;
      const bottomId = updatedVariant.bottomProfileId || topId || leftId;
      extraUpdates.leftProfileId = leftId;
      extraUpdates.topProfileId = topId;
      extraUpdates.rightProfileId = rightId;
      extraUpdates.bottomProfileId = bottomId;
    }

    onChangeConfig(extraUpdates);
  };

  const handleInheritFromLeft = (targetRole: SlidingSashRole) => {
    const leftVar = getVariant('left_sliding');
    handleVariantChange(targetRole, {
      leftProfileId: leftVar.leftProfileId,
      topProfileId: leftVar.topProfileId,
      rightProfileId: leftVar.rightProfileId,
      bottomProfileId: leftVar.bottomProfileId,
    });
  };

  return (
    <div className="space-y-3">
      <div className="font-semibold text-xs text-slate-800">Profile cánh theo kiểu mở:</div>

      {VARIANT_CARDS.map(({ role, title, canInheritFromLeft }) => {
        const v = getVariant(role);
        const leftProf = profiles.find((p) => p.id === v.leftProfileId);
        const topProf = profiles.find((p) => p.id === (v.topProfileId || v.leftProfileId));
        const inheritFrom1Label = leftProf ? `${leftProf.code} (kế thừa)` : 'Kế thừa từ [1]';
        const inheritFrom2Label = topProf ? `${topProf.code} (kế thừa)` : inheritFrom1Label;

        return (
          <div
            key={role}
            className="rounded-lg border border-primary/30 bg-white overflow-hidden shadow-2xs"
          >
            {/* Thanh tiêu đề card */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-primary text-white text-xs font-semibold">
              <span>{title}</span>
              {canInheritFromLeft && (
                <button
                  type="button"
                  onClick={() => handleInheritFromLeft(role)}
                  className="px-2 py-0.5 rounded bg-white text-primary text-[11px] font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ↩ Kế thừa từ Trái
                </button>
              )}
            </div>

            {/* Lưới 2x2 chọn 4 cạnh */}
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white">
              {/* 1 · Đứng trái */}
              <div className="space-y-1">
                <div className="text-[11px] font-medium text-slate-700">
                  1 · Đứng trái <span className="text-red-500">*</span>
                </div>
                <Select
                  fullWidth
                  value={v.leftProfileId || ''}
                  onChange={(e) =>
                    handleVariantChange(role, {
                      leftProfileId: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  options={[
                    { value: '', label: 'Chọn profile...' },
                    ...sashProfiles.map((p) => ({
                      value: p.id,
                      label: `${p.code} · ${p.name}`,
                    })),
                  ]}
                  placeholder="Chọn profile..."
                  className="h-8 py-0 text-xs md:text-xs rounded-md border-primary/50 bg-white text-slate-800 font-medium"
                />
                {leftProf && (
                  <div className="flex flex-wrap gap-1 pt-0.5 text-[10px] font-mono text-slate-600">
                    {Boolean(leftProf.sectionHeightMm) && (
                      <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded">
                        Bản: <b className="text-primary">{leftProf.sectionHeightMm}</b>mm
                      </span>
                    )}
                    {Boolean(leftProf.deductGlassMm) && (
                      <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded">
                        Trừ kính: <b>{leftProf.deductGlassMm}</b>mm
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 2 · Trên <- từ [1] */}
              <div className="space-y-1">
                <div className="text-[11px] font-medium text-slate-700">
                  2 · Trên <span className="text-[10px] text-slate-400 font-normal">← từ [1]</span>
                </div>
                <Select
                  fullWidth
                  value={v.topProfileId || ''}
                  onChange={(e) =>
                    handleVariantChange(role, {
                      topProfileId: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  options={[
                    { value: '', label: inheritFrom1Label },
                    ...sashProfiles.map((p) => ({
                      value: p.id,
                      label: `${p.code} · ${p.name}`,
                    })),
                  ]}
                  placeholder={inheritFrom1Label}
                  className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-700"
                />
              </div>

              {/* 3 · Đứng phải <- từ [1] */}
              <div className="space-y-1">
                <div className="text-[11px] font-medium text-slate-700">
                  3 · Đứng phải <span className="text-[10px] text-slate-400 font-normal">← từ [1]</span>
                </div>
                <Select
                  fullWidth
                  value={v.rightProfileId || ''}
                  onChange={(e) =>
                    handleVariantChange(role, {
                      rightProfileId: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  options={[
                    { value: '', label: inheritFrom1Label },
                    ...sashProfiles.map((p) => ({
                      value: p.id,
                      label: `${p.code} · ${p.name}`,
                    })),
                  ]}
                  placeholder={inheritFrom1Label}
                  className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-700"
                />
              </div>

              {/* 4 · Dưới <- từ [2] */}
              <div className="space-y-1">
                <div className="text-[11px] font-medium text-slate-700">
                  4 · Dưới <span className="text-[10px] text-slate-400 font-normal">← từ [2]</span>
                </div>
                <Select
                  fullWidth
                  value={v.bottomProfileId || ''}
                  onChange={(e) =>
                    handleVariantChange(role, {
                      bottomProfileId: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  options={[
                    { value: '', label: inheritFrom2Label },
                    ...sashProfiles.map((p) => ({
                      value: p.id,
                      label: `${p.code} · ${p.name}`,
                    })),
                  ]}
                  placeholder={inheritFrom2Label}
                  className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-700"
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Lưới 2x2: Đố cánh, Nẹp cánh, Ốp móc / Interlock, Ốp nối cánh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
          <span className="font-semibold text-xs text-slate-800">Đố cánh (Mullion)</span>
          <Select
            fullWidth
            value={config.mullionProfileId || ''}
            onChange={(e) =>
              onChangeConfig({ mullionProfileId: e.target.value ? Number(e.target.value) : undefined })
            }
            options={[
              { value: '', label: 'Chọn profile...' },
              ...mullionProfiles.map((p) => ({
                value: p.id,
                label: `${p.code} · ${p.name}`,
              })),
            ]}
            placeholder="Chọn profile..."
            className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800"
          />
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
          <span className="font-semibold text-xs text-slate-800">Nẹp cánh (Bead)</span>
          <Select
            fullWidth
            value={config.beadProfileId || ''}
            onChange={(e) =>
              onChangeConfig({ beadProfileId: e.target.value ? Number(e.target.value) : undefined })
            }
            options={[
              { value: '', label: 'Chọn profile...' },
              ...beadProfiles.map((p) => ({
                value: p.id,
                label: `${p.code} · ${p.name}`,
              })),
            ]}
            placeholder="Chọn profile..."
            className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800"
          />
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
          <span className="font-semibold text-xs text-slate-800">Ốp móc / Interlock</span>
          <Select
            fullWidth
            value={config.interlockProfileId || ''}
            onChange={(e) =>
              onChangeConfig({ interlockProfileId: e.target.value ? Number(e.target.value) : undefined })
            }
            options={[
              { value: '', label: 'Chọn profile ốp móc...' },
              ...interlockOptions.map((p) => ({
                value: p.id,
                label: `${p.code} · ${p.name}`,
              })),
            ]}
            placeholder="Chọn profile ốp móc..."
            className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800"
          />
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-slate-800">Ốp nối cánh</span>
            <span className="text-[10px] text-slate-400">(nối 2 cánh lùa)</span>
          </div>
          <Select
            fullWidth
            value={config.opNoiProfileId || ''}
            onChange={(e) =>
              onChangeConfig({ opNoiProfileId: e.target.value ? Number(e.target.value) : undefined })
            }
            options={[
              { value: '', label: 'Chọn profile ốp nối...' },
              ...opNoiOptions.map((p) => ({
                value: p.id,
                label: `${p.code} · ${p.name}`,
              })),
            ]}
            placeholder="Chọn profile ốp nối..."
            className="h-8 py-0 text-xs md:text-xs rounded-md border-slate-200 bg-white text-slate-800"
          />
        </div>
      </div>
    </div>
  );
};

