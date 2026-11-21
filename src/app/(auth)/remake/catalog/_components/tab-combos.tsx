'use client';

import { createAccessoryCombo, deleteAccessoryCombo, getAccessoryCombos, updateAccessoryCombo } from '@/actions';
import type { AccessoryCombo } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Badge } from '../../_components/badge';
import { ACTIVE } from './brand-sheet';
import { ComboItems } from './combo-items';
import { EntityTab, type EntityConfig } from './entity-tab';

const APPLY = [
  { value: 'khung', label: 'Khung' },
  { value: 'canh', label: 'Cánh' },
  { value: 'huong_mo', label: 'Hướng mở' },
  { value: 'khac', label: 'Khác' },
];

// Combo phụ kiện: thông tin chung và danh sách phụ kiện trong combo.
export function TabCombos() {
  const cfg: EntityConfig<AccessoryCombo> = {
    queryKey: 'accessory-combos',
    noun: 'combo phụ kiện',
    load: async () => (await getAccessoryCombos({ limit: 500 })).items,
    title: (c) => c.name,
    sub: (c) => `${c.code} · ${c.comboItems?.length ?? 0} món · ${formatCurrency(c.totalComboPrice)}`,
    cols: [
      { key: 'code', header: 'Mã', fit: true, cell: (c) => c.code },
      { key: 'items', header: 'Số món', fit: true, align: 'right', cell: (c) => c.comboItems?.length ?? 0 },
      { key: 'total', header: 'Tổng giá', fit: true, align: 'right', cell: (c) => formatCurrency(c.totalComboPrice) },
    ],
    badge: (c) => <Badge tone="primary">{APPLY.find((a) => a.value === (c.applyFor ?? 'khung'))?.label ?? 'Khác'}</Badge>,
    inactive: (c) => !c.isActive,
    fields: [
      { key: 'code', label: 'Mã', required: true, half: true },
      { key: 'applyFor', label: 'Áp dụng cho', type: 'select', options: APPLY, half: true },
      { key: 'name', label: 'Tên combo', required: true },
      { key: 'description', label: 'Mô tả' },
      { key: 'isActive', label: 'Trạng thái', type: 'select', options: ACTIVE },
    ],
    toForm: (c) => ({
      code: c?.code ?? '',
      applyFor: c?.applyFor ?? 'khung',
      name: c?.name ?? '',
      description: c?.description ?? '',
      isActive: c?.isActive === false ? '0' : '1',
    }),
    save: (f, c) => {
      const body = {
        code: f.code.trim(),
        name: f.name.trim(),
        applyFor: f.applyFor,
        description: f.description.trim() || null,
        isActive: f.isActive === '1',
      };
      return c ? updateAccessoryCombo(c.id, body) : createAccessoryCombo({ ...body, comboItems: [], totalComboPrice: 0 });
    },
    remove: (c) => deleteAccessoryCombo(c.id),
    extra: (c, _f, close) => (
      <>
        <ul className="divide-y divide-rm-line rounded-rm border border-rm-line text-sm">
          {(c.comboItems ?? []).length === 0 && <li className="px-3 py-2 text-rm-muted">Chưa có phụ kiện trong combo</li>}
          {(c.comboItems ?? []).map((i) => (
            <li key={i.accessoryId} className="flex items-center gap-2 px-3 py-2">
              <span className="min-w-0 flex-1 truncate">{i.accessoryName ?? `#${i.accessoryId}`}</span>
              <span className="flex-none text-rm-muted">× {i.quantity}</span>
            </li>
          ))}
        </ul>
        <ComboItems combo={c} onDone={close} />
      </>
    ),
  };
  return <EntityTab cfg={cfg} />;
}
