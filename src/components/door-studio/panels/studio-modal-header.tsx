'use client';

import React from 'react';
import { ChevronDown, LayoutGrid } from 'lucide-react';
import { STUDIO_NAV_TABS } from '../studio-constants';
import type { StudioMainTab } from '../studio-types';

interface StudioModalHeaderProps {
  visibleNavTabs: StudioMainTab[];
  activeMainTab: StudioMainTab;
  onSelectTab: (tab: StudioMainTab) => void;
  templateDoorName?: string | null;
  fallbackName?: string;
  onOpenTemplatePicker?: () => void;
  sketchMode?: boolean;
}

export const StudioModalHeader: React.FC<StudioModalHeaderProps> = ({
  visibleNavTabs,
  activeMainTab,
  onSelectTab,
  templateDoorName,
  fallbackName,
  onOpenTemplatePicker,
  sketchMode = false,
}) => {
  const tabs = STUDIO_NAV_TABS.filter((tab) => visibleNavTabs.includes(tab.id));

  return (
    <div className="flex items-center justify-between gap-2 w-full min-w-0 pr-1">
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/70 overflow-x-auto no-scrollbar max-w-full min-w-0 touch-pan-x">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMainTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={(e) => {
                onSelectTab(tab.id);
                e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {sketchMode && (
        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold shrink-0">
          Chế độ phác thảo 2D
        </span>
      )}

      {!sketchMode && onOpenTemplatePicker && (
        <button
          type="button"
          onClick={onOpenTemplatePicker}
          title="Nhấn để chọn đổi sang mẫu cửa khác"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-primary/40 bg-slate-50/80 hover:bg-primary/5 text-slate-700 hover:text-primary transition-all cursor-pointer max-w-[180px] sm:max-w-[260px] md:max-w-[340px] shrink-0 shadow-2xs"
        >
          <LayoutGrid size={14} className="text-primary shrink-0" />
          <span className="text-xs font-semibold truncate">
            {templateDoorName || fallbackName || 'Chọn mẫu cửa'}
          </span>
          <ChevronDown size={14} className="text-slate-400 shrink-0" />
        </button>
      )}
    </div>
  );
};
