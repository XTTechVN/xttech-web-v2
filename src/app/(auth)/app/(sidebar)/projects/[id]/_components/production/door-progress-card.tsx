'use client';

import React from 'react';
import { Check, ImageOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ProjectDoorPosition, ProgressMatrixItem } from '@/types';
import { DoorThumbnail } from '../../../configuration/door-templates/_components/door-thumbnail';

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
  const hasSvg = !!(position.systemConfig as any)?.rootCell;
  const doorName = position.description || (position.doorType === 'window' ? 'Cửa sổ' : 'Cửa đi');
  const floorText = position.floor?.name || matrixItem?.floorName || 'Tầng 1';

  return (
    <div
      onClick={() => onToggle(position.id)}
      className={cn(
        'group relative flex flex-col bg-white border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 select-none text-left',
        isSelected
          ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.02] shadow-sm'
          : 'border-slate-200/80 hover:border-primary/50 hover:shadow-md',
      )}
    >
      {/* Top Header: Mã vị trí & Checkbox */}
      <div className="px-3 py-2 bg-white border-b border-slate-100 flex items-center justify-between gap-2">
        <span className="font-bold text-xs text-slate-800 tracking-tight" title={position.code}>
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

      {/* CAD Viewport / Thumbnail */}
      <div className="aspect-[4/3] w-full bg-slate-50/60 flex items-center justify-center p-2 overflow-hidden relative">
        {hasSvg ? (
          <div className="w-full h-full p-1 group-hover:scale-105 transition-transform duration-300 pointer-events-none">
            <DoorThumbnail
              systemConfig={position.systemConfig}
              hideDimensions={false}
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-300">
            <ImageOff size={24} />
            <span className="text-[10px]">Chưa có bản vẽ CAD</span>
          </div>
        )}
      </div>

      {/* Thông tin mô tả & kích thước */}
      <div className="p-2.5 border-t border-slate-100 space-y-1 bg-white">
        <p className="text-xs font-semibold text-slate-800 truncate" title={doorName}>
          {doorName}
        </p>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>
            {position.width} × {position.height} mm
          </span>
          <span className="text-slate-400">
            {(position.areaM2 ?? 0).toFixed(2)} m²
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
          <span className="truncate">{floorText}</span>
          {position.color?.name && (
            <span className="truncate max-w-[90px]" title={position.color.name}>
              {position.color.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
