'use client';

import React from 'react';
import { Square } from 'lucide-react';
import { Glass } from '@/types';
import { GlassVisualEffect, SceneCellNode } from '../studio-types';
import { GlassEffectMiniPreview } from '../cad-engine/components/cad-glass-effect-overlay';
import {
  GLASS_VISUAL_EFFECT_OPTIONS,
  inferDefaultGlassVisual,
  resolveCellGlassVisual,
} from '../utils/glass-visual-utils';

interface CellGlassConfigSectionProps {
  selectedCell: SceneCellNode;
  availableGlasses?: Glass[];
  defaultGlass?: Glass | null;
  onUpdateCell: (updates: Partial<SceneCellNode>) => void;
  onApplyGlassVisualToAll?: (patch: Partial<SceneCellNode>) => void;
}

const EFFECT_LABEL_MAP = new Map<GlassVisualEffect, string>(
  GLASS_VISUAL_EFFECT_OPTIONS.map((option) => [option.id, option.label])
);

/**
 * Cấu hình kính của ô: loại kính, hiệu ứng thị giác (6 loại, vector) và chia kính.
 */
export const CellGlassConfigSection: React.FC<CellGlassConfigSectionProps> = ({
  selectedCell,
  availableGlasses,
  defaultGlass,
  onUpdateCell,
  onApplyGlassVisualToAll,
}) => {
  const visual = resolveCellGlassVisual(selectedCell, availableGlasses, defaultGlass);
  const { effectiveEffect, effectiveColor, hasEffectOverride, defaultEffect, defaultColor } = visual;
  const [isEffectOpen, setIsEffectOpen] = React.useState<boolean>(hasEffectOverride);
  const [isApplyAllChecked, setIsApplyAllChecked] = React.useState<boolean>(false);
  const hasSelectedGlass = Boolean(selectedCell.glassName || selectedCell.glassId);
  const selectedGlassValue = visual.selectedGlass ? String(visual.selectedGlass.id) : '';

  const handlePickGlass = (rawValue: string): void => {
    const pickedGlass = availableGlasses?.find((glass) => String(glass.id) === rawValue) ?? null;
    const inferred = inferDefaultGlassVisual(pickedGlass, pickedGlass?.name);
    onUpdateCell({
      glassId: pickedGlass?.id ?? null,
      glassName: pickedGlass?.name ?? undefined,
      glassThickness: pickedGlass?.thicknessMm ?? undefined,
      glassVisualEffectOverride: false,
      glassVisualEffect: inferred.effect,
      glassVisualColor: inferred.color,
    });
  };

  const handleResetGlass = (): void => handlePickGlass('');

  const commitVisualPatch = (patch: Partial<SceneCellNode>): void => {
    if (isApplyAllChecked && onApplyGlassVisualToAll) {
      onApplyGlassVisualToAll(patch);
      return;
    }
    onUpdateCell(patch);
  };

  const handleToggleApplyAll = (isChecked: boolean): void => {
    setIsApplyAllChecked(isChecked);
    if (!isChecked) return;
    onApplyGlassVisualToAll?.({
      glassVisualEffectOverride: hasEffectOverride,
      glassVisualEffect: effectiveEffect,
      glassVisualColor: effectiveColor,
    });
  };

  return (
    <div className="space-y-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
      <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
        <Square size={13} className="text-primary" />
        <span>Kính</span>
      </div>

      <div>
        <label className="text-[11px] text-slate-600 font-medium block mb-1">Loại kính cho ô này:</label>
        <select
          value={selectedGlassValue}
          onChange={(event) => handlePickGlass(event.target.value)}
          className="w-full h-8 px-2 text-xs bg-white rounded-md border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
        >
          <option value="">— Dùng kính mặc định —</option>
          {(availableGlasses ?? []).map((glass) => (
            <option key={glass.id} value={glass.id}>
              {`${glass.name}${glass.isDefault ? ' ★' : ''}${glass.thicknessMm ? ` (${glass.thicknessMm}mm)` : ''}`}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => setIsEffectOpen((prev) => !prev)}
          className="w-full flex items-center justify-between gap-2 px-2 py-1.5 text-left"
        >
          <span className="text-[11px] font-semibold text-slate-700">Hiệu ứng</span>
          <span className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] text-slate-500 truncate">{EFFECT_LABEL_MAP.get(effectiveEffect)}</span>
            <GlassEffectMiniPreview effect={effectiveEffect} color={effectiveColor} previewId={selectedCell.id} />
            <span className="text-slate-500 font-bold">{isEffectOpen ? '−' : '+'}</span>
          </span>
        </button>

        {isEffectOpen && (
          <div className="px-2 pb-2 space-y-2 border-t border-slate-100 pt-2">
            <div className="grid grid-cols-2 gap-1.5">
              {GLASS_VISUAL_EFFECT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    commitVisualPatch({
                      glassVisualEffectOverride: true,
                      glassVisualEffect: option.id,
                      glassVisualColor: effectiveColor,
                    })
                  }
                  className={`h-7 rounded-md border text-[11px] transition-colors ${
                    effectiveEffect === option.id
                      ? 'bg-slate-800 text-white border-slate-800 font-semibold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {effectiveEffect === 'tinted' && (
              <label className="flex items-center justify-between gap-2 text-[11px] text-slate-600">
                <span>Màu kính:</span>
                <span className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={effectiveColor}
                    onChange={(event) =>
                      commitVisualPatch({
                        glassVisualEffectOverride: true,
                        glassVisualEffect: effectiveEffect,
                        glassVisualColor: event.target.value,
                      })
                    }
                    className="w-7 h-6 p-0 border border-slate-300 rounded cursor-pointer"
                  />
                  <span className="font-mono text-[10.5px] text-slate-500">{effectiveColor}</span>
                </span>
              </label>
            )}

            {hasEffectOverride && (
              <button
                type="button"
                onClick={() =>
                  commitVisualPatch({
                    glassVisualEffectOverride: false,
                    glassVisualEffect: defaultEffect,
                    glassVisualColor: defaultColor,
                  })
                }
                className="text-[11px] text-teal-700 hover:underline"
              >
                Dùng lại hiệu ứng của vật liệu
              </button>
            )}

            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-700">
              <input
                type="checkbox"
                checked={isApplyAllChecked}
                onChange={(event) => handleToggleApplyAll(event.target.checked)}
                className="w-3.5 h-3.5 rounded cursor-pointer"
              />
              <span>Áp dụng lựa chọn cho tất cả ô kính</span>
            </label>
          </div>
        )}
      </div>

      {hasSelectedGlass ? (
        <button type="button" onClick={handleResetGlass} className="text-red-500 hover:underline text-[11px]">
          × Reset về mặc định
        </button>
      ) : (
        defaultGlass?.name && <p className="text-[11px] text-gray-500 italic">{`Mặc định: ${defaultGlass.name}`}</p>
      )}

      <div className="pt-1.5 border-t border-slate-200/60">
        <div className="text-[11px] text-gray-700 font-semibold mb-0.5">Chia kính</div>
        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
          <span>Số tấm chia đều:</span>
        </div>
        <input
          type="number"
          min={1}
          max={10}
          value={selectedCell.glassSplitCount || 1}
          onChange={(event) => onUpdateCell({ glassSplitCount: Math.max(1, Math.min(10, Number(event.target.value))) })}
          className="w-full h-8 px-2.5 font-mono font-bold text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 text-slate-800"
          placeholder="1"
        />
      </div>
    </div>
  );
};
