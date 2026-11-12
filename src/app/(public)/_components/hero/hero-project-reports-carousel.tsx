'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, Pause, Play, X, ZoomIn } from 'lucide-react';

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
    description: 'Theo dõi xuyên suốt 5 bước nghiệp vụ: Khảo sát đo đạc → Thiết kế bóc tách → Dự toán báo giá → Ký kết hợp đồng → Lệnh gia công lắp đặt.',
    imageSrc: '/images/projects/project-overview.png',
  },
  {
    id: 'pricing',
    number: '02',
    title: 'Báo cáo cấu thành giá & Dự toán tự động',
    category: 'Dự toán & Báo giá',
    description: 'Live pricing engine bóc tách chi tiết: Vật tư nhôm kính (49%), Nhân công thợ (9%), Nhôm hao hụt (2%), Chi phí xưởng & Tiền lãi (31%).',
    imageSrc: '/images/projects/project-pricing.png',
  },
  {
    id: 'contract',
    number: '03',
    title: 'Báo cáo hợp đồng & Tiến độ dòng tiền',
    category: 'Hợp đồng & Tài chính',
    description: 'Kiểm soát giá trị hợp đồng hiệu lực, theo dõi số tiền đã thu theo đợt thi công, số tiền còn lại và tự động lập phiếu thu công nợ.',
    imageSrc: '/images/projects/project-contract.png',
  },
  {
    id: 'production',
    number: '04',
    title: 'Lệnh sản xuất & Tối ưu thẻ cắt A4',
    category: 'Phân xưởng sản xuất',
    description: 'Tự động gom cửa, lập lệnh sản xuất (LSX), tối ưu hóa sơ đồ cắt cây nhôm giảm đề-xê thừa dưới 2% và đo lường tiến độ xuất xưởng realtime.',
    imageSrc: '/images/projects/project-production.png',
  },
  {
    id: 'spec',
    number: '05',
    title: 'Bóc tách kỹ thuật & Định mức vật tư',
    category: 'Kỹ thuật bóc tách',
    description: 'Chuẩn hóa danh mục vật tư theo từng hệ nhôm, kính cường lực, phụ kiện đồng bộ; tự động sinh phiếu đề xuất xuất/nhập vật tư công trình.',
    imageSrc: '/images/projects/project-spec.png',
  },
];

// Tạo danh sách lặp 3 lần để trượt xoay vòng tròn vô tận không bao giờ gián đoạn
const EXTENDED_REPORTS = [
  ...PROJECT_REPORTS.map((item, idx) => ({ ...item, uniqueKey: `set1-${item.id}-${idx}` })),
  ...PROJECT_REPORTS.map((item, idx) => ({ ...item, uniqueKey: `set2-${item.id}-${idx}` })),
  ...PROJECT_REPORTS.map((item, idx) => ({ ...item, uniqueKey: `set3-${item.id}-${idx}` })),
];

export const HeroProjectReportsCarousel = () => {
  const total = PROJECT_REPORTS.length; // 5 items
  // Bắt đầu từ bộ thứ 2 ở giữa để trượt được cả trái lẫn phải
  const [currentIndex, setCurrentIndex] = useState(total);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [previewImage, setPreviewImage] = useState<ProjectReportItem | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [autoSlideInterval, setAutoSlideInterval] = useState(3200);

  const containerRef = useRef<HTMLDivElement>(null);

  // Số lượng card hiển thị tùy theo responsive screen
  // Desktop: 3 cards, Tablet: 2 cards, Mobile: 1 card
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCount(3);
      } else if (window.innerWidth >= 640) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const handleNext = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handlePrev = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, []);

  // Xử lý vòng lặp xoay tròn vô tận mượt mà (Infinite circular reset)
  useEffect(() => {
    if (currentIndex >= total * 2) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(total);
      }, 700);
      return () => clearTimeout(timer);
    } else if (currentIndex < total) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(total * 2 - 1);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, total]);

  // Tự động trượt mượt mà liên tục: KHI HOVER VÀO LẬP TỨC TRƯỢT MỀM MẠI
  useEffect(() => {
    // Nếu hover vào, trượt ngay sau 400ms rồi tiếp tục trượt đều đặn mỗi 2.2s
    let initialTimer: NodeJS.Timeout | null = null;
    let intervalTimer: NodeJS.Timeout | null = null;

    if (isHovered) {
      initialTimer = setTimeout(() => {
        handleNext();
      }, 400);

      intervalTimer = setInterval(() => {
        handleNext();
      }, 2200);
    } else {
      intervalTimer = setInterval(() => {
        handleNext();
      }, 3500);
    }

    return () => {
      if (initialTimer) clearTimeout(initialTimer);
      if (intervalTimer) clearInterval(intervalTimer);
    };
  }, [isHovered, handleNext]);

  // Tính toán phần trăm dịch chuyển của track
  const itemWidthPercent = 100 / visibleCount;
  const translateOffset = currentIndex * itemWidthPercent;

  // Tính số thứ tự đang active thực tế (0 đến 4)
  const activeDotIndex = ((currentIndex % total) + total) % total;

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thanh công cụ: Nút điều hướng vòng tròn trượt mượt */}
      <div className="absolute -top-14 right-0 flex items-center gap-2 sm:-top-16">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Xem báo cáo trước"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Xem báo cáo kế tiếp"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* VIEWPORT KHUNG TRƯỢT (OVERFLOW HIDDEN) */}
      <div className="overflow-hidden py-4 -mx-3">
        {/* TRACK TRƯỢT MƯỢT MÀ VỚI CSS TRANSFORM CUBIC-BEZIER */}
        <div
          className="flex flex-row"
          style={{
            transform: `translateX(-${translateOffset}%)`,
            transition: isTransitioning
              ? 'transform 750ms cubic-bezier(0.22, 1, 0.36, 1)'
              : 'none',
          }}
        >
          {EXTENDED_REPORTS.map((item, idx) => {
            return (
              <div
                key={item.uniqueKey}
                style={{ width: `${itemWidthPercent}%` }}
                className="shrink-0 px-3 transition-opacity duration-300"
              >
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

                  {/* Phần thông tin & Số thứ tự dưới ảnh (tham khảo style Ảnh 4) */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        {/* Đường line màu cam/amber */}
                        <div className="h-6 w-1 rounded-full bg-amber-500 transition-all duration-300 group-hover:bg-primary group-hover:h-7" />
                        {/* Số thứ tự 01, 02... */}
                        <span className="text-xl font-black tracking-tight text-amber-500 transition-colors duration-300 group-hover:text-primary">
                          {item.number}
                        </span>
                        {/* Tiêu đề báo cáo */}
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1 transition-colors duration-300 group-hover:text-primary">
                          {item.title}
                        </h4>
                      </div>
                      <p className="mt-2.5 text-xs sm:text-[13px] leading-relaxed text-slate-600 line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    {/* Nút xem chi tiết & Nguồn dữ liệu */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setPreviewImage(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                        <span>Xem số liệu thực tế</span>
                      </button>
                      <span className="text-[11px] font-medium text-slate-400">
                        Dự án #4 Roland 134
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Thanh chỉ báo tiến trình xoay vòng (Dots indicators) */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {PROJECT_REPORTS.map((rpt, i) => (
          <button
            key={rpt.id}
            type="button"
            onClick={() => {
              setIsTransitioning(true);
              setCurrentIndex(total + i);
            }}
            aria-label={`Chuyển tới ${rpt.title}`}
            className={`h-2 transition-all duration-500 rounded-full cursor-pointer ${
              i === activeDotIndex
                ? 'w-8 bg-primary shadow-xs'
                : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>

      {/* Modal Lightbox phóng to ảnh sắc nét */}
      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-5xl w-full overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-xs font-black text-amber-600">
                  {previewImage.number}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {previewImage.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Giao diện thực tế phần mềm quản lý nhôm kính XTTECH
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                aria-label="Đóng xem ảnh"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Hình ảnh sắc nét */}
            <div className="relative max-h-[75vh] overflow-auto p-4 bg-slate-900/5 flex items-center justify-center">
              <img
                src={previewImage.imageSrc}
                alt={previewImage.title}
                className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-md"
              />
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 px-6 py-3 bg-white flex items-center justify-between text-xs text-slate-600">
              <span>{previewImage.description}</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroProjectReportsCarousel;
