'use client';

import React from 'react';
import { Wallet } from 'lucide-react';
import { Input, Select, Textarea } from '@/components';
import type { VoucherType } from '@/types';
import {
  VOUCHER_FORM_TYPES,
  type VoucherMasterLookups,
} from './voucher-editor.constants';
import type { AccountantHeaderState } from './accountant-voucher-form';
import { VoucherPartnerFields } from './voucher-partner-fields';

export interface AccountantVoucherHeaderProps {
  header: AccountantHeaderState;
  lookups: VoucherMasterLookups;
  disabled?: boolean;
  onChangeHeader: (patch: Partial<AccountantHeaderState>) => void;
}

export function AccountantVoucherHeader({
  header,
  lookups,
  disabled = false,
  onChangeHeader,
}: AccountantVoucherHeaderProps) {
  const isCashType = header.voucherType === 'cash_receipt' || header.voucherType === 'cash_payment';
  const isBankType = header.voucherType === 'bank_receipt' || header.voucherType === 'bank_payment';

  return (
    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          label="Loại chứng từ *"
          fullWidth
          disabled={disabled}
          value={header.voucherType}
          options={VOUCHER_FORM_TYPES}
          onChange={(e) => onChangeHeader({ voucherType: e.target.value as VoucherType })}
        />
        <Input
          label="Ngày chứng từ *"
          type="date"
          fullWidth
          disabled={disabled}
          value={header.voucherDate}
          onChange={(e) => onChangeHeader({ voucherDate: e.target.value })}
        />
        <Input
          label="Ngày hạch toán (Ghi sổ) *"
          type="date"
          fullWidth
          disabled={disabled}
          value={header.postingDate}
          onChange={(e) => onChangeHeader({ postingDate: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        {isCashType && (
          <div className="flex items-center gap-2 h-10 px-3 rounded-lg bg-primary/5 border border-primary/20 text-xs font-semibold text-primary">
            <Wallet size={15} className="shrink-0" />
            <span>Quỹ Tiền mặt duy nhất (TK {lookups.setting?.defaultCashAccountCode || '1111'})</span>
          </div>
        )}

        {isBankType && (
          <Select
            label="Tài khoản ngân hàng"
            fullWidth
            disabled={disabled}
            placeholder="Chọn TK ngân hàng..."
            value={header.bankAccountId ?? ''}
            options={lookups.bankAccounts
              .filter((b) => b.isActive)
              .map((b) => ({
                value: b.id,
                label: `${b.bankCode} - ${b.accountNumber} (${b.bankName})`,
              }))}
            onChange={(e) =>
              onChangeHeader({ bankAccountId: e.target.value ? Number(e.target.value) : null })
            }
          />
        )}

        <Select
          label="Công trình / Dự án"
          fullWidth
          searchable
          disabled={disabled}
          value={header.projectId ?? ''}
          options={[
            { value: '', label: '-- Không gắn --' },
            ...lookups.projects.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` })),
          ]}
          onChange={(e) =>
            onChangeHeader({ projectId: e.target.value ? Number(e.target.value) : null })
          }
        />

        <Select
          label="Phòng ban"
          fullWidth
          disabled={disabled}
          value={header.departmentId ?? ''}
          options={[
            { value: '', label: '-- Không chọn --' },
            ...lookups.departments.map((d) => ({ value: d.id, label: d.name })),
          ]}
          onChange={(e) =>
            onChangeHeader({ departmentId: e.target.value ? Number(e.target.value) : null })
          }
        />
      </div>

      <VoucherPartnerFields
        partnerType={header.partnerType}
        customerId={header.customerId}
        supplierId={header.supplierId}
        employeeId={header.employeeId}
        contactName={header.contactName}
        contactAddress={header.contactAddress}
        showAddress
        lookups={lookups}
        disabled={disabled}
        onChange={(patch) => onChangeHeader(patch)}
      />

      <Textarea
        label="Diễn giải chung *"
        rows={2}
        fullWidth
        disabled={disabled}
        value={header.description}
        placeholder="Nhập diễn giải nghiệp vụ kinh tế phát sinh..."
        onChange={(e) => onChangeHeader({ description: e.target.value })}
      />
    </div>
  );
}
