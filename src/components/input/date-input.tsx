'use client';

import React, { useMemo, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DateInputProps {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  value?: string; // Expects YYYY-MM-DD
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  max?: string;
  min?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      label,
      error,
      fullWidth = false,
      value = '',
      onChange,
      disabled = false,
      max,
      min,
      placeholder = 'dd/mm/yyyy',
      className,
      id,
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const innerRef = useRef<HTMLInputElement>(null);

    const setRef = (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }
    };

    const handleOpenPicker = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      if (innerRef.current) {
        try {
          if (typeof innerRef.current.showPicker === 'function') {
            innerRef.current.showPicker();
          } else {
            innerRef.current.focus();
            innerRef.current.click();
          }
        } catch (err) {
          innerRef.current.focus();
        }
      }
    };

    const displayValue = useMemo(() => {
      if (!value) return '';
      const rawDate = value.includes('T') ? value.split('T')[0] : value;
      const parts = rawDate.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts;
        return `${d}/${m}/${y}`;
      }
      return value;
    }, [value]);

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-gray-700 select-none cursor-pointer"
            onClick={handleOpenPicker}
          >
            {label}
          </label>
        )}

        <div
          onClick={handleOpenPicker}
          className="relative w-full flex items-center cursor-pointer group"
        >
          <input
            type="text"
            readOnly
            tabIndex={-1}
            disabled={disabled}
            placeholder={placeholder}
            value={displayValue}
            className={cn(
              'w-full h-10 px-3 pr-10 text-sm bg-white border rounded-md outline-none transition-all duration-200 text-gray-900 cursor-pointer select-none',
              'hover:border-gray-300 group-hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
              error ? 'border-red-500' : 'border-gray-200',
              className
            )}
          />

          <Calendar
            size={18}
            className="absolute right-3 text-gray-400 group-hover:text-gray-600 pointer-events-none transition-colors"
          />

          <input
            id={inputId}
            ref={setRef}
            type="date"
            disabled={disabled}
            value={value || ''}
            max={max}
            min={min}
            onChange={onChange}
            className="sr-only pointer-events-none"
          />
        </div>

        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';
export default DateInput;
