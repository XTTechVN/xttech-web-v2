'use client';

import React from 'react';
import { ALUMINUM_PALETTE, ColorSwatch, HARDWARE_PALETTE } from '../studio-types';
import { SlidingCycleDirection } from './door-3d-scene-builder';
import {
  RotateCcw, Play, Pause, DoorOpen, Layers, BrickWall, Compass, ZoomIn, ZoomOut, ArrowLeft, ArrowRight,
} from 'lucide-react';

interface Door3DHudProps {
  w: number;
  h: number;
  aluminumColor: string;
  hardwareColor: string;
  aluminumColors?: ColorSwatch[];
  onSelectAluminumColor?: (color: string) => void;
  onSelectHardwareColor?: (color: string) => void;
  compactMode?: boolean;
  activePreset: string;
  onSelectPreset: (presetId: string) => void;
  openRatio: number;
  onChangeOpenRatio: (ratio: number) => void;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
  hasSlidingSash: boolean;
  slidingDirection: SlidingCycleDirection;
  onChangeSlidingDirection: (dir: SlidingCycleDirection) => void;
  showWall: boolean;
  onToggleWall: () => void;
  showEdges: boolean;
  onToggleEdges: () => void;
  showOpeningRays: boolean;
  onToggleOpeningRays: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetCamera: () => void;
}

const CAMERA_PRESETS = [
  { id: 'front', label: 'Chính diện' },
  { id: 'iso_left', label: 'Góc 3/4 Trái' },
  { id: 'iso_right', label: 'Góc 3/4 Phải' },
  { id: 'back', label: 'Mặt trong' },
  { id: 'top', label: 'Từ trên (Xem ray)' },
];

export const Door3DHud: React.FC<Door3DHudProps> = ({
  w, h, aluminumColor, hardwareColor, aluminumColors, onSelectAluminumColor, onSelectHardwareColor,
  compactMode = false, activePreset, onSelectPreset, openRatio, onChangeOpenRatio, isAutoPlaying,
  onToggleAutoPlay, hasSlidingSash, slidingDirection, onChangeSlidingDirection, showWall, onToggleWall,
  showEdges, onToggleEdges, showOpeningRays, onToggleOpeningRays, onZoomIn, onZoomOut, onResetCamera,
}) => {
  const palettes = aluminumColors && aluminumColors.length > 0 ? aluminumColors : ALUMINUM_PALETTE;

  return (
    <>
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
            <Compass size={14} /> Mô hình 3D Thời gian thực
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-mono font-semibold text-slate-700">{w} × {h} mm</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-200/80 shadow-xs overflow-x-auto max-w-full">
          {CAMERA_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPreset(p.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activePreset === p.id
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {!compactMode && onSelectAluminumColor && (
        <div className="absolute top-16 right-3 z-10 bg-white/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2 w-44">
          <div className="text-[11px] font-bold text-slate-700">Màu thanh nhôm</div>
          <div className="flex flex-wrap gap-1.5">
            {palettes.map((sw) => {
              const active = aluminumColor.toLowerCase() === sw.colorHex.toLowerCase();
              return (
                <button
                  key={sw.code}
                  type="button"
                  title={sw.name}
                  onClick={() => onSelectAluminumColor(sw.colorHex)}
                  className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                    active ? 'ring-2 ring-primary scale-110 border-white' : 'border-slate-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: sw.colorHex }}
                />
              );
            })}
          </div>
          {onSelectHardwareColor && (
            <>
              <div className="text-[11px] font-bold text-slate-700 pt-1 border-t border-slate-100">
                Màu tay nắm & phụ kiện
              </div>
              <div className="flex flex-wrap gap-1.5">
                {HARDWARE_PALETTE.map((hw) => {
                  const active = hardwareColor.toLowerCase() === hw.colorHex.toLowerCase();
                  return (
                    <button
                      key={hw.code}
                      type="button"
                      title={hw.name}
                      onClick={() => onSelectHardwareColor(hw.colorHex)}
                      className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                        active ? 'ring-2 ring-primary scale-110 border-white' : 'border-slate-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: hw.colorHex }}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-sm">
          <button
            type="button"
            onClick={onToggleAutoPlay}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              isAutoPlaying ? 'bg-amber-500 text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
          >
            {isAutoPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isAutoPlaying ? 'Tạm dừng' : 'Mô phỏng Mở cửa'}</span>
          </button>

          {hasSlidingSash && (
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/70">
              <button
                type="button"
                onClick={() => onChangeSlidingDirection('right_to_left')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  slidingDirection === 'right_to_left'
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Lùa từ phải sang trái (dồn cánh về bên trái)"
              >
                <ArrowLeft size={12} />
                <span>Phải → Trái</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeSlidingDirection('left_to_right')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  slidingDirection === 'left_to_right'
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Lùa từ trái sang phải (dồn cánh về bên phải)"
              >
                <span>Trái → Phải</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <DoorOpen size={14} className="text-slate-500 shrink-0" />
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(openRatio * 100)}
              onChange={(e) => onChangeOpenRatio(Number(e.target.value) / 100)}
              className="w-24 sm:w-32 accent-primary cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-slate-700 w-9 text-right">
              {Math.round(openRatio * 100)}%
            </span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200/80 shadow-sm">
          <button
            type="button"
            onClick={onToggleWall}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              showWall ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Bật/tắt khung tường bao quanh cửa"
          >
            <BrickWall size={13} />
            <span className="hidden sm:inline">Tường</span>
          </button>

          <button
            type="button"
            onClick={onToggleEdges}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              showEdges ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Bật/tắt đường chỉ ghép góc CAD"
          >
            <Layers size={13} />
            <span className="hidden sm:inline">Nét ghép</span>
          </button>

          <button
            type="button"
            onClick={onToggleOpeningRays}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              showOpeningRays ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Bật/tắt tia ký hiệu chiều mở"
          >
            <span>Tia mở</span>
          </button>

          <span className="text-slate-200">|</span>

          <button type="button" onClick={onZoomIn} className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer" title="Phóng to">
            <ZoomIn size={14} />
          </button>
          <button type="button" onClick={onZoomOut} className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer" title="Thu nhỏ">
            <ZoomOut size={14} />
          </button>
          <button type="button" onClick={onResetCamera} className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer" title="Đặt lại góc nhìn mặc định">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </>
  );
};
