'use client';

import React, { useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { CurrencyInput } from '@/components';
import { MATURITY_TERM_OPTIONS } from '@/config/finance';
import { formatCurrency } from '@/utils/currency';
import type {
  Account,
  BankAccount,
  Customer,
  Employee,
  MaturityTerm,
  Project,
  WarehouseSupplier,
} from '@/types';
import type { OpeningDraftRow } from './modals.constants';

export type { OpeningDraftRow };

const MATURITY_TRACKED_PREFIXES = ['128', '131', '138', '242', '244', '331', '338', '341', '344'];

export interface OpeningBalanceTableProps {
  rows: OpeningDraftRow[];
  accounts: Account[];
  totalDebit: number;
  totalCredit: number;
  bankAccounts: BankAccount[];
  customers: Customer[];
  suppliers: WarehouseSupplier[];
  employees: Employee[];
  projects: Project[];
  onUpdateRow: (rowKey: string, patch: Partial<OpeningDraftRow>) => void;
  onRemoveRow: (rowKey: string) => void;
}

export function OpeningBalanceTable({
  rows,
  accounts,
  totalDebit,
  totalCredit,
  bankAccounts,
  customers,
  suppliers,
  employees,
  projects,
  onUpdateRow,
  onRemoveRow,
}: OpeningBalanceTableProps) {
  const accountById = useMemo(
    () => new Map(accounts.map((a) => [a.id, a])),
    [accounts],
  );
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden max-h-[48vh] overflow-y-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-10 border-b border-slate-200">
          <tr>
            <th className="p-2.5 w-24">Mã TK</th>
            <th className="p-2.5">Tên tài khoản &amp; Đối tượng chi tiết</th>
            <th className="p-2.5 w-40 text-right">Dư Nợ đầu kỳ</th>
            <th className="p-2.5 w-40 text-right">Dư Có đầu kỳ</th>
            <th className="p-2.5 w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const acc = accountById.get(row.accountId);
            const showEmployee =
              Boolean(acc?.trackEmployee) ||
              Boolean(row.employeeId) ||
              row.accountCode.startsWith('141') ||
              row.accountCode.startsWith('334');
            const showMaturity =
              Boolean(row.maturityTerm) ||
              MATURITY_TRACKED_PREFIXES.some((p) => row.accountCode.startsWith(p));

            return (
              <tr key={row.rowKey} className="hover:bg-slate-50/70">
                <td className="p-2 font-mono font-bold text-primary align-top pt-3">
                  {row.accountCode}
                </td>
                <td className="p-2 space-y-1">
                  <div className="font-medium text-slate-800">{row.accountName}</div>
                  {row.accountCode.startsWith('111') && (
                    <div className="text-[11px] text-slate-500">
                      Quỹ Tiền mặt duy nhất (TK 1111)
                    </div>
                  )}
                  {(acc?.trackBankAccount || row.accountCode.startsWith('112')) && (
                    <select
                      value={row.bankAccountId ?? ''}
                      onChange={(e) =>
                        onUpdateRow(row.rowKey, {
                          bankAccountId: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="h-7 px-2 rounded border border-slate-200 text-[11px] bg-white w-full sm:w-56"
                    >
                      <option value="">-- TK Ngân hàng (tuỳ chọn) --</option>
                      {bankAccounts.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankCode} - {b.accountNumber}
                        </option>
                      ))}
                    </select>
                  )}
                  {(acc?.trackCustomer || row.accountCode.startsWith('131')) && (
                    <select
                      value={row.customerId ?? ''}
                      onChange={(e) =>
                        onUpdateRow(row.rowKey, {
                          customerId: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="h-7 px-2 rounded border border-slate-200 text-[11px] bg-white w-full sm:w-56"
                    >
                      <option value="">-- Khách hàng (tuỳ chọn) --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {(acc?.trackSupplier || row.accountCode.startsWith('331')) && (
                    <select
                      value={row.supplierId ?? ''}
                      onChange={(e) =>
                        onUpdateRow(row.rowKey, {
                          supplierId: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="h-7 px-2 rounded border border-slate-200 text-[11px] bg-white w-full sm:w-56"
                    >
                      <option value="">-- Nhà cung cấp (tuỳ chọn) --</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {showEmployee && (
                    <select
                      value={row.employeeId ?? ''}
                      onChange={(e) =>
                        onUpdateRow(row.rowKey, {
                          employeeId: e.target.value || null,
                        })
                      }
                      className="h-7 px-2 rounded border border-slate-200 text-[11px] bg-white w-full sm:w-56"
                    >
                      <option value="">-- Nhân viên (tuỳ chọn) --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName || emp.username}
                        </option>
                      ))}
                    </select>
                  )}
                  {(acc?.trackProject || row.accountCode.startsWith('154')) && (
                    <select
                      value={row.projectId ?? ''}
                      onChange={(e) =>
                        onUpdateRow(row.rowKey, {
                          projectId: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="h-7 px-2 rounded border border-slate-200 text-[11px] bg-white w-full sm:w-56"
                    >
                      <option value="">-- Công trình dở dang (tuỳ chọn) --</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.code} - {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {showMaturity && (
                    <select
                      value={row.maturityTerm ?? ''}
                      onChange={(e) =>
                        onUpdateRow(row.rowKey, {
                          maturityTerm: (e.target.value as MaturityTerm) || null,
                        })
                      }
                      className="h-7 px-2 rounded border border-slate-200 text-[11px] bg-white w-full sm:w-56"
                    >
                      <option value="">-- Kỳ hạn B01-DN (Ngắn / Dài hạn) --</option>
                      {MATURITY_TERM_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="p-2">
                  <CurrencyInput
                    value={row.debitBalance || ''}
                    className="h-8 text-xs font-mono tabular-nums text-right"
                    onChange={(v) =>
                      onUpdateRow(row.rowKey, {
                        debitBalance: v,
                        creditBalance: v > 0 ? 0 : row.creditBalance,
                      })
                    }
                  />
                </td>
                <td className="p-2">
                  <CurrencyInput
                    value={row.creditBalance || ''}
                    className="h-8 text-xs font-mono tabular-nums text-right"
                    onChange={(v) =>
                      onUpdateRow(row.rowKey, {
                        creditBalance: v,
                        debitBalance: v > 0 ? 0 : row.debitBalance,
                      })
                    }
                  />
                </td>
                <td className="p-2 text-center">
                  <button
                    type="button"
                    onClick={() => onRemoveRow(row.rowKey)}
                    className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                    title="Xóa dòng"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-primary/5 border-t border-primary/20 sticky bottom-0">
          <tr>
            <td colSpan={2} className="p-2.5 text-right font-semibold text-primary">
              TỔNG CỘNG SỐ DƯ ĐẦU KỲ:
            </td>
            <td className="p-2.5 font-mono tabular-nums text-right font-bold text-primary">
              {formatCurrency(totalDebit)}
            </td>
            <td className="p-2.5 font-mono tabular-nums text-right font-bold text-primary">
              {formatCurrency(totalCredit)}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
