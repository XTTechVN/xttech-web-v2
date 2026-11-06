'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ProfileBarVariant } from '@/types';
import { BAR_TYPE_OPTIONS, DEDUCTION_FIELDS, SELECT_CLASS } from './profile-bar-config';
import { NullableNumberInput } from './nullable-number-input';

interface ProfileVariantsSectionProps {
  variants: ProfileBarVariant[];
  onChange: (variants: ProfileBarVariant[]) => void;
}

const INPUT_CLASS =
  'w-full h-8 px-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-primary transition';

const OVERRIDE_FIELDS: Array<{ name: 'sectionHeightMm' | (typeof DEDUCTION_FIELDS)[number]['name']; label: string }> = [
  { name: 'sectionHeightMm', label: 'Chiều cao (mm)' },
  ...DEDUCTION_FIELDS,
];

export function ProfileVariantsSection({ variants, onChange }: ProfileVariantsSectionProps) {
  const updateVariant = (index: number, patch: Partial<ProfileBarVariant>) =>
    onChange(variants.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)));

  const removeVariant = (index: number) => onChange(variants.filter((_, i) => i !== index));

  const addVariant = () => onChange([...variants, { role: 'FRAME', code: '', name: '', note: '' }]);

  return (
    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xs font-bold text-slate-700">🔀 Biến thể</div>
          <p className="text-[11px] text-slate-500">Thông số khi dùng theo vai trò đã chọn (để trống = theo thanh gốc)</p>
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center gap-1 px-2.5 h-7 rounded-lg text-[11px] font-semibold text-primary border border-primary/30 hover:bg-primary/10 transition cursor-pointer"
        >
          <Plus size={13} /> Thêm biến thể
        </button>
      </div>

      {variants.map((variant, index) => (
        <div key={variant.id ?? `new-${index}`} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr_1.4fr_1.4fr_auto] gap-2 items-end">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Vai trò</label>
              <select value={variant.role} onChange={(e) => updateVariant(index, { role: e.target.value })} className={SELECT_CLASS + ' !h-8'}>
                {BAR_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                Mã biến thể <span className="text-rose-500">*</span>
              </label>
              <input value={variant.code} onChange={(e) => updateVariant(index, { code: e.target.value })} className={INPUT_CLASS} required />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Tên biến thể</label>
              <input value={variant.name ?? ''} onChange={(e) => updateVariant(index, { name: e.target.value })} className={INPUT_CLASS} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Ghi chú</label>
              <input value={variant.note ?? ''} onChange={(e) => updateVariant(index, { note: e.target.value })} className={INPUT_CLASS} />
            </div>
            <button
              type="button"
              onClick={() => removeVariant(index)}
              title="Xóa biến thể"
              className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {OVERRIDE_FIELDS.map(({ name, label }) => (
              <div key={name}>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">{label}</label>
                <NullableNumberInput
                  value={variant[name]}
                  onChange={(next) => updateVariant(index, { [name]: next })}
                  placeholder="Theo thanh gốc"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
