'use client';

import React from 'react';
import { ImageOff, Layers, Star, Tag } from 'lucide-react';
import { BASE_MINIO_URL } from '@/config';
import { getDoorTypeConfig, type Door } from '@/types';
import { DoorThumbnail } from '../../../../configuration/door-templates/_components/door-thumbnail';
import type { DoorSeriesGroup } from '../hooks/use-template-door-picker';

interface TemplateDoorCardProps {
  door: Door;
  onSelect: (door: Door) => void;
}

function TemplateDoorCard({ door, onSelect }: TemplateDoorCardProps) {
  const sc = (door.systemConfig || {}) as Record<string, unknown>;
  const hasSvg = Boolean(sc.rootCell);
  const typeConfig = getDoorTypeConfig(door.type);

  const primaryImage = door.images?.find((i) => i.isPrimary)?.imagePath || door.imagePath;
  const imageUrl = primaryImage
    ? primaryImage.startsWith('http')
      ? primaryImage
      : `${BASE_MINIO_URL}/${primaryImage.replace(/^\//, '')}`
    : null;

  return (
    <div
      onClick={() => onSelect(door)}
      className="group bg-white rounded-xl border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between cursor-pointer"
    >
      <div className="aspect-[4/3] w-full bg-slate-50/60 flex items-center justify-center overflow-hidden relative p-2.5 border-b border-slate-100">
        {hasSvg ? (
          <div className="w-full h-full group-hover:scale-[1.03] transition-transform duration-300 pointer-events-none">
            <DoorThumbnail door={door} hideDimensions={false} className="w-full h-full" />
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={door.name}
            className="w-full h-full object-contain p-1.5 group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-300">
            <ImageOff size={24} />
            <span className="text-[11px]">Chưa có bản vẽ</span>
          </div>
        )}

        <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-slate-800 text-xs font-semibold shadow-md border border-slate-200">
            Chọn mẫu này
          </span>
        </div>
      </div>

      <div className="p-3 space-y-1 bg-white">
        <div>
          <span
            className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px] font-semibold truncate max-w-full"
            title={door.code || `#${door.id}`}
          >
            {door.code || `#${door.id}`}
          </span>
        </div>
        <p
          className="text-xs font-bold text-slate-800 truncate group-hover:text-primary transition-colors"
          title={door.name}
        >
          {door.name}
        </p>
        <p className="text-[11px] text-slate-400 truncate">{typeConfig.label}</p>
      </div>
    </div>
  );
}

export interface TemplateDoorCatalogGridProps {
  isLoading: boolean;
  filteredDoors: Door[];
  groupedDoors: DoorSeriesGroup[];
  groupBySeries: boolean;
  onSelectDoor: (door: Door) => void;
}

export function TemplateDoorCatalogGrid({
  isLoading,
  filteredDoors,
  groupedDoors,
  groupBySeries,
  onSelectDoor,
}: TemplateDoorCatalogGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="animate-pulse rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="aspect-[4/3] bg-slate-100" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-4 w-3/4 bg-slate-100 rounded" />
              <div className="h-3 w-1/3 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredDoors.length === 0) {
    return (
      <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-slate-400 text-xs gap-1.5">
        <Layers size={28} className="text-slate-300" />
        <span className="font-medium text-slate-500">Không tìm thấy mẫu cửa nào phù hợp</span>
        <span>Hãy thử chọn hãng nhôm khác hoặc xóa bộ lọc tìm kiếm.</span>
      </div>
    );
  }

  if (!groupBySeries) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredDoors.map((door) => (
          <TemplateDoorCard key={door.id} door={door} onSelect={onSelectDoor} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedDoors.map((group) => (
        <div key={group.seriesId ?? group.seriesName} className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shrink-0">
              <Tag size={12} className="text-indigo-600" />
              <span>{group.seriesName}</span>
              {group.isDefaultSeries && (
                <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
              )}
            </span>
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] text-slate-400 font-medium shrink-0">
              {group.doors.length} mẫu
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {group.doors.map((door) => (
              <TemplateDoorCard key={door.id} door={door} onSelect={onSelectDoor} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
