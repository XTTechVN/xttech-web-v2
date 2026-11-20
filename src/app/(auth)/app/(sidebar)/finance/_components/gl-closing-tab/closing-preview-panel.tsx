'use client';

import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { Alert, Badge } from '@/components';
import { ACCOUNT_CATEGORY_MAP, getTaxDeductibleBadge } from '@/config/finance';
import type { ClosingPreview } from '@/types';
import { cn, formatCurrency } from '@/utils';
import { TRANSFER_DIRECTION_MAP } from './gl-closing-tab.constants';

interface ClosingPreviewPanelProps {
  preview: ClosingPreview;
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function ClosingPreviewPanel({
  preview,
  onOpenVoucherDetail,
}: ClosingPreviewPanelProps) {
  return (
    <div className="space-y-4">
      {preview.hasUnallocatedOverhead && (
        <Alert
          variant="danger"
          title="Chưa phân bổ hết Chi phí sản xuất chung (TK 627 / 154 chung)"
        >
          Tháng {preview.month}/{preview.year} còn số dư chi phí sản xuất chung chưa gắn công trình. Vui lòng chuyển sang tab{' '}
          <strong>Phân bổ chi phí chung (627 / 154)</strong> để phân bổ trước khi thực hiện Kết chuyển 911 → 4212.
        </Alert>
      )}

      {preview.isPeriodLocked && (
        <Alert variant="danger" title="Kỳ kế toán đã bị khóa sổ" icon={<Lock size={16} />}>
          Tháng {preview.month}/{preview.year} đang khóa sổ. Hãy mở khóa ở tab &quot;Khóa kỳ Kế toán&quot; trước khi chạy lại kết chuyển.
        </Alert>
      )}

      {preview.alreadyClosedVoucherId && (
        <Alert variant="warning" title="Kỳ này đã từng kết chuyển trước đó">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Chứng từ hiện có:</span>
            <button
              type="button"
              onClick={() => onOpenVoucherDetail(preview.alreadyClosedVoucherId!)}
              className="font-mono font-bold underline cursor-pointer"
            >
              {preview.alreadyClosedVoucherNo || `#${preview.alreadyClosedVoucherId}`}
            </button>
            <span>— Nếu chạy lại trong kỳ đang mở, hệ thống sẽ tự hủy và lập bộ kết chuyển mới.</span>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="text-xs text-slate-500">Tổng Doanh thu &amp; Thu nhập (511, 515, 711)</div>
          <div className="text-lg font-mono font-bold text-emerald-700 tabular-nums mt-1">
            {formatCurrency(preview.revenueTotal)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="text-xs text-slate-500">Tổng Chi phí &amp; Giá vốn (632, 641, 642, 811...)</div>
          <div className="text-lg font-mono font-bold text-rose-700 tabular-nums mt-1">
            {formatCurrency(preview.expenseTotal)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3.5">
          <div className="text-xs text-slate-500">Lãi / Lỗ trước thuế (911 → 4212)</div>
          <div className="text-lg font-mono font-bold text-primary tabular-nums mt-1">
            {formatCurrency(preview.netProfitBeforeTax)}
          </div>
          {(preview.b4NonDeductibleTotal ?? 0) > 0 && (
            <div className="text-[11px] text-amber-700 mt-1">
              Điều chỉnh B4 (CP loại trừ TNDN): {formatCurrency(preview.b4NonDeductibleTotal ?? 0)}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Mã TK</th>
                <th className="p-3">Tên tài khoản</th>
                <th className="p-3">Loại TK</th>
                <th className="p-3">Chiều kết chuyển</th>
                <th className="p-3 text-center">Tính hợp lệ thuế (B4)</th>
                <th className="p-3 text-right">Dư Nợ</th>
                <th className="p-3 text-right">Dư Có</th>
                <th className="p-3 text-right">Số tiền kết chuyển</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {preview.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Không có phát sinh tài khoản loại 5, 6, 7, 8 cần kết chuyển trong kỳ này.
                  </td>
                </tr>
              ) : (
                preview.items.map((line, idx) => {
                  const catMeta = ACCOUNT_CATEGORY_MAP[line.category];
                  const dirMeta = TRANSFER_DIRECTION_MAP[line.transferDirection];
                  const taxBadge = getTaxDeductibleBadge(line.isTaxDeductible);
                  return (
                    <tr
                      key={`${line.accountId}-${line.transferDirection}-${line.isTaxDeductible ? 'tax' : 'b4'}-${idx}`}
                      className="hover:bg-slate-50"
                    >
                      <td className="p-3 font-mono font-bold text-slate-900">{line.accountCode}</td>
                      <td className="p-3 font-medium text-slate-800">{line.accountName}</td>
                      <td className="p-3">
                        <Badge variant={catMeta?.variant || 'default'} size="sm">
                          {catMeta?.shortLabel || line.category}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold',
                            dirMeta?.badgeClass,
                          )}
                        >
                          <ArrowRight size={11} />
                          {dirMeta?.label || line.transferDirection}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={taxBadge.variant} size="sm">
                          {taxBadge.shortLabel || taxBadge.label}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono tabular-nums text-right">
                        {formatCurrency(line.debitBalance)}
                      </td>
                      <td className="p-3 font-mono tabular-nums text-right">
                        {formatCurrency(line.creditBalance)}
                      </td>
                      <td className="p-3 font-mono tabular-nums text-right font-bold text-primary">
                        {formatCurrency(line.closingAmount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-primary/5 text-primary font-bold border-t-2 border-primary/20">
              <tr>
                <td colSpan={7} className="p-3 text-right uppercase">
                  Lợi nhuận kế toán trước thuế kết chuyển 911 → 4212
                </td>
                <td className="p-3 font-mono tabular-nums text-right text-sm">
                  {formatCurrency(preview.netProfitBeforeTax)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
