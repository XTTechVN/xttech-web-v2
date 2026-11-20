'use client';

import React from 'react';
import { Alert } from '@/components';
import { ACCOUNTING_REGIME_MAP } from '@/config/finance';
import type { OverheadAllocationPreview } from '@/types';
import { formatCurrency } from '@/utils';

export interface OverheadAllocationPreviewPanelProps {
  preview: OverheadAllocationPreview;
}

export function OverheadAllocationPreviewPanel({
  preview,
}: OverheadAllocationPreviewPanelProps) {
  return (
    <div className="space-y-4">
      {preview.basisChangedMidYear && preview.basisChangeDisclosure && (
        <Alert variant="warning" title="Thuyết minh đổi tiêu thức phân bổ giữa năm">
          {preview.basisChangeDisclosure}
        </Alert>
      )}

      {preview.alreadyAllocatedRunId && (
        <Alert
          variant="info"
          title={`Kỳ ${preview.month}/${preview.year} đã thực hiện phân bổ trước đó`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span>Chứng từ hiện hành:</span>
            <strong>
              {preview.alreadyAllocatedVoucherNo || `#${preview.alreadyAllocatedRunId}`}
            </strong>
            <span>— Muốn chạy lại, vui lòng bỏ ghi sổ chứng từ phân bổ cũ trước.</span>
          </div>
        </Alert>
      )}

      {preview.isIdleCapacityToCogs && (
        <Alert
          variant="warning"
          title="Công suất nhàn rỗi — Kết chuyển thẳng sang TK 632 (VAS 02)"
        >
          Tháng {preview.month}/{preview.year} không có chi phí trực tiếp làm cơ sở phân bổ giữa các công trình. Toàn bộ chi phí sản xuất chung chưa gắn dự án sẽ kết chuyển thẳng sang Giá vốn (<strong>Nợ 632</strong>), vẫn giữ tách 2 nhóm Được trừ ({formatCurrency(preview.unallocatedToCogsDeductible)}) và Loại trừ B4 ({formatCurrency(preview.unallocatedToCogsNonDeductible)}).
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="text-slate-500">
            Pool Chung Được trừ TNDN (
            {ACCOUNTING_REGIME_MAP[preview.accountingRegime]?.shortLabel})
          </div>
          <div className="text-lg font-mono font-bold text-emerald-700 tabular-nums mt-1">
            {formatCurrency(preview.totalPoolDeductible)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="text-slate-500">Pool Chung Loại trừ B4 (Không HĐ)</div>
          <div className="text-lg font-mono font-bold text-amber-700 tabular-nums mt-1">
            {formatCurrency(preview.totalPoolNonDeductible)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="text-slate-500">Tổng Cơ sở Phân bổ trực tiếp</div>
          <div className="text-lg font-mono font-bold text-primary tabular-nums mt-1">
            {formatCurrency(preview.totalBaseAmount)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Mã công trình</th>
                <th className="p-3">Tên công trình</th>
                <th className="p-3 text-right">Cơ sở trực tiếp</th>
                <th className="p-3 text-right">Tỷ trọng</th>
                <th className="p-3 text-right">Phân bổ Được trừ</th>
                <th className="p-3 text-right">Phân bổ Loại trừ (B4)</th>
                <th className="p-3 text-right">Tổng phân bổ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {preview.shares.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Không có công trình phát sinh cơ sở phân bổ trong kỳ {preview.month}/
                    {preview.year}.
                  </td>
                </tr>
              ) : (
                preview.shares.map((s) => (
                  <tr key={s.projectId} className="hover:bg-slate-50/70">
                    <td className="p-3 font-mono font-bold text-slate-900">{s.projectCode}</td>
                    <td className="p-3 font-medium text-slate-800">{s.projectName}</td>
                    <td className="p-3 text-right font-mono tabular-nums">
                      {formatCurrency(s.baseAmount)}
                    </td>
                    <td className="p-3 text-right font-mono tabular-nums font-semibold">
                      {s.ratioPercent}%
                    </td>
                    <td className="p-3 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                      {formatCurrency(s.allocatedDeductible)}
                    </td>
                    <td className="p-3 text-right font-mono tabular-nums text-amber-700 font-semibold">
                      {formatCurrency(s.allocatedNonDeductible)}
                    </td>
                    <td className="p-3 text-right font-mono tabular-nums font-bold text-primary">
                      {formatCurrency(s.allocatedDeductible + s.allocatedNonDeductible)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
