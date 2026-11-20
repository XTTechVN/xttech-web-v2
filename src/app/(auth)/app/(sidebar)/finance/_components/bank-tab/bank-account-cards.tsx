'use client';

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, BookOpen, Building2 } from 'lucide-react';
import { Badge, Button } from '@/components';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/cn';
import type { BankAccount, VoucherType } from '@/types';

export interface BankAccountCardsProps {
  banks: BankAccount[];
  selectedBankId: number | null;
  onSelectBank: (bankId: number | null) => void;
  onQuickCreate: (voucherType: VoucherType, bankAccountId: number) => void;
  onOpenLedger: (bankAccount: BankAccount) => void;
}

export function BankAccountCards({
  banks,
  selectedBankId,
  onSelectBank,
  onQuickCreate,
  onOpenLedger,
}: BankAccountCardsProps) {
  if (banks.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-white border border-dashed border-slate-300 text-center text-xs text-slate-500">
        Chưa có tài khoản ngân hàng nào. Vào tab <strong>Thiết lập kế toán</strong> để thêm tài khoản ngân hàng công ty.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {banks.map((bank) => {
        const isSelected = selectedBankId === bank.id;
        return (
          <div
            key={bank.id}
            onClick={() => onSelectBank(isSelected ? null : bank.id)}
            className={cn(
              'p-4 rounded-xl bg-white border transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-2xs',
              isSelected
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-slate-200 hover:border-primary/40',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Building2 size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900">{bank.bankName}</span>
                    <Badge variant="primary" size="sm">
                      {bank.code}
                    </Badge>
                  </div>
                  <div className="font-mono text-xs font-semibold text-primary mt-0.5">
                    {bank.accountNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {bank.accountHolder} • TK {bank.glAccountCode || '1121'}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Số dư hiện tại
                </div>
                <div className="text-base font-bold font-mono tabular-nums text-primary">
                  {formatCurrency(bank.currentBalance)}
                </div>
                <div className="text-[10px] font-mono tabular-nums text-slate-400">
                  ĐK: {formatCurrency(bank.openingBalance)}
                </div>
              </div>
            </div>

            <div
              className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  leftIcon={<ArrowDownLeft size={13} />}
                  onClick={() => onQuickCreate('bank_receipt', bank.id)}
                >
                  Báo Có
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="primary"
                  leftIcon={<ArrowUpRight size={13} />}
                  onClick={() => onQuickCreate('bank_payment', bank.id)}
                >
                  Ủy nhiệm chi
                </Button>
              </div>
              <Button
                type="button"
                size="xs"
                variant="ghost"
                leftIcon={<BookOpen size={13} />}
                onClick={() => onOpenLedger(bank)}
              >
                Sổ TGNH
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
