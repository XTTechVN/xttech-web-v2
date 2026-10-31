'use client';

import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import type { QuotationDoorItemSnapshot } from '@/types';
import { formatCurrency, formatMoneyInput, onlyDigits } from '@/utils';
import { PriceBlock } from './quotation-primitives';
import { groupItemsByFloor, isSeparatedManual } from '../utils/quotation-form-utils';
import {
  getSavedDoorUnitPriceM2,
  getSavedUnitPriceM2,
  getSuggestedDoorUnitPriceM2,
  getSuggestedUnitPriceM2,
  type useQuotationPriceDrafts,
} from '../hooks/use-quotation-price-drafts';

type PriceDrafts = ReturnType<typeof useQuotationPriceDrafts>;

interface QuotationDoorsTableProps {
  items: QuotationDoorItemSnapshot[];
  isSeparated: boolean;
  isLocked: boolean;
  isSaving: boolean;
  drafts: PriceDrafts;
  onSave: () => void;
}

const HEADER_CELL = 'py-2.5 px-2 whitespace-nowrap';
const INPUT_CLASS =
  'text-right text-xs font-bold placeholder:font-normal placeholder:text-slate-400 border rounded px-2 py-1 outline-none focus:border-primary disabled:bg-slate-50';

export function QuotationDoorsTable({
  items,
  isSeparated,
  isLocked,
  isSaving,
  drafts,
  onSave,
}: QuotationDoorsTableProps) {
  const [batchUnitPrice, setBatchUnitPrice] = useState<string>('');
  const columnCount = isSeparated ? 7 : 6;

  const handleApplyBatch = (targetItems: QuotationDoorItemSnapshot[]) => {
    const val = Number(batchUnitPrice);
    if (!Number.isFinite(val) || val <= 0) return;
    drafts.applyBatchUnitPrice(targetItems, val);
  };

  return (
    <PriceBlock
      title={`Chi tiết từng bộ cửa (${items.length})`}
      description="Chi phí và giá bán của từng bộ cửa. Bạn có thể sửa trực tiếp đơn giá đ/m² hoặc số tiền cả bộ."
    >
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6">
          Báo giá này chưa có dữ liệu chi tiết từng bộ cửa.
        </p>
      ) : (
        <div className="space-y-3">
          {/* Thanh công cụ áp dụng nhanh đơn giá */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-lg text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Zap size={14} className="text-amber-500 fill-amber-500" />
                Áp dụng nhanh đơn giá:
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="VD: 2.200.000"
                  value={formatMoneyInput(batchUnitPrice)}
                  onChange={(e) => setBatchUnitPrice(onlyDigits(e.target.value))}
                  disabled={isLocked}
                  className="w-32 text-right text-xs font-bold border rounded px-2 py-1 bg-white outline-none focus:border-primary disabled:bg-slate-100"
                />
                <span className="text-slate-500 font-medium">đ/m²</span>
              </div>
              <button
                type="button"
                disabled={!batchUnitPrice || Number(batchUnitPrice) <= 0 || isLocked}
                onClick={() => handleApplyBatch(items)}
                className="px-2.5 py-1 rounded bg-slate-800 text-white font-medium hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Áp dụng tất cả ({items.length} bộ)
              </button>
            </div>
            {drafts.hasAnyManual && (
              <button
                type="button"
                disabled={isLocked}
                onClick={drafts.revertAllToSuggested}
                className="text-slate-500 hover:text-amber-600 font-medium text-xs underline cursor-pointer"
              >
                Khôi phục tất cả giá gợi ý
              </button>
            )}
          </div>

          {drafts.changedCount > 0 && (
            <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-primary/5 border border-primary/20 text-xs text-primary">
              <span>Bạn đã sửa {drafts.changedCount} giá bán. Lưu sẽ cập nhật lại báo giá.</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={drafts.resetDrafts}
                  className="px-2 py-1 rounded border border-primary/30 hover:bg-primary/10 cursor-pointer"
                >
                  Hoàn tác
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={onSave}
                  className="px-2 py-1 rounded bg-primary text-white font-semibold disabled:opacity-60 cursor-pointer"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu giá bán'}
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className={`min-w-[220px] ${HEADER_CELL}`}>Vị trí</th>
                  <th className={HEADER_CELL}>Kích thước (mm)</th>
                  <th className={`${HEADER_CELL} text-right`}>Diện tích (m²)</th>
                  <th className={`${HEADER_CELL} text-right`}>Chi phí vốn</th>
                  {isSeparated ? (
                    <>
                      <th className={`${HEADER_CELL} text-right`}>Đơn giá cửa (đ/m²)</th>
                      <th className={`${HEADER_CELL} text-right`}>Phụ kiện (đ/bộ)</th>
                      <th className={`${HEADER_CELL} text-right`}>Tổng thành tiền</th>
                    </>
                  ) : (
                    <>
                      <th className={`${HEADER_CELL} text-right`}>Đơn giá (đ/m²)</th>
                      <th className={`${HEADER_CELL} text-right`}>Thành tiền (đ)</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="text-xs">
                {groupItemsByFloor(items).map(([floorName, floorItems]) => (
                  <React.Fragment key={floorName}>
                    <tr className="bg-slate-50/90 border-y border-slate-200/60">
                      <td colSpan={columnCount} className="py-2 px-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700">
                            {floorName} ({floorItems.length} bộ)
                          </span>
                          {batchUnitPrice && Number(batchUnitPrice) > 0 && !isLocked && (
                            <button
                              type="button"
                              onClick={() => handleApplyBatch(floorItems)}
                              className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                            >
                              Áp dụng {formatMoneyInput(batchUnitPrice)} đ/m² cho tầng này
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {floorItems.map((item) => (
                      <DoorRow
                        key={item.positionId}
                        item={item}
                        isSeparated={isSeparated}
                        isLocked={isLocked}
                        drafts={drafts}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PriceBlock>
  );
}

function DoorRow({
  item,
  isSeparated,
  isLocked,
  drafts,
}: {
  item: QuotationDoorItemSnapshot;
  isSeparated: boolean;
  isLocked: boolean;
  drafts: PriceDrafts;
}) {
  const isBelowCost = drafts.isBelowCostLive(item);
  const id = item.positionId;
  const isManual = isSeparatedManual(item);
  const costPerM2 = item.areaM2 > 0 ? Math.round(item.costPrice / item.areaM2) : item.costPrice;

  return (
    <tr
      className={`border-b border-slate-100 ${isBelowCost ? 'bg-red-50/60' : 'hover:bg-slate-50/60'}`}
    >
      <td className="py-2 px-2 whitespace-nowrap">
        <span className="font-bold text-slate-800">{item.positionCode}</span>
        <span className="text-slate-500"> · {item.doorName}</span>
      </td>
      <td className="py-2 px-2 whitespace-nowrap text-slate-600">
        {item.width} x {item.height}
      </td>
      <td className="py-2 px-2 whitespace-nowrap text-right text-slate-600">
        {item.areaM2.toLocaleString('vi-VN')}
      </td>
      <td className="py-2 px-2 whitespace-nowrap text-right text-slate-700">
        <span className="font-semibold">{formatCurrency(item.costPrice)}</span>
        <span className="block text-[10px] text-slate-400 font-normal">
          ~{formatCurrency(costPerM2)}/m²
        </span>
      </td>

      {isSeparated ? (
        <>
          <td className="py-2 px-2 whitespace-nowrap text-right">
            <DraftPriceInput
              disabled={isLocked}
              suggested={getSuggestedDoorUnitPriceM2(item)}
              draft={drafts.doorUnitM2Drafts[id]}
              savedValue={isManual ? getSavedDoorUnitPriceM2(item) : undefined}
              onChange={(digits) => drafts.setDoorUnitPriceM2Draft(item, digits)}
              widthClass="w-28"
            />
          </td>
          <td className="py-2 px-2 whitespace-nowrap text-right">
            <DraftPriceInput
              disabled={isLocked}
              suggested={item.accessorySuggestedPrice}
              draft={drafts.accDrafts[id]}
              savedValue={isManual ? item.accessorySellingPrice : undefined}
              onChange={(digits) => drafts.setAccessoryDraft(id, digits)}
              widthClass="w-28"
            />
          </td>
          <td className="py-2 px-2 whitespace-nowrap text-right">
            <span className={`font-bold ${isBelowCost ? 'text-red-600' : 'text-slate-800'}`}>
              {formatCurrency(drafts.getTotalLive(item))}
            </span>
            {isBelowCost && <span className="block text-[10px] text-red-600">Thấp hơn chi phí</span>}
          </td>
        </>
      ) : (
        <>
          <td className="py-2 px-2 whitespace-nowrap text-right">
            <DraftPriceInput
              disabled={isLocked}
              suggested={getSuggestedUnitPriceM2(item)}
              draft={drafts.unitPriceM2Drafts[id]}
              savedValue={item.isManuallyEdited ? getSavedUnitPriceM2(item) : undefined}
              onChange={(digits) => drafts.setUnitPriceM2Draft(item, digits)}
              widthClass="w-32"
            />
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
            {item.isManuallyEdited && (
              <span className="block text-[10px] text-amber-600">Đã sửa giá tay</span>
            )}
            {isBelowCost && <span className="block text-[10px] text-red-600">Thấp hơn chi phí</span>}
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
