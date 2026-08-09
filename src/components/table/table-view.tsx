'use client';

import { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TableViewProps {
  views: { key: string; label: string }[];
  visibleKeys: string[];
  onToggle: (key: string) => void;
}

export function TableView({ views, visibleKeys, onToggle }: TableViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài vùng hiển thị
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Đóng dropdown khi nhấn phím Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Nút trigger mở dropdown cấu hình hiển thị cột */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg transition shadow-xs cursor-pointer select-none h-9',
          isOpen && 'border-solid border-slate-300 bg-slate-50',
        )}
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span className="text-slate-700">Cài đặt</span>
      </button>

      {/* Menu dropdown hiển thị danh sách các cột cần ẩn/hiện */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 z-50 w-44 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="px-3 py-2 text-xs font-semibold text-slate-800 border-b border-slate-100 bg-slate-50/50">
            Cài đặt hiển thị
          </div>

          <div className="py-1 max-h-56 overflow-y-auto">
            {views.map((view) => {
              const isVisible = visibleKeys.includes(view.key);
              return (
                <button
                  key={view.key}
                  type="button"
                  onClick={() => onToggle(view.key)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  {/* Hiển thị checkmark nếu cột đang được bật */}
                  {isVisible ? (
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={3} />
                  ) : (
                    <div className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="truncate">{view.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
