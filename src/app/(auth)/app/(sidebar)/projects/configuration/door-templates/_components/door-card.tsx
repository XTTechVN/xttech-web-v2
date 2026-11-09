'use client';

import React, { useState } from 'react';
import { ImageOff, Pencil, ClipboardList, Trash2 } from 'lucide-react';
import { getDoorTypeConfig, type Door } from '@/types';
import { BASE_MINIO_URL } from '@/config';
import { DoorThumbnail } from '@/components';

export interface DoorCardProps {
  door: Door;
  onEdit: (door: Door) => void;
  onCopy: (door: Door) => void;
  onDelete: (door: Door) => void;
}

export function DoorCard({ door, onEdit, onCopy, onDelete }: DoorCardProps) {
  const [imgError, setImgError] = useState(false);
  const hasSvg = Boolean((door.systemConfig as Record<string, unknown> | undefined)?.rootCell);

  const imgUrl = (() => {
    const primary = door.images?.find((i) => i.isPrimary);
    const path = primary?.imagePath ?? door.imagePath;
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BASE_MINIO_URL}/${path.replace(/^\//, '')}`;
  })();

  const typeConfig = getDoorTypeConfig(door.type);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onEdit(door)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit(door);
        }
      }}
      className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-primary hover:ring-1 hover:ring-primary/25 hover:shadow-md transition-all text-left cursor-pointer"
    >
      <div className="aspect-[4/3] w-full bg-slate-50 flex items-center justify-center overflow-hidden relative">
        {hasSvg ? (
          <div className="w-full h-full p-1.5 group-hover:scale-105 transition-transform duration-300">
            <DoorThumbnail door={door} />
          </div>
        ) : imgUrl && !imgError ? (
          <img
            src={imgUrl}
            alt={door.name}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-slate-300">
            <ImageOff size={28} />
            <span className="text-[11px] font-medium">Chưa có bản vẽ</span>
          </div>
        )}

        {/* Hover Action Buttons: Edit, Copy, Delete */}
        <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2.5 z-10">
          <button
            type="button"
            title="Chỉnh sửa mẫu cửa"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(door);
            }}
            className="w-9 h-9 rounded-full bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary hover:scale-110 transition-all duration-150 cursor-pointer"
          >
            <Pencil size={15} />
          </button>

          <button
            type="button"
            title="Sao chép mẫu cửa"
            onClick={(e) => {
              e.stopPropagation();
              onCopy(door);
            }}
            className="w-9 h-9 rounded-full bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary hover:scale-110 transition-all duration-150 cursor-pointer"
          >
            <ClipboardList size={15} />
          </button>

          <button
            type="button"
            title="Xóa mẫu cửa"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(door);
            }}
            className="w-9 h-9 rounded-full bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:scale-110 transition-all duration-150 cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="p-3 border-t border-slate-100 flex flex-col gap-1.5 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {door.code && (
            <span className="inline-flex text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/70">
              {door.code}
            </span>
          )}
          {door.type && (
            <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded border ${typeConfig.className}`}>
              {typeConfig.label}
            </span>
          )}
        </div>
        <p className="text-xs font-semibold text-slate-800 group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {door.name}
        </p>
      </div>
    </div>
  );
}
