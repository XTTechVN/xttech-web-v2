'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, Badge } from '@/components';
import type {
  TaxInvoiceExcelImportResponse,
  TaxInvoiceExcelRowAction,
} from '@/types';
import { formatCurrency } from '@/utils';

interface ImportExcelPreviewProps {
  preview: TaxInvoiceExcelImportResponse;
  onOpenVoucherDetail: (voucherId: number) => void;
}

const ACTION_BADGE_MAP: Record<
  TaxInvoiceExcelRowAction,
  { label: string; variant: 'success' | 'warning' | 'default' | 'danger' }
> = {
  create: { label: 'Thêm mới', variant: 'success' },
  update_status: { label: 'Cập nhật TT', variant: 'warning' },
  duplicate: { label: 'Trùng (bỏ qua)', variant: 'default' },
  error: { label: 'Lỗi đọc', variant: 'danger' },
};

export function ImportExcelPreview({
  preview,
  onOpenVoucherDetail,
}: ImportExcelPreviewProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
          <div className="text-[11px] text-slate-500">Tổng dòng đọc</div>
          <div className="text-base font-bold font-mono tabular-nums text-slate-900">
            {preview.totalRows}
          </div>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
          <div className="text-[11px] text-emerald-700">Thêm mới</div>
          <div className="text-base font-bold font-mono tabular-nums text-emerald-700">
            {preview.createCount}
          </div>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5">
          <div className="text-[11px] text-amber-700">Cập nhật trạng thái</div>
          <div className="text-base font-bold font-mono tabular-nums text-amber-700">
            {preview.updateStatusCount}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-2.5">
          <div className="text-[11px] text-slate-500">Trùng / Lỗi</div>
          <div className="text-base font-bold font-mono tabular-nums text-slate-700">
            {preview.duplicateCount} / {preview.errorCount}
          </div>
        </div>
      </div>

      {preview.postedVoucherWarnings.length > 0 && (
        <Alert
          variant="warning"
          title="Cảnh báo hóa đơn đã gắn chứng từ ghi sổ bị thay đổi trạng thái"
          icon={<AlertTriangle size={16} />}
        >
          <ul className="space-y-1 text-xs mt-1">
            {preview.postedVoucherWarnings.map((w) => (
              <li key={`${w.invoiceId}-${w.voucherId}`} className="flex flex-wrap items-center gap-1.5">
                <span>{w.message}</span>
                <button
                  type="button"
                  onClick={() => onOpenVoucherDetail(w.voucherId)}
                  className="font-mono font-semibold text-primary underline cursor-pointer"
                >
                  Xem {w.voucherNo}
                </button>
              </li>
            ))}
          </ul>
        </Alert>
      )}

      <div className="max-h-72 overflow-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
            <tr>
              <th className="p-2.5">Xử lý</th>
              <th className="p-2.5">Ký hiệu / Số HĐ</th>
              <th className="p-2.5">Ngày</th>
              <th className="p-2.5">MST &amp; Đối tác</th>
              <th className="p-2.5 text-right">Tổng tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {preview.rows.slice(0, 100).map((row) => {
              const meta = ACTION_BADGE_MAP[row.action];
              return (
                <tr key={`${row.rowNumber}-${row.invoiceSeries}-${row.invoiceNumber}`}>
                  <td className="p-2.5 whitespace-nowrap">
                    <Badge variant={meta.variant} size="sm">{meta.label}</Badge>
                  </td>
                  <td className="p-2.5 font-mono font-semibold text-slate-900 whitespace-nowrap">
                    {row.invoiceSeries}-{row.invoiceNumber}
                  </td>
                  <td className="p-2.5 font-mono whitespace-nowrap">
                    {row.invoiceDate ? row.invoiceDate.slice(0, 10) : '—'}
                  </td>
                  <td className="p-2.5 max-w-xs">
                    <div className="truncate font-medium text-slate-800">{row.partnerName || row.message}</div>
                    <div className="text-[11px] font-mono text-slate-400">{row.partnerTaxCode}</div>
                  </td>
                  <td className="p-2.5 font-mono tabular-nums text-right font-semibold text-slate-900">
                    {formatCurrency(row.totalAmount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
