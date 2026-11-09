'use client';

import React from 'react';
import { ColorSwatch } from '../studio-types';
import { SlidingCycleDirection } from './door-3d-scene-builder';
import {
  AluminumFinishPreset,
  AluminumSurfaceType,
  DisplayEnvMode,
  Door3DCustomSettings,
  FINISH_PRESET_VALUES,
  FloorMaterialType,
} from './door-3d-types';
import { Door3DInspector } from './door-3d-inspector';
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
  settings: Door3DCustomSettings;
  onChangeSettings: (patch: Partial<Door3DCustomSettings>) => void;
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

const SURFACE_OPTIONS: { id: AluminumSurfaceType; label: string }[] = [
  { id: 'powder_coat', label: 'Tĩnh điện' },
  { id: 'anodize', label: 'Anode' },
];

const FINISH_OPTIONS: { id: AluminumFinishPreset; label: string }[] = [
  { id: 'matte', label: 'Mờ' },
  { id: 'satin', label: 'Satin' },
  { id: 'glossy', label: 'Bóng' },
];

const DISPLAY_OPTIONS: { id: DisplayEnvMode; label: string }[] = [
  { id: 'studio', label: 'Studio' },
  { id: 'technical', label: 'Kỹ thuật' },
];

const FLOOR_OPTIONS: { id: FloorMaterialType; label: string }[] = [
  { id: 'tile_60x60', label: '60×60' },
  { id: 'tile_80x80', label: '80×80' },
  { id: 'tile_60x120', label: '60×120' },
  { id: 'wood', label: 'Gỗ' },
];

export const Door3DHud: React.FC<Door3DHudProps> = ({
  w, h, aluminumColor, hardwareColor, aluminumColors, onSelectAluminumColor, onSelectHardwareColor,
  compactMode = false, settings, onChangeSettings, activePreset, onSelectPreset, openRatio,
  onChangeOpenRatio, isAutoPlaying, onToggleAutoPlay, hasSlidingSash, slidingDirection,
  onChangeSlidingDirection, showWall, onToggleWall, showEdges, onToggleEdges, showOpeningRays,
  onToggleOpeningRays, onZoomIn, onZoomOut, onResetCamera,
}) => {
  return (
    <>
      {/* Thanh tiêu đề & Góc nhìn Camera trên cùng */}
      <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 right-2.5 sm:right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="hidden sm:flex pointer-events-auto items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
            <Compass size={14} /> Mô hình 3D Thời gian thực
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-mono font-semibold text-slate-700">{w} × {h} mm</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-200/80 shadow-xs no-scrollbar overflow-x-auto max-w-full">
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

      {/* Cụm Nút Nổi Góc Trái Trên: Nhôm (Tĩnh điện / Anode) & Hoàn thiện (Mờ / Satin / Bóng) */}
      {!compactMode && (
        <div className="absolute top-14 left-3 z-10 bg-slate-800/88 backdrop-blur-md text-slate-100 px-3 py-2 rounded-xl border border-slate-700/80 shadow-lg flex flex-col gap-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-16 text-slate-300 font-medium">Nhôm</span>
            <div className="flex items-center gap-1">
              {SURFACE_OPTIONS.map((opt) => {
                const active = settings.surfaceType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeSettings({ surfaceType: opt.id })}
                    className={`px-2.5 py-0.5 rounded-md font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'bg-primary text-white border-primary shadow-2xs'
                        : 'bg-slate-700/60 text-slate-200 border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-16 text-slate-300 font-medium">Hoàn thiện</span>
            <div className="flex items-center gap-1">
              {FINISH_OPTIONS.map((opt) => {
                const active = settings.finishPreset === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      onChangeSettings({
                        finishPreset: opt.id,
                        ...FINISH_PRESET_VALUES[opt.id],
                      })
                    }
                    className={`px-2.5 py-0.5 rounded-md font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'bg-primary text-white border-primary shadow-2xs'
                        : 'bg-slate-700/60 text-slate-200 border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bảng Inspector Chi tiết 4 Nhóm bên phải */}
      {!compactMode && (
        <Door3DInspector
          settings={settings}
          onChangeSettings={onChangeSettings}
          aluminumColor={aluminumColor}
          hardwareColor={hardwareColor}
          aluminumColors={aluminumColors}
          onSelectAluminumColor={onSelectAluminumColor}
          onSelectHardwareColor={onSelectHardwareColor}
        />
      )}

      {/* Cụm Nổi Góc Trái Dưới: Hiển thị (Studio / Kỹ thuật) & Sàn (60x60 / 80x80 / 60x120 / Gỗ) */}
      {!compactMode && (
        <div className="absolute bottom-16 left-3 z-10 bg-slate-800/88 backdrop-blur-md text-slate-100 px-3 py-2 rounded-xl border border-slate-700/80 shadow-lg flex flex-col gap-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-12 text-slate-300 font-medium">Hiển thị</span>
            <div className="flex items-center gap-1">
              {DISPLAY_OPTIONS.map((opt) => {
                const active = settings.displayMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeSettings({ displayMode: opt.id })}
                    className={`px-2.5 py-0.5 rounded-md font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'bg-primary text-white border-primary shadow-2xs'
                        : 'bg-slate-700/60 text-slate-200 border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {settings.displayMode === 'studio' && (
            <div className="flex items-center gap-2">
              <span className="w-12 text-slate-300 font-medium">Sàn</span>
              <div className="flex items-center gap-1">
                {FLOOR_OPTIONS.map((opt) => {
                  const active = settings.floorType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChangeSettings({ floorType: opt.id })}
                      className={`px-2 py-0.5 rounded-md font-semibold border transition-all cursor-pointer ${
                        active
                          ? 'bg-primary text-white border-primary shadow-2xs'
                          : 'bg-slate-700/60 text-slate-200 border-slate-600 hover:bg-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Thanh điều khiển Mở cửa & Hiển thị dưới đáy */}
      <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 right-2.5 sm:right-3 z-10 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-1.5 sm:gap-2 pointer-events-none">
        <div className="pointer-events-auto flex flex-wrap items-center justify-between sm:justify-start gap-2 bg-white/95 backdrop-blur-md px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200/80 shadow-sm">
          <button
            type="button"
            onClick={onToggleAutoPlay}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              isAutoPlaying ? 'bg-amber-500 text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
          >
            {isAutoPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span className="hidden xs:inline sm:inline">{isAutoPlaying ? 'Tạm dừng' : 'Mô phỏng Mở cửa'}</span>
            <span className="xs:hidden sm:hidden">{isAutoPlaying ? 'Dừng' : 'Mở cửa'}</span>
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
              >
                <ArrowLeft size={12} />
                <span className="hidden sm:inline">Phải → Trái</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeSlidingDirection('left_to_right')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  slidingDirection === 'left_to_right'
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="hidden sm:inline">Trái → Phải</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial justify-end">
            <DoorOpen size={14} className="text-slate-500 shrink-0" />
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(openRatio * 100)}
              onChange={(e) => onChangeOpenRatio(Number(e.target.value) / 100)}
              className="w-20 sm:w-28 accent-primary cursor-pointer"
            />
            <span className="text-xs font-mono tabular-nums font-bold text-slate-700 w-9 text-right">
              {Math.round(openRatio * 100)}%
            </span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center justify-between sm:justify-start gap-1 bg-white/95 backdrop-blur-md px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleWall}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
                showWall ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BrickWall size={13} />
              <span>Tường</span>
            </button>

            <button
              type="button"
              onClick={onToggleEdges}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
                showEdges ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers size={13} />
              <span>Nét ghép</span>
            </button>

            <button
              type="button"
              onClick={onToggleOpeningRays}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
                showOpeningRays ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Tia mở</span>
            </button>
          </div>

          <div className="flex items-center gap-0.5 pl-1 border-l border-slate-200">
            <button
              type="button"
              onClick={onZoomIn}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              title="Phóng to"
            >
              <ZoomIn size={14} />
            </button>
            <button
              type="button"
              onClick={onZoomOut}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              title="Thu nhỏ"
            >
              <ZoomOut size={14} />
            </button>
            <button
              type="button"
              onClick={onResetCamera}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              title="Đặt lại góc nhìn mặc định"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
