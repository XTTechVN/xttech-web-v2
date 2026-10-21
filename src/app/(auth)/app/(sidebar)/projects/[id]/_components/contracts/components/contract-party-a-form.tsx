'use client';

import { Input } from '@/components';
import type { ContractPartyA } from '@/types';

interface ContractPartyAFormProps {
  partyA: ContractPartyA;
  onChange: (field: keyof ContractPartyA, value: string) => void;
}

type PartyField = { key: keyof ContractPartyA; label: string; type?: 'text' | 'date' };

const PARTY_A_FIELDS: PartyField[] = [
  { key: 'name', label: 'Họ và tên / Tên khách hàng' },
  { key: 'identityCard', label: 'Số CCCD' },
  { key: 'birthDate', label: 'Ngày sinh', type: 'date' },
  { key: 'identityIssuedDate', label: 'Ngày cấp CCCD', type: 'date' },
  { key: 'phone', label: 'Số điện thoại' },
  { key: 'address', label: 'Địa chỉ' },
  { key: 'siteAddress', label: 'Địa chỉ công trình' },
];

export function ContractPartyAForm({ partyA, onChange }: ContractPartyAFormProps) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-500">
        Thông tin chỉ áp dụng cho hợp đồng này, không làm thay đổi hồ sơ khách hàng.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PARTY_A_FIELDS.map(({ key, label, type }) => (
          <Input
            key={key}
            label={label}
            type={type}
            value={partyA[key]}
            onChange={(event) => onChange(key, event.target.value)}
            fullWidth
          />
        ))}
      </div>
    </div>
  );
}
