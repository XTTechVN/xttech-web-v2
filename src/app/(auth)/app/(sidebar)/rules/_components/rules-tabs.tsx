'use client';

import React from 'react';
import { FilePen, FileCheck2, ClipboardCheck } from 'lucide-react';
import { cn } from '@/utils';
import type { DocumentRulesSummary } from '@/types';
import type { RulesTab } from '../_utils/rules-constants';

interface RulesTabsProps {
  activeTab: RulesTab;
  summary?: DocumentRulesSummary;
  onChange: (tab: RulesTab) => void;
}

interface TabDefinition {
  value: RulesTab;
  label: string;
  icon: React.ReactNode;
  count: number;
  badgeClass: string;
}

export const RulesTabs: React.FC<RulesTabsProps> = ({ activeTab, summary, onChange }) => {
  const tabs: TabDefinition[] = [
    {
      value: 'current',
      label: 'Cơ chế hiện hành',
      icon: <FileCheck2 size={15} />,
      count: summary?.unreadCount ?? 0,
      badgeClass: 'bg-rose-500 text-white',
    },
    {
      value: 'drafts',
      label: 'Soạn thảo',
      icon: <FilePen size={15} />,
      count: summary?.draftCount ?? 0,
      badgeClass: 'bg-slate-200 text-slate-700',
    },
    {
      value: 'to_process',
      label: 'Chờ tôi xử lý',
      icon: <ClipboardCheck size={15} />,
      count: summary?.pendingActionCount ?? 0,
      badgeClass: 'bg-amber-500 text-white',
    },
  ];

  // Tab "Chờ tôi xử lý" chỉ hiện khi có việc cần xử lý (hoặc đang đứng ở tab đó)
  const visibleTabs = tabs.filter((tab) => tab.value !== 'to_process' || tab.count > 0 || activeTab === 'to_process');

  return (
    <div className="flex gap-1 border-b border-slate-200 px-4 mt-3 overflow-x-auto" role="tablist">
      {visibleTabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            id={`rules-tab-${tab.value}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 -mb-px whitespace-nowrap cursor-pointer select-none transition-colors',
              isActive
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300',
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={cn('min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center', tab.badgeClass)}>
                {tab.count > 99 ? '99+' : tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
