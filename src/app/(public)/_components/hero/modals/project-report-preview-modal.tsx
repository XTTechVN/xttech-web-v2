'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ProjectReportItem } from '../hero.constants';

interface ProjectReportPreviewModalProps {
  previewImage: ProjectReportItem | null;
  reports: ProjectReportItem[];
  isZoomed: boolean;
  onToggleZoom: () => void;
  onSelectReport: (item: ProjectReportItem) => void;
  onStep: (direction: -1 | 1) => void;
  onClose: () => void;
}

export function ProjectReportPreviewModal({
  previewImage,
  reports,
  isZoomed,
  onToggleZoom,
  onSelectReport,
  onStep,
  onClose,
}: ProjectReportPreviewModalProps) {
  useEffect(() => {
    if (!previewImage) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onStep(-1);
      } else if (e.key === 'ArrowRight') {
        onStep(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewImage, onStep, onClose]);

  if (!previewImage || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-100 flex items-center justify-center overscroll-contain bg-slate-950/85 p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="flex w-full max-w-[96vw] items-center justify-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => onStep(-1)}
          aria-label="Màn hình trước"
          className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/95 text-slate-800 shadow-xl transition-all hover:scale-110 hover:border-primary hover:bg-primary hover:text-white cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="relative grid w-full max-w-[1160px] max-h-[94vh] grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
          <div className="lg:col-span-9 flex flex-col bg-slate-100">
            <div className="relative flex-1 min-h-[260px] max-h-[62vh] lg:max-h-[92vh] overflow-auto flex items-center justify-center">
              <div className="absolute top-3 right-3 z-10 flex items-center gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng xem ảnh"
                  className="rounded-lg border border-slate-200 bg-white/95 p-1.5 text-slate-500 shadow-sm hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <img
                src={previewImage.imageSrc}
                alt={previewImage.title}
                onClick={onToggleZoom}
                className={`block w-full transition-transform duration-300 cursor-zoom-in ${
                  isZoomed ? 'scale-125 sm:scale-135 origin-center cursor-zoom-out' : 'h-full object-contain'
                }`}
              />
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col justify-start border-t lg:border-t-0 lg:border-l border-slate-200 bg-white p-5 sm:p-6 text-slate-900 overflow-y-auto max-h-[32vh] lg:max-h-[94vh]">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 font-mono text-xs font-black text-primary">
                    {previewImage.number} / 0{reports.length}
                  </span>
                  <span className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                    {previewImage.category}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng xem ảnh"
                  className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black leading-snug text-slate-900">{previewImage.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{previewImage.description}</p>
              </div>

              <div className="flex sm:hidden items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onStep(-1)}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Trước</span>
                </button>
                <button
                  type="button"
                  onClick={() => onStep(1)}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <span>Tiếp</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="pt-2 space-y-1.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Chuyển nhanh màn hình
                </span>
                <div className="space-y-1.5">
                  {reports.map((rpt) => {
                    const isSelected = rpt.id === previewImage.id;
                    return (
                      <button
                        key={rpt.id}
                        type="button"
                        onClick={() => onSelectReport(rpt)}
                        className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white font-bold shadow-sm'
                            : 'border border-slate-200/80 bg-slate-50/80 text-slate-700 hover:border-primary/30 hover:bg-primary/5 hover:text-primary'
                        }`}
                      >
                        <span className={`font-mono text-[11px] font-black ${isSelected ? 'text-white/90' : 'text-primary'}`}>
                          {rpt.number}
                        </span>
                        <span className="truncate">{rpt.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onStep(1)}
          aria-label="Màn hình tiếp theo"
          className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/95 text-slate-800 shadow-xl transition-all hover:scale-110 hover:border-primary hover:bg-primary hover:text-white cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
