'use client';

import { useState, useRef, useEffect } from 'react';
import { PlusCircle, Search, Check, Calendar, X } from 'lucide-react';
import { cn } from '@/utils/cn';

import type { ITableFilterProps } from './types';

interface FacetedFilterProps {
  filter: ITableFilterProps;
}

function FacetedFilter({ filter }: FacetedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownAlign, setDropdownAlign] = useState<'left' | 'right'>('left');
  const containerRef = useRef<HTMLDivElement>(null);

  const options = filter.options || [];

  // Tự động tính toán hướng mở dropdown dựa trên không gian trống bên phải nút để tránh tràn viền
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownWidth = window.innerWidth < 768 ? 192 : 208; // w-48 (192px) trên mobile, w-52 (208px) trên desktop
      if (rect.left + dropdownWidth > window.innerWidth) {
        setDropdownAlign('right');
      } else {
        setDropdownAlign('left');
      }
    }
  }, [isOpen]);

  // Đóng dropdown khi click ra ngoài vùng hiển thị
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
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
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Lọc các lựa chọn dựa trên truy vấn tìm kiếm
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Tìm lựa chọn đang được chọn hiện tại
  const selectedOption = options.find((opt) => opt.value === filter.value);

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Nút kích hoạt mở dropdown (Pill Button) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-text-secondary bg-white border border-dashed border-border-secondary hover:border-border-hover rounded-lg transition shadow-xs cursor-pointer select-none h-9',
          selectedOption &&
            selectedOption.value !== undefined &&
            'border-solid border-border-focus',
        )}
      >
        {filter.icon ? (
          <span className="shrink-0">{filter.icon}</span>
        ) : (
          <PlusCircle className="w-3.5 h-3.5 text-icon-secondary shrink-0" />
        )}
        <span className="text-gray-500">{filter.label}</span>
        {selectedOption && selectedOption.value !== undefined && (
          <>
            <span className="w-px h-4 bg-border-primary mx-1" />
            <span className="bg-[#f3f4f6] text-gray-700 text-xs px-1.5 py-0.5 rounded font-semibold tracking-wider flex items-center justify-center min-w-[1.25rem]">
              {/* Hiển thị số "1" trên mobile và nhãn đầy đủ trên desktop */}
              <span className="md:hidden">1</span>
              <span className="hidden md:inline">{selectedOption.label}</span>
            </span>
          </>
        )}
      </button>

      {/* Menu thả xuống (Dropdown) */}
      {isOpen && (
        <div
          className={cn(
            'absolute mt-1.5 z-50 w-48 md:w-52 bg-white rounded-lg shadow-lg border border-border-primary overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100',
            dropdownAlign === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {/* Thanh tìm kiếm bên trong dropdown */}
          <div className="p-2 border-b border-border-primary flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-icon-tertiary shrink-0" />
            <input
              type="text"
              className="w-full text-sm outline-none bg-transparent text-text-primary placeholder:text-text-placeholder"
              placeholder={filter.label}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Danh sách các lựa chọn */}
          <div className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-text-placeholder text-center">
                Không tìm thấy kết quả
              </div>
            ) : (
              filteredOptions.map((option, idx) => {
                const isSelected = option.value === filter.value;
                return (
                  <button
                    key={option.value ?? `opt-${idx}`}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        filter.onChange?.(undefined); // Tắt lựa chọn đang hoạt động
                      } else {
                        filter.onChange?.(option.value);
                      }
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm font-medium transition cursor-pointer',
                      isSelected
                        ? 'bg-bg-hover text-text-primary'
                        : 'text-text-secondary hover:bg-bg-hover/50',
                    )}
                  >
                    {/* Vòng tròn hiển thị trạng thái đã chọn (Checkmark inside filled circle) */}
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all',
                        isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-border-secondary bg-white',
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    {option.icon && (
                      <span className="shrink-0 text-text-secondary flex items-center justify-center w-4 h-4">
                        {option.icon}
                      </span>
                    )}
                    <span className="truncate flex-1">{option.label}</span>
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

function DateRangeFilter({ filter }: { filter: ITableFilterProps }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownAlign, setDropdownAlign] = useState<'left' | 'right'>('left');
  const containerRef = useRef<HTMLDivElement>(null);

  const startDate = filter.startDate;
  const endDate = filter.endDate;
  const hasValue = Boolean(startDate || endDate);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownWidth = 280;
      if (rect.left + dropdownWidth > window.innerWidth) {
        setDropdownAlign('right');
      } else {
        setDropdownAlign('left');
      }
    }
  }, [isOpen]);

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

  const getLabelText = () => {
    if (startDate && endDate) {
      return `${startDate} ~ ${endDate}`;
    }
    if (startDate) {
      return `Từ ${startDate}`;
    }
    if (endDate) {
      return `Đến ${endDate}`;
    }
    return null;
  };

  const labelText = getLabelText();

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-text-secondary bg-white border border-dashed border-border-secondary hover:border-border-hover rounded-lg transition shadow-xs cursor-pointer select-none h-9',
          hasValue && 'border-solid border-border-focus',
        )}
      >
        <Calendar className="w-3.5 h-3.5 text-icon-secondary shrink-0" />
        <span className="text-gray-500">{filter.label || 'Ngày làm việc'}</span>
        {hasValue && (
          <>
            <span className="w-px h-4 bg-border-primary mx-1" />
            <span className="bg-[#f3f4f6] text-gray-700 text-xs px-1.5 py-0.5 rounded font-semibold tracking-wider flex items-center justify-center">
              {labelText}
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                filter.onDateChange?.(undefined, undefined);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  filter.onDateChange?.(undefined, undefined);
                }
              }}
              className="p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition"
            >
              <X className="w-3 h-3" />
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute mt-1.5 z-50 w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-3.5 animate-in fade-in-0 zoom-in-95 duration-100 space-y-3',
            dropdownAlign === 'right' ? 'right-0' : 'left-0',
          )}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              {filter.label || 'Ngày làm việc'}
            </span>
            {hasValue && (
              <button
                type="button"
                onClick={() => {
                  filter.onDateChange?.(undefined, undefined);
                }}
                className="text-[11px] font-semibold text-red-500 hover:text-red-700 hover:underline"
              >
                Xóa chọn
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={startDate || ''}
                onChange={(e) => filter.onDateChange?.(e.target.value || undefined, endDate)}
                className="w-full h-9 px-2.5 text-xs text-slate-800 border border-slate-200 rounded-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={endDate || ''}
                onChange={(e) => filter.onDateChange?.(startDate, e.target.value || undefined)}
                className="w-full h-9 px-2.5 text-xs text-slate-800 border border-slate-200 rounded-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-xs font-semibold text-white bg-[#005c53] hover:bg-[#004740] rounded-lg transition shadow-xs cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TableFilters({ filters }: { filters: ITableFilterProps[] }) {
  if (!filters || filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter, index) => {
        if (filter.type === 'date-range' || filter.onDateChange) {
          return <DateRangeFilter key={index} filter={filter} />;
        }
        return <FacetedFilter key={index} filter={filter} />;
      })}
    </div>
  );
}
