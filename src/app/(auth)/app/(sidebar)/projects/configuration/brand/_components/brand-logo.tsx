'use client';

import { useState } from 'react';
import { cn } from '@/utils/cn';
import { logoSrc } from './format';
import type { Brand } from '@/types';

interface Props {
  brand: Pick<Brand, 'logoPath' | 'updatedAt' | 'name' | 'code'>;
  /** Kích thước (class Tailwind), mặc định 40px */
  className?: string;
}

// Logo hãng trong ô vuông; chưa có hoặc lỗi ảnh thì hiện hai chữ đầu của mã
export function BrandLogo({ brand, className = 'size-10' }: Props) {
  const src = logoSrc(brand);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  return (
    <span className={cn('flex flex-none items-center justify-center overflow-hidden rounded-control border border-slate-200 bg-white', className)}>
      {src && failedSrc !== src ? (
        <img src={src} alt={brand.name} onError={() => setFailedSrc(src)} className="size-full object-contain p-1" />
      ) : (
        <span className="text-xs font-semibold text-primary">{(brand.code || brand.name).slice(0, 2).toUpperCase()}</span>
      )}
    </span>
  );
}
