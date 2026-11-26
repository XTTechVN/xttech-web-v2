'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { CurrencyInput, Input } from '@/components';
import type { PitContractCategory, PitEntryInput, PitEntryStatus } from '@/types';
import { PIT_CATEGORY_OPTIONS } from './statutory-tax-tab.constants';

export interface PitEntriesTableProps {
  rows: PitEntryInput[];
  onUpdateRow: (idx: number, patch: Partial<PitEntryInput>) => void;
  onRemoveRow: (idx: number) => void;
}

export function PitEntriesTable({
  rows,
  onUpdateRow,
  onRemoveRow,
}: PitEntriesTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-2.5 min-w-[160px]">Họ và tên *</th>
              <th className="p-2.5 w-32">MST / CCCD</th>
              <th className="p-2.5 w-44">Nhóm HĐ</th>
              <th className="p-2.5 w-36 text-right">TN chịu thuế</th>
              <th className="p-2.5 w-32 text-right">Giảm trừ BT+NPT</th>
              <th className="p-2.5 w-32 text-right">Thuế TNCN</th>
              <th className="p-2.5 w-32 text-center">Trạng thái</th>
              <th className="p-2.5 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  Chưa có dữ liệu bảng kê TNCN. Bấm &quot;Đồng bộ từ Sổ cái TK 334 / 3335&quot; hoặc &quot;Nhập Excel Bảng lương&quot;.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="p-2">
                    <Input
                      value={row.fullName}
                      placeholder="Nguyễn Văn A..."
                      className="h-8 text-xs"
                      onChange={(e) => onUpdateRow(idx, { fullName: e.target.value })}
                      fullWidth
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={row.taxCode || row.idNumber || ''}
                      placeholder="MST / CCCD"
                      className="h-8 text-xs font-mono"
                      onChange={(e) => onUpdateRow(idx, { taxCode: e.target.value || null })}
                      fullWidth
                    />
                  </td>
                  <td className="p-2">
                    <select
                      value={row.contractCategory}
                      onChange={(e) =>
                        onUpdateRow(idx, {
                          contractCategory: e.target.value as PitContractCategory,
                        })
                      }
                      className="h-8 px-2 rounded border border-slate-200 bg-white text-xs w-full"
                    >
                      {PIT_CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <CurrencyInput
                      value={row.grossTaxableIncome || ''}
                      className="h-8 text-xs font-mono tabular-nums text-right"
                      onChange={(val) => onUpdateRow(idx, { grossTaxableIncome: val })}
                    />
                  </td>
                  <td className="p-2">
                    <CurrencyInput
                      value={(row.personalDeduction || 0) + (row.dependentDeduction || 0) || ''}
                      className="h-8 text-xs font-mono tabular-nums text-right"
                      onChange={(val) =>
                        onUpdateRow(idx, { personalDeduction: val, dependentDeduction: 0 })
                      }
                    />
                  </td>
                  <td className="p-2">
                    <CurrencyInput
                      value={row.withheldPitAmount || ''}
                      className="h-8 text-xs font-mono tabular-nums text-right font-semibold text-primary"
                      onChange={(val) => onUpdateRow(idx, { withheldPitAmount: val })}
                    />
                  </td>
                  <td className="p-2 text-center">
                    <select
                      value={row.status || 'verified'}
                      onChange={(e) =>
                        onUpdateRow(idx, { status: e.target.value as PitEntryStatus })
                      }
                      className="h-8 px-2 rounded border border-slate-200 bg-white text-[11px]"
                    >
                      <option value="draft_needs_payroll_reconcile">Nháp cần ĐC</option>
                      <option value="verified">Đã xác nhận</option>
                    </select>
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveRow(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
