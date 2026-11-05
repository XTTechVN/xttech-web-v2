'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { ALUMINUM_PALETTE, ColorSwatch, HARDWARE_PALETTE } from '../studio-types';
import {
  DEFAULT_DOOR_3D_SETTINGS,
  Door3DCustomSettings,
} from './door-3d-types';

interface Door3DInspectorProps {
  settings: Door3DCustomSettings;
  onChangeSettings: (patch: Partial<Door3DCustomSettings>) => void;
  aluminumColor: string;
  hardwareColor: string;
  aluminumColors?: ColorSwatch[];
  onSelectAluminumColor?: (color: string) => void;
  onSelectHardwareColor?: (color: string) => void;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
}

const SliderRow: React.FC<SliderRowProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}) => {
  const pct = Math.max(0, Math.min(100, ((value - min) / Math.max(0.0001, max - min)) * 100));
  return (
    <div className="grid grid-cols-[118px_1fr_54px] items-center gap-2 py-0.5">
      <span className="text-[11px] text-slate-200 truncate" title={label}>
        {label}
      </span>
      <div className="relative h-5 bg-neutral-700/90 rounded overflow-hidden flex items-center px-1">
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-sky-400 pointer-events-none z-10"
          style={{ left: `calc(${pct}% - 1px)` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-full opacity-0 cursor-ew-resize relative z-20"
        />
      </div>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!Number.isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
        }}
        className="h-5 px-1.5 bg-neutral-700/90 text-sky-400 font-mono text-[11px] rounded border border-neutral-600/60 focus:outline-none focus:border-sky-400 text-left"
      />
    </div>
  );
};

export const Door3DInspector: React.FC<Door3DInspectorProps> = ({
  settings,
  onChangeSettings,
  aluminumColor,
  hardwareColor,
  aluminumColors,
  onSelectAluminumColor,
  onSelectHardwareColor,
}) => {
  const [isOpenPanel, setIsOpenPanel] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    depth: true,
    position: true,
    material: true,
    glass: true,
  });

  const palettes = aluminumColors && aluminumColors.length > 0 ? aluminumColors : ALUMINUM_PALETTE;
  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  if (!isOpenPanel) {
    return (
      <button
        type="button"
        onClick={() => setIsOpenPanel(true)}
        className="absolute top-14 right-3 z-20 bg-neutral-900/90 hover:bg-neutral-800 text-slate-100 px-3 py-1.5 rounded-lg border border-neutral-700 shadow-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer backdrop-blur-md"
      >
        <SlidersHorizontal size={13} className="text-sky-400" />
        <span>Tùy chỉnh 3D</span>
      </button>
    );
  }

  return (
    <div className="absolute top-14 right-3 z-20 w-72 max-h-[calc(100%-120px)] overflow-y-auto bg-neutral-900/92 backdrop-blur-md text-slate-100 rounded-xl border border-neutral-700/80 shadow-xl select-none text-xs [scrollbar-width:thin]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-950/60 sticky top-0 z-30">
        <span className="font-bold text-[11px] tracking-wide text-slate-200 flex items-center gap-1.5">
          <SlidersHorizontal size={12} className="text-sky-400" />
          Thông số 3D Thực tế
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Khôi phục mặc định"
            onClick={() => onChangeSettings(DEFAULT_DOOR_3D_SETTINGS)}
            className="p-1 rounded hover:bg-neutral-800 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <RotateCcw size={12} />
          </button>
          <button
            type="button"
            onClick={() => setIsOpenPanel(false)}
            className="px-1.5 py-0.5 rounded hover:bg-neutral-800 text-[10px] text-slate-400 hover:text-white cursor-pointer"
          >
            Thu gọn
          </button>
        </div>
      </div>

      {/* 1. Kích thước Sâu (mm) */}
      <div className="border-b border-neutral-800">
        <button
          type="button"
          onClick={() => toggleSection('depth')}
          className="w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-950/50 hover:bg-neutral-800/60 font-bold text-[11px] text-slate-100 cursor-pointer"
        >
          {openSections.depth ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          <span>Kích thước Sâu (mm)</span>
        </button>
        {openSections.depth && (
          <div className="px-2.5 py-2 flex flex-col gap-1">
            <SliderRow
              label="Sâu khung bao"
              value={settings.frameDepthMm}
              min={40}
              max={250}
              onChange={(v) => onChangeSettings({ frameDepthMm: v })}
            />
            <SliderRow
              label="Sâu đố cánh"
              value={settings.sashDepthMm}
              min={25}
              max={120}
              onChange={(v) => onChangeSettings({ sashDepthMm: v })}
            />
            <SliderRow
              label="Dày kính"
              value={settings.glassThicknessMm}
              min={4}
              max={30}
              onChange={(v) => onChangeSettings({ glassThicknessMm: v })}
            />
            <SliderRow
              label="Sâu đố chia"
              value={settings.mullionDepthMm}
              min={40}
              max={250}
              onChange={(v) => onChangeSettings({ mullionDepthMm: v })}
            />
            <SliderRow
              label="Sâu tay nắm"
              value={settings.handleDepthMm}
              min={15}
              max={100}
              onChange={(v) => onChangeSettings({ handleDepthMm: v })}
            />
            <label className="grid grid-cols-[118px_1fr] items-center gap-2 py-0.5 cursor-pointer">
              <span className="text-[11px] text-slate-200">Nhân theo số lớp Z</span>
              <input
                type="checkbox"
                checked={settings.multiplyByZLayers}
                onChange={(e) => onChangeSettings({ multiplyByZLayers: e.target.checked })}
                className="w-4 h-4 rounded accent-sky-500 cursor-pointer"
              />
            </label>
          </div>
        )}
      </div>

      {/* 2. Hiệu Chỉnh Vị Trí */}
      <div className="border-b border-neutral-800">
        <button
          type="button"
          onClick={() => toggleSection('position')}
          className="w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-950/50 hover:bg-neutral-800/60 font-bold text-[11px] text-slate-100 cursor-pointer"
        >
          {openSections.position ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          <span>Hiệu Chỉnh Vị Trí</span>
        </button>
        {openSections.position && (
          <div className="px-2.5 py-2 flex flex-col gap-1">
            <SliderRow
              label="Hiệu chỉnh X Tay Nắm"
              value={settings.handleOffsetXMm}
              min={-120}
              max={120}
              onChange={(v) => onChangeSettings({ handleOffsetXMm: v })}
            />
            <SliderRow
              label="Hiệu chỉnh Y Tay Nắm"
              value={settings.handleOffsetYMm}
              min={-400}
              max={400}
              onChange={(v) => onChangeSettings({ handleOffsetYMm: v })}
            />
            <label className="grid grid-cols-[118px_1fr] items-center gap-2 py-0.5 cursor-pointer">
              <span className="text-[11px] text-slate-200">Hiện tay nắm 2 mặt</span>
              <input
                type="checkbox"
                checked={settings.bothSidesHandle}
                onChange={(e) => onChangeSettings({ bothSidesHandle: e.target.checked })}
                className="w-4 h-4 rounded accent-sky-500 cursor-pointer"
              />
            </label>
          </div>
        )}
      </div>

      {/* 3. Vật liệu */}
      <div className="border-b border-neutral-800">
        <button
          type="button"
          onClick={() => toggleSection('material')}
          className="w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-950/50 hover:bg-neutral-800/60 font-bold text-[11px] text-slate-100 cursor-pointer"
        >
          {openSections.material ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          <span>Vật liệu</span>
        </button>
        {openSections.material && (
          <div className="px-2.5 py-2 flex flex-col gap-1.5">
            {onSelectAluminumColor && (
              <div className="grid grid-cols-[95px_1fr] items-center gap-2">
                <span className="text-[11px] text-slate-200">Màu nhôm</span>
                <select
                  value={aluminumColor}
                  onChange={(e) => onSelectAluminumColor(e.target.value)}
                  className="h-6 px-2 bg-neutral-700/90 text-slate-100 text-[11px] rounded border border-neutral-600 focus:outline-none focus:border-sky-400 cursor-pointer truncate"
                >
                  {palettes.map((sw) => (
                    <option key={sw.code} value={sw.colorHex} className="bg-neutral-800 text-slate-100">
                      {sw.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-[95px_1fr] items-center gap-2">
              <span className="text-[11px] text-slate-200">Màu tay nắm</span>
              <select
                value={settings.handleColorMode === 'design' ? 'design' : hardwareColor}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'design') {
                    onChangeSettings({ handleColorMode: 'design' });
                  } else {
                    onChangeSettings({ handleColorMode: val });
                    onSelectHardwareColor?.(val);
                  }
                }}
                className="h-6 px-2 bg-neutral-700/90 text-slate-100 text-[11px] rounded border border-neutral-600 focus:outline-none focus:border-sky-400 cursor-pointer truncate"
              >
                <option value="design" className="bg-neutral-800 text-slate-100">
                  Màu thiết kế
                </option>
                {HARDWARE_PALETTE.map((hw) => (
                  <option key={hw.code} value={hw.colorHex} className="bg-neutral-800 text-slate-100">
                    {hw.name}
                  </option>
                ))}
              </select>
            </div>

            <SliderRow
              label="Độ nhám"
              value={settings.roughness}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => onChangeSettings({ roughness: v })}
            />
            <SliderRow
              label="Độ kim loại"
              value={settings.metalness}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => onChangeSettings({ metalness: v })}
            />
          </div>
        )}
      </div>

      {/* 4. Kính */}
      <div>
        <button
          type="button"
          onClick={() => toggleSection('glass')}
          className="w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-950/50 hover:bg-neutral-800/60 font-bold text-[11px] text-slate-100 cursor-pointer"
        >
          {openSections.glass ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          <span>Kính</span>
        </button>
        {openSections.glass && (
          <div className="px-2.5 py-2 flex flex-col gap-1.5">
            <div className="grid grid-cols-[118px_1fr_54px] items-center gap-2 py-0.5">
              <span className="text-[11px] text-slate-200">Màu kính</span>
              <label className="h-5 rounded overflow-hidden border border-neutral-600 cursor-pointer block relative">
                <input
                  type="color"
                  value={settings.glassColorHex}
                  onChange={(e) => onChangeSettings({ glassColorHex: e.target.value })}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
                <span
                  className="block w-full h-full"
                  style={{ backgroundColor: settings.glassColorHex }}
                />
              </label>
              <input
                type="text"
                value={settings.glassColorHex.replace('#', '')}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                  onChangeSettings({ glassColorHex: `#${raw}` });
                }}
                className="h-5 px-1.5 bg-neutral-700/90 text-slate-100 font-mono text-[11px] rounded border border-neutral-600/60 focus:outline-none focus:border-sky-400"
              />
            </div>

            <SliderRow
              label="Trong suốt"
              value={settings.glassTransparency}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => onChangeSettings({ glassTransparency: v })}
            />
            <SliderRow
              label="Độ nhám (mờ)"
              value={settings.glassRoughness}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => onChangeSettings({ glassRoughness: v })}
            />
            <SliderRow
              label="Độ mờ kính"
              value={settings.glassFrost}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => onChangeSettings({ glassFrost: v })}
            />
          </div>
        )}
      </div>
    </div>
  );
};
