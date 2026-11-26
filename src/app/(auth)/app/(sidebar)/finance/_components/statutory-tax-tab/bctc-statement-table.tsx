'use client';

import React, { useMemo } from 'react';
import { Search } from 'lucide-react';
import { Badge } from '@/components';
import type { StatutoryFormCode, StatutoryIndicatorItem } from '@/types';
import { cn, formatCurrency } from '@/utils';

export interface BctcStatementTableProps {
  formCode: StatutoryFormCode;
  indicators: StatutoryIndicatorItem[];
  hideZeroRows: boolean;
  onDrilldown: (item: StatutoryIndicatorItem) => void;
}

export function BctcStatementTable({
  formCode,
  indicators,
  hideZeroRows,
  onDrilldown,
}: BctcStatementTableProps) {
  const isCdtk = formCode === 'CDTK';
  const isB09 = formCode === 'B09_DN';

  const visibleRows = useMemo(() => {
    if (!hideZeroRows || isCdtk || isB09) return indicators;
    return indicators.filter(
      (ind) => ind.isBold || ind.value !== 0 || (ind.priorValue ?? 0) !== 0,
    );
  }, [hideZeroRows, indicators, isB09, isCdtk]);

  if (isCdtk) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5 w-24">Mã TK</th>
                <th className="p-2.5 min-w-[200px]">Tên tài khoản</th>
                <th className="p-2.5 text-right">Đầu kỳ Nợ</th>
                <th className="p-2.5 text-right">Đầu kỳ Có</th>
                <th className="p-2.5 text-right">Phát sinh Nợ</th>
                <th className="p-2.5 text-right">Phát sinh Có</th>
                <th className="p-2.5 text-right">Cuối kỳ Nợ</th>
                <th className="p-2.5 text-right">Cuối kỳ Có</th>
                <th className="p-2.5 w-16 text-center">Truy vết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRows.map((ind) => (
                <tr
                  key={ind.code}
                  className={cn('hover:bg-slate-50/70', ind.isBold && 'bg-primary/5 font-bold')}
                >
                  <td className="p-2.5 font-mono font-bold text-primary">{ind.code}</td>
                  <td className="p-2.5 text-slate-900">{ind.label}</td>
                  <td className="p-2.5 font-mono tabular-nums text-right">
                    {formatCurrency(ind.openingDebit ?? 0)}
                  </td>
                  <td className="p-2.5 font-mono tabular-nums text-right">
                    {formatCurrency(ind.openingCredit ?? 0)}
                  </td>
                  <td className="p-2.5 font-mono tabular-nums text-right">
                    {formatCurrency(ind.periodDebit ?? 0)}
                  </td>
                  <td className="p-2.5 font-mono tabular-nums text-right">
                    {formatCurrency(ind.periodCredit ?? 0)}
                  </td>
                  <td className="p-2.5 font-mono tabular-nums text-right font-semibold text-primary">
                    {formatCurrency(ind.closingDebit ?? 0)}
                  </td>
                  <td className="p-2.5 font-mono tabular-nums text-right font-semibold text-slate-900">
                    {formatCurrency(ind.closingCredit ?? 0)}
                  </td>
                  <td className="p-2.5 text-center">
                    {ind.hasDrilldown ? (
                      <button
                        type="button"
                        onClick={() => onDrilldown(ind)}
                        className="p-1 rounded bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                      >
                        <Search size={12} />
                      </button>
                    ) : (
                      <span className="text-slate-300">---</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100 font-semibold border-b border-slate-200">
            <tr>
              {isB09 ? (
                <th className="p-3 w-44">Mục / Phần</th>
              ) : (
                <th className="p-3 w-16 text-center">STT</th>
              )}
              <th className="p-3">Chỉ tiêu</th>
              <th className="p-3 w-24 text-center">Mã số</th>
              <th className="p-3 w-44 text-right">Kỳ này / Số cuối năm</th>
              {!isB09 && <th className="p-3 w-44 text-right">Đầu năm / Năm trước</th>}
              <th className="p-3 w-32 text-center">Nguồn</th>
              <th className="p-3 w-20 text-center">Truy vết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleRows.map((ind) => (
              <tr
                key={`${ind.section || ''}-${ind.code}`}
                className={cn('hover:bg-slate-50/70', ind.isBold && 'bg-slate-50/90 font-semibold')}
              >
                {isB09 ? (
                  <td className="p-2.5 text-[11px] font-semibold text-primary">
                    {ind.section || '---'}
                  </td>
                ) : (
                  <td className="p-2.5 text-center text-slate-500">{ind.lineNo || ''}</td>
                )}
                <td className="p-2.5">
                  <div className={cn(ind.isBold ? 'font-bold text-slate-900' : 'text-slate-800')}>
                    {ind.label}
                  </div>
                  {(ind.note || ind.formulaNote) && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {ind.note || ind.formulaNote}
                    </div>
                  )}
                </td>
                <td className="p-2.5 text-center font-mono font-bold text-primary">
                  {ind.code}
                </td>
                <td className="p-2.5 text-right">
                  {ind.hasDrilldown ? (
                    <button
                      type="button"
                      onClick={() => onDrilldown(ind)}
                      className="font-mono tabular-nums font-bold text-primary hover:underline cursor-pointer"
                    >
                      {formatCurrency(ind.value)}
                    </button>
                  ) : (
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {formatCurrency(ind.value)}
                    </span>
                  )}
                </td>
                {!isB09 && (
                  <td className="p-2.5 font-mono tabular-nums text-right text-slate-600">
                    {formatCurrency(ind.priorValue ?? 0)}
                  </td>
                )}
                <td className="p-2.5 text-center">
                  <Badge
                    variant={ind.sourceKind === 'manual_input' ? 'warning' : 'info'}
                    size="sm"
                  >
                    {ind.sourceKind === 'manual_input' ? 'Nhập tay' : 'Tự động'}
                  </Badge>
                </td>
                <td className="p-2.5 text-center">
                  {ind.hasDrilldown ? (
                    <button
                      type="button"
                      onClick={() => onDrilldown(ind)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                    >
                      <Search size={12} />
                      Xem
                    </button>
                  ) : (
                    <span className="text-slate-300">---</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
