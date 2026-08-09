import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', pill = false, ...props }, ref) => {
    const variants = {
      default: 'bg-gray-100 text-gray-800 border-gray-200/50',
      primary: 'bg-primary-raw/10 text-primary border-primary-raw/20',
      success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      warning: 'bg-amber-50 text-amber-700 border-amber-200',
      danger: 'bg-red-50 text-red-700 border-red-200',
      info: 'bg-sky-50 text-sky-700 border-sky-200',
    };

    const sizes = {
      sm: 'px-1.5 py-0.5 text-[10px] font-semibold',
      md: 'px-2 py-0.5 text-xs font-semibold',
      lg: 'px-2.5 py-1 text-sm font-semibold',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center border font-medium transition-colors select-none shrink-0',
          variants[variant],
          sizes[size],
          pill ? 'rounded-full' : 'rounded-md',
          className
        )}
        {...props}
      />
    );
  },
);

Badge.displayName = 'Badge';

export default Badge;
export { Badge };
