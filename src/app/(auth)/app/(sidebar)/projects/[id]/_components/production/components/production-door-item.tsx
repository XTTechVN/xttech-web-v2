'use client';

import React from 'react';
import { Check, ImageOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ProjectDoorPosition } from '@/types';
import { DoorThumbnail } from '../../../../configuration/door-templates/_components/door-thumbnail';

interface ProductionDoorItemProps {
  position: ProjectDoorPosition;
  isSelected: boolean;
  isAvailable: boolean;
  onToggle: (position: ProjectDoorPosition) => void;
  statusLabel: string;
  statusVariant: 'amber' | 'emerald' | 'purple' | 'slate';
  tooltip?: string;
}

export function ProductionDoorItem({
  position,
  isSelected,
  isAvailable,
  onToggle,
  statusLabel,
  statusVariant,
  tooltip,
}: ProductionDoorItemProps) {
  const hasSvg = Boolean((position.systemConfig as Record<string, unknown> | undefined)?.rootCell);
  const doorName = position.description || (position.doorType === 'window' ? 'Cửa sổ' : 'Cửa đi');
  const floorText = position.floor?.name || 'Tầng 1';

  return (
    <div
      onClick={() => onToggle(position)}
      title={tooltip}
      className={cn(
        'group relative flex select-none flex-col overflow-hidden rounded-xl border bg-white text-left transition-all duration-200',
        !isAvailable && 'cursor-not-allowed border-slate-200/60 bg-slate-50/70 opacity-60',
        isAvailable && !isSelected && 'cursor-pointer border-slate-200/90 hover:border-primary/50 hover:shadow-md',
        isAvailable && isSelected && 'cursor-pointer border-primary bg-primary/[0.03] shadow-sm ring-2 ring-primary/20',
      )}
    >
      {/* Header card: Mã cửa + Checkbox */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-2.5 py-1.5">
        <span className="text-xs font-bold tracking-tight text-slate-800" title={position.code}>
          {position.code}
        </span>

        <div
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
            !isAvailable && 'border-slate-200 bg-slate-100 text-transparent',
            isAvailable && !isSelected && 'border-slate-300 bg-white group-hover:border-primary/60',
            isAvailable && isSelected && 'border-primary bg-primary text-white',
          )}
        >
          {isSelected && <Check size={11} strokeWidth={3} />}
        </div>
      </div>

      {/* Bản vẽ CAD trực quan + Badge trạng thái overlay */}
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-slate-50/60 p-2">
        {statusLabel && (
          <div className="absolute top-1.5 left-1.5 z-10">
            <span
              className={cn(
                'rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-tight shadow-xs backdrop-blur-xs',
                statusVariant === 'amber' && 'border border-amber-200 bg-amber-50/90 text-amber-700',
                statusVariant === 'emerald' && 'border border-emerald-200 bg-emerald-50/90 text-emerald-700',
                statusVariant === 'purple' && 'border border-purple-200 bg-purple-50/90 text-purple-700',
                statusVariant === 'slate' && 'border border-slate-200 bg-white/90 text-slate-600',
              )}
            >
              {statusLabel}
            </span>
          </div>
        )}

        {hasSvg ? (
          <div className="pointer-events-none h-full w-full p-0.5 transition-transform duration-300 group-hover:scale-105">
            <DoorThumbnail
              systemConfig={position.systemConfig}
              hideDimensions={false}
              className="h-full w-full"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-300">
            <ImageOff size={22} />
            <span className="text-[9px]">Chưa có CAD</span>
          </div>
        )}
      </div>

      <div className="space-y-1 border-t border-slate-100 bg-white p-2 text-left">
        <p className="truncate text-xs font-semibold text-slate-800" title={doorName}>
          {doorName}
        </p>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-medium">
            {position.width} × {position.height} mm
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            {(position.areaM2 ?? 0).toFixed(2)} m²
          </span>
        </div>

        <div className="flex items-center justify-between pt-0.5 text-[10px] text-slate-400">
          <span className="truncate">{floorText}</span>
          {position.color?.name && (
            <span className="max-w-[70px] truncate" title={position.color.name}>
              {position.color.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
