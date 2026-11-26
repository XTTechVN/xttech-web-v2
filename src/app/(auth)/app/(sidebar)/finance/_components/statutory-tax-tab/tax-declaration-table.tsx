'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Badge, CurrencyInput } from '@/components';
import type { StatutoryIndicatorItem } from '@/types';
import { cn, formatCurrency } from '@/utils';

export interface TaxDeclarationTableProps {
  indicators: StatutoryIndicatorItem[];
  manualOverrides: Record<string, number>;
  isLockedFiled: boolean;
  onChangeOverride: (code: string, value: number) => void;
  onDrilldown: (item: StatutoryIndicatorItem) => void;
}

export function TaxDeclarationTable({
  indicators,
  manualOverrides,
  isLockedFiled,
  onChangeOverride,
  onDrilldown,
}: TaxDeclarationTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3 w-28">Mã CT</th>
              <th className="p-3">Tên chỉ tiêu</th>
              <th className="p-3 w-36 text-center">Nguồn</th>
              <th className="p-3 w-52 text-right">Giá trị (VNĐ)</th>
              <th className="p-3 w-24 text-center">Truy vết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {indicators.map((ind) => {
              const effectiveVal =
                ind.editable && manualOverrides[ind.code] !== undefined
                  ? manualOverrides[ind.code]
                  : ind.value;
              return (
                <tr
                  key={`${ind.section || ''}-${ind.code}`}
                  className={cn(
                    'hover:bg-slate-50/70',
                    ind.isBold && 'bg-slate-50 font-semibold',
                  )}
                >
                  <td className="p-2.5 font-mono font-bold text-primary">
                    <div>[{ind.code}]</div>
                    {ind.section && (
                      <div className="text-[10px] font-normal text-slate-500">
                        {ind.section}
                      </div>
                    )}
                  </td>
                  <td className="p-2.5">
                    <div
                      className={cn(
                        ind.isBold
                          ? 'font-bold text-slate-900'
                          : 'font-medium text-slate-900',
                      )}
                    >
                      {ind.label}
                    </div>
                    {(ind.note || ind.formulaNote) && (
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {ind.note || ind.formulaNote}
                      </div>
                    )}
                  </td>
                  <td className="p-2.5 text-center">
                    <Badge
                      variant={ind.sourceKind === 'manual_input' ? 'warning' : 'info'}
                      size="sm"
                    >
                      {ind.sourceKind === 'manual_input' ? 'Nhập tay' : 'Tự động tính'}
                    </Badge>
                  </td>
                  <td className="p-2.5 text-right">
                    {ind.editable && !isLockedFiled ? (
                      <CurrencyInput
                        value={effectiveVal || ''}
                        className="h-8 text-xs font-mono tabular-nums text-right"
                        onChange={(val) => onChangeOverride(ind.code, val)}
                      />
                    ) : ind.hasDrilldown ? (
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
