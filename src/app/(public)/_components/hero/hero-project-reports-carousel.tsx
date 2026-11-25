'use client';

import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, ZoomIn } from 'lucide-react';
import { PROJECT_REPORTS, type ProjectReportItem } from './hero.constants';
import { ProjectReportPreviewModal } from './modals';
import { useHeroMarquee } from './use-hero-marquee';

/** Số bài tối thiểu trong 1 dải để băng chuyền phủ đủ chiều rộng màn hình. */
const MIN_ITEMS_PER_STRIP = 6;

export const HeroProjectReportsCarousel = () => {
  const [previewImage, setPreviewImage] = useState<ProjectReportItem | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const { trackRef, viewportHandlers, step } = useHeroMarquee(35, Boolean(previewImage));

  const repeat = Math.max(1, Math.ceil(MIN_ITEMS_PER_STRIP / PROJECT_REPORTS.length));
  const strip = Array.from({ length: repeat }, () => PROJECT_REPORTS).flat();
  const track = [...strip, ...strip];

  const handleStepPreview = useCallback((stepVal: -1 | 1) => {
    setPreviewImage((current) => {
      if (!current) return null;
      const idx = PROJECT_REPORTS.findIndex((item) => item.id === current.id);
      const nextIdx = (idx + stepVal + PROJECT_REPORTS.length) % PROJECT_REPORTS.length;
      return PROJECT_REPORTS[nextIdx];
    });
    setIsZoomed(false);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewImage(null);
    setIsZoomed(false);
  }, []);

  const handleSelectReport = useCallback((item: ProjectReportItem) => {
    setPreviewImage(item);
    setIsZoomed(false);
  }, []);

  return (
    <div className="relative w-full">
      <div className="hidden sm:flex absolute -top-14 right-0 items-center gap-2 z-10">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Xem báo cáo trước"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Xem báo cáo kế tiếp"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div
        {...viewportHandlers}
        className="relative cursor-grab touch-pan-y overflow-hidden py-4 select-none active:cursor-grabbing [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
      >
        <div ref={trackRef} className="flex w-max will-change-transform">
          {track.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="w-[300px] shrink-0 px-3 sm:w-[360px] lg:w-[410px]">
              <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-2xl">
                <div
                  className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 cursor-pointer"
                  onClick={() => handleSelectReport(item)}
                >
                  <Image
                    src={item.imageSrc}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 transition-all duration-300 group-hover:bg-slate-900/25 flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/85 px-3 py-1.5 text-xs font-bold text-white opacity-0 backdrop-blur-xs transition-all duration-300 group-hover:opacity-100 group-hover:scale-105">
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span>Phóng to xem chi tiết</span>
                    </span>
                  </div>

                  <div className="absolute top-2.5 left-2.5 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs backdrop-blur-xs">
                    {item.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-1 rounded-full bg-amber-500 transition-all duration-300 group-hover:bg-primary group-hover:h-7" />
                      <span className="text-xl font-black tracking-tight text-amber-500 transition-colors duration-300 group-hover:text-primary">
                        {item.number}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1 transition-colors duration-300 group-hover:text-primary">
                        {item.title}
                      </h4>
                    </div>
                    <p className="mt-2.5 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => handleSelectReport(item)}
                      className="cursor-pointer text-primary font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                      <span>Xem số liệu thực tế</span>
                    </button>
                    <span className="text-slate-400 text-[11px]">Giao diện XTTech XMS</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex sm:hidden items-center justify-center gap-3 mt-3">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Xem báo cáo trước"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-2xs active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Xem báo cáo kế tiếp"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-2xs active:scale-95 cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <ProjectReportPreviewModal
        previewImage={previewImage}
        reports={PROJECT_REPORTS}
        isZoomed={isZoomed}
        onToggleZoom={() => setIsZoomed((z) => !z)}
        onSelectReport={handleSelectReport}
        onStep={handleStepPreview}
        onClose={handleClosePreview}
      />
    </div>
  );
};

export default HeroProjectReportsCarousel;
