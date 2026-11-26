'use client';

import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { DoorThumbnail } from '@/components';
import { Tag } from '@/components-remake';
import { BASE_MINIO_URL } from '@/config';
import { getDoorTypeConfig, type Door } from '@/types';

// Bản vẽ của mẫu cửa: ưu tiên bản vẽ SVG từ cấu hình, sau đó ảnh, cuối cùng là khung trống
export function DoorPreview({ door }: { door: Door }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasSvg = Boolean((door.systemConfig as Record<string, unknown> | undefined)?.rootCell);
  const path = door.images?.find((i) => i.isPrimary)?.imagePath ?? door.imagePath;
  const src = path ? (path.startsWith('http') ? path : `${BASE_MINIO_URL}/${path.replace(/^\//, '')}`) : null;

  if (hasSvg) {
    return (
      <div className="size-full p-1.5">
        <DoorThumbnail door={door} />
      </div>
    );
  }
  if (src && failedSrc !== src) {
    return <img src={src} alt={door.name} loading="lazy" className="size-full object-contain p-2" onError={() => setFailedSrc(src)} />;
  }
  return (
    <div className="flex flex-col items-center gap-1.5 text-slate-400">
      <ImageOff size={28} />
      <span className="text-xs">Chưa có bản vẽ</span>
    </div>
  );
}

// Thẻ mẫu cửa: cả thẻ là một nút mở chi tiết; sửa, sao chép, xóa nằm trong drawer
export function DoorCard({ door, onOpen }: { door: Door; onOpen: (door: Door) => void }) {
  const type = getDoorTypeConfig(door.type);
  return (
    <button
      type="button"
      onClick={() => onOpen(door)}
      className="flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-block border border-slate-200 bg-white text-left transition active:bg-slate-50 md:hover:border-primary"
    >
      <span className="flex aspect-4/3 w-full items-center justify-center overflow-hidden bg-slate-50">
        <DoorPreview door={door} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5 border-t border-slate-100 p-3">
        <span className="flex flex-wrap items-center gap-1.5">
          {door.code && <Tag tone="blue">{door.code}</Tag>}
          {door.type && <Tag tone="violet">{type.label}</Tag>}
        </span>
        <span className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 [overflow-wrap:anywhere]">{door.name}</span>
      </span>
    </button>
  );
}
