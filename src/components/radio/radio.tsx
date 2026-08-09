import React from 'react';
import { cn } from '@/utils/cn';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, error, id, disabled, ...props }, ref) => {
    const radioId = id || React.useId();

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={radioId}
          className={cn(
            'inline-flex items-center gap-2 text-sm text-gray-700 select-none cursor-pointer',
            disabled && 'text-gray-400 cursor-not-allowed'
          )}
        >
          <input
            ref={ref}
            id={radioId}
            type="radio"
            disabled={disabled}
            className={cn(
              // CSS radio tuân thủ design system
              'h-4 w-4 rounded-full border-gray-300 accent-primary text-primary focus:ring-primary/20 cursor-pointer disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />
          {label && <span>{label}</span>}
        </label>
        {error && <span className="text-xs text-red-500 pl-6">{error}</span>}
      </div>
    );
  },
);

Radio.displayName = 'Radio';

export default Radio;
export { Radio };
