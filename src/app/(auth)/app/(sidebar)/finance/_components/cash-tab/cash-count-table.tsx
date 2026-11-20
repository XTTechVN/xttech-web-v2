'use client';

import React from 'react';
import { CheckCircle2, FilePlus2, XCircle } from 'lucide-react';
import { Badge, Button } from '@/components';
import { CASH_COUNT_STATUS_MAP } from '@/config/finance';
import type { CashCountMinute } from '@/types';
import { formatCurrency } from '@/utils';

export interface CashCountTableProps {
  rows: CashCountMinute[];
  busyId: number | null;
  canCashierConfirm: boolean;
  onConfirm: (minute: CashCountMinute) => void;
  onCreateAdjustment: (minute: CashCountMinute) => void;
  onVoid: (minute: CashCountMinute) => void;
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function CashCountTable({
  rows,
  busyId,
  canCashierConfirm,
  onConfirm,
  onCreateAdjustment,
  onVoid,
  onOpenVoucherDetail,
}: CashCountTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3">Số BB</th>
              <th className="p-3">Ngày kiểm</th>
              <th className="p-3 text-right">Số dư sổ quỹ</th>
              <th className="p-3 text-right">Thực kiểm</th>
              <th className="p-3 text-right">Chênh lệch</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Phiếu xử lý</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((m) => {
              const st = CASH_COUNT_STATUS_MAP[m.status];
              const busy = busyId === m.id;
              return (
                <tr key={m.id} className="hover:bg-slate-50/70">
                  <td className="p-3 font-mono font-bold text-slate-900">{m.minuteNo}</td>
                  <td className="p-3 font-mono">{m.countDate}</td>
                  <td className="p-3 text-right font-mono tabular-nums">
                    {formatCurrency(m.bookBalance)}
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                    {formatCurrency(m.actualBalance)}
                  </td>
                  <td
                    className={`p-3 text-right font-mono tabular-nums font-bold ${
                      m.differenceAmount > 0
                        ? 'text-emerald-700'
                        : m.differenceAmount < 0
                          ? 'text-rose-700'
                          : 'text-slate-500'
                    }`}
                  >
                    {m.differenceAmount > 0 ? '+' : ''}
                    {formatCurrency(m.differenceAmount)}
                  </td>
                  <td className="p-3">
                    <Badge variant={st.variant} size="sm">
                      {st.shortLabel || st.label}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {m.adjustmentVoucherId ? (
                      <button
                        type="button"
                        onClick={() => onOpenVoucherDetail(m.adjustmentVoucherId!)}
                        className="font-mono font-bold text-primary underline cursor-pointer"
                      >
                        {m.adjustmentVoucherNo || `#${m.adjustmentVoucherId}`}
                      </button>
                    ) : (
                      <span className="text-slate-400">---</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {m.status === 'draft' && canCashierConfirm && (
                        <Button
                          type="button"
                          size="xs"
                          variant="primary"
                          loading={busy}
                          leftIcon={<CheckCircle2 size={12} />}
                          onClick={() => onConfirm(m)}
                        >
                          Xác nhận
                        </Button>
                      )}
                      {m.status === 'confirmed' &&
                        m.differenceAmount !== 0 &&
                        !m.adjustmentVoucherId && (
                          <Button
                            type="button"
                            size="xs"
                            variant="outline"
                            loading={busy}
                            leftIcon={<FilePlus2 size={12} />}
                            onClick={() => onCreateAdjustment(m)}
                          >
                            Tạo phiếu điều chỉnh
                          </Button>
                        )}
                      {m.status === 'draft' && (
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          disabled={busy}
                          leftIcon={<XCircle size={12} />}
                          onClick={() => onVoid(m)}
                        >
                          Hủy
                        </Button>
                      )}
                    </div>
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
