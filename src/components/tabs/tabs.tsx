'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (value: string) => void;
  variant?: 'line' | 'pill';
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs = [],
  activeTab,
  onChange,
  variant = 'line',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center',
        variant === 'line' && 'border-b border-gray-200 w-full',
        className
      )}
    >
      <div className="flex gap-2 -mb-px">
        {tabs.map((tab) => {
          const isActive = tab.value === activeTab;

          return (
            <button
              key={tab.value}
              type="button"
              disabled={tab.disabled}
              onClick={() => onChange(tab.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none',
                // Kiểu Line (Có gạch chân)
                variant === 'line' && [
                  'border-b-2 hover:text-gray-900',
                  isActive
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-gray-500 hover:border-gray-300',
                ],
                // Kiểu Pill (Bo tròn dạng hộp chọn)
                variant === 'pill' && [
                  'rounded-md',
                  isActive
                    ? 'bg-primary text-white font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                ]
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

Tabs.displayName = 'Tabs';

export default Tabs;
export { Tabs };
