'use client';

import dynamic from 'next/dynamic';
import { resolvePositionVisual } from '@/utils';
import type { PublicSigningItem } from '@/types';

const DoorThumbnail = dynamic(
  () => import('@/components/door-studio/door-thumbnail').then((m) => m.DoorThumbnail),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse rounded bg-slate-100" aria-hidden />,
  },
);

interface SignDoorDrawingProps {
  item: PublicSigningItem;
  /** Ẩn kích thước trên bản vẽ (dùng ở thẻ nhỏ); lightbox hiện đầy đủ. */
  hideDimensions?: boolean;
  className?: string;
}

/** Bản vẽ cửa: chuẩn hóa qua resolvePositionVisual (ưu tiên CAD nếu có rootCell, ngược lại hiển thị ảnh). */
export function SignDoorDrawing({ item, hideDimensions = true, className = '' }: SignDoorDrawingProps) {
  const systemConfig = item.drawing?.systemConfig;
  const hasCadRoot = Boolean(
    systemConfig && typeof systemConfig === 'object' && 'rootCell' in systemConfig && systemConfig.rootCell,
  );
  const visual = resolvePositionVisual({
    visualMode: item.spec.supplierName && item.drawing?.imagePath ? undefined : hasCadRoot ? 'cad' : undefined,
    designImage: item.drawing?.imagePath,
    systemConfig,
  });

  if (visual.systemConfig) {
    return (
      <div className={className}>
        <DoorThumbnail systemConfig={visual.systemConfig} hideDimensions={hideDimensions} />
      </div>
    );
  }
  if (visual.imageUrl) {
    return (
      <div className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={visual.imageUrl} alt={`Bản vẽ ${item.code}`} className="h-full w-full object-contain" />
      </div>
    );
  }
  return (
    <div className={`flex items-center justify-center text-[11px] text-slate-400 ${className}`}>
      Chưa có bản vẽ
    </div>
  );
}
