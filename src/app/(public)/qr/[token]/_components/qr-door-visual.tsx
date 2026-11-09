'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, DoorOpen, ImageOff, Loader2, Maximize2, Ruler, X } from 'lucide-react';
import { DoorThumbnail, parseDoorSystemConfig } from '@/components';
import { BASE_MINIO_URL } from '@/config';

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

export interface QrDoorVisualProps {
  code: string;
  doorName: string;
  name?: string | null;
  width: number;
  height: number;
  areaM2?: number;
  designImage?: string | null;
  systemConfig?: Record<string, unknown> | null;
  variant?: 'card' | 'mini';
  className?: string;
}

export function resolveDoorImageUrl(raw?: string | null): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  if (/^(https?:\/\/|data:image\/)/.test(trimmed)) return trimmed;
  if (trimmed.length > 200 && !trimmed.includes('/')) return `data:image/png;base64,${trimmed}`;
  return `${BASE_MINIO_URL}/${trimmed.replace(/^\//, '')}`;
}

export const QrDoorVisual: React.FC<QrDoorVisualProps> = ({
  code,
  doorName,
  name,
  width,
  height,
  areaM2,
  designImage,
  systemConfig,
  variant = 'card',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  const effectiveSystemConfig = useMemo(() => {
    if (!systemConfig) return null;
    return {
      ...systemConfig,
      w: width > 0 ? width : (systemConfig.w ?? 800),
      h: height > 0 ? height : (systemConfig.h ?? 1200),
    };
  }, [systemConfig, width, height]);

  const parsedConfig = useMemo(
    () => parseDoorSystemConfig(effectiveSystemConfig, width || 800, height || 1200),
    [effectiveSystemConfig, width, height],
  );

  const hasCad = Boolean(parsedConfig.rootCell);
  const resolvedImgUrl = !imgError ? resolveDoorImageUrl(designImage) : null;
  const hasVisual = hasCad || Boolean(resolvedImgUrl);

  const handleOpenViewer = (preferredMode: '3d' | '2d' = '3d') => {
    if (!hasVisual) return;
    setViewMode(hasCad ? preferredMode : '2d');
    setIsModalOpen(true);
  };

  if (variant === 'mini') {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50/90 flex items-center justify-center p-1.5 ${
          className || 'w-16 h-20'
        }`}
      >
        {hasCad && effectiveSystemConfig ? (
          <DoorThumbnail
            systemConfig={effectiveSystemConfig}
            hideDimensions={true}
            className="pointer-events-none"
          />
        ) : resolvedImgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedImgUrl}
            alt={doorName}
            onError={() => setImgError(true)}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300 gap-0.5">
            <DoorOpen className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[9px] font-mono tabular-nums text-slate-400">
              {width}×{height}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden ${className}`}
      >
        <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/60">
          <div className="flex items-center gap-2 min-w-0">
            <Ruler className="w-4 h-4 text-[#045863] shrink-0" />
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider truncate">
              Bản vẽ kỹ thuật cửa
            </p>
            {hasCad ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#045863]/10 text-[#045863] border border-[#045863]/20 shrink-0">
                CAD 2D
              </span>
            ) : resolvedImgUrl ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                Ảnh mẫu
              </span>
            ) : null}
          </div>

          {hasCad ? (
            <button
              type="button"
              onClick={() => handleOpenViewer('3d')}
              className="inline-flex min-h-[36px] items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#045863] hover:bg-[#034952] active:scale-95 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Box className="w-3.5 h-3.5" />
              <span>Xem 3D</span>
            </button>
          ) : resolvedImgUrl ? (
            <button
              type="button"
              onClick={() => handleOpenViewer('2d')}
              className="inline-flex min-h-[36px] items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#045863] bg-white hover:bg-[#045863]/5 border border-slate-200 transition-colors cursor-pointer shrink-0"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Phóng to</span>
            </button>
          ) : null}
        </div>

        <div
          onClick={() => handleOpenViewer(hasCad ? '3d' : '2d')}
          className={`relative w-full h-60 sm:h-72 lg:h-[340px] flex items-center justify-center p-3.5 sm:p-4 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50/50 ${
            hasVisual ? 'cursor-pointer group' : ''
          }`}
        >
          {hasCad && effectiveSystemConfig ? (
            <div className="w-full h-full flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.02]">
              <DoorThumbnail systemConfig={effectiveSystemConfig} hideDimensions={false} />
            </div>
          ) : resolvedImgUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolvedImgUrl}
              alt={doorName}
              onError={() => setImgError(true)}
              className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-200 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center px-4 py-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 mb-2.5">
                <ImageOff className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="text-xs font-semibold text-slate-600">
                Chưa có bản vẽ thiết kế cho bộ cửa này
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono tabular-nums">
                Kích thước: {width} × {height} mm
              </p>
            </div>
          )}

          {hasVisual && (
            <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[10px] font-semibold backdrop-blur-xs opacity-95 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1.5 shadow-xs">
              {hasCad ? <Box className="w-3 h-3 text-teal-300" /> : <Maximize2 className="w-3 h-3" />}
              <span>{hasCad ? 'Chạm để xem mô hình 3D' : 'Chạm để phóng to'}</span>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setIsModalOpen(false)}
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
                  <h3 className="text-xs sm:text-base font-bold text-slate-900 truncate">
                    {name || doorName}
                  </h3>
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
                  onClick={() => setIsModalOpen(false)}
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
              ) : hasCad && effectiveSystemConfig ? (
                <div className="w-full h-full p-4 sm:p-8 flex items-center justify-center bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] bg-slate-50/70 overflow-auto">
                  <DoorThumbnail systemConfig={effectiveSystemConfig} hideDimensions={false} />
                </div>
              ) : resolvedImgUrl ? (
                <div className="w-full h-full p-4 sm:p-8 flex items-center justify-center bg-slate-50 overflow-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolvedImgUrl} alt={doorName} className="max-h-full max-w-full object-contain rounded-lg" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
