'use client';

import React from 'react';
import { Info, Store } from 'lucide-react';
import { POSITION_VISUAL_MODE_MAP, getPositionDoorTypeLabel } from '@/config';
import type { ProductionSheet } from '@/types';

interface OutsourcedSheetSpecPanelProps {
  sheet: ProductionSheet;
}

export function OutsourcedSheetSpecPanel({ sheet }: OutsourcedSheetSpecPanelProps) {
  const qty = Math.max(1, Number(sheet.quantity) || 1);
  const visualModeLabel = POSITION_VISUAL_MODE_MAP[sheet.visualMode ?? 'cad'];

  const rows: Array<{ label: string; value: string; mono?: boolean }> = [
    { label: 'Tên cửa', value: sheet.positionName || sheet.doorName || '—' },
    { label: 'Loại cửa', value: getPositionDoorTypeLabel(sheet.doorType) },
    {
      label: 'Kích thước',
      value: `${Math.round(sheet.width)} × ${Math.round(sheet.height)} mm`,
      mono: true,
    },
    { label: 'Diện tích', value: `${(sheet.areaM2 || 0).toFixed(2)} m²`, mono: true },
    { label: 'Số lượng', value: `${qty} bộ`, mono: true },
    { label: 'Nhà cung cấp', value: sheet.supplierName || 'Chưa gán NCC' },
    { label: 'Chế độ hiển thị', value: visualModeLabel },
  ];

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-control border border-primary/20 bg-white">
        <div className="flex items-center justify-between border-b border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary">
          <span className="flex items-center gap-1.5">
            <Store size={13} /> THÔNG SỐ BỘ CỬA NHẬP NGUYÊN BỘ (NCC)
          </span>
          <span className="text-[10px] font-medium text-primary/80">Nhập nguyên bộ</span>
        </div>

        <dl className="divide-y divide-slate-100 text-xs">
          {rows.map((item) => (
            <div key={item.label} className="grid grid-cols-12 gap-2 px-3 py-2">
              <dt className="col-span-5 text-slate-500">{item.label}</dt>
              <dd
                className={`col-span-7 font-semibold text-slate-800 ${
                  item.mono ? 'tabular-nums' : ''
                }`}
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {sheet.specification && (
        <div className="rounded-control border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs">
          <p className="font-semibold text-slate-700">Quy cách kỹ thuật</p>
          <p className="mt-1 whitespace-pre-line leading-relaxed text-slate-600">
            {sheet.specification}
          </p>
        </div>
      )}

      {sheet.measureNote && (
        <div className="rounded-control border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs">
          <p className="font-semibold text-slate-700">Ghi chú đo đạc</p>
          <p className="mt-1 whitespace-pre-line leading-relaxed text-slate-600">
            {sheet.measureNote}
          </p>
        </div>
      )}

      <div className="flex items-start gap-2 rounded-control border border-primary/20 bg-primary/5 px-3 py-2.5 text-[11px] text-primary">
        <Info size={14} className="mt-0.5 shrink-0" />
        <span>
          Bộ cửa nhập nguyên bộ từ NCC — không tách phôi cắt nhôm, kính, roan tại xưởng.
        </span>
      </div>
    </div>
  );
}
