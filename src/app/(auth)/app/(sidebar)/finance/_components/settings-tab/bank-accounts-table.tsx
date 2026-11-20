'use client';

import React, { useMemo } from 'react';
import { Building2, Edit2, Trash2 } from 'lucide-react';
import { Badge, Button } from '@/components';
import type { BankAccount } from '@/types';
import { formatCurrency } from '@/utils';

interface BankAccountsTableProps {
  bankAccounts: BankAccount[];
  onEditBankAccount: (bank: BankAccount) => void;
  onDeleteBankAccount: (bank: BankAccount) => void;
}

export function BankAccountsTable({
  bankAccounts,
  onEditBankAccount,
  onDeleteBankAccount,
}: BankAccountsTableProps) {
  const { totalOpeningBalance, totalCurrentBalance } = useMemo(
    () =>
      bankAccounts.reduce(
        (acc, b) => ({
          totalOpeningBalance: acc.totalOpeningBalance + b.openingBalance,
          totalCurrentBalance: acc.totalCurrentBalance + b.currentBalance,
        }),
        { totalOpeningBalance: 0, totalCurrentBalance: 0 },
      ),
    [bankAccounts],
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <Building2 size={15} className="text-primary" />
        <h4 className="text-sm font-bold text-slate-900">
          Danh mục Tài khoản Ngân hàng ({bankAccounts.length})
        </h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3">Mã / Số tài khoản</th>
              <th className="p-3">Ngân hàng &amp; Chủ TK</th>
              <th className="p-3">TK Kế toán</th>
              <th className="p-3 text-right">Số dư đầu kỳ</th>
              <th className="p-3 text-right">Số dư hiện tại</th>
              <th className="p-3 text-center">Trạng thái</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bankAccounts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Chưa có tài khoản ngân hàng nào phù hợp bộ lọc.
                </td>
              </tr>
            ) : (
              bankAccounts.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <div className="font-mono font-bold text-primary">{b.code}</div>
                    <div className="font-mono text-slate-900">{b.accountNumber}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">
                      {b.bankCode} - {b.bankName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {b.accountHolder}
                      {b.branchName ? ` • ${b.branchName}` : ''}
                    </div>
                  </td>
                  <td className="p-3 font-mono">{b.glAccountCode || b.glAccountId}</td>
                  <td className="p-3 font-mono tabular-nums text-right text-slate-700">
                    {formatCurrency(b.openingBalance)}
                  </td>
                  <td className="p-3 font-mono tabular-nums text-right font-bold text-primary">
                    {formatCurrency(b.currentBalance)}
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant={b.isActive ? 'success' : 'default'} size="sm">
                      {b.isActive ? 'Đang dùng' : 'Ngưng'}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="xs" onClick={() => onEditBankAccount(b)}>
                        <Edit2 size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onDeleteBankAccount(b)}
                        className="text-rose-600"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-primary/5 text-primary font-bold border-t border-primary/20">
            <tr>
              <td colSpan={3} className="p-3 text-right uppercase">
                Tổng số dư ngân hàng
              </td>
              <td className="p-3 font-mono tabular-nums text-right">
                {formatCurrency(totalOpeningBalance)}
              </td>
              <td className="p-3 font-mono tabular-nums text-right">
                {formatCurrency(totalCurrentBalance)}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
