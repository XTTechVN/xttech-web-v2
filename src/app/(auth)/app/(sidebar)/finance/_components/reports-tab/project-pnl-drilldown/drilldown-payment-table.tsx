'use client';

import React from 'react';
import { Badge } from '@/components';
import { PAYMENT_METHOD_MAP, TRANSACTION_TYPE_MAP } from '@/config/quotation-contract';
import type { ProjectPnlDrilldownItem } from '@/types';
import { cn, formatCurrency } from '@/utils';

interface DrilldownPaymentTableProps {
  items: ProjectPnlDrilldownItem[];
  filteredTotal: number;
  overallTotal: number;
  hasSearch: boolean;
}

export function DrilldownPaymentTable({
  items,
  filteredTotal,
  overallTotal,
  hasSearch,
}: DrilldownPaymentTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3 whitespace-nowrap">Ngày thu</th>
              <th className="p-3 whitespace-nowrap">Mã GD</th>
              <th className="p-3 whitespace-nowrap">Mã HĐ</th>
              <th className="p-3 whitespace-nowrap">Loại GD / PTTT</th>
              <th className="p-3">Tham chiếu NH &amp; Ghi chú</th>
              <th className="p-3 text-right whitespace-nowrap">Số tiền (VNĐ)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  Không có giao dịch thanh toán phù hợp.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const txTypeLabel = item.transactionType
                  ? TRANSACTION_TYPE_MAP[item.transactionType] || item.transactionType
                  : 'Thu tiền';
                const methodLabel = item.paymentMethod
                  ? PAYMENT_METHOD_MAP[item.paymentMethod] || item.paymentMethod
                  : null;
                const isNegative = item.amount < 0;
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono whitespace-nowrap">
                      {item.entryDate.slice(0, 10)}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.documentNo}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {item.contractCode ? (
                        <Badge variant="primary" size="sm">
                          {item.contractCode}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">Chưa gán HĐ</span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <Badge variant={isNegative ? 'danger' : 'success'} size="sm">
                        {txTypeLabel}
                      </Badge>
                      {methodLabel && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {methodLabel}
                        </div>
                      )}
                    </td>
                    <td className="p-3 max-w-xs">
                      <div className="text-slate-900 font-medium line-clamp-2">
                        {item.description}
                      </div>
                      {item.bankReference && (
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          Ref: {item.bankReference}
                        </div>
                      )}
                    </td>
                    <td
                      className={cn(
                        'p-3 font-mono tabular-nums text-right font-bold whitespace-nowrap',
                        isNegative ? 'text-rose-700' : 'text-emerald-700',
                      )}
                    >
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className="bg-primary/5 text-primary font-bold border-t-2 border-primary/20">
            <tr>
              <td colSpan={5} className="p-3 text-right uppercase">
                {hasSearch
                  ? `Tổng theo bộ lọc (${items.length} GD — Tổng gốc ${formatCurrency(overallTotal)})`
                  : `Tổng tiền đã thu (${items.length} giao dịch)`}
              </td>
              <td className="p-3 font-mono tabular-nums text-right text-sm whitespace-nowrap">
                {formatCurrency(filteredTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
