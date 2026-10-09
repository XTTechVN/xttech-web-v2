'use client';

import React from 'react';
import {
  FrameConfig,
  FrameCornerJoint,
  BeadCornerJoint,
  SafetyBarsConfig,
  DEFAULT_SAFETY_BARS_CONFIG,
} from '../../studio-types';
import { ProfileBar } from '@/types';
import { Layers, Shield, RefreshCw, Plus } from 'lucide-react';

interface ConfigFrameTabProps {
  config: FrameConfig;
  onChangeConfig: (updates: Partial<FrameConfig>) => void;
  profiles: ProfileBar[];
}

export const ConfigFrameTab: React.FC<ConfigFrameTabProps> = ({ config, onChangeConfig, profiles, }) => {
  const frameProfiles = profiles.filter((p) => p.barType === 'FRAME');
  const mullionProfiles = profiles.filter((p) => p.barType === 'MULLION');
  const beadProfiles = profiles.filter((p) => p.barType === 'BEAD');
  const auxiliaryProfiles = profiles.filter(
    (p) => p.barType !== 'FRAME' && p.barType !== 'SASH' && p.barType !== 'MULLION' && p.barType !== 'BEAD'
  );

  const leftEdge = config?.leftEdge ?? { offsetMm: 0 };
  const topEdge = config?.topEdge ?? { offsetMm: 0 };
  const rightEdge = config?.rightEdge ?? { offsetMm: 0 };
  const bottomEdge = config?.bottomEdge ?? { offsetMm: 0 };

  const safetyBarsConfig = config.safetyBarsConfig || {
    ...DEFAULT_SAFETY_BARS_CONFIG,
    isEnabled: config.hasSafetyBars,
  };

  const updateSafetyBars = (updates: Partial<SafetyBarsConfig>) => {
    const nextCfg: SafetyBarsConfig = {
      ...safetyBarsConfig,
      ...updates,
    };
    onChangeConfig({
      hasSafetyBars: nextCfg.isEnabled,
      safetyBarsConfig: nextCfg,
    });
  };

  const mainSeriesId = profiles.find((p) => p.id === leftEdge.profileId)?.seriesId;
  const isDifferentSerie = (profileId?: number) => {
    if (!profileId || !mainSeriesId) return false;
    const p = profiles.find((item) => item.id === profileId);
    return Boolean(p && p.seriesId && p.seriesId !== mainSeriesId);
  };

  const selectedSafetyProfile = profiles.find((p) => p.id === safetyBarsConfig.profileId);
  const safetySectionMm = selectedSafetyProfile?.sectionHeightMm || 50;
  const vertSafetyProfile = profiles.find((p) => p.id === safetyBarsConfig.mullionVertProfileId);
  const horizSafetyProfile = profiles.find((p) => p.id === safetyBarsConfig.mullionHorizProfileId);

  // Handle Master Left Edge input -> auto apply to other edges if empty
  const handleLeftProfileChange = (profileId: number) => {
    const selected = profiles.find((p) => p.id === profileId);
    const code = selected?.code;
    onChangeConfig({
      leftEdge: { ...leftEdge, profileId, profileCode: code },
      topEdge: topEdge.profileId ? topEdge : { ...topEdge, profileId, profileCode: code },
      rightEdge: rightEdge.profileId ? rightEdge : { ...rightEdge, profileId, profileCode: code },
      bottomEdge: bottomEdge.profileId ? bottomEdge : { ...bottomEdge, profileId, profileCode: code },
    });
  };

  const CORNER_JOINTS: { id: FrameCornerJoint; label: string; desc: string }[] = [
    { id: '45', label: 'Ghép 45°', desc: 'Ghép thanh 45 độ' },
    { id: '90_horiz', label: '90° Ngang phủ', desc: 'Thanh ngang chạy suốt' },
    { id: '90_vert', label: '90° Dọc phủ', desc: 'Thanh đứng chạy suốt' },
    { id: '45_top_90_bot', label: '45° trên - 90° dưới', desc: 'Dành cho cửa chạm sàn' },
    { id: '63', label: 'Góc 63° (gấp xếp)', desc: 'Cửa xếp trượt' },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 text-xs text-slate-800">
      {/* CỘT TRÁI (7 cols): Khung bao chính & Khai báo profile 4 cạnh */}
      <div className="xl:col-span-7 space-y-4">
        {/* 1. Khung bao (Frame) */}
        <div className="space-y-3 p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 pb-2 border-b border-slate-100">
            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">1</span>
            <span>Khung bao chính</span>
          </div>

        {/* Khung kín vs Khung hở */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChangeConfig({ isOpenBottom: false })}
            className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !config.isOpenBottom
                ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100/60'
            }`}
          >
            <span>Khung kín (4 cạnh)</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeConfig({ isOpenBottom: true })}
            className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              config.isOpenBottom
                ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100/60'
            }`}
          >
            <span>Khung hở (3 cạnh — chạm sàn)</span>
          </button>
        </div>

        {/* Kiểu góc ghép khung */}
        <div className="space-y-1.5 pt-1">
          <div className="font-semibold text-slate-700 text-xs">Kiểu góc ghép khung</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {CORNER_JOINTS.map((joint) => (
              <button
                key={joint.id}
                type="button"
                onClick={() => onChangeConfig({ cornerJoint: joint.id })}
                className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all cursor-pointer ${
                  config.cornerJoint === joint.id
                    ? 'bg-primary text-white border-primary shadow-2xs font-semibold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {joint.label}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-slate-400">
            {CORNER_JOINTS.find((j) => j.id === config.cornerJoint)?.desc}
          </div>
        </div>

        {/* Công thức cắt theo góc ghép */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-white rounded-md border border-slate-200 text-xs">
          <div className="text-slate-600">Trái: <span className="font-bold text-primary">H · {config.cornerJoint === '45' ? '45°/45°' : '90°/90°'}</span></div>
          <div className="text-slate-600">Trên: <span className="font-bold text-primary">W · {config.cornerJoint === '45' ? '45°/45°' : '90°/90°'}</span></div>
          <div className="text-slate-600">Phải: <span className="font-bold text-primary">H · {config.cornerJoint === '45' ? '45°/45°' : '90°/90°'}</span></div>
          <div className="text-slate-600">Dưới: <span className="font-bold text-primary">{config.isOpenBottom ? 'Khung hở' : `W · ${config.cornerJoint === '45' ? '45°/45°' : '90°/90°'}`}</span></div>
        </div>
      </div>

      {/* Nhập Profile từng cạnh */}
      <div className="space-y-3 p-4 rounded-lg bg-white border border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
          <span>Khai báo thanh nhôm theo từng cạnh khung</span>
          <span className="text-[11px] text-primary">Cạnh trái tự động đồng bộ cho các cạnh còn lại</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Cạnh Trái */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-semibold text-xs text-slate-800">
              <span>Cạnh trái (Gốc)</span>
              <span className="text-primary font-bold text-[11px]">H · 45°/45°</span>
            </div>
            <select
              value={leftEdge.profileId || ''}
              onChange={(e) => handleLeftProfileChange(Number(e.target.value))}
              className="w-full h-8 px-2.5 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:border-primary text-slate-800"
            >
              <option value="">Chọn profile...</option>
              {frameProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">Bù/trừ offset:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={leftEdge.offsetMm}
                  onChange={(e) => onChangeConfig({ leftEdge: { ...leftEdge, offsetMm: Number(e.target.value) } })}
                  className="w-14 h-6 px-1.5 text-xs text-center font-bold rounded border border-slate-200 bg-white focus:outline-none focus:border-primary"
                />
                <span className="text-[10px] text-slate-400">mm</span>
              </div>
            </div>
          </div>

          {/* Cạnh Trên */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-semibold text-xs text-slate-800">
              <span>Cạnh trên</span>
              <span className="text-primary font-bold text-[11px]">W · 45°/45°</span>
            </div>
            <select
              value={topEdge.profileId || ''}
              onChange={(e) => onChangeConfig({ topEdge: { ...topEdge, profileId: Number(e.target.value) } })}
              className="w-full h-8 px-2.5 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:border-primary text-slate-800"
            >
              <option value="">{leftEdge.profileId ? '↑ Kế thừa (Cạnh trái)' : 'Chọn profile...'}</option>
              {frameProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">Bù/trừ offset:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={topEdge.offsetMm}
                  onChange={(e) => onChangeConfig({ topEdge: { ...topEdge, offsetMm: Number(e.target.value) } })}
                  className="w-14 h-6 px-1.5 text-xs text-center font-bold rounded border border-slate-200 bg-white focus:outline-none focus:border-primary"
                />
                <span className="text-[10px] text-slate-400">mm</span>
              </div>
            </div>
          </div>

          {/* Cạnh Phải */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-semibold text-xs text-slate-800">
              <span>Cạnh phải</span>
              <span className="text-primary font-bold text-[11px]">H · 45°/45°</span>
            </div>
            <select
              value={rightEdge.profileId || ''}
              onChange={(e) => onChangeConfig({ rightEdge: { ...rightEdge, profileId: Number(e.target.value) } })}
              className="w-full h-8 px-2.5 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:border-primary text-slate-800"
            >
              <option value="">{leftEdge.profileId ? '↑ Kế thừa (Cạnh trái)' : 'Chọn profile...'}</option>
              {frameProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">Bù/trừ offset:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={rightEdge.offsetMm}
                  onChange={(e) => onChangeConfig({ rightEdge: { ...rightEdge, offsetMm: Number(e.target.value) } })}
                  className="w-14 h-6 px-1.5 text-xs text-center font-bold rounded border border-slate-200 bg-white focus:outline-none focus:border-primary"
                />
                <span className="text-[10px] text-slate-400">mm</span>
              </div>
            </div>
          </div>

          {/* Cạnh Dưới (Hỗ trợ Ngưỡng nhôm & Ốp chân ngưỡng) */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-semibold text-xs text-slate-800">
              <span>Cạnh dưới</span>
              <span className="text-primary font-bold text-[11px]">
                {config.isOpenBottom
                  ? 'Bỏ qua'
                  : bottomEdge.profileId && auxiliaryProfiles.some((p) => p.id === bottomEdge.profileId)
                  ? 'W · 90°/90° (Ngưỡng)'
                  : 'W · 45°/45°'}
              </span>
            </div>
            <select
              disabled={config.isOpenBottom}
              value={bottomEdge.profileId || ''}
              onChange={(e) => {
                const pId = Number(e.target.value) || undefined;
                const selected = profiles.find((p) => p.id === pId);
                onChangeConfig({
                  bottomEdge: {
                    ...bottomEdge,
                    profileId: pId,
                    profileCode: selected?.code,
                  },
                });
              }}
              className="w-full h-8 px-2.5 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:border-primary text-slate-800 disabled:bg-slate-100"
            >
              <option value="">
                {config.isOpenBottom
                  ? '(Khung hở - không có cạnh dưới)'
                  : leftEdge.profileId
                  ? '↑ Kế thừa (Cạnh trái)'
                  : 'Chọn profile...'}
              </option>
              <optgroup label="Khung bao tiêu chuẩn (FRAME)">
                {frameProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </optgroup>
              {auxiliaryProfiles.length > 0 && (
                <optgroup label="Ngưỡng sàn / Thanh phụ khác (OTHER / SILL)">
                  {auxiliaryProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500">Bù/trừ offset:</span>
              <input
                disabled={config.isOpenBottom}
                type="number"
                value={bottomEdge.offsetMm}
                onChange={(e) => onChangeConfig({ bottomEdge: { ...bottomEdge, offsetMm: Number(e.target.value) } })}
                className="w-16 h-6 px-1.5 text-xs text-center font-mono rounded border border-gray-300 disabled:bg-gray-100"
              />
              <span className="text-[11px] text-gray-400">mm</span>
            </div>

            {/* Ốp chân ngưỡng phụ đi kèm (Tùy chọn nâng cao) */}
            {!config.isOpenBottom && bottomEdge.profileId && auxiliaryProfiles.length > 0 && (
              <div className="pt-2 border-t border-gray-200/60 mt-1 space-y-1">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-semibold text-slate-700">Ốp chân ngưỡng / nẹp phụ:</span>
                  {bottomEdge.coverProfileId && (
                    <button
                      type="button"
                      onClick={() =>
                        onChangeConfig({
                          bottomEdge: {
                            ...bottomEdge,
                            coverProfileId: undefined,
                            coverProfileCode: undefined,
                          },
                        })
                      }
                      className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  )}
                </div>
                <select
                  value={bottomEdge.coverProfileId || ''}
                  onChange={(e) => {
                    const cId = Number(e.target.value) || undefined;
                    const selected = profiles.find((p) => p.id === cId);
                    onChangeConfig({
                      bottomEdge: {
                        ...bottomEdge,
                        coverProfileId: cId,
                        coverProfileCode: selected?.code,
                      },
                    });
                  }}
                  className="w-full h-7 px-1.5 text-[11px] rounded-lg border border-gray-300 bg-white"
                >
                  <option value="">-- Không dùng thanh ốp chân --</option>
                  {auxiliaryProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* CỘT PHẢI (5 cols): Đố chia, Khung bảo vệ, Nẹp kính, Nối khung & Tùy chọn đảo chiều */}
      <div className="xl:col-span-5 space-y-4">
        {/* 2. Đố chia (Mullion) & Khung bảo vệ */}
        <div className="space-y-3 p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 pb-2 border-b border-slate-100">
            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">2</span>
            <span>Đố chia & Khung bảo vệ</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'none', label: 'Không có đố' },
              { id: 'single', label: '1 loại chung' },
              { id: 'separate', label: 'Dọc / Ngang' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeConfig({ mullionMode: item.id as any })}
                className={`p-2 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                  config.mullionMode === item.id
                    ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {config.mullionMode !== 'none' && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="font-medium text-[11px] text-slate-700">Chọn Profile Đố T:</div>
              <select
                value={config.mullionProfileId || ''}
                onChange={(e) => onChangeConfig({ mullionProfileId: Number(e.target.value) })}
                className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
              >
                <option value="">Chọn profile đố...</option>
                {mullionProfiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Khung bảo vệ switch */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 font-medium text-xs text-slate-800">
              <Shield size={14} className="text-slate-500" />
              <span>Khung bảo vệ</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.hasSafetyBars}
                onChange={(e) => updateSafetyBars({ isEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
              />
            </label>
          </div>

          {/* Form cấu hình chi tiết Khung bảo vệ */}
          {config.hasSafetyBars && (
            <div className="pt-2 border-t border-slate-100 space-y-3">
              {/* Presets: 3 chế độ */}
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { id: 'equal_frame', label: 'Bằng khung ngoài' },
                  { id: 'inset', label: 'Lọt lòng' },
                  { id: 'no_frame', label: 'Không khung ngoài' },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => updateSafetyBars({ preset: tab.id })}
                    className={`p-2 rounded-lg border text-[11px] font-medium text-center transition-all cursor-pointer ${
                      safetyBarsConfig.preset === tab.id
                        ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Chi tiết cho preset Bằng khung hoặc Lọt lòng */}
              {safetyBarsConfig.preset !== 'no_frame' && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Profile khung bảo vệ */}
                    <div className="space-y-1">
                      <label className="font-semibold text-xs text-slate-700">Profile khung bảo vệ</label>
                      <select
                        value={safetyBarsConfig.profileId || ''}
                        onChange={(e) => updateSafetyBars({ profileId: Number(e.target.value) || undefined })}
                        className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
                      >
                        <option value="">Chọn profile khung...</option>
                        {profiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} · {p.name}
                          </option>
                        ))}
                      </select>
                      {selectedSafetyProfile && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <span>{selectedSafetyProfile.code} — {selectedSafetyProfile.name}</span>
                          {isDifferentSerie(safetyBarsConfig.profileId) && (
                            <span className="text-amber-600 font-medium">⚠️ khác serie</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Góc ghép khung */}
                    <div className="space-y-1">
                      <label className="font-semibold text-xs text-slate-700">Góc ghép khung</label>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => updateSafetyBars({ cornerJoint: '45' })}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium border cursor-pointer transition-colors ${
                            safetyBarsConfig.cornerJoint === '45'
                              ? 'bg-primary text-white border-primary shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          Ghép 45°
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSafetyBars({ cornerJoint: '90_vert' })}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium border cursor-pointer transition-colors ${
                            safetyBarsConfig.cornerJoint === '90_vert'
                              ? 'bg-primary text-white border-primary shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          90° Dọc phủ
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">Mặc định khung kín 4 cạnh</p>
                    </div>

                    {/* Độ hở lắp lọt lòng (chỉ hiển thị khi preset == 'inset') */}
                    {safetyBarsConfig.preset === 'inset' && (
                      <div className="sm:col-span-2 space-y-1 pt-1">
                        <label className="font-semibold text-xs text-slate-700">Độ hở lắp lọt lòng (mm)</label>
                        <div className="w-full sm:w-1/2">
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={safetyBarsConfig.insetGapMm ?? 3}
                            onChange={(e) => updateSafetyBars({ insetGapMm: Number(e.target.value) || 0 })}
                            className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 italic">
                          Inner khung sẽ trừ thêm {safetyBarsConfig.insetGapMm ?? 3}mm mỗi cạnh.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium">
                    Bản dày profile khung bảo vệ: <span className="font-bold text-slate-800">{safetySectionMm}mm</span>
                  </div>

                  {/* Đố chia khung bảo vệ */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5">
                    <div className="font-semibold text-xs text-slate-800">Đố chia khung bảo vệ</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Cây dọc */}
                      <div className="space-y-1">
                        <label className="font-medium text-[11px] text-slate-700">Cây dọc</label>
                        <select
                          value={safetyBarsConfig.mullionVertProfileId || ''}
                          onChange={(e) => updateSafetyBars({ mullionVertProfileId: Number(e.target.value) || undefined })}
                          className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
                        >
                          <option value="">Chọn profile cây dọc...</option>
                          {profiles.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.code} · {p.name}
                            </option>
                          ))}
                        </select>
                        {vertSafetyProfile && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <span>{vertSafetyProfile.code} — {vertSafetyProfile.name}</span>
                            {isDifferentSerie(safetyBarsConfig.mullionVertProfileId) && (
                              <span className="text-amber-600 font-medium">⚠️ khác serie</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Cây ngang */}
                      <div className="space-y-1">
                        <label className="font-medium text-[11px] text-slate-700">Cây ngang</label>
                        <select
                          value={safetyBarsConfig.mullionHorizProfileId || ''}
                          onChange={(e) => updateSafetyBars({ mullionHorizProfileId: Number(e.target.value) || undefined })}
                          className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
                        >
                          <option value="">Chọn profile cây ngang...</option>
                          {profiles.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.code} · {p.name}
                            </option>
                          ))}
                        </select>
                        {horizSafetyProfile && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <span>{horizSafetyProfile.code} — {horizSafetyProfile.name}</span>
                            {isDifferentSerie(safetyBarsConfig.mullionHorizProfileId) && (
                              <span className="text-amber-600 font-medium">⚠️ khác serie</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chi tiết cho preset Không khung ngoài */}
              {safetyBarsConfig.preset === 'no_frame' && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                  <div className="font-semibold text-xs text-slate-800">Thanh bảo vệ không khung</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Cây dọc */}
                    <div className="space-y-1">
                      <label className="font-medium text-[11px] text-slate-700">Cây dọc</label>
                      <select
                        value={safetyBarsConfig.mullionVertProfileId || ''}
                        onChange={(e) => updateSafetyBars({ mullionVertProfileId: Number(e.target.value) || undefined })}
                        className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
                      >
                        <option value="">Chọn profile cây dọc...</option>
                        {profiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} · {p.name}
                          </option>
                        ))}
                      </select>
                      {vertSafetyProfile && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <span>{vertSafetyProfile.code} — {vertSafetyProfile.name}</span>
                          {isDifferentSerie(safetyBarsConfig.mullionVertProfileId) && (
                            <span className="text-amber-600 font-medium">⚠️ khác serie</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Cây ngang */}
                    <div className="space-y-1">
                      <label className="font-medium text-[11px] text-slate-700">Cây ngang</label>
                      <select
                        value={safetyBarsConfig.mullionHorizProfileId || ''}
                        onChange={(e) => updateSafetyBars({ mullionHorizProfileId: Number(e.target.value) || undefined })}
                        className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
                      >
                        <option value="">Chọn profile cây ngang...</option>
                        {profiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} · {p.name}
                          </option>
                        ))}
                      </select>
                      {horizSafetyProfile && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <span>{horizSafetyProfile.code} — {horizSafetyProfile.name}</span>
                          {isDifferentSerie(safetyBarsConfig.mullionHorizProfileId) && (
                            <span className="text-amber-600 font-medium">⚠️ khác serie</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Nẹp kính & Nối khung */}
        <div className="space-y-3 p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 pb-2 border-b border-slate-100">
            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">3</span>
            <span>Nẹp kính & Nối khung</span>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="font-semibold text-xs text-slate-800">Nẹp kính (Bead)</div>
              <select
                value={config.beadProfileId || ''}
                onChange={(e) => onChangeConfig({ beadProfileId: Number(e.target.value) })}
                className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
              >
                <option value="">Chọn profile nẹp...</option>
                {beadProfiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                {([
                  { id: '45', label: 'Ghép 45°' },
                  { id: '90_horiz', label: '90° Ngang phủ' },
                  { id: '90_vert', label: '90° Dọc phủ' },
                ] as const).map((bj) => (
                  <button
                    key={bj.id}
                    type="button"
                    onClick={() => onChangeConfig({ beadCornerJoint: bj.id })}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium border cursor-pointer transition-colors ${
                      config.beadCornerJoint === bj.id
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {bj.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="font-semibold text-xs text-slate-800">Nối khung (Coupling)</div>
              <select
                value={config.couplingProfileId || ''}
                onChange={(e) => onChangeConfig({ couplingProfileId: Number(e.target.value) })}
                className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
              >
                <option value="">Chọn profile nối khung...</option>
                {frameProfiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
              <div className="text-[11px] text-slate-400">Thanh nối ghép góc 90°, 135° giữa các bộ khung</div>
            </div>
          </div>

          {/* Đảo khung */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-slate-600 font-medium">Tùy chọn:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChangeConfig({ isReversedWall: !config.isReversedWall })}
                className={`px-2.5 py-1 rounded-md border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                  config.isReversedWall
                    ? 'bg-primary/10 border-primary text-primary font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <RefreshCw size={12} className={config.isReversedWall ? 'text-primary' : 'text-slate-400'} />
                <span>Đảo vách</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ isReversedSash: !config.isReversedSash })}
                className={`px-2.5 py-1 rounded-md border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                  config.isReversedSash
                    ? 'bg-primary/10 border-primary text-primary font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Layers size={12} className={config.isReversedSash ? 'text-primary' : 'text-slate-400'} />
                <span>Đảo cánh</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
