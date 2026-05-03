'use client';

import { cn } from '@/utils/cn';
import { ChevronDown, Check, X } from 'lucide-react';
import { ComponentSize, COMPONENT_SIZE_CLASSES } from './shared/size';
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
  forwardRef,
  ReactNode,
} from 'react';

/**
 * ============================================================================
 * SELECT COMPONENT
 * ============================================================================
 *
 * A reusable, accessible select/dropdown component with white/gray/black theme.
 * Fully optimized with useMemo, useCallback, memo, and forwardRef.
 *
 * Features:
 * - Inline search: When options > 10, the trigger becomes a searchable input
 */

// ============================================================================
// TYPES
// ============================================================================

export type SelectSize = 'xs' | 'sm' | 'md' | 'lg';

export interface SelectOption {
  label: string;
  value: string | number | boolean;
}

export interface SelectProps {
  /** Array of options to display */
  options: SelectOption[];
  /** Currently selected value */
  value?: string | number | boolean;
  /** Callback when selection changes */
  onChange: (value: string | number | boolean) => void;
  /** Placeholder text when no value selected */
  placeholder?: string;
  /** Select size - md (44px) is recommended for mobile touch targets */
  size?: SelectSize;
  /** Disables select interaction */
  disabled?: boolean;
  /** Makes select take full container width */
  fullWidth?: boolean;
  /** Optional label above the select */
  label?: string;
  /** Error message to display below the select */
  error?: string;
  /** Additional CSS classes for the trigger button */
  className?: string;
  /** Additional CSS classes for the wrapper */
  wrapperClassName?: string;
  /** Whether the selection can be cleared. Defaults to true. */
  canClear?: boolean;
  /** Optional icon to display on the left */
  icon?: ReactNode;
  /** Threshold for showing search input. Defaults to 10. */
  searchThreshold?: number;
}

// ============================================================================
// STYLES
// ============================================================================

/** Base styles for the select trigger */
const selectTriggerClasses =
  'flex items-center justify-between gap-2 rounded-lg border bg-white text-left font-medium transition-all duration-200 cursor-pointer select-none';

/** Option item base styles */
const optionClasses =
  'flex items-center justify-between px-4 py-2 text-left cursor-pointer transition-colors duration-150';

// ============================================================================
// MEMOIZED OPTION ITEM COMPONENT
// ============================================================================

interface OptionItemProps {
  option: SelectOption;
  isSelected: boolean;
  size: SelectSize;
  onSelect: (value: string | number | boolean) => void;
}

/**
 * Memoized option item - prevents re-render when other options change
 */
const OptionItem = memo(function OptionItem({
  option,
  isSelected,
  size,
  onSelect,
}: OptionItemProps) {
  const handleClick = useCallback(() => {
    onSelect(option.value);
  }, [onSelect, option.value]);

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={handleClick}
      className={cn(
        optionClasses,
        COMPONENT_SIZE_CLASSES[size],
        'w-full',
        isSelected
          ? 'bg-[#F3F4F6] text-[#111827] font-medium'
          : 'text-[#374151] hover:bg-[#F9FAFB]',
      )}
    >
      <span className="truncate">{option.label}</span>
      {isSelected && <Check className="w-4 h-4 text-[#111827] shrink-0" />}
    </button>
  );
});

// ============================================================================
// MAIN SELECT COMPONENT
// ============================================================================

/**
 * Select Component with forwardRef for trigger button DOM access
 */
const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    options,
    value,
    onChange,
    placeholder = 'Chọn...',
    size = 'md',
    disabled = false,
    fullWidth = false,
    label,
    error,
    className,
    wrapperClassName,
    canClear = true,
    icon,
    searchThreshold = 10,
  },
  ref,
) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [internalLabel, setInternalLabel] = useState<string | number | boolean>('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine if search should be enabled
  const isSearchable = options.length > searchThreshold;

  // Memoized: Find the selected option
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  // Memoized: Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!isSearchable || !searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(query));
  }, [options, searchQuery, isSearchable]);

  // Memoized: Close dropdown when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      setSearchQuery('');
    }
  }, []);

  // Memoized: Close dropdown on Escape key
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  }, []);

  // Add/remove event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClickOutside, handleKeyDown]);

  // Focus input when opening (for searchable mode)
  useEffect(() => {
    if (isOpen && isSearchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isSearchable]);

  // Memoized: Handle option selection
  const handleSelect = useCallback(
    (optionValue: string | number | boolean) => {
      onChange(optionValue);
      setInternalLabel(options.find((option) => option.value === optionValue)?.label || '');
      setIsOpen(false);
      setSearchQuery('');
    },
    [onChange],
  );

  // Memoized: Handle clear selection
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('');
      setSearchQuery('');
    },
    [onChange],
  );

  // Memoized: Toggle dropdown (for non-searchable mode)
  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
      if (isOpen) {
        setSearchQuery('');
      }
    }
  }, [disabled, isOpen]);

  // Handle click on trigger (for searchable mode)
  const handleTriggerClick = useCallback(() => {
    if (!disabled && !isOpen) {
      setIsOpen(true);
    }
  }, [disabled, isOpen]);

  // Memoized: Trigger classes
  const triggerClassName = useMemo(
    () =>
      cn(
        selectTriggerClasses,
        COMPONENT_SIZE_CLASSES[size],
        fullWidth && 'w-full',
        isOpen
          ? 'border-[#111827] ring-1 ring-[#111827]'
          : error
            ? 'border-red-500'
            : 'border-[#E5E7EB] hover:border-[#9CA3AF]',
        selectedOption ? 'text-gray-700' : 'text-gray-700',
        disabled && 'cursor-not-allowed opacity-50 bg-[#F3F4F6]',
        className,
      ),
    [size, fullWidth, isOpen, error, selectedOption, disabled, className],
  );

  // Display value: show search query when typing, otherwise show selected label or placeholder
  const displayValue =
    isOpen && isSearchable && searchQuery ? searchQuery : selectedOption?.label || '';

  return (
    <div
      ref={wrapperRef}
      className={cn('relative', fullWidth ? 'w-full' : 'w-auto', wrapperClassName)}
    >
      {/* Label */}
      {label && <label className="block text-sm font-medium text-[#374151] mb-1.5">{label}</label>}

      {/* Trigger - Button or Input based on searchable state */}
      {isSearchable ? (
        <div onClick={handleTriggerClick} className={triggerClassName}>
          {/* Optional Icon */}
          {icon && <span className="text-gray-500 shrink-0">{icon}</span>}

          {/* Inline Input for search */}
          <input
            ref={inputRef}
            type="text"
            value={isOpen ? searchQuery : selectedOption?.label || ''}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => !isOpen && setIsOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 min-w-0 bg-transparent outline-none text-[#111827] placeholder:text-[#9CA3AF] truncate"
          />

          <div className="flex items-center gap-2">
            {selectedOption && !disabled && canClear ? (
              <span
                role="button"
                onClick={handleClear}
                className="p-0.5 hover:bg-gray-200 rounded-full text-[#9CA3AF] hover:text-[#374151] transition-colors"
              >
                <X className="w-4 h-4" />
              </span>
            ) : (
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-[#374151] transition-transform duration-200 shrink-0',
                  isOpen && 'rotate-180',
                )}
              />
            )}
          </div>
        </div>
      ) : (
        <button
          ref={ref}
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={triggerClassName}
        >
          {icon && <span className="text-gray-500 shrink-0">{icon}</span>}
          <span className="truncate flex-1">
            {internalLabel || selectedOption?.label || placeholder}
          </span>
          <div className="flex items-center gap-2">
            {selectedOption && !disabled && canClear ? (
              <span
                role="button"
                onClick={handleClear}
                className="p-0.5 hover:bg-gray-200 rounded-full text-[#9CA3AF] hover:text-[#374151] transition-colors"
              >
                <X className="w-4 h-4" />
              </span>
            ) : (
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-[#374151] transition-transform duration-200 shrink-0',
                  isOpen && 'rotate-180',
                )}
              />
            )}
          </div>
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-1000 bg-white rounded-lg shadow-lg border border-[#E5E7EB] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
        >
          <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[#9CA3AF]">
                {searchQuery ? 'Không tìm thấy kết quả' : 'Không có dữ liệu'}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <OptionItem
                  key={option.value.toString()}
                  option={option}
                  isSelected={option.value === value}
                  size={size}
                  onSelect={handleSelect}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
});

export default Select;
