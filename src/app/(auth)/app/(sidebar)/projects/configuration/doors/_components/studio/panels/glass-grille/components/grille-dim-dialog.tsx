'use client';

import React from 'react';
import { Ruler, X } from 'lucide-react';
import { EditingDim } from '../types';

interface GrilleDimDialogProps {
  editingDim: EditingDim | null;
  dimInputValue: string;
  setDimInputValue: (val: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export const GrilleDimDialog: React.FC<GrilleDimDialogProps> = ({
  editingDim,
  dimInputValue,
  setDimInputValue,
  onClose,
  onSave,
}) => {
  if (!editingDim) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[340px] bg-white rounded-2xl p-5 shadow-2xl border border-gray-100 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <Ruler size={16} className="text-blue-600" />
            <span>Sửa kích thước</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-700 mb-1">{editingDim.label}</div>
          <div className="relative">
            <input
              type="number"
              min={1}
              autoFocus
              value={dimInputValue}
              onChange={(e) => setDimInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSave();
                if (e.key === 'Escape') onClose();
              }}
              className="w-full h-10 px-3 pr-12 font-mono font-bold text-sm bg-white rounded-xl border-2 border-blue-400 focus:outline-none focus:border-blue-600 text-gray-900 shadow-xs"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
              mm
            </span>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
          >
            Lưu kích thước
          </button>
        </div>
      </div>
    </div>
  );
};
