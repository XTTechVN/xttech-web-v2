'use client';

import React from 'react';
import { Tooltip } from '@/components/tooltip';
import { cn } from '@/utils/cn';

export interface TableActionItem {
  title?: string;
  icon: React.ReactNode | React.ComponentType<{ size?: number; className?: string }>;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  size?: number;
  className?: string;
  disabled?: boolean;
}

export interface TableActionProps {
  items: (TableActionItem | null | undefined | false)[];
  className?: string;
}

const DEFAULT_BUTTON_CLASS =
  'flex items-center justify-center p-1.5 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

export default function TableAction({ items = [], className }: TableActionProps) {
  // Lọc bỏ các phần tử falsy để hỗ trợ conditional rendering
  const validItems = items.filter(Boolean) as TableActionItem[];

  if (validItems.length === 0) return null;

  const renderIcon = (icon: React.ReactNode | React.ComponentType<{ size?: number; className?: string }>, size = 16) => {
    if (!icon) return null;

    // Hỗ trợ truyền dạng React Element (ví dụ: <Eye />)
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
        size: (icon.props as { size?: number }).size ?? size,
      });
    }

    // Hỗ trợ truyền dạng Component (Function hoặc ForwardRef object từ lucide-react)
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && ('render' in icon || '$$typeof' in icon))) {
      return React.createElement(icon as React.ComponentType<{ size?: number }>, { size });
    }

    return icon;
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {validItems.map((item, index) => {
        const itemSize = item.size ?? 16;
        const button = (
          <button key={index} type="button" onClick={item.onClick} disabled={item.disabled} className={cn(DEFAULT_BUTTON_CLASS, item.className)}>
            {renderIcon(item.icon, itemSize)}
          </button>
        );

        if (item.title) {
          return (
            <Tooltip key={index} content={item.title} position="top">
              {button}
            </Tooltip>
          );
        }

        return button;
      })}
    </div>
  );
}

export { TableAction };
