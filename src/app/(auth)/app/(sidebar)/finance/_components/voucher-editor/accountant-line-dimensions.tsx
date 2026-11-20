'use client';

import React from 'react';
import { Select } from '@/components';
import type { VoucherDraftLine, VoucherMasterLookups } from './voucher-editor.constants';

export interface AccountantLineDimensionsProps {
  line: VoucherDraftLine;
  lookups: VoucherMasterLookups;
  disabled?: boolean;
  onUpdate: (tempId: string, patch: Partial<VoucherDraftLine>) => void;
}

export function AccountantLineDimensions({
  line,
  lookups,
  disabled = false,
  onUpdate,
}: AccountantLineDimensionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
      <Select
        label="Công trình / Dự án"
        fullWidth
        searchable
        disabled={disabled}
        value={line.projectId ?? ''}
        options={[
          { value: '', label: '-- Không chọn --' },
          ...lookups.projects.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` })),
        ]}
        onChange={(e) =>
          onUpdate(line.tempId, { projectId: e.target.value ? Number(e.target.value) : null })
        }
      />
      <Select
        label="Khoản mục chi phí"
        fullWidth
        searchable
        disabled={disabled}
        value={line.costItemId ?? ''}
        options={[
          { value: '', label: '-- Không chọn --' },
          ...lookups.costItems
            .filter((c) => c.isActive)
            .map((c) => ({ value: c.id, label: `${c.code} - ${c.name}` })),
        ]}
        onChange={(e) =>
          onUpdate(line.tempId, { costItemId: e.target.value ? Number(e.target.value) : null })
        }
      />
      <Select
        label="Phòng ban / Bộ phận"
        fullWidth
        disabled={disabled}
        value={line.departmentId ?? ''}
        options={[
          { value: '', label: '-- Không chọn --' },
          ...lookups.departments.map((d) => ({ value: d.id, label: d.name })),
        ]}
        onChange={(e) =>
          onUpdate(line.tempId, { departmentId: e.target.value ? Number(e.target.value) : null })
        }
      />
      <Select
        label="Khách hàng (131)"
        fullWidth
        searchable
        disabled={disabled}
        value={line.customerId ?? ''}
        options={[
          { value: '', label: '-- Không chọn --' },
          ...lookups.customers.map((c) => ({ value: c.id, label: c.name })),
        ]}
        onChange={(e) =>
          onUpdate(line.tempId, { customerId: e.target.value ? Number(e.target.value) : null })
        }
      />
      <Select
        label="Nhà cung cấp (331)"
        fullWidth
        searchable
        disabled={disabled}
        value={line.supplierId ?? ''}
        options={[
          { value: '', label: '-- Không chọn --' },
          ...lookups.suppliers.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` })),
        ]}
        onChange={(e) =>
          onUpdate(line.tempId, { supplierId: e.target.value ? Number(e.target.value) : null })
        }
      />
      <Select
        label="Nhân viên (141 / 334)"
        fullWidth
        searchable
        disabled={disabled}
        value={line.employeeId ?? ''}
        options={[
          { value: '', label: '-- Không chọn --' },
          ...lookups.employees.map((em) => ({ value: em.id, label: em.fullName || em.username })),
        ]}
        onChange={(e) => onUpdate(line.tempId, { employeeId: e.target.value || null })}
      />
      <Select
        label="Vật tư kho (152 / 153)"
        fullWidth
        searchable
        disabled={disabled}
        value={line.warehouseItemId ?? ''}
        options={[
          { value: '', label: '-- Không chọn --' },
          ...lookups.warehouseItems.map((w) => ({
            value: w.id,
            label: `${w.itemCode} - ${w.itemName}`,
          })),
        ]}
        onChange={(e) =>
          onUpdate(line.tempId, {
            warehouseItemId: e.target.value ? Number(e.target.value) : null,
          })
        }
      />
    </div>
  );
}
