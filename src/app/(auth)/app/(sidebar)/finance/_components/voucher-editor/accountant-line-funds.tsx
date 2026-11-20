'use client';

import React from 'react';
import { Select } from '@/components';
import type { BankAccount } from '@/types';
import type { VoucherDraftLine } from './voucher-editor.constants';

export interface AccountantLineFundsProps {
  line: VoucherDraftLine;
  activeBanks: BankAccount[];
  needDebitBank: boolean;
  needCreditBank: boolean;
  disabled?: boolean;
  onUpdate: (tempId: string, patch: Partial<VoucherDraftLine>) => void;
}

export function AccountantLineFunds({
  line,
  activeBanks,
  needDebitBank,
  needCreditBank,
  disabled = false,
  onUpdate,
}: AccountantLineFundsProps) {
  if (!needDebitBank && !needCreditBank) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-2.5 rounded-lg bg-primary/5 border border-primary/15">
      {needDebitBank && (
        <Select
          label="TK NH Nợ (+ Thu NH)"
          fullWidth
          disabled={disabled}
          value={line.debitBankAccountId ?? ''}
          options={[
            { value: '', label: '-- Theo header --' },
            ...activeBanks.map((b) => ({
              value: b.id,
              label: `${b.bankCode} - ${b.accountNumber}`,
            })),
          ]}
          onChange={(e) =>
            onUpdate(line.tempId, {
              debitBankAccountId: e.target.value ? Number(e.target.value) : null,
            })
          }
        />
      )}
      {needCreditBank && (
        <Select
          label="TK NH Có (- Chi NH)"
          fullWidth
          disabled={disabled}
          value={line.creditBankAccountId ?? ''}
          options={[
            { value: '', label: '-- Theo header --' },
            ...activeBanks.map((b) => ({
              value: b.id,
              label: `${b.bankCode} - ${b.accountNumber}`,
            })),
          ]}
          onChange={(e) =>
            onUpdate(line.tempId, {
              creditBankAccountId: e.target.value ? Number(e.target.value) : null,
            })
          }
        />
      )}
    </div>
  );
}
