'use client';

import { ExternalLink, Star, Trash2 } from 'lucide-react';
import { Tag } from '@/components-remake';
import type { Brand } from '@/types';
import { cn } from '@/utils/cn';
import { BrandLogo } from './brand-logo';
import { useBrandFavorite } from './brand-favorite';

interface Props {
  brand: Brand;
  brands: Brand[];
  canFavorite: boolean;
  /** Có = hiện nút xóa */
  onDelete?: (b: Brand) => void;
  onOpen: (b: Brand) => void;
}

const ACTION =
  'flex size-11 flex-none cursor-pointer items-center justify-center rounded-control text-slate-400 transition active:scale-95 disabled:cursor-default md:size-9 md:hover:bg-slate-100';

// Thẻ hãng: logo lớn, bấm vào thẻ mở chi tiết; sao đặt hãng mặc định, thùng rác xóa
export function BrandCard({ brand: b, brands, canFavorite, onDelete, onOpen }: Props) {
  const fav = useBrandFavorite(b, brands);

  return (
    <div className="relative flex h-full flex-col rounded-block border border-slate-200 bg-white transition md:hover:border-primary">
      <button type="button" onClick={() => onOpen(b)} className="flex min-w-0 cursor-pointer flex-col gap-2 p-2.5 text-left">
        <span className="relative">
          <BrandLogo brand={b} className="aspect-square w-full bg-slate-50" />
          <span
            title={b.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
            className={cn(
              'absolute right-1.5 top-1.5 size-2 rounded-full ring-2',
              b.isActive ? 'bg-emerald-500 ring-emerald-50' : 'bg-rose-400 ring-rose-50',
            )}
          />
        </span>
        <span className="block truncate text-sm font-semibold text-slate-900" title={b.name}>
          {b.name}
        </span>
        <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
          <Tag tone="blue">{b.code}</Tag>
          {b.originCountry && <span className="min-w-0 truncate text-xs text-slate-500">{b.originCountry}</span>}
        </span>
        {!!b.barLengthMm && <span className="text-xs text-slate-500">Cây {b.barLengthMm.toLocaleString('vi-VN')} mm</span>}
      </button>
      <div className="flex items-center justify-between border-t border-slate-100 px-1">
        <button
          type="button"
          disabled={!canFavorite || fav.pending}
          onClick={fav.toggle}
          aria-label={fav.on ? `Bỏ hãng mặc định ${b.name}` : `Đặt ${b.name} làm hãng mặc định`}
          title={fav.on ? 'Hãng mặc định khi vào trang. Bấm để bỏ.' : 'Đặt làm hãng mặc định khi vào trang'}
          className={ACTION}
        >
          <Star size={16} className={cn(fav.on && 'fill-amber-400 text-amber-400')} />
        </button>
        <span className="flex items-center">
          {b.website && (
            <a href={b.website} target="_blank" rel="noreferrer" aria-label={`Website ${b.name}`} title={b.website} className={ACTION}>
              <ExternalLink size={14} />
            </a>
          )}
          {onDelete && (
            <button
              type="button"
              aria-label={`Xóa ${b.name}`}
              title="Xóa thương hiệu"
              onClick={() => onDelete(b)}
              className={cn(ACTION, 'md:hover:text-red-600')}
            >
              <Trash2 size={14} />
            </button>
          )}
        </span>
      </div>
    </div>
  );
}
