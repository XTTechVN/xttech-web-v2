import React from 'react';
import { cn } from '@/utils/cn';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: 'success' | 'warning' | 'danger' | 'info';
  title?: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, icon, onClose, children, ...props }, ref) => {
    const variants = {
      success: {
        container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        icon: 'text-emerald-500',
      },
      warning: {
        container: 'bg-amber-50 border-amber-200 text-amber-800',
        icon: 'text-amber-500',
      },
      danger: {
        container: 'bg-red-50 border-red-200 text-red-800',
        icon: 'text-red-500',
      },
      info: {
        container: 'bg-sky-50 border-sky-200 text-sky-800',
        icon: 'text-sky-500',
      },
    };

    const defaultIcons = {
      success: <CheckCircle2 size={18} />,
      warning: <AlertTriangle size={18} />,
      danger: <XCircle size={18} />,
      info: <Info size={18} />,
    };

    const activeIcon = icon !== undefined ? icon : defaultIcons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'flex gap-3 p-4 border rounded-lg text-sm transition-all duration-200',
          variants[variant].container,
          className
        )}
        {...props}
      >
        {activeIcon && <div className={cn('shrink-0 mt-0.5', variants[variant].icon)}>{activeIcon}</div>}

        <div className="flex-1 space-y-1">
          {title && <h5 className="font-semibold leading-none">{title}</h5>}
          {children && <div className="text-xs opacity-90 leading-relaxed">{children}</div>}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-0.5 rounded-md hover:bg-black/5 transition-colors cursor-pointer text-current opacity-60 hover:opacity-100 h-fit"
            aria-label="Close alert"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  },
);

Alert.displayName = 'Alert';

export default Alert;
export { Alert };
