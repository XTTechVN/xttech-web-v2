'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, Loader2, Ruler, X } from 'lucide-react';
import { DoorThumbnail, parseDoorSystemConfig } from '@/components';

const Door3DViewer = dynamic(
  () => import('@/components/door-studio/canvas-3d/door-3d-viewer'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 bg-slate-900 text-slate-300">
        <Loader2 className="h-7 w-7 animate-spin text-[#045863]" />
        <span className="text-xs font-medium tracking-wide">Đang khởi tạo mô hình 3D...</span>
      </div>
    ),
  },
);

interface QrDoorLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: '3d' | '2d';
  code: string;
  title: string;
  width: number;
  height: number;
  areaM2?: number;
  hasCad: boolean;
  parsedConfig: ReturnType<typeof parseDoorSystemConfig>;
  cadConfig: Record<string, unknown> | null;
  imageUrl: string | null;
}

export function QrDoorLightboxModal({
  isOpen,
  onClose,
  initialMode,
  code,
  title,
  width,
  height,
  areaM2,
  hasCad,
  parsedConfig,
  cadConfig,
  imageUrl,
}: QrDoorLightboxModalProps) {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>(initialMode);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-5xl rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[88dvh] sm:h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-3.5 sm:px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#045863] text-white font-mono text-[11px] sm:text-xs font-bold shrink-0">
                {code}
              </span>
              <h3 className="text-xs sm:text-base font-bold text-slate-900 truncate">{title}</h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-mono tabular-nums mt-0.5 truncate">
              {width} × {height} mm{typeof areaM2 === 'number' ? ` · ${areaM2} m²` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasCad && (
              <div className="inline-flex items-center rounded-xl bg-slate-200/75 p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('3d')}
                  className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 text-[11px] font-bold transition cursor-pointer ${
                    viewMode === '3d' ? 'bg-[#045863] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('2d')}
                  className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 text-[11px] font-bold transition cursor-pointer ${
                    viewMode === '2d' ? 'bg-[#045863] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>CAD 2D</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Đóng trình xem"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 min-h-0 w-full overflow-hidden flex items-center justify-center bg-slate-50">
          {viewMode === '3d' && hasCad && parsedConfig.rootCell ? (
            <div className="w-full h-full">
              <Door3DViewer
                w={parsedConfig.w}
                h={parsedConfig.h}
                aluminumColor={parsedConfig.aluminumColor}
                hardwareColor={parsedConfig.hardwareColor}
                frameShape={parsedConfig.frameShape}
                rootCell={parsedConfig.rootCell}
                frameConfig={parsedConfig.frameConfig}
                sashConfig={parsedConfig.sashConfig}
                compactMode={true}
              />
            </div>
          ) : hasCad && cadConfig ? (
            <div className="w-full h-full p-4 sm:p-8 flex items-center justify-center bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] bg-slate-50/70 overflow-auto">
              <DoorThumbnail systemConfig={cadConfig} hideDimensions={false} />
            </div>
          ) : imageUrl ? (
            <div className="w-full h-full p-4 sm:p-8 flex items-center justify-center bg-slate-50 overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt={title} className="max-h-full max-w-full object-contain rounded-lg" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
