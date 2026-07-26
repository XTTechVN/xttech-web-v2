'use client';

import React, { useState } from 'react';
import { cn } from '@/utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt = '',
      name,
      size = 'md',
      shape = 'circle',
      status,
      ...props
    },
    ref,
  ) => {
    const [hasError, setHasError] = useState(false);

    // Lấy chữ cái viết tắt (ví dụ: "John Doe" -> "JD")
    const getInitials = (fullName: string) => {
      const parts = fullName.trim().split(' ');
      if (parts.length === 0) return '';
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const sizes = {
      xs: 'h-6 w-6 text-[10px]',
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm font-medium',
      lg: 'h-12 w-12 text-base font-medium',
      xl: 'h-14 w-14 text-lg font-semibold',
    };

    const shapes = {
      circle: 'rounded-full',
      square: 'rounded-lg',
    };

    const statusColors = {
      online: 'bg-emerald-500 ring-white',
      offline: 'bg-gray-400 ring-white',
      away: 'bg-amber-500 ring-white',
      busy: 'bg-red-500 ring-white',
    };

    const statusSizes = {
      xs: 'h-1.5 w-1.5 ring-1',
      sm: 'h-2 w-2 ring-1.5',
      md: 'h-2.5 w-2.5 ring-2',
      lg: 'h-3 w-3 ring-2',
      xl: 'h-3.5 w-3.5 ring-2',
    };

    const showInitials = !src || hasError;

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center bg-gray-100 text-gray-600 select-none shrink-0',
          sizes[size],
          shapes[shape],
          className,
        )}
        {...props}
      >
        {showInitials ? (
          <span className="uppercase font-semibold text-gray-500">
            {name ? getInitials(name) : '?'}
          </span>
        ) : (
          <img
            src={src}
            alt={alt || name}
            onError={() => setHasError(true)}
            className={cn('h-full w-full object-cover', shapes[shape])}
          />
        )}

        {/* Status indicator */}
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full',
              statusColors[status],
              statusSizes[size],
            )}
          />
        )}
      </div>
    );
  },
);

Avatar.displayName = 'Avatar';

export default Avatar;
export { Avatar };
