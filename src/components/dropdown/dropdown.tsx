'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

export interface DropdownItemProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  icon?: React.ReactNode;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItemProps[];
  align?: 'left' | 'right';
  triggerOn?: 'click' | 'hover';
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'left',
  triggerOn = 'click',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isHover = triggerOn === 'hover';

  return (
    <div
      className={cn('relative inline-block text-left', className)}
      ref={dropdownRef}
      onMouseEnter={isHover ? () => setIsOpen(true) : undefined}
      onMouseLeave={isHover ? () => setIsOpen(false) : undefined}
    >
      <div onClick={() => setIsOpen(!isOpen)} className="inline-flex cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 pt-2 w-56 focus:outline-none transition-all duration-200',
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
          )}
        >
          <div className="rounded-md bg-white shadow-lg ring-1 ring-black/5 divide-y divide-gray-100 overflow-hidden border border-gray-100 py-1">
            {items.map((item, idx) => (
              <button
                key={idx}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors duration-150 text-left cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
                  item.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50',
                )}
              >
                {item.icon && <span className="shrink-0 text-gray-400">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

Dropdown.displayName = 'Dropdown';

export default Dropdown;
export { Dropdown };
