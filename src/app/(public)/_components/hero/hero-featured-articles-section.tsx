'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import { getPublicNewsList } from '@/actions';
import {
  NEWS_CATEGORY_BADGE_MAP,
  NEWS_CATEGORY_MAP,
  PUBLIC_NEWS_QUERY_KEYS,
} from '@/config';
import { getFileUrl } from '@/utils';
import type { NewsArticle } from '@/types';

// Danh sách 6 bài viết tiêu biểu chuẩn XTTech (fallback nếu API chưa có bài viết)
const FALLBACK_FEATURED_ARTICLES: Array<
  Pick<NewsArticle, 'id' | 'title' | 'slug' | 'summary' | 'thumbnailUrl' | 'category' | 'createdAt'>
> = [
  {
    id: 101,
    title: 'XT Tech – XMS Fab: Giải pháp quản lý toàn diện cho xưởng nhôm kính và nội thất',
    slug: 'xttech-xms-fab-giai-phap-quan-ly-toan-dien-cho-xuong-nhom-kinh-va-noi-that',
    summary:
      'Hệ thống phần mềm may đo riêng cho từng quy mô xưởng, tự động hóa từ bóc tách kỹ thuật, barem nhôm đến in thẻ cắt A4 phân ca.',
    thumbnailUrl: null,
    category: 'technology_solution',
    createdAt: '2026-11-09T08:00:00.000Z',
  },
  {
    id: 102,
    title: 'Làm sao chủ xưởng nhôm kính nắm bắt tiến độ công trình và dòng tiền theo thời gian thực?',
    slug: 'lam-sao-chu-xuong-nhom-kinh-nam-duoc-tien-do-va-dong-tien',
    summary:
      'Giải bài toán thất thoát vật tư, chậm tiến độ lắp đặt và công nợ tồn đọng với ứng dụng quản lý công trường số hóa tích hợp QR Code và Live GPS.',
    thumbnailUrl: null,
    category: 'industry_knowledge',
    createdAt: '2026-11-08T09:30:00.000Z',
  },
  {
    id: 103,
    title: '10 ứng dụng công nghệ và tự động hóa trong quản trị phân xưởng cơ khí hiện đại 2025',
    slug: '10-ung-dung-cong-nghe-va-tu-dong-hoa-trong-quan-tri-phan-xuong-2025',
    summary:
      'Xu hướng chuyển đổi số mạnh mẽ trong ngành nhôm kính xây dựng: thuật toán tối ưu de-xe, live pricing lãi gộp và quản lý đa nền tảng Cloud.',
    thumbnailUrl: null,
    category: 'company_news',
    createdAt: '2026-11-07T14:15:00.000Z',
  },
  {
    id: 104,
    title: 'Tự động bóc tách barem nhôm kính: Cắt giảm 98% sai sót kỹ thuật cho phân xưởng',
    slug: 'tu-dong-boc-tach-barem-nhom-kinh-cat-giam-sai-sot-cho-phan-xuong',
    summary:
      'Không còn phụ thuộc vào trí nhớ của thợ chính. Hệ thống tự động tính toán kích thước kính, danh mục thanh nhôm và phụ kiện đồng bộ.',
    thumbnailUrl: null,
    category: 'technology_solution',
    createdAt: '2026-11-06T10:00:00.000Z',
  },
  {
    id: 105,
    title: 'Tối ưu hóa sơ đồ cắt nhôm thanh (De-xe): Bí quyết tiết kiệm hàng trăm triệu mỗi năm',
    slug: 'toi-uu-hoa-so-do-cat-nhom-thanh-tiet-kiem-chi-phi',
    summary:
      'Ứng dụng thuật toán thông minh sắp xếp cây nhôm nguyên, giảm tỷ lệ phôi vụn thừa xuống dưới 2%, tối đa hóa tỷ suất lợi nhuận xưởng.',
    thumbnailUrl: null,
    category: 'industry_knowledge',
    createdAt: '2026-11-05T15:20:00.000Z',
  },
  {
    id: 106,
    title: 'Quản trị thi công công trình từ xa: Số hóa nhật ký, chấm công GPS và nghiệm thu mã QR',
    slug: 'quan-tri-thi-cong-cong-trinh-tu-xa-so-hoa-nhat-ky-va-nghiem-thu',
    summary:
      'Kết nối liền mạch giữa xưởng sản xuất và đội thợ lắp dựng công trường. Cập nhật tiến độ tức thì trên ứng dụng di động XTTech.',
    thumbnailUrl: null,
    category: 'technology_solution',
    createdAt: '2026-11-04T09:00:00.000Z',
  },
];

export function HeroFeaturedArticlesSection() {
  // Lấy dữ liệu bài viết thực tế từ API public news
  const { data } = useQuery({
    queryKey: PUBLIC_NEWS_QUERY_KEYS.list,
    queryFn: () => getPublicNewsList({ limit: 12 }),
  });

  const apiArticles = data?.items || [];
  // Lấy danh sách bài viết phong phú (ít nhất 6 bài để trượt mượt mà)
  const baseArticles: NewsArticle[] =
    apiArticles.length >= 4
      ? (apiArticles as NewsArticle[])
      : (FALLBACK_FEATURED_ARTICLES as NewsArticle[]);

  const total = baseArticles.length;

  // Lặp 3 lần danh sách để tạo chuỗi trượt xoay vòng tròn vô tận không gián đoạn
  const EXTENDED_ARTICLES = [
    ...baseArticles.map((a, i) => ({ ...a, slideKey: `set1-${a.id}-${i}` })),
    ...baseArticles.map((a, i) => ({ ...a, slideKey: `set2-${a.id}-${i}` })),
    ...baseArticles.map((a, i) => ({ ...a, slideKey: `set3-${a.id}-${i}` })),
  ];

  // Bắt đầu từ bộ thứ 2 ở giữa
  const [currentIndex, setCurrentIndex] = useState(total);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);

  // Responsive: Desktop 3 cards, Tablet 2 cards, Mobile 1 card
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCount(3);
      } else if (window.innerWidth >= 640) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNext = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handlePrev = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, []);

  // Vòng lặp xoay tròn vô tận mượt mà (Infinite circular reset)
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

  // Tự động trượt mượt mà sang các bài khác: KHI HOVER VÀO LẬP TỨC TRƯỢT MỀM MẠI
  useEffect(() => {
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

  const itemWidthPercent = 100 / visibleCount;
  const translateOffset = currentIndex * itemWidthPercent;
  const activeDotIndex = ((currentIndex % total) + total) % total;

  return (
    <section className="py-16 lg:py-24 bg-[#fcfdfd] border-t border-slate-100 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header: Tiêu đề & Nút điều hướng vòng tròn */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary tracking-tight">
              Bài viết tiêu biểu
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
              Kiến thức quản trị sản xuất, bóc tách bareme & xu hướng công nghệ ngành nhôm kính
            </p>
          </div>

          {/* Nút điều hướng trái phải trượt mượt */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Xem bài trước"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Xem bài kế tiếp"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* VIEWPORT KHUNG TRƯỢT CAROUSEL TỰ ĐỘNG */}
        <div
          className="relative w-full overflow-hidden py-4 -mx-3"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
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
            {EXTENDED_ARTICLES.map((article) => {
              const categoryBadge = NEWS_CATEGORY_BADGE_MAP[article.category] || {
                label: NEWS_CATEGORY_MAP[article.category] || 'Tin tức',
                className: 'bg-primary/10 text-primary border-primary/20',
              };
              const thumbnailSrc = getFileUrl(article.thumbnailUrl);
              const href = `/news/${encodeURIComponent(article.slug)}`;

              return (
                <div
                  key={article.slideKey}
                  style={{ width: `${itemWidthPercent}%` }}
                  className="shrink-0 px-3"
                >
                  <article className="group flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-2xl">
                    <div className="space-y-4">
                      {/* Khung ảnh bài viết tiêu biểu bo tròn góc */}
                      <Link
                        href={href}
                        className="block aspect-16/10 w-full overflow-hidden rounded-2xl bg-slate-100 relative"
                      >
                        {thumbnailSrc ? (
                          <img
                            src={thumbnailSrc}
                            alt={article.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                          />
                        ) : (
                          /* Placeholder hình ảnh minh họa đậm chất công nghệ AI & Nhôm kính */
                          <div className="h-full w-full flex flex-col items-center justify-center bg-linear-to-br from-primary/15 via-primary/5 to-slate-100 text-primary p-6 text-center">
                            <Newspaper className="w-12 h-12 stroke-[1.5] text-primary/70 mb-2 transition-transform duration-300 group-hover:scale-110" />
                            <span className="text-[11px] font-bold tracking-wider uppercase text-primary/80">
                              XTTech Digital News
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Nội dung bài viết */}
                      <div className="space-y-2.5">
                        {/* Badge Chuyên mục dạng pill bo tròn */}
                        <div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${categoryBadge.className}`}
                          >
                            {categoryBadge.label}
                          </span>
                        </div>

                        {/* Tiêu đề bài viết kèm mũi tên điều hướng (→) */}
                        <h3 className="text-base sm:text-[17px] font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          <Link href={href} className="flex items-start justify-between gap-3">
                            <span>{article.title}</span>
                            <span className="text-primary font-bold text-lg shrink-0 mt-0.5 transition-transform group-hover:translate-x-1">
                              →
                            </span>
                          </Link>
                        </h3>

                        {/* Đoạn mô tả ngắn gọn */}
                        {article.summary && (
                          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2">
                            {article.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer bài viết: Ngày đăng & Link đọc tiếp */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>XTTech Insight</span>
                      <Link
                        href={href}
                        className="font-bold text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1"
                      >
                        <span>Chi tiết</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        {/* Thanh chỉ báo xoay vòng tròn (Dots Indicators) */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {baseArticles.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setIsTransitioning(true);
                setCurrentIndex(total + i);
              }}
              aria-label={`Chuyển tới bài viết số ${i + 1}`}
              className={`h-2 transition-all duration-500 rounded-full cursor-pointer ${
                i === activeDotIndex
                  ? 'w-8 bg-primary shadow-xs'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        {/* Nút Xem tất cả bài viết căn giữa bên dưới */}
        <div className="mt-10 sm:mt-12 text-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-200 bg-white text-xs sm:text-sm font-bold text-primary hover:border-primary hover:bg-primary/5 transition-all shadow-2xs"
          >
            <span>Xem tất cả bài viết</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HeroFeaturedArticlesSection;
