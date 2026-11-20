'use client';

import React, { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components';
import type { ArApAgingItem } from '@/types';
import { formatCurrency } from '@/utils';

interface PartnerAgingTableProps {
  items: ArApAgingItem[];
  onSelectPartner: (partner: ArApAgingItem) => void;
}

export function PartnerAgingTable({
  items,
  onSelectPartner,
}: PartnerAgingTableProps) {
  const totals = useMemo(
    () =>
      items.reduce(
        (acc, item) => ({
          debit: acc.debit + item.totalDebit,
          credit: acc.credit + item.totalCredit,
          net: acc.net + item.netBalance,
          current: acc.current + item.currentAmount,
          d30: acc.d30 + item.overdue1To30,
          d60: acc.d60 + item.overdue31To60,
          d90: acc.d90 + item.overdue61To90,
          over90: acc.over90 + item.overdueOver90,
        }),
        { debit: 0, credit: 0, net: 0, current: 0, d30: 0, d60: 0, d90: 0, over90: 0 },
      ),
    [items],
  );

  return (
    <>
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Đối tượng</th>
                <th className="p-3 text-right">Tổng Nợ</th>
                <th className="p-3 text-right">Tổng Có</th>
                <th className="p-3 text-right">Số dư hiện tại</th>
                <th className="p-3 text-right">Trong hạn</th>
                <th className="p-3 text-right">1-30 ngày</th>
                <th className="p-3 text-right">31-60 ngày</th>
                <th className="p-3 text-right">61-90 ngày</th>
                <th className="p-3 text-right">&gt; 90 ngày</th>
                <th className="p-3 text-right">Sổ CT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={`${item.partnerType}-${item.partnerId}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{item.partnerName}</div>
                    <div className="text-[11px] text-slate-500">
                      {item.partnerCode ? `${item.partnerCode} • ` : ''}
                      {item.partnerPhone || 'Chưa có SĐT'}
                    </div>
                  </td>
                  <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(item.totalDebit)}</td>
                  <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(item.totalCredit)}</td>
                  <td className="p-3 font-mono tabular-nums text-right font-bold text-primary">{formatCurrency(item.netBalance)}</td>
                  <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(item.currentAmount)}</td>
                  <td className="p-3 font-mono tabular-nums text-right text-amber-700">{formatCurrency(item.overdue1To30)}</td>
                  <td className="p-3 font-mono tabular-nums text-right text-orange-700">{formatCurrency(item.overdue31To60)}</td>
                  <td className="p-3 font-mono tabular-nums text-right text-rose-600">{formatCurrency(item.overdue61To90)}</td>
                  <td className="p-3 font-mono tabular-nums text-right font-semibold text-rose-700">{formatCurrency(item.overdueOver90)}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="xs" onClick={() => onSelectPartner(item)} leftIcon={<BookOpen size={13} />}>
                      Chi tiết
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-primary/5 text-primary font-bold border-t-2 border-primary/20">
              <tr>
                <td className="p-3 uppercase">Tổng cộng ({items.length})</td>
                <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(totals.debit)}</td>
                <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(totals.credit)}</td>
                <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(totals.net)}</td>
                <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(totals.current)}</td>
                <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(totals.d30)}</td>
                <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(totals.d60)}</td>
                <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(totals.d90)}</td>
                <td className="p-3 font-mono tabular-nums text-right">{formatCurrency(totals.over90)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <div key={`${item.partnerType}-${item.partnerId}`} className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-sm text-slate-900">{item.partnerName}</div>
                <div className="text-[11px] text-slate-500">{item.partnerPhone || item.partnerCode}</div>
              </div>
              <div className="font-mono tabular-nums text-right font-bold text-primary">
                {formatCurrency(item.netBalance)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
              <div>Trong hạn: {formatCurrency(item.currentAmount)}</div>
              <div className="text-right text-rose-700">
                Quá hạn: {formatCurrency(item.netBalance - item.currentAmount)}
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" size="xs" onClick={() => onSelectPartner(item)} leftIcon={<BookOpen size={12} />}>
                Sổ chi tiết
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
