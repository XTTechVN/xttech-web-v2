'use client';

import React, { useMemo } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { ProfileBar, ProfileBarCompanion } from '@/types';
import { SELECT_CLASS } from './profile-bar-config';
import { NullableNumberInput } from './nullable-number-input';
import {
  type CombineWayGroup,
  groupCompanionsByWay,
  flattenCombineWayGroups,
  buildSuggestedCombineCode,
  buildSuggestedCombineName,
} from './profile-companion-utils';

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

const createEmptyItem = (code = '', name = ''): ProfileBarCompanion => ({
  companionBarId: 0,
  code,
  name,
  offsetMm: 0,
  qty: 1,
  goc1: null,
  goc2: null,
  note: '',
});

export function ProfileCompanionsSection({ companions, onChange, availableBars, parent, isFullCompanion }: ProfileCompanionsSectionProps) {
  const candidateBars = useMemo(() => {
    const rank = (bar: ProfileBar) => (bar.barType?.toUpperCase() === 'OTHER' ? 2 : bar.seriesId === parent.seriesId ? 0 : 1);
    return availableBars
      .filter((bar) => bar.brandId === parent.brandId && bar.id !== parent.id)
      .sort((a, b) => rank(a) - rank(b) || a.code.localeCompare(b.code, 'vi', { sensitivity: 'base' }));
  }, [availableBars, parent.brandId, parent.seriesId, parent.id]);

  const barById = useMemo(() => new Map(availableBars.map((bar) => [bar.id, bar])), [availableBars]);
  const combineGroups = useMemo(() => groupCompanionsByWay(companions, parent.code, parent.name), [companions, parent.code, parent.name]);
  const commitGroups = (nextGroups: CombineWayGroup[]) => onChange(flattenCombineWayGroups(nextGroups));

  const handleAddWayOrItem = () => {
    if (isFullCompanion) {
      onChange([...companions, createEmptyItem()]);
      return;
    }
    commitGroups([...combineGroups, { groupId: `way-new-${Date.now()}`, code: '', name: '', items: [createEmptyItem()] }]);
  };

  const handleRemoveGroup = (groupIdx: number) => commitGroups(combineGroups.filter((_, idx) => idx !== groupIdx));
  const handleGroupMetaChange = (groupIdx: number, field: 'code' | 'name', value: string) =>
    commitGroups(combineGroups.map((group, idx) => (idx === groupIdx ? { ...group, [field]: value } : group)));

  const applyAutoSuggestedMeta = (group: CombineWayGroup, nextItems: ProfileBarCompanion[]): CombineWayGroup => {
    const prevCode = buildSuggestedCombineCode(parent.code, group.items, barById);
    const prevName = buildSuggestedCombineName(parent.name, group.items, barById);
    const nextCode = buildSuggestedCombineCode(parent.code, nextItems, barById);
    const nextName = buildSuggestedCombineName(parent.name, nextItems, barById);
    return {
      ...group,
      code: !group.code.trim() || group.code.trim() === prevCode ? nextCode : group.code,
      name: !group.name.trim() || group.name.trim() === prevName ? nextName : group.name,
      items: nextItems,
    };
  };

  const handleAddProfileToGroup = (groupIdx: number) =>
    commitGroups(
      combineGroups.map((group, idx) =>
        idx === groupIdx ? { ...group, items: [...group.items, createEmptyItem(group.code, group.name)] } : group,
      ),
    );

  const handleUpdateGroupItem = (groupIdx: number, itemIdx: number, patch: Partial<ProfileBarCompanion>, autoMeta = false) =>
    commitGroups(
      combineGroups.map((group, idx) => {
        if (idx !== groupIdx) return group;
        const nextItems = group.items.map((item, i) => (i === itemIdx ? { ...item, ...patch } : item));
        return autoMeta ? applyAutoSuggestedMeta(group, nextItems) : { ...group, items: nextItems };
      }),
    );

  const handleRemoveGroupItem = (groupIdx: number, itemIdx: number) => {
    const targetGroup = combineGroups[groupIdx];
    if (!targetGroup) return;
    if (targetGroup.items.length <= 1) return handleRemoveGroup(groupIdx);
    const nextItems = targetGroup.items.filter((_, i) => i !== itemIdx);
    const updatedGroup = applyAutoSuggestedMeta(targetGroup, nextItems);
    commitGroups(combineGroups.map((g, idx) => (idx === groupIdx ? updatedGroup : g)));
  };

  const renderCompanionRow = (
    companion: ProfileBarCompanion,
    onSelectBar: (barId: number) => void,
    onPatch: (patch: Partial<ProfileBarCompanion>) => void,
    onRemove: () => void,
    key: string | number,
  ) => (
    <div key={key} className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end">
        <div>
          <label className={LABEL_CLASS}>Thanh kèm theo <span className="text-rose-500">*</span></label>
          <select value={companion.companionBarId || ''} onChange={(e) => onSelectBar(Number(e.target.value))} className={SELECT_CLASS + ' !h-8'} required>
            <option value="">— Chọn thanh kèm —</option>
            {companion.companionBarId > 0 && !barById.has(companion.companionBarId) && (
              <option value={companion.companionBarId}>{`${companion.companionCode ?? companion.companionBarId} — ${companion.companionName ?? ''}`}</option>
            )}
            {candidateBars.map((bar) => (
              <option key={bar.id} value={bar.id}>{`${bar.code} — ${bar.name}`}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Offset (mm)</label>
          <NullableNumberInput value={companion.offsetMm} onChange={(next) => onPatch({ offsetMm: next ?? 0 })} step={0.5} />
        </div>
        <div>
          <label className={LABEL_CLASS}>SL (1–10)</label>
          <NullableNumberInput value={companion.qty} onChange={(next) => onPatch({ qty: Math.min(10, Math.max(1, Math.round(next ?? 1))) })} step={1} min={1} max={10} />
        </div>
        <button type="button" onClick={onRemove} title="Xóa dòng profile phụ" className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer">
          <Trash2 size={15} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {(['goc1', 'goc2'] as const).map((field, angleIndex) => (
          <div key={field}>
            <label className={LABEL_CLASS}>Góc cắt {angleIndex + 1}</label>
            <select value={companion[field] ?? ''} onChange={(e) => onPatch({ [field]: e.target.value === '' ? null : Number(e.target.value) })} className={SELECT_CLASS + ' !h-8'}>
              <option value="">Theo thanh chính</option>
              {ANGLE_OPTIONS.map((angle) => (
                <option key={angle} value={angle}>{angle}°</option>
              ))}
            </select>
          </div>
        ))}
        <div>
          <label className={LABEL_CLASS}>Ghi chú</label>
          <input value={companion.note ?? ''} onChange={(e) => onPatch({ note: e.target.value })} className={INPUT_CLASS} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xs font-bold text-slate-700">⊕ Thanh đính kèm</div>
          <p className="text-[11px] text-slate-500">Combine — mỗi cách có thể gồm nhiều profile kèm, cùng số đo + offset riêng</p>
        </div>
        <button type="button" onClick={handleAddWayOrItem} className="inline-flex items-center gap-1 px-2.5 h-7 rounded-lg text-[11px] font-semibold text-primary border border-primary/30 hover:bg-primary/10 transition cursor-pointer">
          <Plus size={13} /> Thêm
        </button>
      </div>

      {isFullCompanion ? (
        <div className="space-y-2.5">
          {companions.map((companion, index) =>
            renderCompanionRow(
              companion,
              (barId) => {
                const selectedBar = barById.get(barId);
                onChange(companions.map((item, i) => (i === index ? { ...item, companionBarId: barId, companionCode: selectedBar?.code ?? item.companionCode, companionName: selectedBar?.name ?? item.companionName } : item)));
              },
              (patch) => onChange(companions.map((item, i) => (i === index ? { ...item, ...patch } : item))),
              () => onChange(companions.filter((_, i) => i !== index)),
              companion.id ?? `full-${index}`,
            ),
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {combineGroups.map((group, groupIdx) => (
            <div key={group.groupId} className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-2xs space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_auto] gap-2 items-end">
                <div>
                  <label className={LABEL_CLASS}>Mã combine</label>
                  <input value={group.code} onChange={(e) => handleGroupMetaChange(groupIdx, 'code', e.target.value)} placeholder={parent.code ? `${parent.code}+...` : 'Mã combine...'} className={INPUT_CLASS + ' font-mono font-semibold'} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Tên combine</label>
                  <input value={group.name} onChange={(e) => handleGroupMetaChange(groupIdx, 'name', e.target.value)} placeholder={parent.name ? `${parent.name} + ...` : 'Tên combine...'} className={INPUT_CLASS} />
                </div>
                <button type="button" onClick={() => handleRemoveGroup(groupIdx)} title="Xóa cách combine này" className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer">
                  <X size={15} />
                </button>
              </div>
              <div className="p-2.5 bg-amber-50/30 rounded-lg border border-amber-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-amber-900">Profile ráp trong cách combine này</span>
                  <button type="button" onClick={() => handleAddProfileToGroup(groupIdx)} className="inline-flex items-center gap-1 px-2 h-6 rounded-md text-[11px] font-semibold text-amber-800 bg-amber-100/80 hover:bg-amber-200/70 transition cursor-pointer">
                    <Plus size={12} /> Thêm profile
                  </button>
                </div>
                <div className="space-y-2">
                  {group.items.map((item, itemIdx) =>
                    renderCompanionRow(
                      item,
                      (barId) => {
                        const selectedBar = barById.get(barId);
                        handleUpdateGroupItem(groupIdx, itemIdx, { companionBarId: barId, companionCode: selectedBar?.code ?? item.companionCode, companionName: selectedBar?.name ?? item.companionName }, true);
                      },
                      (patch) => handleUpdateGroupItem(groupIdx, itemIdx, patch, false),
                      () => handleRemoveGroupItem(groupIdx, itemIdx),
                      item.id ?? `${group.groupId}-item-${itemIdx}`,
                    ),
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {companions.length > 0 && (
        <p className="text-[11px] text-teal-800 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
          Mỗi thanh gốc sẽ xuất thêm <strong>{companions.length}</strong> loại profile kèm · offset cộng chiều dài · SL là hệ số nhân · góc nhập sẽ ghi đè
        </p>
      )}
    </div>
  );
}
