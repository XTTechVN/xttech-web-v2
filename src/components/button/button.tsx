import React from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    // Định nghĩa các class CSS cho biến thể (variant)
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary active:bg-primary/80',
      secondary: 'bg-secondary text-primary hover:bg-secondary/80 focus-visible:ring-secondary active:bg-secondary/70',
      outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus-visible:ring-primary active:bg-gray-100',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400 active:bg-gray-200',
      danger: 'bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger active:bg-danger/80',
    };

    // Định nghĩa các class CSS cho kích thước (size)
    const sizes = {
      xs: 'h-7 px-2.5 text-xs rounded',
      sm: 'h-9 px-3 text-sm rounded-md',
      md: 'h-10 px-4 text-sm font-medium rounded-md',
      lg: 'h-11 px-6 text-base font-medium rounded-lg',
      xl: 'h-12 px-8 text-base font-semibold rounded-lg',
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          // Các lớp CSS cơ bản
          'inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 outline-none cursor-pointer',
          'focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {/* Vòng xoay tải dữ liệu (spinner) */}
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* Icon bên trái (chỉ hiển thị khi không tải) */}
        {!loading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}

        {/* Nội dung nút */}
        <span>{children}</span>

        {/* Icon bên phải */}
        {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
export { Button };
