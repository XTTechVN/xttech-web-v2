'use client';

import dynamic from 'next/dynamic';
import { getFileUrl } from '@/utils/string';
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

/** Bản vẽ cửa: CAD từ systemConfig, fallback ảnh `imagePath`. Chỉ nên mount khi thẻ đã mở. */
export function SignDoorDrawing({ item, hideDimensions = true, className = '' }: SignDoorDrawingProps) {
  const systemConfig = item.drawing?.systemConfig;
  const imageUrl = getFileUrl(item.drawing?.imagePath);

  if (systemConfig && Object.keys(systemConfig).length > 0) {
    return (
      <div className={className}>
        <DoorThumbnail systemConfig={systemConfig} hideDimensions={hideDimensions} />
      </div>
    );
  }
  if (imageUrl) {
    return (
      <div className={className}>
        { }
        <img src={imageUrl} alt={`Bản vẽ ${item.code}`} className="h-full w-full object-contain" />
      </div>
    );
  }
  return (
    <div className={`flex items-center justify-center text-[11px] text-slate-400 ${className}`}>Chưa có bản vẽ</div>
  );
}
