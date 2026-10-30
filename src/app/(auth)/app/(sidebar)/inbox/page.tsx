'use client';

import React, { Suspense } from 'react';
import { useDocumentExplorer } from '@/hooks';
import { DocumentExplorerPageLayout } from '@/components/documents';
import { cn } from '@/utils';

function SharedDocumentsInboxContent() {
  const explorer = useDocumentExplorer({ tab: 'shared' });
  const { documents, filterUnreadOnly, setFilterUnreadOnly, unreadCount } = explorer;

  const filterBanner = (
    <div className="flex items-center justify-between gap-3 pt-0.5 pb-1 flex-wrap">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setFilterUnreadOnly(false)}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border',
            !filterUnreadOnly
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
          )}
        >
          Tất cả ({documents.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterUnreadOnly(true)}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5',
            filterUnreadOnly
              ? 'bg-primary text-white border-primary shadow-2xs font-semibold'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
          )}
        >
          <span>Chưa đọc</span>
          {unreadCount > 0 && (
            <span
              className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                filterUnreadOnly ? 'bg-white/25 text-white' : 'bg-primary/10 text-primary',
              )}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>
      {unreadCount > 0 && (
        <span className="text-[11px] text-slate-500 hidden sm:inline-block">
          Bạn có <strong className="text-primary font-semibold">{unreadCount}</strong> văn bản mới chưa xem
        </span>
      )}
    </div>
  );

  return <DocumentExplorerPageLayout explorer={explorer} subHeaderSlot={filterBanner} />;
}

export default function SharedDocumentsInboxPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col min-w-0 h-full overflow-hidden bg-white select-none items-center justify-center text-slate-500 text-xs">
          Đang tải dữ liệu...
        </div>
      }
    >
      <SharedDocumentsInboxContent />
    </Suspense>
  );
}
