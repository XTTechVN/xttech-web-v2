'use client';

import React from 'react';
import {
  SashConfig,
  SashCornerJoint,
  BeadCornerJoint,
} from '../../studio-types';
import { ProfileBar } from '@/types';
import { DoorClosed, Shield, SlidersHorizontal, Layers, Check } from 'lucide-react';

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
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 text-xs text-slate-800">
      {/* CỘT TRÁI (7 cols): Cấu hình lưới muỗi & Thông số quy cách cánh */}
      <div className="xl:col-span-7 space-y-4">
        {/* Cấu hình lưới muỗi */}
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

        {/* Cánh cửa (Sash) */}
        <div className="space-y-4 p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">1</span>
            <span>Thông số quy cách cánh</span>
          </div>
          <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">Cấu hình áp dụng mặc định cho các cánh</span>
        </div>

        {/* Nhóm kiểu mở & Loại cánh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5 p-3 bg-white rounded-lg border border-slate-200">
            <label className="font-medium text-xs text-slate-700">Nhóm kiểu mở (Family):</label>
            <select
              value={config.family}
              onChange={(e) => onChangeConfig({ family: e.target.value })}
              className="w-full h-8 px-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:border-primary"
            >
              <option value="Cửa sổ mở quay/Hất">Cửa sổ mở quay/Hất</option>
              <option value="Cửa đi mở quay">Cửa đi mở quay</option>
              <option value="Cửa trượt lùa">Cửa trượt lùa</option>
              <option value="Cửa xếp trượt">Cửa xếp trượt</option>
            </select>
          </div>

          <div className="space-y-1.5 p-3 bg-white rounded-lg border border-slate-200">
            <label className="font-medium text-xs text-slate-700">Loại bản cánh:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeConfig({ sashStyle: 'standard' })}
                className={`py-1.5 px-2 rounded-lg border text-xs font-medium text-center cursor-pointer transition-all ${
                  config.sashStyle === 'standard'
                    ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Cánh tiêu chuẩn
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ sashStyle: 'slim' })}
                className={`py-1.5 px-2 rounded-lg border text-xs font-medium text-center cursor-pointer transition-all ${
                  config.sashStyle === 'slim'
                    ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Cánh vô cực (Slim)
              </button>
            </div>
          </div>
        </div>

        {/* Khe hở & ngàm trừ cơ khí */}
        <div className="space-y-1.5">
          <div className="font-medium text-xs text-slate-700">Khe hở & ngàm trừ cơ khí:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                <span>Ngàm ngang</span>
                <span className="text-slate-400">mm</span>
              </div>
              <input
                type="number"
                value={config.ngamNgangMm}
                onChange={(e) => onChangeConfig({ ngamNgangMm: Number(e.target.value) })}
                className="w-full h-7 px-2 text-xs text-center border rounded border-slate-300 focus:outline-none focus:border-primary font-medium"
              />
              <div className="text-[10px] text-slate-400 text-center">Trừ ngàm đứng</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                <span>Ngàm dọc</span>
                <span className="text-slate-400">mm</span>
              </div>
              <input
                type="number"
                value={config.ngamDocMm}
                onChange={(e) => onChangeConfig({ ngamDocMm: Number(e.target.value) })}
                className="w-full h-7 px-2 text-xs text-center border rounded border-slate-300 focus:outline-none focus:border-primary font-medium"
              />
              <div className="text-[10px] text-slate-400 text-center">Trừ ngàm trên / dưới</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                <span>Trừ đố động</span>
                <span className="text-slate-400">mm</span>
              </div>
              <input
                type="number"
                value={config.truDoDongMm}
                onChange={(e) => onChangeConfig({ truDoDongMm: Number(e.target.value) })}
                className="w-full h-7 px-2 text-xs text-center border rounded border-slate-300 focus:outline-none focus:border-primary font-medium"
              />
              <div className="text-[10px] text-slate-400 text-center">Hs - giá trị này</div>
            </div>
          </div>
        </div>

        {/* Bù trừ offset cánh */}
        <div className="space-y-1.5">
          <div className="font-medium text-xs text-slate-700">Bù / trừ offset cánh (mm):</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'left', label: 'Cạnh Trái' },
              { key: 'top', label: 'Cạnh Trên' },
              { key: 'right', label: 'Cạnh Phải' },
              { key: 'bottom', label: 'Cạnh Dưới' },
            ].map(({ key, label }) => (
              <div key={key} className="p-2.5 bg-white rounded-lg border border-slate-200 text-center space-y-1">
                <div className="text-[11px] font-medium text-slate-600">{label}</div>
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
                  className="w-full h-7 text-center text-xs border rounded border-slate-300 focus:outline-none focus:border-primary font-medium"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Góc ghép cánh & Góc ghép nẹp cánh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
            <div className="font-semibold text-xs text-slate-800">Góc ghép cánh:</div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {SASH_CORNER_JOINTS.map((joint) => (
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
        </div>
      </div>

      {/* CỘT PHẢI (5 cols): Profile chi tiết cánh cửa */}
      <div className="xl:col-span-5 space-y-4">
        <div className="space-y-3 p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
              <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Profile chi tiết cánh cửa</span>
            </div>
            <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded">Tự đồng bộ</span>
          </div>

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
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
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
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
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
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
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
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <span className="font-semibold text-xs text-slate-800">Đố chia cánh</span>
                <select
                  value={config.mullionProfileId || ''}
                  onChange={(e) => onChangeConfig({ mullionProfileId: Number(e.target.value) })}
                  className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
                >
                  <option value="">Chọn profile...</option>
                  {mullionProfiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <span className="font-semibold text-xs text-slate-800">Nẹp kính cánh</span>
                <select
                  value={config.beadProfileId || ''}
                  onChange={(e) => onChangeConfig({ beadProfileId: Number(e.target.value) })}
                  className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
                >
                  <option value="">Chọn profile...</option>
                  {beadProfiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-800">Đố động (Astragal)</span>
                <span className="text-[11px] text-slate-400">Dành cho 2 cánh</span>
              </div>
              <select
                value={config.dynamicMullionProfileId || ''}
                onChange={(e) => onChangeConfig({ dynamicMullionProfileId: Number(e.target.value) })}
                className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-primary"
              >
                <option value="">Chọn profile đố động...</option>
                {mullionProfiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
