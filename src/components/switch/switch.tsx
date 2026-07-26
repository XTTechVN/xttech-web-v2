import React from 'react';
import { cn } from '@/utils/cn';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, disabled, checked, defaultChecked, onChange, ...props }, ref) => {
    const switchId = id || React.useId();

    return (
      <label
        htmlFor={switchId}
        className={cn(
          'inline-flex items-center gap-3 text-sm text-gray-700 select-none cursor-pointer',
          disabled && 'text-gray-400 cursor-not-allowed'
        )}
      >
        <span className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200">
          <input
            ref={ref}
            id={switchId}
            type="checkbox"
            disabled={disabled}
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          {/* Track */}
          <span className="absolute inset-0 rounded-full bg-gray-200 transition-colors duration-200 peer-checked:bg-primary peer-disabled:opacity-50" />
          {/* Thumb */}
          <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 translate-x-0 peer-checked:translate-x-4" />
        </span>
        {label && <span>{label}</span>}
      </label>
    );
  },
);

Switch.displayName = 'Switch';

export default Switch;
export { Switch };
