'use client';

import React from 'react';
import {
  SashConfig,
  SashCornerJoint,
  BeadCornerJoint,
  SashOffsetScope,
  SashOffsetValues,
} from '../../studio-types';
import { ProfileBar } from '@/types';
import { Shield } from 'lucide-react';
import { GasketConfigSection } from './gasket-config-section';
import { CustomExtraConfigSection } from './custom-extra-config-section';
import { SlidingSashVariantsSection } from './sliding-sash-variants-section';
import { CasementSashProfilesSection } from './casement-sash-profiles-section';

interface ConfigSashTabProps {
  config: SashConfig;
  onChangeConfig: (updates: Partial<SashConfig>) => void;
  profiles: ProfileBar[];
}

const BASE_SASH_JOINTS: { id: SashCornerJoint; label: string }[] = [
  { id: '45', label: 'Ghép 45°' },
  { id: '90_vert', label: '90° Dọc phủ' },
  { id: '45_top_90_bot', label: '45° trên - 90° dưới' },
  { id: '90_horiz', label: '90° Ngang phủ' },
];

const LEFT_SLIDING_JOINTS: { id: SashCornerJoint; label: string }[] = [
  ...BASE_SASH_JOINTS,
  { id: 'd_left', label: 'Cánh lùa Trái (D)' },
];

const RIGHT_SLIDING_JOINTS: { id: SashCornerJoint; label: string }[] = [
  ...BASE_SASH_JOINTS,
  { id: 'd_right', label: 'Cánh lùa Phải (D)' },
];

const BEAD_CORNER_JOINTS: { id: BeadCornerJoint; label: string }[] = [
  { id: '45', label: 'Ghép 45°' },
  { id: '90_horiz', label: '90° Ngang phủ' },
  { id: '90_vert', label: '90° Dọc phủ' },
];

const OFFSET_SCOPES: { id: SashOffsetScope; label: string }[] = [
  { id: 'all', label: 'Tất cả cánh' },
  { id: 'left_sliding', label: 'Cánh lùa trái' },
  { id: 'right_sliding', label: 'Cánh lùa phải' },
  { id: 'center_sliding', label: 'Cánh lùa giữa (2 chiều)' },
];

export const ConfigSashTab: React.FC<ConfigSashTabProps> = ({
  config,
  onChangeConfig,
  profiles,
}) => {
  const isSlidingFamily =
    config.family === 'Cửa đi lùa' ||
    config.family === 'Cửa sổ lùa' ||
    config.family === 'Cửa trượt lùa';

  const normalizedFamilyValue =
    config.family === 'Cửa trượt lùa' ? 'Cửa đi lùa' : config.family;

  const selectedLeftSash =
    profiles.find(
      (p) => p.id === config.leftProfileId && (p.barType === 'SASH' || p.barType === 'SCREEN_SASH')
    ) || profiles.find((p) => p.barType === 'SASH' || p.barType === 'SCREEN_SASH');
  const currentScope: SashOffsetScope = isSlidingFamily ? (config.offsetApplyTo || 'all') : 'all';
  const currentScopeLabel =
    OFFSET_SCOPES.find((s) => s.id === currentScope)?.label || 'Tất cả cánh';

  const activeOffset: SashOffsetValues =
    (isSlidingFamily ? config.slidingOffsets?.[currentScope] : undefined) ??
    config?.offsetMm ?? { left: 0, top: 0, right: 0, bottom: 0 };

  const handleOffsetFieldChange = (edge: keyof SashOffsetValues, val: number) => {
    const nextOffset: SashOffsetValues = {
      ...activeOffset,
      [edge]: val,
    };
    const nextSlidingOffsets = {
      ...(config.slidingOffsets || {}),
      [currentScope]: nextOffset,
    };
    onChangeConfig({
      offsetMm: nextOffset,
      offsetApplyTo: currentScope,
      slidingOffsets: nextSlidingOffsets,
    });
  };

  const handleScopeChange = (nextScope: SashOffsetScope) => {
    const scopeOffset = config.slidingOffsets?.[nextScope] ?? {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    };
    onChangeConfig({
      offsetApplyTo: nextScope,
      offsetMm: scopeOffset,
    });
  };

  const slidingJoints = config.slidingJoints ?? {
    leftSliding: config.cornerJoint || '45',
    rightSliding: config.cornerJoint || '45',
    centerSliding: config.cornerJoint || '45',
  };

  const handleSlidingJointChange = (
    key: 'leftSliding' | 'rightSliding' | 'centerSliding',
    joint: SashCornerJoint
  ) => {
    const nextJoints = {
      ...slidingJoints,
      [key]: joint,
    };
    onChangeConfig({
      slidingJoints: nextJoints,
      ...(key === 'leftSliding' ? { cornerJoint: joint } : {}),
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 text-xs text-slate-800">
      {/* CỘT TRÁI (7 cols): Cấu hình lưới muỗi & Thông số quy cách cánh */}
      <div className="xl:col-span-7 space-y-4">
        <div className="flex items-center justify-between p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Shield size={16} />
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-900">Cánh lưới chống muỗi (Screen Sash)</div>
              <div className="text-[11px] text-slate-500 hidden sm:block">Kích hoạt để cấu hình và tính toán hệ lưới muỗi độc lập</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.hasScreenSash}
              onChange={(e) => onChangeConfig({ hasScreenSash: e.target.checked })}
              className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
            />
          </label>
        </div>

        <div className="space-y-4 p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
              <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Thông số quy cách cánh</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">Cấu hình áp dụng mặc định cho các cánh</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 p-3 bg-white rounded-lg border border-slate-200">
              <label className="font-medium text-xs text-slate-700">Nhóm kiểu mở (Family):</label>
              <select
                value={normalizedFamilyValue}
                onChange={(e) => onChangeConfig({ family: e.target.value })}
                className="w-full h-8 px-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:border-primary"
              >
                <option value="Cửa đi lùa">Cửa đi lùa</option>
                <option value="Cửa sổ lùa">Cửa sổ lùa</option>
                <option value="Cửa đi mở quay">Cửa đi mở quay</option>
                <option value="Cửa sổ mở quay/Hất">Cửa sổ mở quay/Hất</option>
                <option value="Cửa xếp trượt">Cửa xếp trượt</option>
              </select>
            </div>

            <div className="space-y-1.5 p-3 bg-white rounded-lg border border-slate-200">
              <label className="font-medium text-xs text-slate-700">Loại bản cánh:</label>
              <div className="grid grid-cols-2 gap-2">
                {(['standard', 'slim'] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => onChangeConfig({ sashStyle: style })}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium text-center cursor-pointer transition-all ${
                      config.sashStyle === style
                        ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {style === 'standard' ? 'Cánh tiêu chuẩn' : 'Cánh vô cực (Slim)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Khe hở & ngậm cơ khí */}
          <div className="space-y-1.5">
            <div className="font-medium text-xs text-slate-700">Khe hở & ngậm cơ khí:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span>Ngậm ngang</span>
                  <span className="text-slate-400">mm</span>
                </div>
                <input
                  type="number"
                  value={config.ngamNgangMm}
                  onChange={(e) => onChangeConfig({ ngamNgangMm: Number(e.target.value) })}
                  className="w-full h-7 px-2 text-xs text-center border rounded border-slate-300 focus:outline-none focus:border-primary font-medium"
                />
                <div className="text-[10px] text-slate-400 text-center">Ngậm khung đứng</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span>Ngậm dọc</span>
                  <span className="text-slate-400">mm</span>
                </div>
                <input
                  type="number"
                  value={config.ngamDocMm}
                  onChange={(e) => onChangeConfig({ ngamDocMm: Number(e.target.value) })}
                  className="w-full h-7 px-2 text-xs text-center border rounded border-slate-300 focus:outline-none focus:border-primary font-medium"
                />
                <div className="text-[10px] text-slate-400 text-center">Ngậm trên/dưới</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span>{isSlidingFamily ? 'Trừ ốp nối cánh' : 'Trừ đố động'}</span>
                  <span className="text-slate-400">mm</span>
                </div>
                <input
                  type="number"
                  value={config.truDoDongMm}
                  onChange={(e) => onChangeConfig({ truDoDongMm: Number(e.target.value) })}
                  className="w-full h-7 px-2 text-xs text-center border rounded border-slate-300 focus:outline-none focus:border-primary font-medium"
                />
                <div className="text-[10px] text-slate-400 text-center">
                  {isSlidingFamily ? 'Ốp nối = Hs - giá trị này' : 'Hs - giá trị này'}
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span>Ngậm lùa</span>
                  <span className="text-slate-400">mm</span>
                </div>
                <input
                  type="number"
                  value={config.slidingOverlapMm ?? ''}
                  placeholder={
                    selectedLeftSash?.sectionHeightMm
                      ? `Tự động (${selectedLeftSash.sectionHeightMm} mm)`
                      : 'Tự động'
                  }
                  onChange={(e) =>
                    onChangeConfig({
                      slidingOverlapMm: e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                  className="w-full h-7 px-2 text-xs text-center border rounded border-slate-300 focus:outline-none focus:border-primary font-medium placeholder:text-slate-400 placeholder:italic"
                />
                <div className="text-[10px] text-slate-400 text-center">Chồng đè cánh lùa</div>
              </div>
            </div>
          </div>

          {/* Bù trừ offset cánh */}
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <div className="font-medium text-xs text-slate-800">Bù / trừ offset cánh (mm):</div>
                {isSlidingFamily && (
                  <div className="text-[11px] text-primary font-medium">
                    Đang chỉnh bộ offset: <b>{currentScopeLabel}</b>
                  </div>
                )}
              </div>
              {isSlidingFamily && (
                <select
                  value={currentScope}
                  onChange={(e) => handleScopeChange(e.target.value as SashOffsetScope)}
                  className="h-7 px-2 text-xs rounded border border-primary/40 bg-white text-slate-800 font-medium focus:outline-none focus:border-primary"
                >
                  {OFFSET_SCOPES.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([
                { key: 'left', label: 'Cạnh Trái' },
                { key: 'top', label: 'Cạnh Trên' },
                { key: 'right', label: 'Cạnh Phải' },
                { key: 'bottom', label: 'Cạnh Dưới' },
              ] as const).map(({ key, label }) => (
                <div key={key} className="p-2 bg-white rounded-lg border border-slate-200 text-center space-y-1">
                  <div className="text-[11px] font-medium text-slate-600">{label}</div>
                  <input
                    type="number"
                    value={activeOffset[key]}
                    onChange={(e) => handleOffsetFieldChange(key, Number(e.target.value))}
                    className="w-full h-7 text-center text-xs border rounded border-slate-300 focus:outline-none focus:border-primary font-medium"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Góc ghép cánh & Góc ghép nẹp cánh */}
          {isSlidingFamily ? (
            <div className="space-y-3 pt-1">
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5">
                <div className="font-semibold text-xs text-slate-800">Góc ghép cánh (theo loại cánh):</div>
                {([
                  { key: 'leftSliding', label: 'Cánh lùa trái:', options: LEFT_SLIDING_JOINTS },
                  { key: 'rightSliding', label: 'Cánh lùa phải:', options: RIGHT_SLIDING_JOINTS },
                  { key: 'centerSliding', label: 'Cánh lùa giữa (2 chiều):', options: BASE_SASH_JOINTS },
                ] as const).map((row) => (
                  <div key={row.key} className="space-y-1">
                    <div className="text-[11px] font-medium text-slate-600">{row.label}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {row.options.map((joint) => (
                        <button
                          key={joint.id}
                          type="button"
                          onClick={() => handleSlidingJointChange(row.key, joint.id)}
                          className={`px-2 py-1.5 rounded text-[11px] font-medium border cursor-pointer transition-colors ${
                            slidingJoints[row.key] === joint.id
                              ? 'bg-primary text-white border-primary shadow-xs font-semibold'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {joint.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                <div className="font-semibold text-xs text-slate-800">Góc ghép nẹp cho cánh:</div>
                <div className="grid grid-cols-3 gap-2">
                  {BEAD_CORNER_JOINTS.map((joint) => (
                    <button
                      key={joint.id}
                      type="button"
                      onClick={() => onChangeConfig({ beadCornerJoint: joint.id })}
                      className={`px-2.5 py-1.5 rounded text-[11px] font-medium border cursor-pointer transition-colors ${
                        config.beadCornerJoint === joint.id
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {joint.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                <div className="font-semibold text-xs text-slate-800">Góc ghép cánh:</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {BASE_SASH_JOINTS.map((joint) => (
                    <button
                      key={joint.id}
                      type="button"
                      onClick={() => onChangeConfig({ cornerJoint: joint.id })}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium border cursor-pointer transition-colors ${
                        config.cornerJoint === joint.id
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {joint.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                <div className="font-semibold text-xs text-slate-800">Góc ghép nẹp cho cánh:</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {BEAD_CORNER_JOINTS.map((joint) => (
                    <button
                      key={joint.id}
                      type="button"
                      onClick={() => onChangeConfig({ beadCornerJoint: joint.id })}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium border cursor-pointer transition-colors ${
                        config.beadCornerJoint === joint.id
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {joint.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CỘT PHẢI (5 cols): Profile chi tiết cánh cửa */}
      <div className="xl:col-span-5 space-y-4">
        <div className="space-y-3 p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
              <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">2</span>
              <span>{isSlidingFamily ? 'Cấu hình thanh / profile cánh lùa' : 'Profile chi tiết cánh cửa'}</span>
            </div>
            <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded">Tự đồng bộ</span>
          </div>

          {isSlidingFamily ? (
            <SlidingSashVariantsSection
              config={config}
              onChangeConfig={onChangeConfig}
              profiles={profiles}
            />
          ) : (
            <CasementSashProfilesSection
              config={config}
              onChangeConfig={onChangeConfig}
              profiles={profiles}
            />
          )}
        </div>
      </div>

      {/* CỘT RỘNG TOÀN PHẦN (12 cols): Roan gắn kính — Cánh & Phụ kiện tùy biến — Cánh */}
      <div className="xl:col-span-12 space-y-4 pt-1">
        <GasketConfigSection
          items={config.gaskets}
          onChangeItems={(gaskets) => onChangeConfig({ gaskets })}
          target="sash"
        />

        <CustomExtraConfigSection
          items={config.extras}
          onChangeItems={(extras) => onChangeConfig({ extras })}
          profiles={profiles}
          target="sash"
        />
      </div>
    </div>
  );
};
