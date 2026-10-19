/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useRef, useMemo, useId, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { ChevronDown, Check, X, CheckSquare, Square } from 'lucide-react';

export interface MultiSelectOption {
  value: string | number;
  label: string;
  subLabel?: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  label?: string;
  error?: string;
  options?: MultiSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
  id?: string;
  name?: string;
  className?: string;
  maxCount?: number;
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      className,
      label,
      error,
      options = [],
      placeholder,
      searchPlaceholder,
      fullWidth = false,
      disabled,
      value = [],
      onChange,
      id,
      name,
      maxCount = 3,
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const containerRef = useRef<HTMLDivElement>(null);
    const visibleInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
      setMounted(true);
    }, []);

    // Sync ref
    React.useImperativeHandle(ref, () => containerRef.current!);

    // Handle internal selected values state
    const [selectedValues, setSelectedValues] = useState<(string | number)[]>(() => {
      return Array.isArray(value) ? value : [];
    });
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownPos, setDropdownPos] = useState({
      top: 0,
      left: 0,
      width: 0,
      openUpward: false,
    });

    const canSearch = options.length > 10 || !!searchPlaceholder;

    // Calculate fixed coordinates for Portal Dropdown
    const updatePosition = useCallback(() => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 260;
      const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

      setDropdownPos({
        top: openUpward ? rect.top - 4 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        openUpward,
      });
    }, []);

    useEffect(() => {
      if (isOpen) {
        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
          window.removeEventListener('resize', updatePosition);
          window.removeEventListener('scroll', updatePosition, true);
        };
      }
    }, [isOpen, updatePosition]);

    // Update internal state when controlled value changes
    useEffect(() => {
      if (value !== undefined) {
        setSelectedValues(Array.isArray(value) ? value : []);
      }
    }, [value]);

    // Close on click outside (check both container and portal dropdown)
    useEffect(() => {
      if (!isOpen) return;
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (containerRef.current && !containerRef.current.contains(target) && dropdownRef.current && !dropdownRef.current.contains(target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Auto-focus visible input when open
    useEffect(() => {
      if (isOpen) {
        if (canSearch) {
          const timer = setTimeout(() => {
            visibleInputRef.current?.focus();
          }, 50);
          return () => clearTimeout(timer);
        }
      } else {
        setSearchQuery('');
      }
    }, [isOpen, canSearch]);

    const selectedOptions = useMemo(() => {
      const selectedSet = new Set(selectedValues.map(String));
      return options.filter((opt) => selectedSet.has(String(opt.value)));
    }, [options, selectedValues]);

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
      if (!canSearch || !searchQuery) return options;
      const query = searchQuery.toLowerCase().trim();
      return options.filter((opt) => opt.label.toLowerCase().includes(query));
    }, [options, searchQuery, canSearch]);

    // Toggle single option
    const handleToggleOption = (optValue: string | number) => {
      if (disabled) return;
      const isSelected = selectedValues.map(String).includes(String(optValue));
      const newValues = isSelected ? selectedValues.filter((v) => String(v) !== String(optValue)) : [...selectedValues, optValue];

      setSelectedValues(newValues);
      onChange?.(newValues);
    };

    // Remove single badge chip
    const handleRemoveOption = (optValue: string | number) => {
      if (disabled) return;
      const newValues = selectedValues.filter((v) => String(v) !== String(optValue));
      setSelectedValues(newValues);
      onChange?.(newValues);
    };

    // Clear all selected values
    const handleClearAll = () => {
      if (disabled) return;
      const newValues: (string | number)[] = [];
      setSelectedValues(newValues);
      onChange?.(newValues);
    };

    // Check if all filtered options are currently selected
    const isAllFilteredSelected = useMemo(() => {
      if (filteredOptions.length === 0) return false;
      const selectedSet = new Set(selectedValues.map(String));
      return filteredOptions.every((opt) => selectedSet.has(String(opt.value)));
    }, [filteredOptions, selectedValues]);

    // Select all / Deselect all filtered options
    const handleToggleAllFiltered = () => {
      if (disabled || filteredOptions.length === 0) return;
      if (isAllFilteredSelected) {
        const filteredSet = new Set(filteredOptions.map((opt) => String(opt.value)));
        const newValues = selectedValues.filter((v) => !filteredSet.has(String(v)));
        setSelectedValues(newValues);
        onChange?.(newValues);
      } else {
        const filteredValues = filteredOptions.map((opt) => opt.value);
        const mergedSet = new Set([...selectedValues, ...filteredValues]);
        const newValues = Array.from(mergedSet);
        setSelectedValues(newValues);
        onChange?.(newValues);
      }
    };

    return (
      <div ref={containerRef} className={cn('flex flex-col gap-1.5 relative', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-gray-700 select-none">
            {label}
          </label>
        )}

        {/* Custom Dropdown Trigger / Search Input */}
        <div className="relative w-full">
          <input
            ref={visibleInputRef}
            type="text"
            disabled={disabled}
            readOnly={!isOpen || !canSearch}
            value={isOpen && canSearch ? searchQuery : selectedValues.length > 0 ? `Đã chọn ${selectedValues.length} mục` : ''}
            placeholder={
              isOpen && canSearch
                ? selectedValues.length > 0
                  ? `Đã chọn ${selectedValues.length} mục`
                  : placeholder || 'Chọn...'
                : placeholder || 'Chọn...'
            }
            onClick={() => {
              if (disabled) return;
              if (!isOpen) {
                setIsOpen(true);
                if (canSearch) setSearchQuery('');
              }
            }}
            onChange={(e) => {
              if (isOpen && canSearch) {
                setSearchQuery(e.target.value);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
              }
            }}
            className={cn(
              'w-full h-10 pl-3 pr-10 text-left text-base md:text-sm bg-white border rounded-md outline-none transition-all duration-200 text-gray-900 disabled:cursor-not-allowed',
              isOpen && canSearch ? 'cursor-text border-primary ring-2 ring-primary/20 bg-white' : 'cursor-pointer border-gray-200',
              'hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:pointer-events-none',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className,
            )}
          />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1 text-gray-400 pointer-events-none">
            {selectedValues.length > 0 && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearAll();
                }}
                className="p-0.5 hover:text-gray-600 rounded transition-colors cursor-pointer pointer-events-auto"
                title="Xóa tất cả"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) {
                  setIsOpen(!isOpen);
                  if (!isOpen && canSearch) setSearchQuery('');
                }
              }}
              className="flex items-center cursor-pointer disabled:pointer-events-none disabled:opacity-40 pointer-events-auto"
            >
              <ChevronDown size={16} className={cn('transition-transform duration-200 shrink-0', isOpen && 'transform rotate-180')} />
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && <span className="text-xs text-red-500">{error}</span>}

        {/* Portal Dropdown Menu Options list */}
        {mounted &&
          isOpen &&
          dropdownPos.width > 0 &&
          createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: 'fixed',
                left: `${dropdownPos.left}px`,
                minWidth: `${dropdownPos.width}px`,
                width: 'max-content',
                maxWidth: 'min(420px, calc(100vw - 32px))',
                ...(dropdownPos.openUpward ? { bottom: `${window.innerHeight - dropdownPos.top}px` } : { top: `${dropdownPos.top}px` }),
                zIndex: 99999,
              }}
              className={cn(
                'bg-white border border-gray-200 rounded-lg shadow-2xl p-1 max-h-64 overflow-hidden select-none animate-in fade-in duration-150 flex flex-col gap-1',
                dropdownPos.openUpward ? 'slide-in-from-bottom-1' : 'slide-in-from-top-1',
              )}
            >
              {/* Header action bar: Select All / Deselect All & Count */}
              {options.length > 0 && (
                <div className="px-2 py-1.5 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500 shrink-0 gap-3">
                  <span className="font-medium">
                    Đã chọn {selectedValues.length}/{options.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleAllFiltered}
                    className="flex items-center gap-1 text-xs text-primary font-semibold hover:bg-primary/10 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                  >
                    {isAllFilteredSelected ? (
                      <>
                        <Square size={13} />
                        <span>Bỏ chọn tất cả</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare size={13} />
                        <span>Chọn tất cả</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Options list */}
              <div className="overflow-y-auto max-h-48 flex flex-col gap-1 pr-0.5">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-gray-400 text-center">Không tìm thấy kết quả</div>
                ) : (
                  filteredOptions.map((opt, idx) => {
                    const isSelected = selectedValues.map(String).includes(String(opt.value));
                    return (
                      <button
                        key={`${opt.value}-${idx}`}
                        type="button"
                        disabled={opt.disabled}
                        onClick={() => handleToggleOption(opt.value)}
                        className={cn(
                          'px-2.5 py-1.5 text-left text-sm flex items-center justify-between transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer rounded-md shrink-0 gap-2 border',
                          isSelected
                            ? 'bg-primary/15 border-primary/40 text-primary font-semibold shadow-2xs'
                            : 'bg-white border-transparent text-gray-700 hover:bg-gray-100/70',
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isSelected ? (
                            <CheckSquare size={16} className="text-primary shrink-0" />
                          ) : (
                            <Square size={16} className="text-gray-400 shrink-0" />
                          )}
                          <div className="flex flex-col min-w-0 text-left">
                            <span className="whitespace-normal leading-snug">{opt.label}</span>
                            {opt.subLabel && (
                              <span className={cn('text-xs', isSelected ? 'text-primary/80 font-normal' : 'text-gray-400')}>{opt.subLabel}</span>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-primary text-white shrink-0">Đã chọn</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  },
);

MultiSelect.displayName = 'MultiSelect';

export default MultiSelect;
export { MultiSelect };
