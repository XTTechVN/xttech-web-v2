'use client';

import React, { useMemo, useState } from 'react';
import { Box, DoorOpen, ImageOff, Maximize2, Ruler } from 'lucide-react';
import { DoorThumbnail, parseDoorSystemConfig } from '@/components';
import type { DoorFulfillmentType, PositionVisualMode } from '@/types';
import { resolvePositionVisual } from '@/utils';
import { QrDoorLightboxModal } from './modals/qr-door-lightbox-modal';

export interface QrDoorVisualProps {
  code: string;
  doorName: string;
  name?: string | null;
  width: number;
  height: number;
  areaM2?: number;
  designImage?: string | null;
  systemConfig?: Record<string, unknown> | null;
  fulfillmentType?: DoorFulfillmentType;
  visualMode?: PositionVisualMode | null;
  variant?: 'card' | 'mini';
  className?: string;
}

const normalizeRawImage = (raw?: string | null): string | null => {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  if (trimmed.length > 200 && !trimmed.includes('/') && !trimmed.startsWith('data:')) {
    return `data:image/png;base64,${trimmed}`;
  }
  return trimmed;
};

export const QrDoorVisual: React.FC<QrDoorVisualProps> = ({
  code,
  doorName,
  name,
  width,
  height,
  areaM2,
  designImage,
  systemConfig,
  fulfillmentType,
  visualMode,
  variant = 'card',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<'3d' | '2d'>('3d');

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

  const normalizedImage = !imgError ? normalizeRawImage(designImage) : null;
  const visual = useMemo(() => {
    const inferredMode: PositionVisualMode | null =
      visualMode ?? (fulfillmentType === 'outsourced' ? null : parsedConfig.rootCell ? 'cad' : null);
    return resolvePositionVisual({
      visualMode: inferredMode,
      designImage: normalizedImage,
      systemConfig: effectiveSystemConfig,
    });
  }, [visualMode, fulfillmentType, parsedConfig.rootCell, normalizedImage, effectiveSystemConfig]);

  const hasCad = Boolean(visual.systemConfig && parsedConfig.rootCell);
  const resolvedImgUrl = !imgError ? visual.imageUrl : null;
  const hasVisual = hasCad || Boolean(resolvedImgUrl);

  const handleOpenViewer = (preferredMode: '3d' | '2d' = '3d') => {
    if (!hasVisual) return;
    setInitialMode(hasCad ? preferredMode : '2d');
    setIsModalOpen(true);
  };

  if (variant === 'mini') {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50/90 flex items-center justify-center p-1.5 ${
          className || 'w-16 h-20'
        }`}
      >
        {hasCad && visual.systemConfig ? (
          <DoorThumbnail systemConfig={visual.systemConfig} hideDimensions={true} className="pointer-events-none" />
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
      <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden ${className}`}>
        <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/60">
          <div className="flex items-center gap-2 min-w-0">
            <Ruler className="w-4 h-4 text-[#045863] shrink-0" />
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider truncate">
              {fulfillmentType === 'outsourced' && !hasCad ? 'Hình ảnh mẫu cửa' : 'Bản vẽ kỹ thuật cửa'}
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
          {hasCad && visual.systemConfig ? (
            <div className="w-full h-full flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.02]">
              <DoorThumbnail systemConfig={visual.systemConfig} hideDimensions={false} />
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

      <QrDoorLightboxModal
        key={`${isModalOpen}-${initialMode}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialMode={initialMode}
        code={code}
        title={name || doorName}
        width={width}
        height={height}
        areaM2={areaM2}
        hasCad={hasCad}
        parsedConfig={parsedConfig}
        cadConfig={visual.systemConfig}
        imageUrl={resolvedImgUrl}
      />
    </>
  );
};
