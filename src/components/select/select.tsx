/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useRef, useMemo, useId, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      options = [],
      placeholder,
      fullWidth = false,
      disabled,
      value,
      defaultValue,
      onChange,
      id,
      name,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const containerRef = useRef<HTMLDivElement>(null);
    const hiddenSelectRef = useRef<HTMLSelectElement>(null);
    const visibleInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
      setMounted(true);
    }, []);

    // Sync ref
    React.useImperativeHandle(ref, () => hiddenSelectRef.current!);

    // Handle internal selected value state to sync with custom UI
    const [selectedValue, setSelectedValue] = useState<string | number>(() => {
      const val = value !== undefined ? value : defaultValue;
      if (Array.isArray(val)) return val[0] || '';
      return (val as string | number) ?? '';
    });
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownPos, setDropdownPos] = useState({
      top: 0,
      left: 0,
      width: 0,
      openUpward: false,
    });

    const canSearch = options.length > 10;

    // Calculate fixed coordinates for Portal Dropdown
    const updatePosition = useCallback(() => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 220;
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
        setSelectedValue(Array.isArray(value) ? value[0] || '' : (value as string | number));
      }
    }, [value]);

    // Close on click outside (check both container and portal dropdown)
    useEffect(() => {
      if (!isOpen) return;
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          containerRef.current &&
          !containerRef.current.contains(target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Auto-focus and select visible input when open
    useEffect(() => {
      if (isOpen) {
        if (canSearch) {
          const timer = setTimeout(() => {
            visibleInputRef.current?.focus();
            visibleInputRef.current?.select();
          }, 50);
          return () => clearTimeout(timer);
        }
      } else {
        setSearchQuery('');
      }
    }, [isOpen, canSearch]);

    const selectedOption = options.find((opt) => String(opt.value) === String(selectedValue));

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
      if (!canSearch || !searchQuery) return options;
      const query = searchQuery.toLowerCase().trim();
      return options.filter((opt) => opt.label.toLowerCase().includes(query));
    }, [options, searchQuery, canSearch]);

    const handleSelectOption = (optValue: string | number) => {
      if (disabled) return;
      setSelectedValue(optValue);
      setIsOpen(false);

      // Sync value to hidden select
      if (hiddenSelectRef.current) {
        hiddenSelectRef.current.value = String(optValue);
        // Create and dispatch a fake synthetic change event
        const event = new Event('change', { bubbles: true });
        hiddenSelectRef.current.dispatchEvent(event);
      }

      // Call onChange callback directly with a synthetic-like event
      if (onChange) {
        const synthEvent = {
          target: {
            name,
            value: optValue,
          },
          currentTarget: {
            name,
            value: optValue,
          },
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(synthEvent);
      }
    };

    return (
      <div
        ref={containerRef}
        className={cn('flex flex-col gap-1.5 relative', fullWidth && 'w-full')}
      >
        {/* Hidden native select for form submission / ref binding */}
        <select
          ref={hiddenSelectRef}
          id={selectId}
          name={name}
          value={selectedValue}
          disabled={disabled}
          onChange={(e) => {
            setSelectedValue(e.target.value);
            onChange?.(e);
          }}
          className="sr-only"
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-gray-700 select-none"
          >
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
            value={isOpen && canSearch ? searchQuery : (selectedOption ? selectedOption.label : '')}
            placeholder={isOpen && canSearch && selectedOption ? selectedOption.label : (placeholder || 'Chọn...')}
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
              if (e.key === 'Enter' && isOpen && filteredOptions.length > 0) {
                e.preventDefault();
                handleSelectOption(filteredOptions[0].value);
              } else if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
              }
            }}
            className={cn(
              'w-full h-10 pl-3 pr-10 text-left text-base md:text-sm bg-white border rounded-md outline-none transition-all duration-200 text-gray-900 disabled:cursor-not-allowed',
              isOpen && canSearch ? 'cursor-text border-primary ring-2 ring-primary/20 bg-white' : 'cursor-pointer border-gray-200',
              'hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:pointer-events-none',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
          />

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
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronDown
              size={16}
              className={cn('transition-transform duration-200 shrink-0', isOpen && 'transform rotate-180')}
            />
          </button>
        </div>

        {/* Error message */}
        {error && <span className="text-xs text-red-500">{error}</span>}

        {/* Portal Dropdown Menu Options list */}
        {mounted && isOpen && dropdownPos.width > 0 && createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              left: `${dropdownPos.left}px`,
              width: `${dropdownPos.width}px`,
              ...(dropdownPos.openUpward
                ? { bottom: `${window.innerHeight - dropdownPos.top}px` }
                : { top: `${dropdownPos.top}px` }),
              zIndex: 99999,
            }}
            className={cn(
              "bg-white border border-gray-200 rounded-lg shadow-2xl p-1 max-h-52 overflow-y-auto select-none animate-in fade-in duration-150 flex flex-col gap-0.5 pr-0.5",
              dropdownPos.openUpward ? "slide-in-from-bottom-1" : "slide-in-from-top-1"
            )}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-xs text-gray-400 text-center">
                Không tìm thấy kết quả
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(selectedValue);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelectOption(opt.value)}
                    className={cn(
                      'px-3 py-2 text-left text-sm flex items-center justify-between transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer rounded-md shrink-0',
                      isSelected
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check size={14} className="text-primary shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>,
          document.body
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
export { Select };
