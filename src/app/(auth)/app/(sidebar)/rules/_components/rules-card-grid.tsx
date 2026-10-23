'use client';

import React from 'react';
import { FileSearch } from 'lucide-react';
import { TablePagination } from '@/components/table';
import type { DocumentItem } from '@/types';
import type { RuleActionContext } from '../_utils/rule-permissions';
import { RuleCard } from './rule-card';

interface RulesCardGridProps {
  items: DocumentItem[];
  total: number;
  offset: number;
  limit: number;
  isLoading: boolean;
  emptyHint: string;
  context?: RuleActionContext;
  onPreview: (doc: DocumentItem) => void;
  onOpenDetail: (doc: DocumentItem) => void;
  onEdit?: (doc: DocumentItem) => void;
  onDelete?: (doc: DocumentItem) => void;
  onReplace?: (doc: DocumentItem) => void;
  onPageChange: (offset: number) => void;
}

const SkeletonCards: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-3">
    {Array.from({ length: 8 }).map((_, idx) => (
      <div key={idx} className="animate-pulse rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-4 w-8 bg-slate-200 rounded" />
        </div>
        <div className="h-32 w-full bg-slate-100 rounded-lg" />
        <div className="h-4 w-4/5 bg-slate-200 rounded" />
        <div className="h-3 w-full bg-slate-100 rounded" />
        <div className="h-7 w-full bg-slate-100 rounded-lg" />
        <div className="h-4 w-full bg-slate-100 rounded pt-1" />
      </div>
    ))}
  </div>
);

export const RulesCardGrid: React.FC<RulesCardGridProps> = ({
  items,
  total,
  offset,
  limit,
  isLoading,
  emptyHint,
  context,
  onPreview,
  onOpenDetail,
  onEdit,
  onDelete,
  onReplace,
  onPageChange,
}) => {
  const currentPage = limit > 0 ? Math.floor(offset / limit) + 1 : 1;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-50/30">
      <div className="flex-1 overflow-auto px-4 pt-3 custom-scrollbar">
        {isLoading && items.length === 0 ? (
          <SkeletonCards />
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
            {items.map((doc) => (
              <RuleCard
                key={doc.id}
                doc={doc}
                context={context}
                onPreview={onPreview}
                onOpenDetail={onOpenDetail}
                onEdit={onEdit}
                onDelete={onDelete}
                onReplace={onReplace}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-slate-400">
            <FileSearch size={36} />
            <p className="text-sm font-medium text-slate-500">Chưa có cơ chế nào</p>
            <p className="text-xs">{emptyHint}</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={limit}
          onPageChange={(page) => onPageChange((page - 1) * limit)}
          onPageSizeChange={() => {}}
          hideRowPerPage={true}
        />
      </div>
    </div>
  );
};
