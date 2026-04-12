'use client';

import { cn } from '@/utils/cn';
import { LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  active?: boolean;
  danger?: boolean;
  className?: string;
  onClick?: () => void;
}

export const IconButton = ({
  icon: Icon,
  active = false,
  danger = false,
  className,
  onClick,
}: IconButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      'p-1.5 rounded transition-all flex items-center justify-center',
      active
        ? 'bg-white text-primary shadow-sm'
        : 'text-gray-500 hover:bg-white/50 hover:text-gray-700',
      danger && 'hover:text-red-500',
      className,
    )}
  >
    <Icon size={14} />
  </button>
);
