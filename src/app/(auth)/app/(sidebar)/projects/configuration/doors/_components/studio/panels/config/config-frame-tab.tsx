'use client';

import React from 'react';
import {
  FrameConfig,
  FrameCornerJoint,
  BeadCornerJoint,
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

  const leftEdge = config?.leftEdge ?? { offsetMm: 0 };
  const topEdge = config?.topEdge ?? { offsetMm: 0 };
  const rightEdge = config?.rightEdge ?? { offsetMm: 0 };
  const bottomEdge = config?.bottomEdge ?? { offsetMm: 0 };

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
    <div className="flex flex-col space-y-5 p-5 text-xs text-gray-800 bg-white">
      <div className="text-center font-bold text-sm text-slate-800 py-1 border-b border-gray-100 flex items-center justify-center gap-2">
        <span className="bg-blue-900 text-white px-3 py-0.5 rounded-full text-xs font-semibold">PHẦN 1 — KHUNG BAO</span>
      </div>

      {/* 1. Khung bao (Frame) */}
      <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-gray-200/80">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
          <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px]">1</span>
          <span>Khung bao (Frame)</span>
        </div>

        {/* Khung kín vs Khung hở */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChangeConfig({ isOpenBottom: false })}
            className={`p-3 rounded-xl border font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !config.isOpenBottom
                ? 'border-blue-600 bg-white shadow-xs text-blue-700 ring-2 ring-blue-500/20'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100/60'
            }`}
          >
            <span>🔳 Khung kín (4 cạnh)</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeConfig({ isOpenBottom: true })}
            className={`p-3 rounded-xl border font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              config.isOpenBottom
                ? 'border-amber-600 bg-white shadow-xs text-amber-700 ring-2 ring-amber-500/20'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100/60'
            }`}
          >
            <span>🔓 Khung hở (3 cạnh — chạm sàn)</span>
          </button>
        </div>

        {/* Kiểu góc ghép khung */}
        <div className="space-y-1.5 pt-2">
          <div className="font-semibold text-gray-700 text-xs">Kiểu góc ghép khung</div>
          <div className="flex items-center gap-2 flex-wrap">
            {CORNER_JOINTS.map((joint) => (
              <button
                key={joint.id}
                type="button"
                onClick={() => onChangeConfig({ cornerJoint: joint.id })}
                className={`px-3 py-1.5 rounded-lg border font-medium text-xs transition-all cursor-pointer ${
                  config.cornerJoint === joint.id
                    ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {joint.label}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-gray-400 italic">
            {CORNER_JOINTS.find((j) => j.id === config.cornerJoint)?.desc}
          </div>
        </div>

        {/* Công thức cắt theo góc ghép */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-white rounded-xl border border-gray-200 text-xs font-mono">
          <div className="text-gray-600">Trái: <span className="font-bold text-amber-700">H · {config.cornerJoint === '45' ? '45°/45°' : '90°/90°'}</span></div>
          <div className="text-gray-600">Trên: <span className="font-bold text-amber-700">W · {config.cornerJoint === '45' ? '45°/45°' : '90°/90°'}</span></div>
          <div className="text-gray-600">Phải: <span className="font-bold text-amber-700">H · {config.cornerJoint === '45' ? '45°/45°' : '90°/90°'}</span></div>
          <div className="text-gray-600">Dưới: <span className="font-bold text-amber-700">{config.isOpenBottom ? '(Bỏ qua - Khung hở)' : `W · ${config.cornerJoint === '45' ? '45°/45°' : '90°/90°'}`}</span></div>
        </div>
      </div>

      {/* Nhập Profile từng cạnh */}
      <div className="space-y-2.5 p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
        <div className="text-xs text-gray-500 font-medium">
          Nhập profile từng cạnh. Chỉ nhập <strong className="text-gray-900">CẠNH TRÁI</strong> → áp dụng cho tất cả.
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Cạnh Trái */}
          <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between font-bold text-xs text-gray-800">
              <span>CẠNH TRÁI</span>
              <span className="text-amber-700 font-mono text-[11px]">H • 45°/45°</span>
            </div>
            <select
              value={leftEdge.profileId || ''}
              onChange={(e) => handleLeftProfileChange(Number(e.target.value))}
              className="w-full h-8 px-2 text-xs rounded-lg border border-gray-300 bg-white"
            >
              <option value="">Chọn profile...</option>
              {frameProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500">Bù/trừ offset:</span>
              <input
                type="number"
                value={leftEdge.offsetMm}
                onChange={(e) => onChangeConfig({ leftEdge: { ...leftEdge, offsetMm: Number(e.target.value) } })}
                className="w-16 h-6 px-1.5 text-xs text-center font-mono rounded border border-gray-300"
              />
              <span className="text-[11px] text-gray-400">mm</span>
            </div>
          </div>

          {/* Cạnh Trên */}
          <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between font-bold text-xs text-gray-800">
              <span>CẠNH TRÊN</span>
              <span className="text-amber-700 font-mono text-[11px]">W • 45°/45°</span>
            </div>
            <select
              value={topEdge.profileId || ''}
              onChange={(e) => onChangeConfig({ topEdge: { ...topEdge, profileId: Number(e.target.value) } })}
              className="w-full h-8 px-2 text-xs rounded-lg border border-gray-300 bg-white"
            >
              <option value="">{leftEdge.profileId ? '↑ Kế thừa (Cạnh trái)' : 'Chọn profile...'}</option>
              {frameProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500">Bù/trừ offset:</span>
              <input
                type="number"
                value={topEdge.offsetMm}
                onChange={(e) => onChangeConfig({ topEdge: { ...topEdge, offsetMm: Number(e.target.value) } })}
                className="w-16 h-6 px-1.5 text-xs text-center font-mono rounded border border-gray-300"
              />
              <span className="text-[11px] text-gray-400">mm</span>
            </div>
          </div>

          {/* Cạnh Phải */}
          <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between font-bold text-xs text-gray-800">
              <span>CẠNH PHẢI</span>
              <span className="text-amber-700 font-mono text-[11px]">H • 45°/45°</span>
            </div>
            <select
              value={rightEdge.profileId || ''}
              onChange={(e) => onChangeConfig({ rightEdge: { ...rightEdge, profileId: Number(e.target.value) } })}
              className="w-full h-8 px-2 text-xs rounded-lg border border-gray-300 bg-white"
            >
              <option value="">{leftEdge.profileId ? '↑ Kế thừa (Cạnh trái)' : 'Chọn profile...'}</option>
              {frameProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500">Bù/trừ offset:</span>
              <input
                type="number"
                value={rightEdge.offsetMm}
                onChange={(e) => onChangeConfig({ rightEdge: { ...rightEdge, offsetMm: Number(e.target.value) } })}
                className="w-16 h-6 px-1.5 text-xs text-center font-mono rounded border border-gray-300"
              />
              <span className="text-[11px] text-gray-400">mm</span>
            </div>
          </div>

          {/* Cạnh Dưới */}
          <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between font-bold text-xs text-gray-800">
              <span>CẠNH DƯỚI</span>
              <span className="text-amber-700 font-mono text-[11px]">W • 45°/45°</span>
            </div>
            <select
              disabled={config.isOpenBottom}
              value={bottomEdge.profileId || ''}
              onChange={(e) => onChangeConfig({ bottomEdge: { ...bottomEdge, profileId: Number(e.target.value) } })}
              className="w-full h-8 px-2 text-xs rounded-lg border border-gray-300 bg-white disabled:bg-gray-100"
            >
              <option value="">{config.isOpenBottom ? '(Khung hở - không có cạnh dưới)' : (leftEdge.profileId ? '↑ Kế thừa (Cạnh trái)' : 'Chọn profile...')}</option>
              {frameProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
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
          </div>
        </div>
      </div>

      {/* 2. Đố chia (Mullion) & Khung bảo vệ */}
      <div className="space-y-3 p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
          <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">2</span>
          <span>Đố chia (Mullion)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'none', label: 'Không có' },
            { id: 'single', label: 'Dùng chung 1 loại' },
            { id: 'separate', label: 'Dọc / Ngang riêng' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeConfig({ mullionMode: item.id as any })}
              className={`p-2.5 rounded-xl border font-semibold text-center transition-all cursor-pointer ${
                config.mullionMode === item.id
                  ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {config.mullionMode !== 'none' && (
          <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200/80 space-y-2">
            <div className="font-semibold text-xs text-teal-900">Chọn Profile Đố T:</div>
            <select
              value={config.mullionProfileId || ''}
              onChange={(e) => onChangeConfig({ mullionProfileId: Number(e.target.value) })}
              className="w-full h-8 px-2 text-xs rounded-lg border border-gray-300 bg-white"
            >
              <option value="">Chọn profile đố...</option>
              {mullionProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Khung bảo vệ switch */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 font-bold text-xs text-gray-800">
            <Shield size={14} className="text-gray-500" />
            <span>Khung bảo vệ</span>
          </div>
          <input
            type="checkbox"
            checked={config.hasSafetyBars}
            onChange={(e) => onChangeConfig({ hasSafetyBars: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 cursor-pointer"
          />
        </div>
      </div>

      {/* 3. Nẹp kính & Nối khung */}
      <div className="space-y-3 p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
          <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">3</span>
          <span>Nẹp kính & Nối khung</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="font-semibold text-xs text-gray-700">Nẹp kính (Bead)</div>
            <select
              value={config.beadProfileId || ''}
              onChange={(e) => onChangeConfig({ beadProfileId: Number(e.target.value) })}
              className="w-full h-8 px-2 text-xs rounded-lg border border-gray-300 bg-white"
            >
              <option value="">Chọn profile nẹp...</option>
              {beadProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-1.5 pt-1">
              {([
                { id: '45', label: 'Ghép 45°' },
                { id: '90_horiz', label: '90° Ngang phủ' },
                { id: '90_vert', label: '90° Dọc phủ' },
              ] as const).map((bj) => (
                <button
                  key={bj.id}
                  type="button"
                  onClick={() => onChangeConfig({ beadCornerJoint: bj.id })}
                  className={`px-2 py-1 rounded text-[11px] font-medium border cursor-pointer ${
                    config.beadCornerJoint === bj.id ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {bj.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-xs text-gray-700">Nối khung (Coupling)</div>
            <select
              value={config.couplingProfileId || ''}
              onChange={(e) => onChangeConfig({ couplingProfileId: Number(e.target.value) })}
              className="w-full h-8 px-2 text-xs rounded-lg border border-gray-300 bg-white"
            >
              <option value="">Chọn profile nối khung...</option>
              {frameProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
            <div className="text-[11px] text-gray-400 italic">Thanh nối giữa 2 khung ghép 90°, 135°</div>
          </div>
        </div>

        {/* Đảo khung */}
        <div className="pt-2 border-t border-gray-100 flex items-center gap-3">
          <span className="text-[11px] text-gray-500">Đảo khung:</span>
          <button
            type="button"
            onClick={() => onChangeConfig({ isReversedWall: !config.isReversedWall })}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
              config.isReversedWall ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <RefreshCw size={12} />
            <span>⇄ Đảo vách</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeConfig({ isReversedSash: !config.isReversedSash })}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
              config.isReversedSash ? 'bg-amber-50 border-amber-400 text-amber-700' : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <Layers size={12} />
            <span>🚪 Đảo cánh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
