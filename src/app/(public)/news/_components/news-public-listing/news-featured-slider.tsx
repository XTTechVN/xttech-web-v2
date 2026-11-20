import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { NewsArticle } from '@/types';
import { NewsArticleCard } from '../news-article-card';

interface NewsFeaturedSliderProps {
  articles: NewsArticle[];
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  onHoverChange: (isHovering: boolean) => void;
}

export function NewsFeaturedSlider({ articles, activeIndex, setActiveIndex, onHoverChange }: NewsFeaturedSliderProps) {
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    lockedAxis: 'x' | 'y' | null;
  }>({ active: false, startX: 0, startY: 0, lockedAxis: null });
  const didSwipeRef = useRef(false);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const stepSlide = (delta: -1 | 1) => {
    if (articles.length <= 1) return;
    setActiveIndex((prev) => (prev + delta + articles.length) % articles.length);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (articles.length <= 1) return;
    const touch = e.touches[0];
    if (!touch) return;
    dragRef.current = { active: true, startX: touch.clientX, startY: touch.clientY, lockedAxis: null };
    didSwipeRef.current = false;
    setIsDragging(true);
    setDragOffsetPx(0);
    onHoverChange(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const touch = e.touches[0];
    if (!drag.active || !touch) return;

    const dx = touch.clientX - drag.startX;
    const dy = touch.clientY - drag.startY;

    if (!drag.lockedAxis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      drag.lockedAxis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
    }

    if (drag.lockedAxis === 'x') {
      didSwipeRef.current = true;
      setDragOffsetPx(dx);
    }
  };

  const handleTouchEnd = () => {
    if (!dragRef.current.active) return;
    if (dragOffsetPx <= -40) {
      stepSlide(1);
    } else if (dragOffsetPx >= 40) {
      stepSlide(-1);
    }
    dragRef.current = { active: false, startX: 0, startY: 0, lockedAxis: null };
    setIsDragging(false);
    setDragOffsetPx(0);
    onHoverChange(false);
    setTimeout(() => {
      didSwipeRef.current = false;
    }, 50);
  };

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (didSwipeRef.current) {
      e.preventDefault();
      e.stopPropagation();
      didSwipeRef.current = false;
    }
  };
  return (
    <div
      className="group/slide rounded-lg bg-white border border-slate-200/90 shadow-sm p-5 space-y-4 overflow-hidden"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <h3 className="text-lg font-bold text-primary">Tiêu điểm nổi bật</h3>

        {articles.length > 1 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono tabular-nums text-slate-400 mr-1">
              {activeIndex + 1}/{articles.length}
            </span>
            <button
              type="button"
              onClick={() =>
                setActiveIndex(
                  (prev) =>
                    (prev - 1 + articles.length) %
                    articles.length,
                )
              }
              aria-label="Bài nổi bật trước"
              className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveIndex(
                  (prev) => (prev + 1) % articles.length,
                )
              }
              aria-label="Bài nổi bật tiếp theo"
              className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Khung trượt Slide ngang mượt mà - hỗ trợ vuốt tay trên mobile */}
        <div
          className="overflow-hidden rounded-md touch-pan-y select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onClickCapture={handleClickCapture}
        >
          <div
            className="flex will-change-transform"
            style={{
              transform: `translate3d(calc(-${activeIndex * 100}% + ${dragOffsetPx}px), 0, 0)`,
              transition: isDragging ? 'none' : 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {articles.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={item.id}
                  className={`w-full shrink-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive
                      ? 'opacity-100 scale-100'
                      : 'opacity-40 scale-[0.96]'
                  }`}
                >
                  <NewsArticleCard article={item} variant="sub-lead" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Chấm tròn chuyển slide */}
        <div className="flex items-center justify-center gap-2.5 pt-1">
          {articles.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Xem bài nổi bật ${idx + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-[#6f857d] scale-110'
                    : 'bg-slate-300/90 hover:bg-slate-400'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
