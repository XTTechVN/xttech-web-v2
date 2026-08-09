import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, fullWidth = false, type = 'text', id, disabled, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-gray-700 select-none">
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={cn(
            // Lớp CSS cơ bản tuân thủ design system
            'w-full h-10 px-3 text-sm bg-white border rounded-md outline-none transition-all duration-200 text-gray-900',
            'hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20',
            'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200',
            className,
          )}
          {...props}
        />

        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
export { Input };
