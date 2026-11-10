'use client';

import React from 'react';
import { ProfileBar } from '@/types';
import {
  CellOpenBottomOverride,
  CellReversalOverride,
  FrameConfig,
  SashConfig,
  SceneCellNode,
} from '../studio-types';
import { parseStudioProfileId } from '../utils/profile-combine-utils';

interface CellFrameOverrideSectionProps {
  selectedCell: SceneCellNode;
  onUpdateCell: (updates: Partial<SceneCellNode>) => void;
  /** Ô có chạm đáy cửa không (chỉ ô chạm đáy mới được chọn Hở/Kín cạnh đáy) */
  isTouchingBottom: boolean;
  availableProfiles?: ProfileBar[];
  frameConfig?: FrameConfig;
  sashConfig?: SashConfig;
}

const REVERSAL_LABEL_MAP: Record<string, string> = {
  inherit: 'Mặc định chung',
  none: 'Không đảo',
};

const OPEN_BOTTOM_OPTIONS: Array<{ value: CellOpenBottomOverride; label: string }> = [
  { value: 'inherit', label: 'Mặc định chung' },
  { value: 'open', label: 'Hở' },
  { value: 'closed', label: 'Kín' },
];

const SELECT_CLASS =
  'w-full h-8 px-2 text-xs bg-white rounded-lg border border-gray-300 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600';

/**
 * Cấu hình riêng theo ô: Đảo vách/Đảo cánh và Hở/Kín cạnh đáy (ghi đè cấu hình chung của cửa).
 */
export const CellFrameOverrideSection: React.FC<CellFrameOverrideSectionProps> = ({
  selectedCell,
  onUpdateCell,
  isTouchingBottom,
  availableProfiles,
  sashConfig,
}) => {
  const isFixedCell = selectedCell.sashType === 'fixed';
  const appliedReversalValue: CellReversalOverride = isFixedCell ? 'wall' : 'sash';
  const reversalOverride = selectedCell.reversalOverride ?? 'inherit';
  const isReversalActive = reversalOverride === 'wall' || reversalOverride === 'sash';
  const openBottomOverride = selectedCell.openBottomOverride ?? 'inherit';
  // Khe hở nền riêng chỉ áp cho ô ghi đè 'open' (cùng nguồn dữ liệu với ô Hở nền ở khối Thông số cánh)
  const isCellOverrideOpen = openBottomOverride === 'open';
  const reversalProfiles = (availableProfiles ?? []).filter((profile) => profile.barType === 'REVERSAL');
  const defaultHoNenMm = sashConfig?.hoNenMm ?? 8;

  const reversalOptions: Array<{ value: CellReversalOverride; label: string }> = [
    { value: 'inherit', label: REVERSAL_LABEL_MAP.inherit },
    { value: 'none', label: REVERSAL_LABEL_MAP.none },
    { value: appliedReversalValue, label: 'Đảo' },
  ];

  const handleChangeReversal = (value: CellReversalOverride): void => {
    if (value === 'inherit') {
      onUpdateCell({ reversalOverride: undefined, reversalProfileIdOverride: undefined, reversalOffsetMmOverride: undefined });
      return;
    }
    onUpdateCell({ reversalOverride: value });
  };

  const handleChangeOpenBottom = (value: CellOpenBottomOverride): void => {
    onUpdateCell({ openBottomOverride: value === 'inherit' ? undefined : value });
  };

  return (
    <div className="space-y-2 p-2.5 rounded-xl bg-teal-50/60 border border-teal-200/80">
      <div className="text-gray-800 font-semibold text-xs">
        {isFixedCell ? 'Đảo vách (riêng ô này)' : 'Đảo cánh (riêng ô này)'}
      </div>
      <select
        value={reversalOverride === 'inherit' || reversalOverride === 'none' ? reversalOverride : appliedReversalValue}
        onChange={(event) => handleChangeReversal(event.target.value as CellReversalOverride)}
        className={SELECT_CLASS}
      >
        {reversalOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {isReversalActive && (
        <div>
          <div className="text-[11px] text-gray-600 mb-1">Mã thanh đảo:</div>
          <select
            value={selectedCell.reversalProfileIdOverride ?? ''}
            onChange={(event) =>
              onUpdateCell({
                reversalProfileIdOverride: parseStudioProfileId(event.target.value) ?? null,
              })
            }
            className={SELECT_CLASS}
          >
            <option value="">Mặc định của hệ nhôm</option>
            {reversalProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.code} - {profile.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {isTouchingBottom && (
        <div className="pt-1 space-y-1.5">
          <div className="text-gray-800 font-semibold text-xs">Cạnh đáy (riêng ô này)</div>
          <div className="grid grid-cols-3 gap-1">
            {OPEN_BOTTOM_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChangeOpenBottom(option.value)}
                className={`h-8 rounded-lg text-[11px] font-medium border transition-colors ${
                  openBottomOverride === option.value
                    ? 'bg-[#045863] text-white border-[#045863]'
                    : 'bg-white text-slate-600 border-gray-300 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {isCellOverrideOpen && !isFixedCell && (
            <label className="flex items-center justify-between gap-2 text-[11px] text-gray-600">
              <span>Khe hở nền (mm):</span>
              <input
                type="number"
                value={selectedCell.hoNenMm ?? defaultHoNenMm}
                onChange={(event) => onUpdateCell({ hoNenMm: Number(event.target.value) })}
                className="w-20 h-7 px-2 text-xs text-right rounded-lg border border-gray-300 bg-white"
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
};
