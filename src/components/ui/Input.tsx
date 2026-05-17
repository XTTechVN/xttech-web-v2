'use client';

import { cn } from '@/utils/cn';
import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { ComponentSize, COMPONENT_SIZE_CLASSES } from './shared/size';

/**
 * ============================================================================
 * INPUT COMPONENT
 * ============================================================================
 *
 * A reusable, accessible input component with semantic colors.
 * Optimized for mobile (prevents iOS zoom with font-size: 16px minimum).
 */

// ============================================================================
// TYPES
// ============================================================================

export interface InputProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'size'> {
  /** Optional label above input */
  label?: string;
  /** Error message to display below input */
  error?: string;
  /** Icon element to display on the left */
  icon?: React.ReactNode;
  /** Makes input take full container width */
  fullWidth?: boolean;
  /** Input size */
  size?: ComponentSize;
  /** Additional CSS classes for wrapper */
  wrapperClassName?: string;
}

// ============================================================================
// STYLES
// ============================================================================

/** Base input styles - using semantic colors */
const inputBaseClasses =
  'w-full border border-gray-300 rounded-lg bg-bg-primary text-text-primary placeholder:text-gray-400 transition-all duration-200 outline-none';

// ============================================================================
// COMPONENT
// ============================================================================

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    icon,
    fullWidth = false,
    size = 'md',
    type = 'text',
    disabled = false,
    className,
    wrapperClassName,
    ...props
  },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);

  // Determine actual input type (handle password toggle)
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Determine if we should show password toggle
  const isPassword = type === 'password';

  return (
    <div className={cn('relative', fullWidth ? 'w-full' : 'w-auto', wrapperClassName)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Input Element */}
        <input
          ref={ref}
          type={inputType}
          disabled={disabled}
          {...props}
          onFocus={(e) => {
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            props.onBlur?.(e);
          }}
          className={cn(
            inputBaseClasses,
            COMPONENT_SIZE_CLASSES[size],
            // Icon padding
            icon && 'pr-10',
            isPassword && 'pr-10',
            // Border states using semantic colors
            error && 'border-red-500 focus:border-red-500',
            // Disabled state
            disabled && 'bg-bg-disabled text-text-disabled cursor-not-allowed opacity-60',
            className,
            'px-4',
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : undefined}
        />

        {/* Right Icon */}
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            {icon}
          </div>
        )}

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-icon-secondary hover:text-icon-primary transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p id={`${props.id}-error`} className="mt-1.5 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
