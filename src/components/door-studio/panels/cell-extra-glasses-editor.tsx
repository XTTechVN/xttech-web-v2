'use client';

import React from 'react';
import { AlertTriangle, CheckCheck, Layers, X } from 'lucide-react';
import { Select, type SelectOption } from '@/components/select';
import { GLASS_MATERIAL_TYPE_MAP } from '@/config';
import type { Glass } from '@/types';
import type { ExtraGlassItem, SceneCellNode } from '../studio-types';

interface CellExtraGlassesEditorProps {
  selectedCell: SceneCellNode;
  availableGlasses?: Glass[];
  defaultGlass?: Glass | null;
  onUpdateCell: (updates: Partial<SceneCellNode>) => void;
  onApplyGlassVisualToAll?: (patch: Partial<SceneCellNode>) => void;
}

/**
 * Cấu hình các lớp kính / tấm / lưới bổ sung trên cùng một ô (kính hộp ghép nhiều lớp, lưới chống muỗi, tấm ốp...).
 */
export const CellExtraGlassesEditor: React.FC<CellExtraGlassesEditorProps> = ({
  selectedCell,
  availableGlasses,
  defaultGlass,
  onUpdateCell,
  onApplyGlassVisualToAll,
}) => {
  const extraGlasses = selectedCell.extraGlasses ?? [];
  const selectedIds = new Set(extraGlasses.map((item) => item.glassId));
  const primaryGlassId = selectedCell.glassId ?? defaultGlass?.id ?? null;
  const primaryGlassName = selectedCell.glassName ?? defaultGlass?.name ?? null;
  const glassById = new Map((availableGlasses ?? []).map((glass) => [glass.id, glass]));

  const handleAdd = (rawValue: string): void => {
    const picked = availableGlasses?.find((glass) => String(glass.id) === rawValue);
    if (!picked || selectedIds.has(picked.id)) return;
    const nextItem: ExtraGlassItem = {
      glassId: picked.id,
      glassCode: picked.code,
      glassName: picked.name,
      glassThickness: picked.thicknessMm,
    };
    onUpdateCell({ extraGlasses: [...extraGlasses, nextItem] });
  };

  const handleRemove = (glassId: number): void => {
    const nextList = extraGlasses.filter((item) => item.glassId !== glassId);
    onUpdateCell({ extraGlasses: nextList.length > 0 ? nextList : undefined });
  };

  return (
    <div className="pt-2 border-t border-slate-200/60 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
          <Layers size={12} className="text-primary" />
          <span>Lớp bổ sung (kính / tấm / lưới)</span>
        </span>
        {extraGlasses.length > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold">
            +{extraGlasses.length}
          </span>
        )}
      </div>

      {extraGlasses.length > 0 && (
        <div className="space-y-1.5">
          {extraGlasses.map((item) => {
            const matchedGlass = glassById.get(item.glassId);
            const materialType = matchedGlass?.category?.materialType;
            const materialBadge = materialType ? GLASS_MATERIAL_TYPE_MAP[materialType] : undefined;
            const thickness = item.glassThickness ?? matchedGlass?.thicknessMm;
            const isDuplicatePrimary =
              (primaryGlassId != null && item.glassId === primaryGlassId) ||
              (primaryGlassId == null && Boolean(primaryGlassName) && item.glassName === primaryGlassName);

            return (
              <div
                key={item.glassId}
                className="p-2 rounded-md border border-slate-200 bg-white space-y-1"
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1 flex-wrap">
                      {materialBadge && (
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${materialBadge.badgeClass}`}
                        >
                          {materialBadge.label}
                        </span>
                      )}
                      {item.glassCode && (
                        <span className="font-mono text-[10px] font-semibold text-slate-500">
                          {item.glassCode}
                        </span>
                      )}
                      {thickness ? (
                        <span className="font-mono text-[10px] text-slate-400">{thickness}mm</span>
                      ) : null}
                    </div>
                    <div className="text-[11px] font-medium text-slate-800 leading-snug">
                      {item.glassName}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.glassId)}
                    title="Xóa lớp bổ sung"
                    aria-label={`Xóa ${item.glassName}`}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                  >
                    <X size={12} />
                  </button>
                </div>

                {isDuplicatePrimary && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200/80 rounded px-1.5 py-0.5">
                    <AlertTriangle size={11} className="shrink-0 text-amber-600" />
                    <span>Trùng với lớp kính chính đang chọn trên ô</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Select
        fullWidth
        className="h-8 text-xs"
        value=""
        placeholder="+ Chọn thêm kính / tấm / lưới..."
        onChange={(event) => handleAdd(String(event.target.value))}
        options={(availableGlasses ?? []).map((glass): SelectOption => {
          const materialType = glass.category?.materialType;
          const typeLabel = materialType ? GLASS_MATERIAL_TYPE_MAP[materialType]?.shortLabel : null;
          const isAdded = selectedIds.has(glass.id);
          return {
            value: String(glass.id),
            disabled: isAdded,
            label: `${typeLabel ? `[${typeLabel}] ` : ''}${glass.code ? `${glass.code} - ` : ''}${glass.name}${glass.thicknessMm ? ` (${glass.thicknessMm}mm)` : ''}${isAdded ? ' (Đã chọn)' : ''}`,
          };
        })}
      />

      {extraGlasses.length > 0 && Boolean(onApplyGlassVisualToAll) && (
        <button
          type="button"
          onClick={() => onApplyGlassVisualToAll?.({ extraGlasses })}
          className="w-full py-1.5 px-2 rounded-md border border-primary/25 bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <CheckCheck size={13} />
          <span>Áp dụng lớp bổ sung cho tất cả ô kính</span>
        </button>
      )}
    </div>
  );
};
