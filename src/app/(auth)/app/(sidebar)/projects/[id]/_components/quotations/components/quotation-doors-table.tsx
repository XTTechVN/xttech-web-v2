'use client';

import React, { useState } from 'react';
import { AlertTriangle, Zap } from 'lucide-react';
import type { QuotationDoorItemSnapshot } from '@/types';
import { formatMoneyInput, onlyDigits } from '@/utils';
import { PriceBlock } from './quotation-primitives';
import { QuotationDoorRow } from './quotation-door-row';
import { groupItemsByFloor } from '../utils/quotation-form-utils';
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
  const inHouseItems = items.filter((item) => item.fulfillmentType !== 'outsourced');
  const outsourcedCount = items.length - inHouseItems.length;
  const estimatedOutsourcedCount = items.filter(
    (item) => item.fulfillmentType === 'outsourced' && item.costStatus === 'estimated',
  ).length;

  const handleApplyBatch = (targetItems: QuotationDoorItemSnapshot[]) => {
    const val = Number(batchUnitPrice);
    if (!Number.isFinite(val) || val <= 0) return;
    drafts.applyBatchUnitPrice(targetItems, val);
  };

  return (
    <PriceBlock
      title={`Chi tiết từng bộ cửa (${items.length})`}
      description="Chi phí và giá bán của từng bộ cửa. Cửa tự sản xuất hỗ trợ sửa theo đ/m² hoặc cả bộ; cửa nhập nguyên bộ NCC sửa trực tiếp theo đ/bộ."
    >
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6">
          Báo giá này chưa có dữ liệu chi tiết từng bộ cửa.
        </p>
      ) : (
        <div className="space-y-3">
          {estimatedOutsourcedCount > 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
              <span>
                Có <span className="font-bold">{estimatedOutsourcedCount}</span> cửa nhập nguyên bộ
                đang dùng giá vốn <span className="font-semibold">tạm tính</span> từ danh mục NCC.
                Vui lòng cập nhật báo giá NCC trước khi chốt hợp đồng chính thức.
              </span>
            </div>
          )}

          {/* Thanh công cụ áp dụng nhanh đơn giá (chỉ áp dụng cho cửa tự sản xuất tính theo m²) */}
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
                  disabled={isLocked || inHouseItems.length === 0}
                  className="w-32 text-right text-xs font-bold font-mono tabular-nums border rounded px-2 py-1 bg-white outline-none focus:border-primary disabled:bg-slate-100"
                />
                <span className="text-slate-500 font-medium">đ/m²</span>
              </div>
              <button
                type="button"
                disabled={
                  !batchUnitPrice ||
                  Number(batchUnitPrice) <= 0 ||
                  isLocked ||
                  inHouseItems.length === 0
                }
                onClick={() => handleApplyBatch(items)}
                className="px-2.5 py-1 rounded bg-slate-800 text-white font-medium hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Áp dụng ({inHouseItems.length} bộ tự SX)
              </button>
              {outsourcedCount > 0 && (
                <span className="text-[11px] text-slate-400">
                  Bỏ qua {outsourcedCount} cửa nhập NCC (tính theo Bộ)
                </span>
              )}
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
                  <th className={`min-w-[230px] ${HEADER_CELL}`}>Vị trí</th>
                  <th className={HEADER_CELL}>Kích thước (mm)</th>
                  <th className={`${HEADER_CELL} text-right`}>Diện tích (m²)</th>
                  <th className={`${HEADER_CELL} text-right`}>Chi phí vốn</th>
                  {isSeparated ? (
                    <>
                      <th className={`${HEADER_CELL} text-right`}>Đơn giá cửa</th>
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
                {groupItemsByFloor(items).map(([floorName, floorItems]) => {
                  const hasFloorInHouse = floorItems.some((item) => item.fulfillmentType !== 'outsourced');
                  return (
                    <React.Fragment key={floorName}>
                      <tr className="bg-slate-50/90 border-y border-slate-200/60">
                        <td colSpan={columnCount} className="py-2 px-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700">
                              {floorName} ({floorItems.length} bộ)
                            </span>
                            {hasFloorInHouse && batchUnitPrice && Number(batchUnitPrice) > 0 && !isLocked && (
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
                        <QuotationDoorRow
                          key={item.positionId}
                          item={item}
                          isSeparated={isSeparated}
                          isLocked={isLocked}
                          drafts={drafts}
                        />
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PriceBlock>
  );
}
