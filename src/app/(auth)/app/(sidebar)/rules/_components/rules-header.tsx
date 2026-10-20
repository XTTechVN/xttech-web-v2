'use client';

import React from 'react';
import { Search, Plus, ScrollText } from 'lucide-react';
import { Button } from '@/components';

interface RulesHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
}

export const RulesHeader: React.FC<RulesHeaderProps> = ({ search, onSearchChange, onCreate }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <ScrollText size={20} />
      </div>
      <div className="min-w-0">
        <h1 className="text-base font-bold text-slate-800 leading-tight">Cơ chế &amp; Quy định</h1>
        <p className="text-xs text-slate-500 truncate">
          Quy chế, quy định, chính sách, quy trình, quyết định, thông báo, hướng dẫn, định mức
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2 w-full sm:w-auto">
      <div className="relative flex-1 sm:w-72">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id="rules-search-input"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo mã, tiêu đề, trích yếu..."
          className="w-full h-9 pl-8 pr-3 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>
      <Button id="rules-create-button" size="sm" leftIcon={<Plus size={14} />} onClick={onCreate}>
        Soạn cơ chế
      </Button>
    </div>
  </div>
);
