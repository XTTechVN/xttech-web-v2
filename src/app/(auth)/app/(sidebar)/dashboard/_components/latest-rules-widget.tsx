'use client';

import React, { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { getDocumentRules, getDocumentRulesSummary } from '@/actions/document';
import { DOCUMENT_TYPE_MAP } from '@/types';
import { RULES_QUERY_KEYS, cn } from '@/utils';

const formatShortDate = (isoDate?: string | null): string => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export function LatestRulesWidget() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: rulesData, isLoading } = useQuery({
    queryKey: RULES_QUERY_KEYS.list({ scope: 'all', status: 'published', limit: 5, offset: 0 }),
    queryFn: () => getDocumentRules({ scope: 'all', status: 'published', limit: 5, offset: 0 }),
    refetchInterval: 60_000,
  });

  const { data: summary } = useQuery({
    queryKey: RULES_QUERY_KEYS.summary,
    queryFn: getDocumentRulesSummary,
    refetchInterval: 60_000,
  });

  const items = rulesData?.items ?? [];
  const unreadCount = summary?.unreadCount ?? 0;

  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const nextIndex = Math.round(track.scrollLeft / track.clientWidth);
    if (nextIndex !== activeIndex) {
      setActiveIndex(Math.max(0, Math.min(items.length - 1, nextIndex)));
    }
  }, [activeIndex, items.length]);

  const scrollToSlide = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const bounded = Math.max(0, Math.min(items.length - 1, index));
    track.scrollTo({
      left: bounded * track.clientWidth,
      behavior: 'smooth',
    });
    setActiveIndex(bounded);
  }, [items.length]);

  const safeActiveIndex = items.length > 0 ? Math.min(activeIndex, items.length - 1) : 0;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-xs flex flex-col gap-3">
      {/* Header 1 dòng gọn gàng */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpenCheck size={16} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"
                title={`${unreadCount} cơ chế chưa đọc`}
              />
            )}
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 truncate">
              Cơ chế mới nhất
            </h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-mono font-bold tabular-nums shrink-0">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>
        </div>

        <Link
          href="/app/rules"
          className="inline-flex items-center gap-1 rounded-lg bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors shrink-0"
        >
          <span>Xem tất cả</span>
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Carousel lướt ngang từng thẻ nổi bật + Pagination Dots */}
      {isLoading ? (
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3.5 flex flex-col gap-2 animate-pulse">
          <div className="flex justify-between">
            <div className="h-3.5 w-28 rounded bg-slate-200" />
            <div className="h-4 w-20 rounded bg-slate-200" />
          </div>
          <div className="h-4 w-11/12 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-100 mt-1" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-3 text-xs text-slate-500">
          <FileText size={14} className="shrink-0 text-slate-400" />
          <span>Chưa có cơ chế / quy chế nào đang có hiệu lực.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {/* Track cuộn ngang mượt 60fps bằng CSS Scroll Snap */}
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth -mx-0.5 px-0.5"
          >
            {items.map((doc) => {
              const typeMeta = DOCUMENT_TYPE_MAP[doc.documentType];
              const isUnread = doc.isRead === false;
              const needsAck = Boolean(doc.requiresAcknowledgement && !doc.isAcknowledged);
              const dateLabel = formatShortDate(doc.effectiveDate || doc.createdAt);

              return (
                <Link
                  key={doc.id}
                  href="/app/rules"
                  className={cn(
                    'w-full shrink-0 snap-center rounded-xl border p-3.5 transition-colors flex flex-col justify-between gap-2.5',
                    isUnread
                      ? 'border-red-200/80 bg-red-50/30 hover:bg-red-50/60'
                      : 'border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/70'
                  )}
                >
                  {/* Hàng trên: Mã + Loại + Trạng thái */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isUnread && (
                        <span
                          className="w-2 h-2 rounded-full bg-red-500 shrink-0"
                          title="Chưa đọc"
                        />
                      )}
                      <span className="font-mono text-xs font-bold text-primary shrink-0">
                        {doc.code}
                      </span>
                      {typeMeta && (
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded-md text-[10px] font-medium border shrink-0',
                            typeMeta.badgeClass
                          )}
                        >
                          {typeMeta.label}
                        </span>
                      )}
                    </div>

                    {isUnread ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-semibold shrink-0">
                        Chưa đọc
                      </span>
                    ) : needsAck ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold shrink-0">
                        Cần xác nhận
                      </span>
                    ) : doc.isAcknowledged ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium shrink-0">
                        <CheckCircle2 size={10} />
                        Đã xác nhận
                      </span>
                    ) : null}
                  </div>

                  {/* Hàng giữa: Tiêu đề đầy đủ tối đa 2 dòng */}
                  <h4
                    className={cn(
                      'text-[13px] leading-snug line-clamp-2 min-h-[2.25rem]',
                      isUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'
                    )}
                  >
                    {doc.title}
                  </h4>

                  {/* Hàng dưới: Phòng ban + Ngày hiệu lực + CTA */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-[11px] text-slate-500">
                    <div className="flex items-center gap-3 min-w-0">
                      {dateLabel && (
                        <span className="inline-flex items-center gap-1 font-mono tabular-nums shrink-0">
                          <Calendar size={11} className="text-slate-400" />
                          {dateLabel}
                        </span>
                      )}
                      {doc.issuingDepartment?.name && (
                        <span className="inline-flex items-center gap-1 truncate">
                          <Building2 size={11} className="text-slate-400 shrink-0" />
                          <span className="truncate">{doc.issuingDepartment.name}</span>
                        </span>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-0.5 font-semibold text-primary shrink-0">
                      Chi tiết
                      <ArrowRight size={11} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Thanh điều hướng dưới đáy: Nút lùi + Dots phân trang + Nút tiến */}
          {items.length > 1 && (
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => scrollToSlide(safeActiveIndex - 1)}
                disabled={safeActiveIndex === 0}
                className="p-1 rounded-md text-slate-400 hover:text-primary hover:bg-primary/5 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Cơ chế trước"
              >
                <ChevronLeft size={14} />
              </button>

              <div className="flex items-center justify-center gap-1.5">
                {items.map((doc, idx) => {
                  const isActive = idx === safeActiveIndex;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => scrollToSlide(idx)}
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-200 cursor-pointer',
                        isActive ? 'w-5 bg-primary' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                      )}
                      aria-label={`Xem cơ chế ${idx + 1}`}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollToSlide(safeActiveIndex + 1)}
                disabled={safeActiveIndex === items.length - 1}
                className="p-1 rounded-md text-slate-400 hover:text-primary hover:bg-primary/5 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Cơ chế tiếp theo"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LatestRulesWidget;
