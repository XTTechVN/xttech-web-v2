'use client';

import React, { useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ProfileBar, ProfileBarCompanion } from '@/types';
import { SELECT_CLASS } from './profile-bar-config';
import { NullableNumberInput } from './nullable-number-input';

interface ParentBarInfo {
  id?: number;
  code: string;
  name: string;
  brandId: number;
  seriesId: number;
}

interface ProfileCompanionsSectionProps {
  companions: ProfileBarCompanion[];
  onChange: (companions: ProfileBarCompanion[]) => void;
  availableBars: ProfileBar[];
  parent: ParentBarInfo;
  isFullCompanion: boolean;
}

const INPUT_CLASS =
  'w-full h-8 px-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-primary transition';
const LABEL_CLASS = 'block text-[10px] font-semibold text-slate-600 mb-1';
const ANGLE_OPTIONS = [45, 90];

export function ProfileCompanionsSection({ companions, onChange, availableBars, parent, isFullCompanion }: ProfileCompanionsSectionProps) {
  const candidateBars = useMemo(() => {
    const rank = (bar: ProfileBar) => (bar.barType?.toUpperCase() === 'OTHER' ? 2 : bar.seriesId === parent.seriesId ? 0 : 1);
    return availableBars
      .filter((bar) => bar.brandId === parent.brandId && bar.id !== parent.id)
      .sort((a, b) => rank(a) - rank(b) || a.code.localeCompare(b.code, 'vi', { sensitivity: 'base' }));
  }, [availableBars, parent.brandId, parent.seriesId, parent.id]);

  const barById = useMemo(() => new Map(availableBars.map((bar) => [bar.id, bar])), [availableBars]);

  const updateCompanion = (index: number, patch: Partial<ProfileBarCompanion>) =>
    onChange(companions.map((companion, i) => (i === index ? { ...companion, ...patch } : companion)));

  const removeCompanion = (index: number) => onChange(companions.filter((_, i) => i !== index));

  const addCompanion = () => onChange([...companions, { companionBarId: 0, code: '', name: '', offsetMm: 0, qty: 1, goc1: null, goc2: null, note: '' }]);

  const handleSelectBar = (index: number, barId: number) => {
    const selectedBar = barById.get(barId);
    const current = companions[index];
    const patch: Partial<ProfileBarCompanion> = { companionBarId: barId };
    if (selectedBar && !isFullCompanion) {
      if (!current.code) patch.code = `${parent.code}+${selectedBar.code}`;
      if (!current.name) patch.name = `${parent.name} + ${selectedBar.name}`;
    }
    updateCompanion(index, patch);
  };

  const handleAngleChange = (index: number, field: 'goc1' | 'goc2', raw: string) =>
    updateCompanion(index, { [field]: raw === '' ? null : Number(raw) });

  return (
    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xs font-bold text-slate-700">⊕ Thanh đính kèm</div>
          <p className="text-[11px] text-slate-500">Combine — mỗi cách có thể gồm nhiều profile kèm, cùng số đo + offset riêng</p>
        </div>
        <button
          type="button"
          onClick={addCompanion}
          className="inline-flex items-center gap-1 px-2.5 h-7 rounded-lg text-[11px] font-semibold text-primary border border-primary/30 hover:bg-primary/10 transition cursor-pointer"
        >
          <Plus size={13} /> Thêm
        </button>
      </div>

      {companions.map((companion, index) => (
        <div key={companion.id ?? `new-${index}`} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end">
            <div>
              <label className={LABEL_CLASS}>
                Thanh kèm theo <span className="text-rose-500">*</span>
              </label>
              <select
                value={companion.companionBarId || ''}
                onChange={(e) => handleSelectBar(index, Number(e.target.value))}
                className={SELECT_CLASS + ' !h-8'}
                required
              >
                <option value="">— Chọn thanh kèm —</option>
                {companion.companionBarId > 0 && !barById.has(companion.companionBarId) && (
                  <option value={companion.companionBarId}>
                    {`${companion.companionCode ?? companion.companionBarId} — ${companion.companionName ?? ''}`}
                  </option>
                )}
                {candidateBars.map((bar) => (
                  <option key={bar.id} value={bar.id}>{`${bar.code} — ${bar.name}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Offset (mm)</label>
              <NullableNumberInput value={companion.offsetMm} onChange={(next) => updateCompanion(index, { offsetMm: next ?? 0 })} step={0.5} />
            </div>
            <div>
              <label className={LABEL_CLASS}>SL (1–10)</label>
              <NullableNumberInput
                value={companion.qty}
                onChange={(next) => updateCompanion(index, { qty: Math.min(10, Math.max(1, Math.round(next ?? 1))) })}
                step={1}
                min={1}
                max={10}
              />
            </div>
            <button
              type="button"
              onClick={() => removeCompanion(index)}
              title="Xóa thanh kèm"
              className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {!isFullCompanion && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className={LABEL_CLASS}>Mã combine</label>
                <input value={companion.code ?? ''} onChange={(e) => updateCompanion(index, { code: e.target.value })} className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Tên combine</label>
                <input value={companion.name ?? ''} onChange={(e) => updateCompanion(index, { name: e.target.value })} className={INPUT_CLASS} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(['goc1', 'goc2'] as const).map((field, angleIndex) => (
              <div key={field}>
                <label className={LABEL_CLASS}>Góc cắt {angleIndex + 1}</label>
                <select
                  value={companion[field] ?? ''}
                  onChange={(e) => handleAngleChange(index, field, e.target.value)}
                  className={SELECT_CLASS + ' !h-8'}
                >
                  <option value="">Theo thanh chính</option>
                  {ANGLE_OPTIONS.map((angle) => (
                    <option key={angle} value={angle}>{angle}°</option>
                  ))}
                </select>
              </div>
            ))}
            <div>
              <label className={LABEL_CLASS}>Ghi chú</label>
              <input value={companion.note ?? ''} onChange={(e) => updateCompanion(index, { note: e.target.value })} className={INPUT_CLASS} />
            </div>
          </div>
        </div>
      ))}

      {companions.length > 0 && (
        <p className="text-[11px] text-teal-800 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
          Mỗi thanh gốc sẽ xuất thêm <strong>{companions.length}</strong> loại profile kèm · offset cộng chiều dài · SL là hệ số nhân · góc nhập sẽ ghi đè
        </p>
      )}
    </div>
  );
}
