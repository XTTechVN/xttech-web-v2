'use client';

import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Trash2 } from 'lucide-react';
import { Badge, Checkbox, CurrencyInput, Input, Select } from '@/components';
import { getTaxDeductibleBadge, VOUCHER_LINE_KIND_MAP } from '@/config/finance';
import { cn } from '@/utils/cn';
import type { VoucherLineKind } from '@/types';
import {
  isBankGlCode,
  type VoucherDraftLine,
  type VoucherMasterLookups,
} from './voucher-editor.constants';
import { AccountantLineFunds } from './accountant-line-funds';
import { AccountantLineDimensions } from './accountant-line-dimensions';

export interface AccountantLineRowProps {
  line: VoucherDraftLine;
  index: number;
  lookups: VoucherMasterLookups;
  canDelete: boolean;
  disabled?: boolean;
  onUpdate: (tempId: string, patch: Partial<VoucherDraftLine>) => void;
  onDuplicate: (line: VoucherDraftLine) => void;
  onRemove: (tempId: string) => void;
}

export function AccountantLineRow({
  line,
  index,
  lookups,
  canDelete,
  disabled = false,
  onUpdate,
  onDuplicate,
  onRemove,
}: AccountantLineRowProps) {
  const [showDimensions, setShowDimensions] = useState(
    Boolean(
      line.projectId ||
        line.departmentId ||
        line.costItemId ||
        line.customerId ||
        line.supplierId ||
        line.employeeId ||
        line.warehouseItemId,
    ),
  );

  const accountOptions = useMemo(
    () =>
      lookups.accounts
        .filter((a) => a.isPostable && a.isActive)
        .map((a) => ({ value: a.id, label: `${a.accountCode} - ${a.name}` })),
    [lookups.accounts],
  );

  const debitAcc = useMemo(
    () => lookups.accounts.find((a) => a.id === line.debitAccountId) || null,
    [lookups.accounts, line.debitAccountId],
  );
  const creditAcc = useMemo(
    () => lookups.accounts.find((a) => a.id === line.creditAccountId) || null,
    [lookups.accounts, line.creditAccountId],
  );

  const activeBanks = useMemo(
    () => lookups.bankAccounts.filter((b) => b.isActive),
    [lookups.bankAccounts],
  );

  const taxBadge = getTaxDeductibleBadge(line.isTaxDeductible);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2.5 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold">
            {index + 1}
          </span>
          <div className="w-32">
            <Select
              fullWidth
              disabled={disabled}
              className="h-8 text-xs"
              value={line.lineKind}
              options={[
                { value: 'principal', label: VOUCHER_LINE_KIND_MAP.principal.shortLabel || 'Chính' },
                { value: 'vat', label: VOUCHER_LINE_KIND_MAP.vat.shortLabel || 'GTGT' },
              ]}
              onChange={(e) => onUpdate(line.tempId, { lineKind: e.target.value as VoucherLineKind })}
            />
          </div>
          <Checkbox
            label="Được trừ thuế TNDN"
            disabled={disabled}
            checked={line.isTaxDeductible}
            onChange={(e) => onUpdate(line.tempId, { isTaxDeductible: e.target.checked })}
            labelClassName="text-xs text-slate-700 font-medium"
          />
          <Badge variant={taxBadge.variant} size="sm">
            {taxBadge.shortLabel || taxBadge.label}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowDimensions((prev) => !prev)}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer',
              showDimensions ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            <span>Chi tiết quản trị</span>
            {showDimensions ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onDuplicate(line)}
            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-md cursor-pointer disabled:opacity-40"
            title="Nhân bản dòng"
          >
            <Copy size={14} />
          </button>
          {canDelete && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onRemove(line.tempId)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer disabled:opacity-40"
              title="Xóa dòng"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
        <div className="md:col-span-4">
          <Input
            label="Diễn giải dòng *"
            fullWidth
            disabled={disabled}
            value={line.description}
            placeholder="VD: Mua nhôm Xingfa nhập xưởng..."
            onChange={(e) => onUpdate(line.tempId, { description: e.target.value })}
          />
        </div>
        <div className="md:col-span-3">
          <Select
            label="TK Nợ *"
            fullWidth
            searchable
            disabled={disabled}
            placeholder="Chọn TK Nợ..."
            value={line.debitAccountId || ''}
            options={accountOptions}
            onChange={(e) =>
              onUpdate(line.tempId, { debitAccountId: e.target.value ? Number(e.target.value) : 0 })
            }
          />
        </div>
        <div className="md:col-span-3">
          <Select
            label="TK Có *"
            fullWidth
            searchable
            disabled={disabled}
            placeholder="Chọn TK Có..."
            value={line.creditAccountId || ''}
            options={accountOptions}
            onChange={(e) =>
              onUpdate(line.tempId, { creditAccountId: e.target.value ? Number(e.target.value) : 0 })
            }
          />
        </div>
        <div className="md:col-span-2">
          <CurrencyInput
            label="Số tiền (VNĐ) *"
            fullWidth
            disabled={disabled}
            value={line.amount || ''}
            placeholder="0"
            className="font-mono tabular-nums text-right font-semibold text-primary"
            onChange={(val) => onUpdate(line.tempId, { amount: val })}
          />
        </div>
      </div>

      <AccountantLineFunds
        line={line}
        activeBanks={activeBanks}
        needDebitBank={isBankGlCode(debitAcc?.accountCode) || Boolean(debitAcc?.trackBankAccount)}
        needCreditBank={isBankGlCode(creditAcc?.accountCode) || Boolean(creditAcc?.trackBankAccount)}
        disabled={disabled}
        onUpdate={onUpdate}
      />

      {showDimensions && (
        <AccountantLineDimensions
          line={line}
          lookups={lookups}
          disabled={disabled}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
