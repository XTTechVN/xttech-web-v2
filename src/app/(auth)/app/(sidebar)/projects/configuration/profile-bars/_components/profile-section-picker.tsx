'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import type { ProfileSection } from '@/types';

interface ProfileSectionPickerProps {
  section: ProfileSection | null;
  onOpenLibrary: () => void;
  onClear: () => void;
}

export function ProfileSectionPicker({ section, onOpenLibrary, onClear }: ProfileSectionPickerProps) {
  return (
    <div className="flex flex-col items-center justify-center pt-1 pb-1">
      <span className="text-[11px] font-bold text-slate-500 tracking-wider mb-2">MẶT CẮT PROFILE</span>
      <div className="relative group">
        <div
          onClick={onOpenLibrary}
          title={section ? 'Bấm để đổi mặt cắt khác' : 'Bấm để chọn mặt cắt từ thư viện'}
          className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 hover:border-primary hover:bg-slate-50 flex flex-col items-center justify-center p-2 cursor-pointer transition shadow-2xs group"
        >
          {section ? (
            <svg
              viewBox={section.viewBox || '0 0 100 100'}
              className="w-full h-full stroke-slate-700 fill-none transition-transform group-hover:scale-105"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={section.svgPathData} />
            </svg>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400 group-hover:text-primary transition">
              <Layers className="w-8 h-8 stroke-1" />
              <span className="text-[11px] font-medium text-center leading-tight">Chọn mặt cắt</span>
            </div>
          )}
        </div>
        {section && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            title="Gỡ mặt cắt này"
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center text-xs font-bold shadow-md cursor-pointer transition transform hover:scale-110 z-10"
          >
            ✕
          </button>
        )}
      </div>
      <span className="text-[11px] text-slate-400 mt-1.5 font-medium">{section ? section.name || 'SVG (Vector)' : 'SVG (Vector)'}</span>
    </div>
  );
}
