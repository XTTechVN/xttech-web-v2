'use client';

import React from 'react';
import { DOOR_FULFILLMENT_TYPE_MAP, POSITION_COST_STATUS_MAP } from '@/config';
import type { QuotationDoorItemSnapshot } from '@/types';
import { formatCurrency, formatMoneyInput, onlyDigits } from '@/utils';
import { isSeparatedManual } from '../utils/quotation-form-utils';
import {
  getSavedUnitPriceM2,
  getSuggestedUnitPriceM2,
  getSavedDoorUnitPriceM2,
  getSuggestedDoorUnitPriceM2,
  type useQuotationPriceDrafts,
} from '../hooks/use-quotation-price-drafts';

type PriceDrafts = ReturnType<typeof useQuotationPriceDrafts>;

interface QuotationDoorRowProps {
  item: QuotationDoorItemSnapshot;
  isSeparated: boolean;
  isLocked: boolean;
  drafts: PriceDrafts;
}

const INPUT_CLASS =
  'text-right text-xs font-semibold tabular-nums placeholder:font-normal placeholder:text-slate-400 border rounded px-2 py-1 outline-none focus:border-primary disabled:bg-slate-50';

export function QuotationDoorRow({ item, isSeparated, isLocked, drafts }: QuotationDoorRowProps) {
  const isOutsourced = item.fulfillmentType === 'outsourced';
  const isEstimated = isOutsourced && item.costStatus === 'estimated';
  const isBelowCost = drafts.isBelowCostLive(item);
  const id = item.positionId;
  const isManual = isSeparatedManual(item);
  const isLiveManual = drafts.isManualLive(item);
  const costPerM2 = item.areaM2 > 0 ? Math.round(item.costPrice / item.areaM2) : item.costPrice;
  const extraGlasses = item.extraGlassesDetail ?? [];
  const hasSeparatedDraft = drafts.doorTotalDrafts[id] !== undefined || drafts.accDrafts[id] !== undefined;
  const useSuggestedExtra = isSeparated
    ? (hasSeparatedDraft || !isManual)
    : (drafts.totalDrafts[id] === '' || !item.isManuallyEdited);

  return (
    <tr className={`border-b border-slate-100 ${isBelowCost ? 'bg-red-50/60' : 'hover:bg-slate-50/60'}`}>
      <td className="py-2 px-2">
        <div className="whitespace-nowrap">
          <span className="font-semibold text-slate-800">{item.positionCode}</span>
          <span className="text-slate-500"> · {item.doorName}</span>
        </div>
        {isOutsourced && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${DOOR_FULFILLMENT_TYPE_MAP.outsourced.badgeClass}`}>
              {DOOR_FULFILLMENT_TYPE_MAP.outsourced.shortLabel}
            </span>
            {item.supplierName && (
              <span className="text-xs text-slate-600 font-medium truncate max-w-[140px]">
                {item.supplierName}
              </span>
            )}
            {isEstimated && (
              <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${POSITION_COST_STATUS_MAP.estimated.badgeClass}`}>
                {POSITION_COST_STATUS_MAP.estimated.shortLabel}
              </span>
            )}
          </div>
        )}
        {extraGlasses.length > 0 && (
          <div className="mt-1 space-y-0.5 text-xs text-slate-600">
            {extraGlasses.map((eg, idx) => (
              <div key={`${eg.glassId ?? eg.glassName}-${idx}`} className="flex flex-wrap items-center gap-1">
                <span className="px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold">
                  Bổ sung
                </span>
                <span className="font-medium text-slate-700">
                  {eg.glassCode ? `${eg.glassCode} · ` : ''}
                  {eg.glassName}
                </span>
                <span className="tabular-nums text-slate-500">
                  ({eg.areaM2.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} m² ·{' '}
                  {formatCurrency(useSuggestedExtra ? eg.suggestedPrice : eg.sellingPrice)})
                </span>
              </div>
            ))}
            {!isSeparated && (
              <p className="text-xs italic text-slate-500">
                Đơn giá/m² đang gồm kính bổ sung và sẽ tự tách dòng riêng trên bảng Xem trước báo giá / Excel.
              </p>
            )}
          </div>
        )}
      </td>

      <td className="py-2 px-2 whitespace-nowrap text-slate-600 tabular-nums">
        {item.width} x {item.height}
      </td>

      <td className="py-2 px-2 whitespace-nowrap text-right text-slate-600">
        <span className="tabular-nums">{item.areaM2.toLocaleString('vi-VN')}</span>
        {isOutsourced && (
          <span className="block text-xs font-medium text-primary">ĐVT: Bộ</span>
        )}
      </td>

      <td className="py-2 px-2 whitespace-nowrap text-right text-slate-700">
        <span className="font-semibold tabular-nums">{formatCurrency(item.costPrice)}</span>
        <span className="block text-xs text-slate-400 font-normal">
          {isOutsourced
            ? isEstimated
              ? 'Tạm tính NCC / bộ'
              : 'Giá nhập / bộ'
            : `~${formatCurrency(costPerM2)}/m²`}
        </span>
      </td>

      {isSeparated ? (
        <>
          <td className="py-2 px-2 whitespace-nowrap text-right">
            {isOutsourced ? (
              <div>
                <DraftPriceInput
                  disabled={isLocked}
                  suggested={item.doorOnlySuggestedPrice}
                  draft={drafts.doorTotalDrafts[id]}
                  savedValue={isManual ? item.doorOnlySellingPrice : undefined}
                  onChange={(digits) => drafts.setDoorTotalPriceDraft(item, digits)}
                  widthClass="w-32"
                />
                <span className="block text-xs text-slate-400 mt-0.5">đ/bộ (trọn bộ)</span>
              </div>
            ) : (
              <DraftPriceInput
                disabled={isLocked}
                suggested={getSuggestedDoorUnitPriceM2(item)}
                draft={drafts.doorUnitM2Drafts[id]}
                savedValue={isManual ? getSavedDoorUnitPriceM2(item) : undefined}
                onChange={(digits) => drafts.setDoorUnitPriceM2Draft(item, digits)}
                widthClass="w-28"
              />
            )}
          </td>
          <td className="py-2 px-2 whitespace-nowrap text-right">
            {isOutsourced ? (
              <div className="text-slate-400">
                <span className="tabular-nums font-medium">0 đ</span>
                <span className="block text-xs">Gồm theo bộ</span>
              </div>
            ) : (
              <DraftPriceInput
                disabled={isLocked}
                suggested={item.accessorySuggestedPrice}
                draft={drafts.accDrafts[id]}
                savedValue={isManual ? item.accessorySellingPrice : undefined}
                onChange={(digits) => drafts.setAccessoryDraft(id, digits)}
                widthClass="w-28"
              />
            )}
          </td>
          <td className="py-2 px-2 whitespace-nowrap text-right">
            <span className={`font-semibold tabular-nums ${isBelowCost ? 'text-red-600' : 'text-slate-800'}`}>
              {formatCurrency(drafts.getTotalLive(item))}
            </span>
            {isLiveManual && <span className="block text-xs text-amber-600">Đã sửa giá tay</span>}
            {isBelowCost && <span className="block text-xs text-red-600">Thấp hơn chi phí</span>}
          </td>
        </>
      ) : (
        <>
          <td className="py-2 px-2 whitespace-nowrap text-right">
            {isOutsourced ? (
              <span className="text-xs font-medium text-slate-400">Theo bộ</span>
            ) : (
              <DraftPriceInput
                disabled={isLocked}
                suggested={getSuggestedUnitPriceM2(item)}
                draft={drafts.unitPriceM2Drafts[id]}
                savedValue={item.isManuallyEdited ? getSavedUnitPriceM2(item) : undefined}
                onChange={(digits) => drafts.setUnitPriceM2Draft(item, digits)}
                widthClass="w-32"
              />
            )}
          </td>
          <td className="py-2 px-2 whitespace-nowrap text-right">
            <DraftPriceInput
              disabled={isLocked}
              suggested={item.suggestedPrice}
              draft={drafts.totalDrafts[id]}
              savedValue={item.isManuallyEdited ? item.sellingPrice : undefined}
              onChange={(digits) => drafts.setTotalPriceDraft(item, digits)}
              widthClass="w-32"
              isDanger={isBelowCost}
            />
            {isOutsourced && (
              <span className="block text-xs text-slate-400 mt-0.5">đ/bộ</span>
            )}
            {isLiveManual && <span className="block text-xs text-amber-600">Đã sửa giá tay</span>}
            {isBelowCost && <span className="block text-xs text-red-600">Thấp hơn chi phí</span>}
          </td>
        </>
      )}
    </tr>
  );
}

interface DraftPriceInputProps {
  disabled: boolean;
  suggested: number;
  draft: string | undefined;
  savedValue: number | undefined;
  widthClass: string;
  isDanger?: boolean;
  onChange: (digits: string) => void;
}

function DraftPriceInput({
  disabled,
  suggested,
  draft,
  savedValue,
  widthClass,
  isDanger = false,
  onChange,
}: DraftPriceInputProps) {
  const displayDigits = draft ?? (savedValue !== undefined ? String(savedValue) : '');
  return (
    <input
      type="text"
      inputMode="numeric"
      disabled={disabled}
      placeholder={formatMoneyInput(String(suggested ?? 0))}
      value={formatMoneyInput(displayDigits)}
      onChange={(e) => onChange(onlyDigits(e.target.value))}
      className={`${widthClass} ${INPUT_CLASS} ${
        isDanger ? 'text-red-600 border-red-300' : 'text-slate-800 border-slate-200'
      }`}
    />
  );
}
