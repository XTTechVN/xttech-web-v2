import React from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

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
      children,
      id,
      ...props
    },
    ref,
  ) => {
    const selectId = id || React.useId();

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-gray-700 select-none"
          >
            {label}
          </label>
        )}

        {/* Input Wrapper */}
        <div className="relative w-full">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={cn(
              // Lớp CSS cơ bản tuân thủ design system
              'appearance-none w-full h-10 pl-3 pr-10 text-sm bg-white border rounded-md outline-none transition-all duration-200 text-gray-900 cursor-pointer disabled:cursor-not-allowed',
              'hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:pointer-events-none',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-200',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden className="text-gray-400">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled} className="text-gray-900">
                {opt.label}
              </option>
            ))}
            {children}
          </select>

          {/* Custom Arrow Icon */}
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Error message */}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
export { Select };
