'use client';

import { DataTable, Tag, type Column, type TagTone } from '@/components-remake';
import { getDoorTypeConfig, type AccessoryCombo } from '@/types';
import { formatCurrency } from '@/utils';

export const APPLY_FOR: Record<string, { label: string; tone: TagTone }> = {
  khung: { label: 'Khung', tone: 'slate' },
  canh: { label: 'Cánh', tone: 'blue' },
  huong_mo: { label: 'Hướng mở', tone: 'amber' },
  khac: { label: 'Khác', tone: 'slate' },
};

export const OPENING_TYPE: Record<string, string> = {
  vach_co_dinh: 'Vách cố định',
  '2_canh_mo': '2 cánh mở',
  '1_canh_quay_trai': '1 cánh quay (trái)',
  '1_canh_quay_phai': '1 cánh quay (phải)',
  mo_hat_khong_song: 'Mở hất',
  mo_lat_khong_song: 'Mở lật',
  lat_xuong: 'Lật xuống',
  quay_va_lat: 'Quay & Lật',
  canh_truot_luoi: 'Trượt lưới',
  canh_truot_ngang: 'Trượt ngang',
};

export const applyOf = (c: AccessoryCombo) => APPLY_FOR[c.applyFor || 'khung'] ?? APPLY_FOR.khac;
const status = (c: AccessoryCombo) => (c.isActive ? <Tag tone="green">Hoạt động</Tag> : <Tag>Tạm ngưng</Tag>);
const count = (c: AccessoryCombo) => `${c.comboItems?.length ?? 0} món`;

const COLUMNS: Column<AccessoryCombo>[] = [
  {
    key: 'name',
    header: 'Gói combo',
    className: 'max-w-0',
    render: (c) => (
      <>
        <span className="block truncate text-sm font-semibold text-slate-900" title={c.name}>
          {c.name}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5">
          <Tag tone="blue">{c.code}</Tag>
          {c.isDefault && <Tag tone="amber">Mặc định</Tag>}
        </span>
      </>
    ),
  },
  { key: 'apply', header: 'Dành cho', className: 'w-36', render: (c) => <Tag tone={applyOf(c).tone}>{applyOf(c).label}</Tag> },
  { key: 'count', header: 'Số món', className: 'w-24 whitespace-nowrap', render: count },
  { key: 'price', header: 'Tổng giá', className: 'w-36 whitespace-nowrap text-right tabular-nums', render: (c) => formatCurrency(c.totalComboPrice || 0) },
  {
    key: 'doors',
    header: 'Loại cửa',
    className: 'max-w-0 truncate',
    wide: true,
    render: (c) => (c.doorTypes?.filter(Boolean).map((d) => getDoorTypeConfig(d).label).join(', ') || '–'),
  },
  { key: 'status', header: 'Trạng thái', className: 'w-32', render: status },
];

interface Props {
  rows: AccessoryCombo[];
  onOpen: (c: AccessoryCombo) => void;
}

export function ComboList({ rows, onOpen }: Props) {
  return (
    <DataTable
      caption="Danh sách gói combo phụ kiện của hãng đang chọn. Bấm vào một dòng để xem chi tiết."
      rows={rows}
      rowKey={(c) => c.id}
      columns={COLUMNS}
      onOpen={onOpen}
      card={(c) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{c.name}</p>
            <span className="flex-none">{status(c)}</span>
          </div>
          <p className="flex flex-wrap items-center gap-1.5">
            <Tag tone="blue">{c.code}</Tag>
            <Tag tone={applyOf(c).tone}>{applyOf(c).label}</Tag>
            {c.isDefault && <Tag tone="amber">Mặc định</Tag>}
          </p>
          <p className="text-xs text-slate-500">
            {count(c)} · {formatCurrency(c.totalComboPrice || 0)}
          </p>
        </div>
      )}
    />
  );
}
