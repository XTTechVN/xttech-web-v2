'use client';

import { Check, ChevronDown, Maximize2, X } from 'lucide-react';
import { SIGN_ITEM_RESULT_LABEL } from '@/config';
import type { PublicSigningItem } from '@/types';
import { cn } from '@/utils/cn';
import { formatNumber, formatVnd } from '@/utils/public-signing';
import { SignDoorAccessories } from './sign-door-accessories';
import { SignDoorDrawing } from './sign-door-drawing';
import { SignDoorSpec } from './sign-door-spec';

interface SignDoorCardProps {
  item: PublicSigningItem;
  isOpen: boolean;
  onToggle: () => void;
  onZoom: (item: PublicSigningItem) => void;
}

export function SignDoorCard({ item, isOpen, onToggle, onZoom }: SignDoorCardProps) {
  const panelId = `door-panel-${item.positionId}`;
  const isFailed = item.result === 'failed';
  const { spec, pricing } = item;

  return (
    <article className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex min-h-[56px] w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-primary/5"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {item.result && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
                  isFailed ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800',
                )}
              >
                {isFailed ? <X size={10} aria-hidden /> : <Check size={10} aria-hidden />}
                {SIGN_ITEM_RESULT_LABEL[item.result]}
              </span>
            )}
            <span className="text-sm font-bold text-stone-900">{item.code}</span>
            {item.name && <span className="text-xs text-stone-600">· {item.name}</span>}
            {spec.supplierName && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                NCC: {spec.supplierName}
              </span>
            )}
          </div>
          <div className="mt-0.5 font-mono text-[11px] tabular-nums text-stone-600">
            {formatNumber(spec.width, 0)} × {formatNumber(spec.height, 0)} mm · {formatNumber(spec.areaM2)} m²
          </div>
        </div>
        {pricing && (
          <span className="shrink-0 text-right font-mono text-sm font-bold tabular-nums text-primary">
            {formatVnd(pricing.amount)}
          </span>
        )}
        <ChevronDown
          size={18}
          aria-hidden
          className={cn('shrink-0 text-primary transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div id={panelId} className="space-y-3 border-t border-stone-100 bg-stone-50/50 p-3 sm:grid sm:grid-cols-[200px_1fr] sm:gap-4 sm:space-y-0">
          <button
            type="button"
            onClick={() => onZoom(item)}
            aria-label={`Xem lớn bản vẽ ${item.code}`}
            className="group relative mx-auto h-48 w-full max-w-[260px] rounded-lg border border-stone-200 bg-white p-2 sm:h-52"
          >
            <SignDoorDrawing item={item} className="h-full w-full" />
            <span className="absolute bottom-1.5 right-1.5 inline-flex min-h-[28px] items-center gap-1 rounded bg-white/90 px-2 text-[10px] font-medium text-primary shadow-sm">
              <Maximize2 size={12} aria-hidden /> Xem lớn
            </span>
          </button>

          <div className="space-y-3">
            <SignDoorSpec spec={spec} />
            <SignDoorAccessories accessories={item.accessories} />
            {item.note && (
              <p className={cn('text-xs', isFailed ? 'text-rose-700' : 'text-stone-600')}>Ghi chú: {item.note}</p>
            )}
            {pricing && (() => {
              const isSetUnit = pricing.unit === 'set';
              const unitPriceValue = isSetUnit
                ? (pricing.unitPrice ?? pricing.doorAmount)
                : (pricing.unitPrice ?? pricing.unitPricePerM2);
              return (
                <dl className="space-y-1 rounded-md border border-primary/20 bg-primary/5 p-2.5 text-xs">
                  <div className="flex justify-between text-stone-700">
                    <dt>{isSetUnit ? 'Đơn giá / bộ' : 'Đơn giá / m²'}</dt>
                    <dd className="font-mono tabular-nums">{formatVnd(unitPriceValue)}</dd>
                  </div>
                  <div className="flex justify-between text-stone-700">
                    <dt>Cửa</dt>
                    <dd className="font-mono tabular-nums">{formatVnd(pricing.doorAmount)}</dd>
                  </div>
                  {pricing.accessoryAmount > 0 && (
                    <div className="flex justify-between text-stone-700">
                      <dt>Phụ kiện</dt>
                      <dd className="font-mono tabular-nums">{formatVnd(pricing.accessoryAmount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-primary/20 pt-1 text-sm font-bold text-primary">
                    <dt>Thành tiền</dt>
                    <dd className="font-mono tabular-nums">{formatVnd(pricing.amount)}</dd>
                  </div>
                </dl>
              );
            })()}
          </div>
        </div>
      )}
    </article>
  );
}
