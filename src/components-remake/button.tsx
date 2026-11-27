import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'outline' | 'danger' | 'ghost';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: React.ReactNode;
  loading?: boolean;
  /** 'mobile': dưới 768px chỉ hiện icon (vuông 44px), từ 768px kèm chữ. Cần có icon. */
  iconOnly?: 'mobile';
  /** Số nhỏ cạnh chữ (ví dụ số bộ lọc đang bật); chỉ hiện khi > 0. */
  badge?: number;
  children: string;
}

const VARIANT: Record<Variant, string> = {
  primary: 'bg-primary text-white active:bg-primary/90 md:hover:bg-primary/90',
  outline: 'border border-slate-200 bg-white text-slate-700 active:bg-slate-100 md:hover:bg-slate-50',
  danger: 'bg-red-600 text-white active:bg-red-700 md:hover:bg-red-700',
  ghost: 'text-slate-700 active:bg-slate-100 md:hover:bg-slate-100',
};

// Nút dùng chung của components-remake: cao 44px trên điện thoại, 40px từ 768px.
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', icon, loading, iconOnly, badge, className, type = 'button', disabled, children, ...props },
  ref,
) {
  const collapsed = !!iconOnly && !!icon;
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-label={collapsed ? children : undefined}
      title={collapsed ? children : undefined}
      className={cn(
        'relative inline-flex h-11 flex-none cursor-pointer items-center justify-center gap-2 rounded-control text-sm font-medium transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 md:h-10',
        collapsed ? 'size-11 md:w-auto md:px-4' : 'px-4',
        VARIANT[variant],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      <span className={cn('whitespace-nowrap', collapsed && 'hidden md:inline')}>{children}</span>
      {!!badge && (
        <span
          className={cn(
            'flex size-5 items-center justify-center rounded-full bg-primary text-[11px] tabular-nums text-white',
            collapsed && 'absolute -right-1.5 -top-1.5 md:static',
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
});
