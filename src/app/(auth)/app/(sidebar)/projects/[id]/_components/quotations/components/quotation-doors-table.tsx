'use client';

import React from 'react';
import type { QuotationDoorItemSnapshot } from '@/types';
import { formatCurrency, formatMoneyInput, onlyDigits } from '@/utils';
import { PriceBlock } from './quotation-primitives';
import { groupItemsByFloor, isSeparatedManual } from '../utils/quotation-form-utils';
import type { useQuotationPriceDrafts } from '../hooks/use-quotation-price-drafts';

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
  const columnCount = isSeparated ? 7 : 5;

  return (
    <PriceBlock
      title={`Chi tiết từng bộ cửa (${items.length})`}
      description="Chi phí và giá bán của từng bộ cửa tại thời điểm lưu báo giá"
    >
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6">
          Báo giá này chưa có dữ liệu chi tiết từng bộ cửa.
        </p>
      ) : (
        <div>
          {drafts.changedCount > 0 && (
            <div className="flex items-center justify-between gap-3 mb-3 px-3 py-2 rounded-md bg-primary/5 border border-primary/20 text-xs text-primary">
              <span>Bạn đã sửa {drafts.changedCount} giá bán. Lưu sẽ cập nhật lại báo giá.</span>
              <span className="flex gap-2">
                <button
                  type="button"
                  onClick={drafts.resetDrafts}
                  className="px-2 py-1 rounded border border-primary/30 hover:bg-primary/10"
                >
                  Hoàn tác
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={onSave}
                  className="px-2 py-1 rounded bg-primary text-white font-semibold disabled:opacity-60"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu giá bán'}
                </button>
              </span>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className={`min-w-[240px] ${HEADER_CELL}`}>Vị trí</th>
                  <th className={HEADER_CELL}>Kích thước (mm)</th>
                  <th className={`${HEADER_CELL} text-right`}>Diện tích (m²)</th>
                  <th className={`${HEADER_CELL} text-right`}>Chi phí làm ra</th>
                  {isSeparated && <th className={`${HEADER_CELL} text-right`}>Giá cửa</th>}
                  {isSeparated && <th className={`${HEADER_CELL} text-right`}>Giá phụ kiện</th>}
                  <th className={`${HEADER_CELL} text-right`}>{isSeparated ? 'Tổng' : 'Giá bán'}</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {groupItemsByFloor(items).map(([floorName, floorItems]) => (
                  <React.Fragment key={floorName}>
                    <tr className="bg-slate-50">
                      <td colSpan={columnCount} className="py-2 px-3 font-bold text-slate-600">
                        {floorName} ({floorItems.length} bộ)
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
      <td className="py-2 px-2 whitespace-nowrap text-right font-semibold text-slate-700">
        {formatCurrency(item.costPrice)}
      </td>
      {isSeparated ? (
        <>
          <td className="py-2 px-2 whitespace-nowrap text-right">
            <DraftPriceInput
              disabled={isLocked}
              suggested={item.doorOnlySuggestedPrice}
              draft={drafts.doorDrafts[id]}
              savedValue={isManual ? item.doorOnlySellingPrice : undefined}
              onChange={(digits) => drafts.setDoorDraft(id, digits)}
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
        <td className="py-2 px-2 whitespace-nowrap text-right">
          <DraftPriceInput
            disabled={isLocked}
            suggested={item.suggestedPrice}
            draft={drafts.priceDrafts[id]}
            savedValue={item.isManuallyEdited ? item.sellingPrice : undefined}
            onChange={(digits) => drafts.setPriceDraft(id, digits)}
            widthClass="w-32"
            isDanger={isBelowCost}
          />
          {item.isManuallyEdited && (
            <span className="block text-[10px] text-amber-600">Đã sửa giá tay</span>
          )}
          {isBelowCost && <span className="block text-[10px] text-red-600">Thấp hơn chi phí</span>}
        </td>
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
