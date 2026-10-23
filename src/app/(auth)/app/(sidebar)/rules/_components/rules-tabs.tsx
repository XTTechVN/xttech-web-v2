'use client';

import React from 'react';
import { FilePen, FileCheck2, ClipboardCheck, CheckCircle2, AlertCircle, Clock, BarChart3 } from 'lucide-react';
import { cn } from '@/utils';
import type { DocumentRulesSummary } from '@/types';
import type { RulesTab } from '../_utils/rules-constants';

interface RulesTabsProps {
  activeTab: RulesTab;
  canManage?: boolean;
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

export const RulesTabs: React.FC<RulesTabsProps> = ({
  activeTab,
  canManage = false,
  summary,
  onChange,
}) => {
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

  // Chỉ hr/admin/super mới thấy tab "Soạn thảo" và "Chờ tôi xử lý"
  const visibleTabs = tabs.filter((tab) => {
    if (tab.value === 'current') return true;
    if (!canManage) return false;
    if (tab.value === 'to_process') return tab.count > 0 || activeTab === 'to_process';
    return true;
  });

  const publishedCount = summary?.publishedCount ?? 0;
  const unreadCount = summary?.unreadCount ?? 0;
  const expiringCount = summary?.expiringSoonCount ?? 0;
  const readRate = summary?.readRate ?? 100;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 mt-3">
      <div className="flex gap-1 overflow-x-auto -mb-px" role="tablist">
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
                'flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap cursor-pointer select-none transition-colors',
                isActive
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300',
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={cn(
                    'min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center',
                    tab.badgeClass,
                  )}
                >
                  {tab.count > 99 ? '99+' : tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* KPI Summary Strip */}
      {summary && (
        <div className="hidden lg:flex items-center gap-2 py-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-700">
            <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
            <span>Đang hiệu lực:</span>
            <strong className="font-bold text-emerald-800">{publishedCount}</strong>
          </div>

          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium',
              unreadCount > 0
                ? 'bg-rose-50 border-rose-200/80 text-rose-700'
                : 'bg-slate-50 border-slate-200 text-slate-600',
            )}
          >
            <AlertCircle size={12} className={cn('shrink-0', unreadCount > 0 ? 'text-rose-500' : 'text-slate-400')} />
            <span>Chưa đọc:</span>
            <strong className={cn('font-bold', unreadCount > 0 ? 'text-rose-800' : 'text-slate-700')}>
              {unreadCount}
            </strong>
          </div>

          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium',
              expiringCount > 0
                ? 'bg-amber-50 border-amber-200/80 text-amber-700'
                : 'bg-slate-50 border-slate-200 text-slate-600',
            )}
          >
            <Clock size={12} className={cn('shrink-0', expiringCount > 0 ? 'text-amber-500' : 'text-slate-400')} />
            <span>Sắp hết hiệu lực:</span>
            <strong className={cn('font-bold', expiringCount > 0 ? 'text-amber-800' : 'text-slate-700')}>
              {expiringCount}
            </strong>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50/70 border border-primary/20 text-[11px] font-medium text-primary">
            <BarChart3 size={12} className="text-primary shrink-0" />
            <span>Tỷ lệ đã đọc:</span>
            <strong className="font-bold">{readRate}%</strong>
          </div>
        </div>
      )}
    </div>
  );
};
