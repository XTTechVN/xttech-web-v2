'use client';

import React from 'react';
import { Tooltip } from '@/components/tooltip';
import { cn } from '@/utils/cn';

import { Edit2, Trash2, Eye, MoreVertical } from 'lucide-react';
import { Dropdown } from '../dropdown';

export interface TableActionItem {
  title?: string;
  icon: React.ReactNode | React.ComponentType<{ size?: number; className?: string }>;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  size?: number;
  className?: string;
  disabled?: boolean;
}

export interface TableActionProps {
  items?: (TableActionItem | null | undefined | false)[];
  className?: string;
  
  // Backward compatibility props
  onEdit?: (e?: any) => void;
  onDelete?: (e?: any) => void;
  onView?: (e?: any) => void;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
  viewDisabled?: boolean;
}

const DEFAULT_BUTTON_CLASS =
  'flex items-center justify-center p-1.5 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

export default function TableAction({
  items = [],
  className,
  onEdit,
  onDelete,
  onView,
  editDisabled,
  deleteDisabled,
  viewDisabled,
}: TableActionProps) {
  // Build items from backward compatibility props if present
  const backwardItems: TableActionItem[] = [];

  if (onView) {
    backwardItems.push({
      title: 'Xem',
      icon: Eye,
      onClick: (e) => {
        e.stopPropagation();
        onView(e);
      },
      disabled: viewDisabled,
    });
  }

  if (onEdit) {
    backwardItems.push({
      title: 'Chỉnh sửa',
      icon: Edit2,
      onClick: (e) => {
        e.stopPropagation();
        onEdit(e);
      },
      disabled: editDisabled,
    });
  }

  if (onDelete) {
    backwardItems.push({
      title: 'Xóa',
      icon: Trash2,
      onClick: (e) => {
        e.stopPropagation();
        onDelete(e);
      },
      disabled: deleteDisabled,
      className: 'text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30',
    });
  }

  // Combine both types of items
  const validItems = [
    ...backwardItems,
    ...(items || []).filter(Boolean) as TableActionItem[],
  ];

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

  const dropdownItems = validItems.map((item) => {
    const isDanger = item.title === 'Xóa' || item.className?.includes('text-red') || item.className?.includes('red-600') || item.className?.includes('hover:bg-red');
    return {
      label: item.title || '',
      onClick: item.onClick,
      disabled: item.disabled,
      danger: isDanger,
      icon: renderIcon(item.icon, 16),
    };
  });

  return (
    <>
      {/* Desktop view */}
      <div className={cn('hidden md:flex items-center gap-1', className)}>
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

      {/* Mobile view */}
      <div className={cn('flex md:hidden items-center', className)} onClick={(e) => e.stopPropagation()}>
        <Dropdown
          align="right"
          trigger={
            <button key="mobile-trigger" type="button" className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer text-gray-500">
              <MoreVertical size={18} />
            </button>
          }
          items={dropdownItems}
        />
      </div>
    </>
  );
}

export { TableAction };
