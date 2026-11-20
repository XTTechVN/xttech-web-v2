'use client';

import React, { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { ProfileBar } from '@/types';
import { Select } from '@/components/select';
import { cn } from '@/utils/cn';
import {
  MULLION_CUT_LABELS,
  MULLION_CUT_ORDER,
  MullionCutType,
  MullionInfo,
  ProfileIdRef,
  normalizeMullionCutType,
} from '../../studio-types';
import { parseStudioProfileId } from '../../utils/profile-combine-utils';
import {
  MullionReferenceContext,
  MullionReferenceMode,
  computeDistanceForMode,
  computeRangeForMode,
  formatReferenceValue,
  resolveRawTargetPosFromInput,
  resolveTargetPosFromInput,
} from '../../utils/mullion-reference-utils';
import { MullionReferenceDiagram } from './mullion-reference-diagram';

interface MullionBasicTabProps {
  mullion: MullionInfo;
  ctx: MullionReferenceContext;
  profileBars: ProfileBar[];
  onSave: (params: { dimension: number; profileId?: ProfileIdRef; cutType?: MullionCutType }) => void;
  onDeleteMullion: () => void;
  onClose: () => void;
}

export const MullionBasicTab: React.FC<MullionBasicTabProps> = ({
  mullion, ctx, profileBars, onSave, onDeleteMullion, onClose,
}) => {
  const [mode, setMode] = useState<MullionReferenceMode>(() => ctx.defaultMode);
  const [selectedRefId, setSelectedRefId] = useState<string | null>(() => ctx.defaultRefId);
  const [draftPos, setDraftPos] = useState<number>(() => ctx.currentPos);
  const [isDimensionDirty, setIsDimensionDirty] = useState<boolean>(false);
  const [inputStr, setInputStr] = useState<string>(() =>
    String(computeDistanceForMode(ctx.currentPos, ctx.defaultMode, ctx, ctx.defaultRefId))
  );
  const [selectedProfileId, setSelectedProfileId] = useState<ProfileIdRef | undefined>(() => mullion.profileId);
  const [cutType, setCutType] = useState<MullionCutType>(() => normalizeMullionCutType(mullion.cutType));

  const isVert = ctx.direction === 'vertical';
  const activeRefId = selectedRefId ?? ctx.refMullions[0]?.id ?? null;
  const activeRange = computeRangeForMode(mode, ctx, activeRefId);
  const trimmed = inputStr.trim();
  const parsedVal = trimmed === '' ? Number.NaN : Number(trimmed);
  const isFiniteInput = Number.isFinite(parsedVal);
  const isInRange = isFiniteInput && parsedVal >= activeRange.minInput - 1e-6 && parsedVal <= activeRange.maxInput + 1e-6;
  const errorMsg = !isFiniteInput
    ? 'Vui lòng nhập khoảng cách hợp lệ (mm)'
    : !isInRange ? `Khoảng cách phải từ ${activeRange.minInput} đến ${activeRange.maxInput} mm` : null;

  const previewPos = isDimensionDirty
    ? (isFiniteInput ? resolveRawTargetPosFromInput(parsedVal, mode, ctx, activeRefId) : draftPos)
    : ctx.currentPos;
  const diagramDistance = isDimensionDirty && isFiniteInput
    ? formatReferenceValue(parsedVal)
    : computeDistanceForMode(ctx.currentPos, mode, ctx, activeRefId);

  const mullionProfiles = profileBars.filter(
    (b) => b.barType?.toLowerCase() === 'mullion' || b.name.toLowerCase().includes('đố') || b.code.toLowerCase().includes('do')
  );
  const availableProfiles = mullionProfiles.length > 0 ? mullionProfiles : profileBars;

  const modeOptions: Array<{ id: MullionReferenceMode; label: string; disabled?: boolean }> = [
    { id: 'from_start', label: ctx.isSashMullion ? (isVert ? 'Từ mép cánh trái' : 'Từ mép cánh trên') : (isVert ? 'Từ khung trái' : 'Từ khung trên') },
    { id: 'from_ref_mullion', label: ctx.isSashMullion ? (isVert ? 'Từ đố cánh trái' : 'Từ đố cánh trên') : (isVert ? 'Từ đố bên trái' : 'Từ đố bên trên'), disabled: ctx.refMullions.length === 0 },
    { id: 'from_end', label: ctx.isSashMullion ? (isVert ? 'Từ mép cánh phải' : 'Từ mép cánh dưới') : (isVert ? 'Từ khung phải' : 'Từ khung dưới') },
  ];

  const handleModeChange = (nextMode: MullionReferenceMode) => {
    if (nextMode === 'from_ref_mullion' && ctx.refMullions.length === 0) return;
    const nextRefId = nextMode === 'from_ref_mullion' ? activeRefId : selectedRefId;
    const basePos = isDimensionDirty ? draftPos : ctx.currentPos;
    setMode(nextMode);
    if (nextRefId !== selectedRefId) setSelectedRefId(nextRefId);
    setInputStr(String(computeDistanceForMode(basePos, nextMode, ctx, nextRefId)));
  };

  const handleRefChange = (nextRefId: string) => {
    const basePos = isDimensionDirty ? draftPos : ctx.currentPos;
    setSelectedRefId(nextRefId);
    setInputStr(String(computeDistanceForMode(basePos, 'from_ref_mullion', ctx, nextRefId)));
  };

  const handleInputChange = (raw: string) => {
    setInputStr(raw);
    setIsDimensionDirty(true);
    const val = raw.trim() === '' ? Number.NaN : Number(raw.trim());
    if (Number.isFinite(val)) setDraftPos(resolveRawTargetPosFromInput(val, mode, ctx, activeRefId));
  };

  const handleSave = () => {
    if (!isInRange) return;
    const newLeftDim = isDimensionDirty
      ? formatReferenceValue(resolveTargetPosFromInput(parsedVal, mode, ctx, activeRefId) - ctx.leftCellStart)
      : ctx.leftDim;
    onSave({
      dimension: newLeftDim,
      profileId: ctx.isSashMullion ? mullion.profileId : selectedProfileId,
      cutType: ctx.isSashMullion ? mullion.cutType : cutType,
    });
    onClose();
  };

  const handleCycleCutType = () => {
    const currentIdx = MULLION_CUT_ORDER.indexOf(normalizeMullionCutType(cutType));
    setCutType(MULLION_CUT_ORDER[(currentIdx + 1) % MULLION_CUT_ORDER.length]);
  };

  return (
    <div className="p-5 pt-2 flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#045863]/10 text-[#045863] border border-[#045863]/20">
          {ctx.scopeLabel}
        </span>
        <div className="flex items-center justify-between text-[11px] text-slate-600 px-0.5">
          <span>{ctx.isSashMullion ? 'Phủ bì cánh' : 'Phủ bì khung'}: <strong className="font-mono tabular-nums text-slate-900">{ctx.scopeSpan} mm</strong></span>
          <span>Tổng 2 ô kề: <strong className="font-mono tabular-nums text-slate-900">{ctx.pairTotal} mm</strong></span>
        </div>
      </div>

      <MullionReferenceDiagram ctx={ctx} mode={mode} anchorPos={activeRange.anchorPos} previewPos={previewPos} distanceDisplay={diagramDistance} isValid={isInRange} />

      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/70">
        {modeOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            disabled={opt.disabled}
            onClick={() => handleModeChange(opt.id)}
            title={opt.disabled ? 'Không có đố tham chiếu phía trước cùng phương' : opt.label}
            className={cn(
              'px-1.5 py-1.5 rounded-xl text-[11px] leading-tight font-semibold transition-all text-center',
              mode === opt.id ? 'bg-white text-[#045863] shadow-xs font-bold' : opt.disabled ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-slate-900 cursor-pointer'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {mode === 'from_ref_mullion' && ctx.refMullions.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-600">Đố tham chiếu:</label>
          {ctx.refMullions.length >= 2 ? (
            <Select
              fullWidth
              value={activeRefId ?? ''}
              onChange={(e) => handleRefChange(String(e.target.value))}
              options={ctx.refMullions.map((c) => ({ value: c.id, label: c.label }))}
              className="h-9 py-0 rounded-xl border-slate-300 text-xs md:text-xs font-medium text-slate-800 bg-white"
            />
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-teal-50/70 border border-teal-200/80 text-xs font-medium text-[#045863]">
              {ctx.refMullions[0].label}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <div className="relative">
          <input
            type="number"
            step="any"
            autoFocus
            value={inputStr}
            onWheel={(e) => e.currentTarget.blur()}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && isInRange && handleSave()}
            className={cn(
              'w-full h-11 px-3.5 pr-11 rounded-2xl border-2 font-mono tabular-nums font-bold text-lg text-slate-900 bg-white focus:outline-none focus:ring-4 transition-all shadow-inner',
              isInRange ? 'border-orange-400 focus:border-orange-500 focus:ring-orange-500/15' : 'border-rose-500 focus:border-rose-600 focus:ring-rose-500/15'
            )}
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">mm</span>
        </div>
        <div className="text-[11px] px-0.5">
          {errorMsg ? (
            <span className="text-rose-600 font-semibold">{errorMsg}</span>
          ) : (
            <span className="text-slate-500 font-mono tabular-nums">
              Hợp lệ: {activeRange.minInput} – {activeRange.maxInput} mm{activeRange.isAlignedZeroPossible ? ' (0 = thẳng hàng)' : ''}
            </span>
          )}
        </div>
      </div>

      {ctx.isSashMullion ? (
        <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
          Đố cánh cắt vuông 90° lọt lòng cánh và dùng thanh đố cánh mặc định trong tab Cấu hình.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Override cây đố khung:</label>
            <Select
              fullWidth
              value={selectedProfileId ?? ''}
              onChange={(e) => setSelectedProfileId(parseStudioProfileId(e.target.value))}
              options={[{ value: '', label: '(Mặc định theo hệ nhôm)' }, ...availableProfiles.map((b) => ({ value: b.id, label: `${b.code} – ${b.name}` }))]}
              placeholder="(Mặc định theo hệ nhôm)"
              className="h-9 py-0 rounded-xl border-slate-300 text-xs md:text-xs font-medium text-slate-800 bg-white"
            />
            {selectedProfileId && (
              <button type="button" onClick={() => setSelectedProfileId(undefined)} className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 self-start cursor-pointer transition-colors">
                × Reset về mặc định
              </button>
            )}
          </div>
          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="text-slate-600 font-medium">Kiểu cắt:</span>
            <button type="button" onClick={handleCycleCutType} className="px-3.5 py-1.5 rounded-full border border-orange-400 text-orange-600 font-semibold text-xs hover:bg-orange-50 transition-colors cursor-pointer">
              {MULLION_CUT_LABELS[normalizeMullionCutType(cutType)]}
            </button>
          </div>
        </>
      )}

      <button type="button" onClick={() => { onDeleteMullion(); onClose(); }} className="mt-0.5 w-full py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/90 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs">
        <Trash2 size={14} />
        <span>Xóa đố này</span>
      </button>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          disabled={!isInRange}
          onClick={handleSave}
          className={cn(
            'flex-1 h-10 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all',
            isInRange ? 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer hover:shadow-md active:scale-[0.98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          )}
        >
          <Check size={15} />
          <span>Lưu</span>
        </button>
        <button type="button" onClick={onClose} className="flex-1 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer active:scale-[0.98]">
          Hủy
        </button>
      </div>
    </div>
  );
};
