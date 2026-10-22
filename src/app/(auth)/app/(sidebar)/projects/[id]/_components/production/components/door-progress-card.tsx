'use client';

import React from 'react';
import { Check, ImageOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ProgressMatrixItem, ProjectDoorPosition } from '@/types';
import { DoorThumbnail } from '../../../../configuration/door-templates/_components/door-thumbnail';

interface DoorProgressCardProps {
  position: ProjectDoorPosition;
  matrixItem?: ProgressMatrixItem;
  isSelected: boolean;
  onToggle: (id: number) => void;
}

export function DoorProgressCard({
  position,
  matrixItem,
  isSelected,
  onToggle,
}: DoorProgressCardProps) {
  const hasSvg = !!(position.systemConfig as Record<string, unknown> | undefined)?.rootCell;
  const doorName = position.description || (position.doorType === 'window' ? 'Cửa sổ' : 'Cửa đi');
  const floorText = position.floor?.name || matrixItem?.floorName || 'Tầng 1';

  return (
    <div
      onClick={() => onToggle(position.id)}
      className={cn(
        'group relative flex cursor-pointer select-none flex-col overflow-hidden rounded-xl border bg-white text-left transition-all duration-200',
        isSelected
          ? 'border-primary bg-primary/[0.02] shadow-sm ring-2 ring-primary/20'
          : 'border-slate-200/80 hover:border-primary/50 hover:shadow-md',
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-white px-3 py-2">
        <span className="text-xs font-bold tracking-tight text-slate-800" title={position.code}>
          {position.code}
        </span>
        <div
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded border transition-colors',
            isSelected
              ? 'border-primary bg-primary text-white'
              : 'border-slate-300 bg-white group-hover:border-primary/60',
          )}
        >
          {isSelected && <Check size={11} strokeWidth={3} />}
        </div>
      </div>

      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-slate-50/60 p-2">
        {hasSvg ? (
          <div className="pointer-events-none h-full w-full p-1 transition-transform duration-300 group-hover:scale-105">
            <DoorThumbnail
              systemConfig={position.systemConfig}
              hideDimensions={false}
              className="h-full w-full"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-300">
            <ImageOff size={24} />
            <span className="text-[10px]">Chưa có bản vẽ CAD</span>
          </div>
        )}
      </div>

      <div className="space-y-1 border-t border-slate-100 bg-white p-2.5">
        <p className="truncate text-xs font-semibold text-slate-800" title={doorName}>
          {doorName}
        </p>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>
            {position.width} × {position.height} mm
          </span>
          <span className="text-slate-400">{(position.areaM2 ?? 0).toFixed(2)} m²</span>
        </div>

        <div className="flex items-center justify-between pt-0.5 text-[10px] text-slate-400">
          <span className="truncate">{floorText}</span>
          {position.color?.name && (
            <span className="max-w-[90px] truncate" title={position.color.name}>
              {position.color.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

