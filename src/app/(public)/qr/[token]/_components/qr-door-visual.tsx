'use client';

import React, { useState } from 'react';
import { DoorOpen, ImageOff, Maximize2, Ruler, X } from 'lucide-react';
import { DoorThumbnail } from '@/components';
import { BASE_MINIO_URL } from '@/config';

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
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed;
  }
  if (trimmed.length > 200 && !trimmed.includes('/')) {
    return `data:image/png;base64,${trimmed}`;
  }
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
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const hasCad = Boolean(systemConfig && (systemConfig as Record<string, unknown>).rootCell);
  const resolvedImgUrl = !imgError ? resolveDoorImageUrl(designImage) : null;
  const hasVisual = hasCad || Boolean(resolvedImgUrl);

  const effectiveSystemConfig = React.useMemo(() => {
    if (!systemConfig) return null;
    return {
      ...systemConfig,
      w: width > 0 ? width : (systemConfig.w ?? 800),
      h: height > 0 ? height : (systemConfig.h ?? 1200),
    };
  }, [systemConfig, width, height]);

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
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/60">
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

          {hasVisual && (
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#045863] bg-white hover:bg-[#045863]/5 border border-slate-200 transition-colors cursor-pointer shrink-0"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Phóng to
            </button>
          )}
        </div>

        <div
          onClick={() => {
            if (hasVisual) setIsZoomOpen(true);
          }}
          className={`relative w-full h-64 sm:h-72 lg:h-[340px] flex items-center justify-center p-4 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50/50 ${
            hasVisual ? 'cursor-zoom-in group' : ''
          }`}
        >
          {hasCad && effectiveSystemConfig ? (
            <div className="w-full h-full flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.02]">
              <DoorThumbnail
                systemConfig={effectiveSystemConfig}
                hideDimensions={false}
              />
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
            <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-900/75 text-white text-[10px] font-medium backdrop-blur-xs opacity-90 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1">
              <Maximize2 className="w-3 h-3" />
              Chạm để phóng to
            </div>
          )}
        </div>
      </div>

      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#045863] text-white font-mono text-xs font-bold">
                    {code}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {name || doorName}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
                  Rộng {width} mm × Cao {height} mm
                  {typeof areaM2 === 'number' ? ` · Diện tích ${areaM2} m²` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer shrink-0"
                aria-label="Đóng bản vẽ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-[360px] h-[68vh] p-4 sm:p-8 flex items-center justify-center bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] bg-slate-50/70 overflow-auto">
              {hasCad && effectiveSystemConfig ? (
                <div className="w-full h-full flex items-center justify-center">
                  <DoorThumbnail
                    systemConfig={effectiveSystemConfig}
                    hideDimensions={false}
                  />
                </div>
              ) : resolvedImgUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolvedImgUrl}
                  alt={doorName}
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

