'use client';

import React from 'react';
import { CheckCircle2, Upload, X } from 'lucide-react';
import type { SupplierDoorImage } from '@/types';
import { getFileUrl } from '@/utils';

export interface NewSupplierImagePreview {
  id: string;
  file: File;
  previewUrl: string;
}

interface SupplierDoorImagesFieldProps {
  doorName: string;
  existingImages: SupplierDoorImage[];
  newImages: NewSupplierImagePreview[];
  primaryImageId: number | null;
  newPrimaryIdx: number;
  onAddFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectExistingPrimary: (id: number) => void;
  onRemoveExisting: (id: number) => void;
  onSelectNewPrimary: (index: number) => void;
  onRemoveNew: (id: string) => void;
}

export function SupplierDoorImagesField({
  doorName,
  existingImages,
  newImages,
  primaryImageId,
  newPrimaryIdx,
  onAddFiles,
  onSelectExistingPrimary,
  onRemoveExisting,
  onSelectNewPrimary,
  onRemoveNew,
}: SupplierDoorImagesFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Hình ảnh catalog mẫu cửa
        </label>
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 text-primary text-xs font-semibold cursor-pointer hover:bg-primary/10 transition-colors">
          <Upload className="w-3.5 h-3.5" />
          <span>Tải ảnh lên</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={onAddFiles} />
        </label>
      </div>

      {(existingImages.length > 0 || newImages.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-1">
          {existingImages.map((img) => {
            const isPrimary = primaryImageId === img.id;
            return (
              <div key={img.id} className="relative group rounded-lg border border-slate-200 overflow-hidden aspect-square bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getFileUrl(img.imageUrl)} alt={doorName} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => onSelectExistingPrimary(img.id)}
                  className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer ${
                    isPrimary ? 'bg-primary text-white' : 'bg-white/90 text-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{isPrimary ? 'Ảnh chính' : 'Đặt chính'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveExisting(img.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 cursor-pointer"
                  aria-label="Xóa ảnh"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {newImages.map((img, idx) => {
            const isPrimary = primaryImageId === null && newPrimaryIdx === idx;
            return (
              <div key={img.id} className="relative group rounded-lg border border-primary/30 overflow-hidden aspect-square bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.previewUrl} alt="Ảnh mới" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => onSelectNewPrimary(idx)}
                  className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer ${
                    isPrimary ? 'bg-primary text-white' : 'bg-white/90 text-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{isPrimary ? 'Ảnh chính' : 'Mới'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveNew(img.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 cursor-pointer"
                  aria-label="Bỏ ảnh mới"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
