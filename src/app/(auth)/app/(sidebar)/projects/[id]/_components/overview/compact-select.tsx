'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, Loader2 } from 'lucide-react';
import { cn } from '@/utils';

export interface CompactSelectOption {
  value: number | string;
  label: string;
  sublabel?: string;
  colorHex?: string;
}

export interface CompactSelectProps {
  value?: number | string | null;
  displayLabel?: React.ReactNode;
  options: CompactSelectOption[];
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  emptyText?: string;
  onOpen?: () => void;
  onChange: (value: number | string) => void;
  className?: string;
}

export function CompactSelect({
  value,
  displayLabel,
  options = [],
  placeholder = 'Chọn...',
  isLoading = false,
  disabled = false,
  emptyText = 'Không có dữ liệu',
  onOpen,
  onChange,
  className,
}: CompactSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Phím Escape để đóng
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearch('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedOption = useMemo(
    () => options.find((opt) => String(opt.value) === String(value)),
    [options, value]
  );

  const sortedOptions = useMemo(() => {
    return [...options].sort((a, b) =>
      a.label.localeCompare(b.label, 'vi', { sensitivity: 'base' })
    );
  }, [options]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return sortedOptions;
    const q = search.toLowerCase().trim();
    return sortedOptions.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [sortedOptions, search]);
  const isTriggerDisabled = disabled || (isLoading && !isOpen);

  return (
    <div className={cn('relative inline-block text-left', className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          if (isTriggerDisabled) return;
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          if (nextOpen) onOpen?.();
        }}
        disabled={isTriggerDisabled}
        className={cn(
          'group inline-flex items-center gap-1.5 px-2 py-0.5 -mr-1 rounded text-xs font-semibold text-slate-800 transition-all text-left',
          'hover:bg-slate-100/90 hover:text-primary border border-transparent hover:border-slate-200/80 cursor-pointer',
          isOpen && 'bg-slate-100 border-slate-200 text-primary ring-1 ring-primary/20',
          isTriggerDisabled && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-slate-800'
        )}
      >
        <span className="truncate max-w-[170px]">
          {displayLabel !== undefined ? displayLabel : (selectedOption?.label || placeholder)}
        </span>
        {isLoading ? (
          <Loader2 size={11} className="animate-spin text-primary shrink-0" />
        ) : (
          <ChevronDown
            size={11}
            className={cn(
              'text-slate-400 group-hover:text-primary transition-transform shrink-0',
              isOpen && 'rotate-180 text-primary'
            )}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-md border border-slate-200 shadow-lg py-1 z-50 animate-in fade-in-50 zoom-in-95">
          {options.length > 5 && (
            <div className="p-1.5 border-b border-slate-100">
              <div className="relative">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full pl-6 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-h-52 overflow-y-auto py-1">
            {isLoading && filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400 text-center flex items-center justify-center gap-1.5">
                <Loader2 size={12} className="animate-spin text-primary shrink-0" />
                <span>Đang tải danh mục...</span>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400 text-center">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      'w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors cursor-pointer',
                      isSelected ? 'text-primary font-semibold bg-primary/5' : 'text-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {opt.colorHex && (
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: opt.colorHex }}
                        />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isSelected && <Check size={12} className="text-primary shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
