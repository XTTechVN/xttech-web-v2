'use client';

import { useState } from 'react';
import type { QuotationDoorItemSnapshot } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/cn';
import { BTN_LINE, BTN_PRIMARY } from '../../../_components/form';
import { groupItemsByFloor } from '../_quotes/quotation-form-utils';
import {
  getSavedDoorUnitPriceM2,
  getSavedUnitPriceM2,
  getSuggestedDoorUnitPriceM2,
  getSuggestedUnitPriceM2,
  type useQuotationPriceDrafts,
} from '../_quotes/use-quotation-price-drafts';
import { MoneyInput } from '../../_components/fields';

type Drafts = ReturnType<typeof useQuotationPriceDrafts>;
const digits = (v: string) => v.replace(/\D/g, '');

interface Props {
  items: QuotationDoorItemSnapshot[];
  separated: boolean;
  readOnly: boolean;
  saving: boolean;
  drafts: Drafts;
  onSave: () => void;
}

// Chi tiết từng bộ cửa: chi phí, giá gợi ý và giá bán sửa tay (đơn giá đ/m² hoặc thành tiền), áp giá nhanh cho cả tầng.
export function QuoteDoors({ items, separated, readOnly, saving, drafts, onSave }: Props) {
  const [batch, setBatch] = useState('');
  const n = Number(batch);

  if (items.length === 0)
    return (
      <p className="rounded-rm-xl border border-rm-edge bg-rm-surface p-6 text-center text-sm text-rm-muted">
        Báo giá này chưa có dữ liệu từng bộ cửa.
      </p>
    );

  return (
    <div className="flex flex-col gap-3">
      {!readOnly && (
        <div className="rounded-rm-xl border border-rm-edge bg-rm-surface p-rm-gutter">
          <p className="mb-2 text-sm font-medium">Áp nhanh đơn giá (đ/m²)</p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-40">
              <MoneyInput id="qd-batch" value={n || undefined} onChange={(v) => setBatch(v ? String(v) : '')} placeholder="VD: 2.200.000" />
            </div>
            <button type="button" disabled={!n} onClick={() => drafts.applyBatchUnitPrice(items, n)} className={BTN_LINE}>
              Áp cho tất cả ({items.length})
            </button>
            {drafts.hasAnyManual && (
              <button type="button" onClick={drafts.revertAllToSuggested} className="h-rm-tap px-2 text-sm text-rm-primary">
                Khôi phục giá gợi ý
              </button>
            )}
          </div>
        </div>
      )}
      {drafts.changedCount > 0 && (
        <div
          role="status"
          className="sticky top-12 z-10 flex items-center gap-2 rounded-rm-xl border border-rm-primary bg-rm-primary-soft p-3 text-sm"
        >
          <span className="min-w-0 flex-1">Đã sửa {drafts.changedCount} giá bán.</span>
          <button type="button" onClick={drafts.resetDrafts} className={`${BTN_LINE} flex-none px-3`}>
            Hoàn tác
          </button>
          <button type="button" disabled={saving} onClick={onSave} className={`${BTN_PRIMARY} flex-none px-3`}>
            {saving ? 'Đang lưu…' : 'Lưu giá bán'}
          </button>
        </div>
      )}

      {groupItemsByFloor(items).map(([floor, list]) => (
        <section key={floor}>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            {floor} <span className="text-xs font-normal text-rm-muted">{list.length} bộ</span>
          </h3>
          <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface">
            {list.map((it) => {
              const id = it.positionId;
              const below = drafts.isBelowCostLive(it);
              const unit = separated ? drafts.getDoorUnitPriceM2Live(it) : drafts.getUnitPriceM2Live(it);
              const sug = separated ? getSuggestedDoorUnitPriceM2(it) : getSuggestedUnitPriceM2(it);
              const saved = separated ? getSavedDoorUnitPriceM2(it) : getSavedUnitPriceM2(it);
              return (
                <li key={id} className="grid grid-cols-[minmax(0,1fr)] gap-2 px-rm-gutter py-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <span className="min-w-0 truncate">{it.positionCode}</span>
                      {it.isManuallyEdited && (
                        <span className="flex-none rounded-rm-sm bg-rm-primary-soft px-1.5 py-0.5 text-[11px] text-rm-primary">Sửa tay</span>
                      )}
                      {below && (
                        <span className="flex-none rounded-rm-sm bg-rm-danger-soft px-1.5 py-0.5 text-[11px] text-rm-danger">Dưới giá vốn</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-rm-muted">
                      {it.doorName} · {it.width} × {it.height} mm · {it.areaM2.toFixed(2)} m² · vốn {formatCurrency(it.costPrice)}
                    </p>
                    <p className="text-xs text-rm-muted">
                      Gợi ý {formatCurrency(sug)}/m² · đã lưu {formatCurrency(saved)}/m²
                    </p>
                  </div>
                  <div
                    className={cn(
                      'grid gap-2',
                      separated ? 'grid-cols-[repeat(3,minmax(0,1fr))] md:w-[30rem]' : 'grid-cols-[repeat(2,minmax(0,1fr))] md:w-80',
                    )}
                  >
                    <label className="text-xs text-rm-muted">
                      {separated ? 'Cửa (đ/m²)' : 'Đơn giá (đ/m²)'}
                      <MoneyInput
                        id={`qd-u-${id}`}
                        value={unit}
                        disabled={readOnly}
                        onChange={(v) =>
                          separated
                            ? drafts.setDoorUnitPriceM2Draft(it, digits(String(v ?? '')))
                            : drafts.setUnitPriceM2Draft(it, digits(String(v ?? '')))
                        }
                      />
                    </label>
                    {separated && (
                      <label className="text-xs text-rm-muted">
                        Phụ kiện (đ/bộ)
                        <MoneyInput
                          id={`qd-a-${id}`}
                          value={drafts.getAccessoryLive(it)}
                          disabled={readOnly}
                          onChange={(v) => drafts.setAccessoryDraft(id, digits(String(v ?? '')))}
                        />
                      </label>
                    )}
                    <label className="text-xs text-rm-muted">
                      Thành tiền (đ)
                      <MoneyInput
                        id={`qd-t-${id}`}
                        value={drafts.getTotalLive(it)}
                        disabled={readOnly}
                        onChange={(v) =>
                          separated
                            ? drafts.setDoorTotalPriceDraft(it, digits(String(v ?? '')))
                            : drafts.setTotalPriceDraft(it, digits(String(v ?? '')))
                        }
                      />
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
