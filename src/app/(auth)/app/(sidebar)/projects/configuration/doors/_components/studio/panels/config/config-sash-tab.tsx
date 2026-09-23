'use client';

import React from 'react';
import {
  SashConfig,
  SashCornerJoint,
  BeadCornerJoint,
} from '../../studio-types';
import { ProfileBar } from '@/types';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

interface ConfigSashTabProps {
  config: SashConfig;
  onChangeConfig: (updates: Partial<SashConfig>) => void;
  profiles: ProfileBar[];
}

export const ConfigSashTab: React.FC<ConfigSashTabProps> = ({
  config,
  onChangeConfig,
  profiles,
}) => {
  const sashProfiles = profiles.filter((p) => p.barType === 'SASH');
  const mullionProfiles = profiles.filter((p) => p.barType === 'MULLION');
  const beadProfiles = profiles.filter((p) => p.barType === 'BEAD');

  const offsetMm = config?.offsetMm ?? { left: 0, top: 0, right: 0, bottom: 0 };

  // Master left sash profile change -> apply to others if not set
  const handleLeftProfileChange = (profileId: number) => {
    onChangeConfig({
      leftProfileId: profileId,
      topProfileId: config.topProfileId || profileId,
      rightProfileId: config.rightProfileId || profileId,
      bottomProfileId: config.bottomProfileId || profileId,
    });
  };

  const SASH_CORNER_JOINTS: { id: SashCornerJoint; label: string }[] = [
    { id: '45', label: 'Ghép 45°' },
    { id: '90_vert', label: '90° Dọc phủ' },
    { id: '45_top_90_bot', label: '45° trên - 90° dưới' },
    { id: '90_horiz', label: '90° Ngang phủ' },
  ];

  const BEAD_CORNER_JOINTS: { id: BeadCornerJoint; label: string }[] = [
    { id: '45', label: 'Ghép 45°' },
    { id: '90_horiz', label: '90° Ngang phủ' },
    { id: '90_vert', label: '90° Dọc phủ' },
  ];

  return (
    <div className="flex flex-col space-y-5 p-5 text-xs text-gray-800 bg-white">
      <div className="text-center font-bold text-sm text-slate-800 py-1 border-b border-gray-100 flex items-center justify-center gap-2">
        <span className="bg-emerald-800 text-white px-3 py-0.5 rounded-full text-xs font-semibold">PHẦN 2 — CÁNH CỬA</span>
      </div>

      {/* Cấu hình lưới muỗi */}
      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-2 font-bold text-xs text-gray-800">
          <span>🦟 Cấu hình cánh lưới muỗi (Screen Sash)</span>
          <span className="text-[11px] text-gray-400 font-normal">Bật để cấu hình và sử dụng hệ lưới chống muỗi độc lập.</span>
        </div>
        <input
          type="checkbox"
          checked={config.hasScreenSash}
          onChange={(e) => onChangeConfig({ hasScreenSash: e.target.checked })}
          className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
        />
      </div>

      {/* 4. Cánh cửa (Sash) */}
      <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50/70 border border-gray-200/80">
        <div className="flex items-center justify-between font-bold text-sm text-slate-900">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px]">4</span>
            <span>Cánh cửa (Sash)</span>
            <span className="text-[11px] text-gray-400 font-normal">— config mặc định, có thể override từng ô ở tab Vẽ</span>
          </div>
        </div>

        {/* Nhóm kiểu mở (Family) */}
        <div className="space-y-1">
          <div className="font-semibold text-gray-700 text-xs">Nhóm kiểu mở (Family):</div>
          <select
            value={config.family}
            onChange={(e) => onChangeConfig({ family: e.target.value })}
            className="w-full h-8 px-2 text-xs font-semibold rounded-lg border border-gray-300 bg-white"
          >
            <option value="Cửa sổ mở quay/Hất">Cửa sổ mở quay/Hất</option>
            <option value="Cửa đi mở quay">Cửa đi mở quay</option>
            <option value="Cửa trượt lùa">Cửa trượt lùa</option>
            <option value="Cửa xếp trượt">Cửa xếp trượt</option>
          </select>
        </div>

        {/* Loại cánh cửa sổ */}
        <div className="space-y-1 pt-1">
          <div className="font-semibold text-gray-700 text-xs">Loại cánh cửa sổ:</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChangeConfig({ sashStyle: 'standard' })}
              className={`p-2.5 rounded-xl border font-semibold text-center cursor-pointer transition-all ${
                config.sashStyle === 'standard'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Cánh mở quay thường
            </button>
            <button
              type="button"
              onClick={() => onChangeConfig({ sashStyle: 'slim' })}
              className={`p-2.5 rounded-xl border font-semibold text-center cursor-pointer transition-all ${
                config.sashStyle === 'slim'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Cửa vô cực (Slim)
            </button>
          </div>
        </div>

        {/* Khe hở & ngàm trừ cơ khí */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
            <div className="font-semibold text-gray-700 text-[11px]">Ngàm ngang:</div>
            <input
              type="number"
              value={config.ngamNgangMm}
              onChange={(e) => onChangeConfig({ ngamNgangMm: Number(e.target.value) })}
              className="w-full h-7 px-2 font-mono text-xs text-center border rounded border-gray-300"
            />
            <div className="text-[10px] text-gray-400 text-center">Ngàm khung đứng</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
            <div className="font-semibold text-gray-700 text-[11px]">Ngàm dọc:</div>
            <input
              type="number"
              value={config.ngamDocMm}
              onChange={(e) => onChangeConfig({ ngamDocMm: Number(e.target.value) })}
              className="w-full h-7 px-2 font-mono text-xs text-center border rounded border-gray-300"
            />
            <div className="text-[10px] text-gray-400 text-center">Ngàm trên/dưới</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
            <div className="font-semibold text-gray-700 text-[11px]">Trừ đố động:</div>
            <input
              type="number"
              value={config.truDoDongMm}
              onChange={(e) => onChangeConfig({ truDoDongMm: Number(e.target.value) })}
              className="w-full h-7 px-2 font-mono text-xs text-center border rounded border-gray-300"
            />
            <div className="text-[10px] text-gray-400 text-center">Hs - giá trị này</div>
          </div>
        </div>

        {/* Bù trừ offset cánh */}
        <div className="space-y-1.5 pt-2">
          <div className="font-semibold text-gray-700 text-xs">Bù/trừ offset cánh (mm):</div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { key: 'left', label: 'Cạnh Trái' },
              { key: 'top', label: 'Cạnh Trên' },
              { key: 'right', label: 'Cạnh Phải' },
              { key: 'bottom', label: 'Cạnh Dưới' },
            ].map(({ key, label }) => (
              <div key={key} className="p-2 bg-white rounded-lg border border-gray-200 text-center">
                <div className="text-[10px] text-gray-500 mb-1">{label}</div>
                <input
                  type="number"
                  value={offsetMm[key as keyof typeof offsetMm]}
                  onChange={(e) =>
                    onChangeConfig({
                      offsetMm: {
                        ...offsetMm,
                        [key]: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full h-6 text-center font-mono text-xs border rounded border-gray-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Góc ghép cánh */}
        <div className="space-y-1.5 pt-2">
          <div className="font-semibold text-gray-700 text-xs">Góc ghép cánh:</div>
          <div className="flex items-center gap-2 flex-wrap">
            {SASH_CORNER_JOINTS.map((joint) => (
              <button
                key={joint.id}
                type="button"
                onClick={() => onChangeConfig({ cornerJoint: joint.id })}
                className={`px-3 py-1.5 rounded-lg border font-medium text-xs transition-all cursor-pointer ${
                  config.cornerJoint === joint.id
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {joint.label}
              </button>
            ))}
          </div>
        </div>

        {/* Góc ghép nẹp cho cánh */}
        <div className="space-y-1.5 pt-2">
          <div className="font-semibold text-gray-700 text-xs">Góc ghép nẹp cho cánh:</div>
          <div className="flex items-center gap-2 flex-wrap">
            {BEAD_CORNER_JOINTS.map((joint) => (
              <button
                key={joint.id}
                type="button"
                onClick={() => onChangeConfig({ beadCornerJoint: joint.id })}
                className={`px-3 py-1.5 rounded-lg border font-medium text-xs transition-all cursor-pointer ${
                  config.beadCornerJoint === joint.id
                    ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {joint.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Profile cánh theo kiểu mở */}
      <div className="space-y-3 p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
        <div className="bg-emerald-700 text-white p-2 rounded-xl font-bold text-xs flex items-center justify-between">
          <span>▾ Cánh cửa sổ mở quay / hất / lật</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="font-semibold text-gray-700 text-[11px]">1 • Đứng trái *</div>
            <select
              value={config.leftProfileId || ''}
              onChange={(e) => handleLeftProfileChange(Number(e.target.value))}
              className="w-full h-8 px-2 text-xs rounded-lg border border-gray-300 bg-white"
            >
              <option value="">Chọn profile...</option>
              {sashProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="font-semibold text-gray-700 text-[11px]">2 • Trên</div>
            <select
              value={config.topProfileId || ''}
              onChange={(e) => onChangeConfig({ topProfileId: Number(e.target.value) })}
              className="w-full h-8 px-2 text-xs rounded-lg border border-gray-300 bg-white"
            >
              <option value="">{config.leftProfileId ? '↑ Kế thừa (Cạnh trái)' : 'Chọn profile...'}</option>
              {sashProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="font-semibold text-gray-700 text-[11px]">3 • Đứng phải</div>
            <select
              value={config.rightProfileId || ''}
              onChange={(e) => onChangeConfig({ rightProfileId: Number(e.target.value) })}
              className="w-full h-8 px-2 text-xs rounded-lg border border-gray-300 bg-white"
            >
              <option value="">{config.leftProfileId ? '↑ Kế thừa (Cạnh trái)' : 'Chọn profile...'}</option>
              {sashProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="font-semibold text-gray-700 text-[11px]">4 • Dưới</div>
            <select
              value={config.bottomProfileId || ''}
              onChange={(e) => onChangeConfig({ bottomProfileId: Number(e.target.value) })}
              className="w-full h-8 px-2 text-xs rounded-lg border border-gray-300 bg-white"
            >
              <option value="">{config.leftProfileId ? '↑ Kế thừa (Cạnh trái)' : 'Chọn profile...'}</option>
              {sashProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="font-semibold text-gray-700 text-[11px]">Đố cánh (Mullion)</div>
            <select
              value={config.mullionProfileId || ''}
              onChange={(e) => onChangeConfig({ mullionProfileId: Number(e.target.value) })}
              className="w-full h-8 px-2 text-xs rounded-lg border border-gray-300 bg-white"
            >
              <option value="">Chọn profile...</option>
              {mullionProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="font-semibold text-gray-700 text-[11px]">Nẹp cánh (Bead)</div>
            <select
              value={config.beadProfileId || ''}
              onChange={(e) => onChangeConfig({ beadProfileId: Number(e.target.value) })}
              className="w-full h-8 px-2 text-xs rounded-lg border border-gray-300 bg-white"
            >
              <option value="">Chọn profile...</option>
              {beadProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2 space-y-1">
            <div className="font-semibold text-gray-700 text-[11px]">Đố động (Dynamic mullion / Astragal)</div>
            <select
              value={config.dynamicMullionProfileId || ''}
              onChange={(e) => onChangeConfig({ dynamicMullionProfileId: Number(e.target.value) })}
              className="w-full h-8 px-2 text-xs rounded-lg border border-gray-300 bg-white"
            >
              <option value="">Chọn profile đố động cho cửa 2 cánh...</option>
              {mullionProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
