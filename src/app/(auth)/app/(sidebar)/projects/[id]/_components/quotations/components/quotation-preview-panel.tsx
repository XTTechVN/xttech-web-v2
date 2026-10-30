'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button, Skeleton } from '@/components';
import type { ProjectQuotationPreviewResponse } from '@/types';
import { formatCurrency } from '@/utils';
import { CompositionPanel, ResultRow } from './quotation-primitives';

interface QuotationPreviewPanelProps {
  result?: ProjectQuotationPreviewResponse;
  isCalculating: boolean;
  isMissingFloors: boolean;
  saveLabel: string;
  isSaving: boolean;
  isSaveDisabled: boolean;
  onSave: () => void;
}

export function QuotationPreviewPanel({
  result,
  isCalculating,
  isMissingFloors,
  saveLabel,
  isSaving,
  isSaveDisabled,
  onSave,
}: QuotationPreviewPanelProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200/60 p-5 shadow-xs space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">
          Kết quả tính thử (theo dữ liệu cửa hiện tại)
        </span>
        {isCalculating && <Loader2 size={14} className="animate-spin text-slate-400" />}
      </div>

      {result ? (
        <PreviewResult result={result} isCalculating={isCalculating} />
      ) : isMissingFloors ? (
        <p className="text-xs text-slate-400 py-4 text-center">Chọn tầng để xem giá.</p>
      ) : (
        <PreviewSkeleton />
      )}

      <Button
        variant="primary"
        size="sm"
        fullWidth
        leftIcon={<CheckCircle2 size={16} />}
        loading={isSaving}
        disabled={isSaveDisabled || isSaving}
        onClick={onSave}
      >
        {saveLabel}
      </Button>
    </div>
  );
}

function PreviewResult({
  result,
  isCalculating,
}: {
  result: ProjectQuotationPreviewResponse;
  isCalculating: boolean;
}) {
  const belowCostCount = result.items.filter((item) => item.isBelowCost).length;

  return (
    <div className={`space-y-4 transition-opacity ${isCalculating ? 'opacity-50' : ''}`}>
      {result.isLoss && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle size={15} className="shrink-0" />
          <span>Giá bán đang thấp hơn chi phí, bạn sẽ bị lỗ!</span>
        </div>
      )}
      {belowCostCount > 0 && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          Có {belowCostCount} bộ cửa đang bán thấp hơn chi phí làm ra.
        </div>
      )}
      {result.warningFlags.map((flag) => (
        <div
          key={flag}
          className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700"
        >
          {flag}
        </div>
      ))}

      <div>
        <span className="text-[11px] font-bold text-slate-500 block mb-1">Khối lượng công trình</span>
        <div className="divide-y divide-slate-100">
          <ResultRow label="Số bộ cửa" value={result.totalPositions.toLocaleString('vi-VN')} />
          <ResultRow label="Tổng diện tích cửa" value={`${result.totalAreaM2.toLocaleString('vi-VN')} m²`} />
          <ResultRow label="Tổng trọng lượng nhôm" value={`${result.totalAluminumKg.toLocaleString('vi-VN')} kg`} />
        </div>
      </div>

      <div>
        <span className="text-[11px] font-bold text-slate-500 block mb-1">Cơ cấu tổng báo giá</span>
        <CompositionPanel data={result} />
      </div>

      <div>
        <span className="text-[11px] font-bold text-slate-500 block mb-1">Từ giá bán đến số tiền khách trả</span>
        <div className="divide-y divide-slate-100">
          <ResultRow label="Giá bán khi chưa giảm" value={formatCurrency(result.subtotalSellingPrice)} />
          <ResultRow label="Giảm giá cho khách" value={`-${formatCurrency(result.discountAmount)}`} tone="red" />
          <ResultRow label="Khách trả (chưa thuế)" value={formatCurrency(result.totalAmountBeforeVat)} strong />
          <ResultRow label="Thuế VAT" value={formatCurrency(result.vatAmount)} />
          <ResultRow label="Khách phải trả (đã gồm thuế)" value={formatCurrency(result.totalAmount)} strong tone="primary" />
          <ResultRow
            label="Tiền lãi thực tế"
            value={`${formatCurrency(result.totalProfit)} (${result.effectiveMarginPercent.toFixed(1)}%)`}
            strong
            tone={result.isLoss ? 'red' : 'green'}
          />
        </div>
      </div>
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div className="space-y-5">
      {[3, 6, 5].map((rows) => (
        <div key={rows} className="space-y-2.5">
          <Skeleton className="h-3 w-32" />
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
