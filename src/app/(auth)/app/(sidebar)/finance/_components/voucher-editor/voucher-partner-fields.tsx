'use client';

import React, { useMemo } from 'react';
import { Input, Select } from '@/components';
import { PARTNER_TYPE_OPTIONS } from '@/config/finance';
import type { PartnerType } from '@/types';
import type { VoucherMasterLookups } from './voucher-editor.constants';

export interface VoucherPartnerFieldsProps {
  partnerType: PartnerType;
  customerId: number | null;
  supplierId: number | null;
  employeeId: string | null;
  contactName: string;
  contactAddress?: string;
  showAddress?: boolean;
  contactLabel?: string;
  lookups: VoucherMasterLookups;
  disabled?: boolean;
  onChange: (patch: {
    partnerType?: PartnerType;
    customerId?: number | null;
    supplierId?: number | null;
    employeeId?: string | null;
    contactName?: string;
    contactAddress?: string;
  }) => void;
}

export function VoucherPartnerFields({
  partnerType,
  customerId,
  supplierId,
  employeeId,
  contactName,
  contactAddress = '',
  showAddress = false,
  contactLabel = 'Người nộp / nhận',
  lookups,
  disabled = false,
  onChange,
}: VoucherPartnerFieldsProps) {
  const partnerOptions = useMemo(() => {
    if (partnerType === 'customer') {
      return lookups.customers.map((c) => ({ value: c.id, label: c.name }));
    }
    if (partnerType === 'supplier') {
      return lookups.suppliers.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` }));
    }
    if (partnerType === 'employee') {
      return lookups.employees.map((e) => ({ value: e.id, label: e.fullName || e.username }));
    }
    return [];
  }, [partnerType, lookups.customers, lookups.suppliers, lookups.employees]);

  const selectedValue =
    partnerType === 'customer'
      ? customerId || ''
      : partnerType === 'supplier'
        ? supplierId || ''
        : partnerType === 'employee'
          ? employeeId || ''
          : '';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
      <Select
        label="Nhóm đối tượng"
        fullWidth
        disabled={disabled}
        value={partnerType}
        options={PARTNER_TYPE_OPTIONS}
        onChange={(e) =>
          onChange({
            partnerType: e.target.value as PartnerType,
            customerId: null,
            supplierId: null,
            employeeId: null,
          })
        }
      />

      {partnerType !== 'other' && (
        <Select
          label="Đối tượng"
          fullWidth
          searchable
          disabled={disabled}
          placeholder="Chọn đối tượng..."
          value={selectedValue}
          options={[{ value: '', label: '-- Chọn --' }, ...partnerOptions]}
          onChange={(e) => {
            const raw = e.target.value;
            const matched = partnerOptions.find((o) => String(o.value) === String(raw));
            if (partnerType === 'customer') {
              onChange({
                customerId: raw ? Number(raw) : null,
                contactName: matched?.label || contactName,
              });
            } else if (partnerType === 'supplier') {
              onChange({
                supplierId: raw ? Number(raw) : null,
                contactName: matched?.label || contactName,
              });
            } else {
              onChange({
                employeeId: raw || null,
                contactName: matched?.label || contactName,
              });
            }
          }}
        />
      )}

      <div className={partnerType === 'other' ? (showAddress ? 'sm:col-span-2' : 'sm:col-span-3') : showAddress ? '' : 'sm:col-span-2'}>
        <Input
          label={contactLabel}
          fullWidth
          disabled={disabled}
          value={contactName}
          placeholder="Họ tên người giao dịch..."
          onChange={(e) => onChange({ contactName: e.target.value })}
        />
      </div>

      {showAddress && (
        <Input
          label="Địa chỉ / STK đối tác"
          fullWidth
          disabled={disabled}
          value={contactAddress}
          placeholder="Địa chỉ hoặc STK thụ hưởng..."
          onChange={(e) => onChange({ contactAddress: e.target.value })}
        />
      )}
    </div>
  );
}
