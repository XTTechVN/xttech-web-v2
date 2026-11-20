'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn } from 'lucide-react';
import { useHeroMarquee } from './use-hero-marquee';

export interface ProjectReportItem {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  imageSrc: string;
}

const PROJECT_REPORTS: ProjectReportItem[] = [
  {
    id: 'overview',
    number: '01',
    title: 'Báo cáo tổng quan & Tiến trình dự án',
    category: 'Quản lý dự án',
    description:
      'Theo dõi xuyên suốt 5 bước nghiệp vụ: Khảo sát đo đạc → Thiết kế bóc tách → Dự toán báo giá → Ký kết hợp đồng → Lệnh gia công lắp đặt.',
    imageSrc: '/images/projects/project-overview.png',
  },
  {
    id: 'pricing',
    number: '02',
    title: 'Báo cáo cấu thành giá & Dự toán tự động',
    category: 'Dự toán & Báo giá',
    description:
      'Live pricing engine bóc tách chi tiết: Vật tư nhôm kính (49%), Nhân công thợ (9%), Nhôm hao hụt (2%), Chi phí xưởng & Tiền lãi (31%).',
    imageSrc: '/images/projects/project-pricing.png',
  },
  {
    id: 'contract',
    number: '03',
    title: 'Báo cáo hợp đồng & Tiến độ dòng tiền',
    category: 'Hợp đồng & Tài chính',
    description:
      'Kiểm soát giá trị hợp đồng hiệu lực, theo dõi số tiền đã thu theo đợt thi công, số tiền còn lại và hỗ trợ lập phiếu thu theo tiến độ.',
    imageSrc: '/images/projects/project-contract.png',
  },
  {
    id: 'production',
    number: '04',
    title: 'Lệnh sản xuất & Tối ưu thẻ cắt A4',
    category: 'Phân xưởng sản xuất',
    description: 'Tự động gom cửa, lập lệnh sản xuất (LSX), tối ưu hóa sơ đồ cắt cây nhôm hỗ trợ giảm đề-xê thừa và theo dõi tiến độ xuất xưởng.',
    imageSrc: '/images/projects/project-production.png',
  },
  {
    id: 'spec',
    number: '05',
    title: 'Bóc tách kỹ thuật & Định mức vật tư',
    category: 'Kỹ thuật bóc tách',
    description:
      'Chuẩn hóa danh mục vật tư theo từng hệ nhôm, kính cường lực, phụ kiện đồng bộ; tự động sinh phiếu đề xuất xuất/nhập vật tư công trình.',
    imageSrc: '/images/projects/project-spec.png',
  },
];

/** Số bài tối thiểu trong 1 dải để băng chuyền phủ đủ chiều rộng màn hình. */
const MIN_ITEMS_PER_STRIP = 6;

export const HeroProjectReportsCarousel = () => {
  const [previewImage, setPreviewImage] = useState<ProjectReportItem | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // Dùng chung hook thước phim mượt mà useHeroMarquee như phần "Bài viết tiêu biểu"
  const { trackRef, viewportHandlers, step } = useHeroMarquee(35, Boolean(previewImage));

  // Lặp danh sách đủ dài cho 1 dải, rồi nhân đôi dải để chạy vòng lặp liền mạch (-50%)
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

  useEffect(() => {
    if (!previewImage) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewImage(null);
      } else if (e.key === 'ArrowLeft') {
        handleStepPreview(-1);
      } else if (e.key === 'ArrowRight') {
        handleStepPreview(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewImage, handleStepPreview]);

  return (
    <div className="relative w-full">
      {/* Nút điều hướng trên Tablet/PC */}
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

      {/* Dải thước phim: tự trượt mượt mà 60fps, dừng khi hover hoặc kéo chuột, vuốt kéo êm ái y hệt "Bài viết tiêu biểu" */}
      <div
        {...viewportHandlers}
        className="relative cursor-grab touch-pan-y overflow-hidden py-4 select-none active:cursor-grabbing [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
      >
        <div ref={trackRef} className="flex w-max will-change-transform">
          {track.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="w-[300px] shrink-0 px-3 sm:w-[360px] lg:w-[410px]">
              <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-2xl">
                {/* Vùng hiển thị ảnh báo cáo chụp thực tế */}
                <div
                  className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 cursor-pointer"
                  onClick={() => setPreviewImage(item)}
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

                {/* Phần thông tin & Số thứ tự dưới ảnh */}
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
                      onClick={() => setPreviewImage(item)}
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

      {/* Nút điều hướng trên mobile */}
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

      {/* Modal App Showcase 2 cột: Xem ảnh phóng to chi tiết */}
      {previewImage &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-100 flex items-center justify-center overscroll-contain bg-slate-950/85 p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-200"
          >
            <div className="flex w-full max-w-[96vw] items-center justify-center gap-2 sm:gap-4">
              {/* Nút Previous nằm hẳn bên ngoài modal */}
              <button
                type="button"
                onClick={() => handleStepPreview(-1)}
                aria-label="Màn hình trước"
                className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/95 text-slate-800 shadow-xl transition-all hover:scale-110 hover:border-primary hover:bg-primary hover:text-white cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="relative grid w-full max-w-[1160px] max-h-[94vh] grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
                {/* CỘT TRÁI (9 cols): Khung ảnh tràn viền */}
                <div className="lg:col-span-9 flex flex-col bg-slate-100">
                  <div className="relative flex-1 min-h-[260px] max-h-[62vh] lg:max-h-[92vh] overflow-auto flex items-center justify-center">
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-2 lg:hidden">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setIsZoomed(false);
                        }}
                        aria-label="Đóng xem ảnh"
                        className="rounded-lg border border-slate-200 bg-white/95 p-1.5 text-slate-500 shadow-sm hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <img
                      src={previewImage.imageSrc}
                      alt={previewImage.title}
                      onClick={() => setIsZoomed((z) => !z)}
                      className={`block w-full transition-transform duration-300 cursor-zoom-in ${
                        isZoomed ? 'scale-125 sm:scale-135 origin-center cursor-zoom-out' : 'h-full object-contain'
                      }`}
                    />
                  </div>
                </div>

                {/* CỘT PHẢI (3 cols): Thông tin chi tiết & Danh sách chuyển nhanh */}
                <div className="lg:col-span-3 flex flex-col justify-start border-t lg:border-t-0 lg:border-l border-slate-200 bg-white p-5 sm:p-6 text-slate-900 overflow-y-auto max-h-[32vh] lg:max-h-[94vh]">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 font-mono text-xs font-black text-primary">
                          {previewImage.number} / 0{PROJECT_REPORTS.length}
                        </span>
                        <span className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                          {previewImage.category}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setIsZoomed(false);
                        }}
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

                    {/* Nút chuyển trái/phải trên mobile */}
                    <div className="flex sm:hidden items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleStepPreview(-1)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Trước</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStepPreview(1)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        <span>Tiếp</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Danh sách chuyển nhanh 5 màn hình */}
                    <div className="pt-2 space-y-1.5">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Chuyển nhanh màn hình</span>
                      <div className="space-y-1.5">
                        {PROJECT_REPORTS.map((rpt) => {
                          const isSelected = rpt.id === previewImage.id;
                          return (
                            <button
                              key={rpt.id}
                              type="button"
                              onClick={() => {
                                setPreviewImage(rpt);
                                setIsZoomed(false);
                              }}
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

              {/* Nút Next nằm hẳn bên ngoài modal */}
              <button
                type="button"
                onClick={() => handleStepPreview(1)}
                aria-label="Màn hình tiếp theo"
                className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/95 text-slate-800 shadow-xl transition-all hover:scale-110 hover:border-primary hover:bg-primary hover:text-white cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default HeroProjectReportsCarousel;
