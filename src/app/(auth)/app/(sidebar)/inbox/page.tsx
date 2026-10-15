'use client';

import React, { useState, useMemo, useRef, Suspense } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks';
import { useAuthStore } from '@/stores';
import { usePermission } from '@/hooks/user-permission';
import { getInboxDocuments, markDocumentAsRead } from '@/actions/document';
import type { DocumentItem, GetDocumentsResponse } from '@/types';
import { DOCUMENT_TYPE_MAP } from '@/types';

// Components
import { InboxStatCards } from './_components/inbox-stat-cards';
import { InboxItemRow } from './_components/inbox-item-row';
import { DocumentDetailModal } from '../documents/_components/document-detail-modal';
import { Button, Select, TableSearch } from '@/components';

// Icons
import {
  Inbox as InboxIcon,
  Mail,
  MailOpen,
  CheckCheck,
  RotateCcw,
  Sparkles,
  Clock,
  Filter,
  FileText,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

function InboxPageContent() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const { isManager } = usePermission();

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'need_action' | 'read'>('all');
  const [search, setSearch] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const debouncedSearch = useDebounce(search, 300);

  // Modal State
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [detailDocOpen, setDetailDocOpen] = useState(false);

  // Type filter options
  const documentTypeOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả loại văn bản' },
      ...Object.entries(DOCUMENT_TYPE_MAP).map(([key, item]) => ({
        value: key,
        label: item.label,
      })),
    ],
    [],
  );

  // 1. Query KPI counts
  const { data: totalData } = useQuery({
    queryKey: ['inbox-total-count'],
    queryFn: () => getInboxDocuments({ limit: 1 }),
    staleTime: 30000,
  });

  const { data: unreadData } = useQuery({
    queryKey: ['inbox-unread-count'],
    queryFn: () => getInboxDocuments({ isRead: false, limit: 1 }),
    staleTime: 30000,
  });

  const { data: readData } = useQuery({
    queryKey: ['inbox-read-count'],
    queryFn: () => getInboxDocuments({ isRead: true, limit: 1 }),
    staleTime: 30000,
  });

  const totalCount = totalData?.total || 0;
  const unreadCount = unreadData?.total || 0;
  const readCount = readData?.total || 0;

  // 2. Query documents according to filters and tabs
  const queryParams = useMemo(() => {
    let isReadParam: boolean | undefined = undefined;
    if (activeTab === 'unread') isReadParam = false;
    if (activeTab === 'read') isReadParam = true;

    return {
      search: debouncedSearch.trim() || undefined,
      documentType: documentType || undefined,
      isRead: isReadParam,
      offset: (page - 1) * limit,
      limit,
    };
  }, [activeTab, debouncedSearch, documentType, page, limit]);

  const {
    data: inboxData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['inbox-documents', queryParams],
    queryFn: () => getInboxDocuments(queryParams),
    placeholderData: (previousData) => previousData,
  });

  // Client-side filtering for 'need_action' tab (documents requiring approval by current user)
  const rawItems = inboxData?.items || [];
  const displayItems = useMemo(() => {
    if (activeTab === 'need_action') {
      return rawItems.filter(
        (doc) => doc.approvalStatus === 'pending' && Boolean(currentUser?.id) && String(doc.approverId) === String(currentUser?.id),
      );
    }
    return rawItems;
  }, [rawItems, activeTab, currentUser?.id]);

  // Count items awaiting current user's approval
  const pendingReviewCount = useMemo(() => {
    return rawItems.filter(
      (doc) => doc.approvalStatus === 'pending' && Boolean(currentUser?.id) && String(doc.approverId) === String(currentUser?.id),
    ).length;
  }, [rawItems, currentUser?.id]);

  const totalItems = activeTab === 'need_action' ? displayItems.length : inboxData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  // In-flight request guard to prevent duplicate API calls for rapid clicks
  const pendingReadIdsRef = useRef<Set<number>>(new Set());

  // Helper to optimistically update document read status in React Query cache
  const updateDocReadInCache = (docId: number) => {
    queryClient.setQueriesData<GetDocumentsResponse>({ queryKey: ['inbox-documents'] }, (oldData) => {
      if (!oldData || !Array.isArray(oldData.items)) return oldData;
      return {
        ...oldData,
        items: oldData.items.map((item) => (item.id === docId ? { ...item, isRead: true } : item)),
      };
    });
  };

  // Handle opening document detail and marking as read
  const handleOpenDetail = async (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setDetailDocOpen(true);

    // Tự động gọi API đánh dấu đã đọc nếu chưa đọc và không có request đang xử lý
    if (doc.isRead !== true && !pendingReadIdsRef.current.has(doc.id)) {
      pendingReadIdsRef.current.add(doc.id);
      try {
        await markDocumentAsRead(doc.id);

        // Cập nhật ngay trong cache và state modal
        updateDocReadInCache(doc.id);
        setSelectedDoc((prev) => (prev && prev.id === doc.id ? { ...prev, isRead: true } : prev));

        // Invalidate counts & list queries
        queryClient.invalidateQueries({ queryKey: ['inbox-unread-count'] });
        queryClient.invalidateQueries({ queryKey: ['inbox-read-count'] });
        queryClient.invalidateQueries({ queryKey: ['inbox-total-count'] });
        queryClient.invalidateQueries({ queryKey: ['inbox-documents'] });
        queryClient.invalidateQueries({ queryKey: ['documents'] });
      } catch (err: any) {
        toast.error(err.message || 'Không thể đánh dấu đã đọc');
      } finally {
        pendingReadIdsRef.current.delete(doc.id);
      }
    }
  };

  // Handle quick mark as read button
  const handleQuickMarkAsRead = async (docId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pendingReadIdsRef.current.has(docId)) return;

    pendingReadIdsRef.current.add(docId);
    try {
      await markDocumentAsRead(docId);
      toast.success('Đã đánh dấu là đã đọc');

      updateDocReadInCache(docId);

      queryClient.invalidateQueries({ queryKey: ['inbox-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['inbox-read-count'] });
      queryClient.invalidateQueries({ queryKey: ['inbox-total-count'] });
      queryClient.invalidateQueries({ queryKey: ['inbox-documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    } catch (err: any) {
      toast.error(err.message || 'Không thể đánh dấu đã đọc');
    } finally {
      pendingReadIdsRef.current.delete(docId);
    }
  };

  // Handle Mark all currently displayed unread as read
  const handleMarkAllDisplayedAsRead = async () => {
    const unreadItems = displayItems.filter((item) => item.isRead !== true);
    if (unreadItems.length === 0) {
      toast('Không có văn bản chưa đọc nào trên trang này');
      return;
    }

    const idsToMark = unreadItems.map((item) => item.id).filter((id) => !pendingReadIdsRef.current.has(id));

    if (idsToMark.length === 0) return;
    idsToMark.forEach((id) => pendingReadIdsRef.current.add(id));

    try {
      let successCount = 0;
      for (const id of idsToMark) {
        try {
          await markDocumentAsRead(id);
          updateDocReadInCache(id);
          successCount++;
        } catch (err) {
          console.error(`Lỗi đánh dấu đã đọc cho doc #${id}:`, err);
        }
      }

      if (successCount > 0) {
        toast.success(`Đã đánh dấu ${successCount} văn bản là đã đọc`);
        queryClient.invalidateQueries({ queryKey: ['inbox-unread-count'] });
        queryClient.invalidateQueries({ queryKey: ['inbox-read-count'] });
        queryClient.invalidateQueries({ queryKey: ['inbox-total-count'] });
        queryClient.invalidateQueries({ queryKey: ['inbox-documents'] });
      } else {
        toast.error('Không thể đánh dấu đã đọc');
      }
    } finally {
      idsToMark.forEach((id) => pendingReadIdsRef.current.delete(id));
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearch('');
    setDocumentType('');
    setPage(1);
    setActiveTab('all');
  };

  return (
    <div className="w-full flex flex-col gap-4 p-4">
      {/* 1. Statistical Metrics Cards */}
      <InboxStatCards
        total={totalCount}
        unreadCount={unreadCount}
        pendingReviewCount={pendingReviewCount}
        readCount={readCount}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab as any);
          setPage(1);
        }}
      />

      {/* 2. Filter Bar & Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 flex flex-col gap-3 shadow-xs">
        {/* Tabs navigation & Action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1 overflow-x-auto select-none no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'all' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <InboxIcon size={14} />
              <span>Tất cả</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}
              >
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('unread');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'unread' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Mail size={14} />
              <span>Chưa đọc</span>
              {unreadCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === 'unread' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('need_action');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'need_action' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock size={14} />
              <span>Chờ tôi duyệt</span>
              {pendingReviewCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === 'need_action' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {pendingReviewCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('read');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'read' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MailOpen size={14} />
              <span>Đã đọc</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === 'read' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {readCount}
              </span>
            </button>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllDisplayedAsRead}
                leftIcon={<CheckCheck size={14} className="text-emerald-600" />}
                className="text-xs h-8"
              >
                Đọc tất cả trang này
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              loading={isFetching}
              leftIcon={<RotateCcw size={14} className={isFetching ? 'animate-spin' : ''} />}
              className="text-xs h-8"
            >
              Làm mới
            </Button>
          </div>
        </div>

        {/* Search & Document Type Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex-1 max-w-md">
            <TableSearch
              placeholder="Tìm theo mã văn bản, tiêu đề hoặc nội dung..."
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-52">
              <Select
                value={documentType}
                onChange={(e) => {
                  setDocumentType(e.target.value);
                  setPage(1);
                }}
                options={documentTypeOptions}
              />
            </div>

            {(search || documentType || activeTab !== 'all') && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-xs text-slate-500 hover:text-slate-800 shrink-0">
                Đặt lại
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Inbox Documents List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-xs font-medium">Đang tải danh sách hộp thư đến...</p>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center">
              {activeTab === 'unread' ? (
                <Sparkles size={28} className="text-amber-500" />
              ) : activeTab === 'need_action' ? (
                <ShieldCheck size={28} className="text-emerald-500" />
              ) : (
                <InboxIcon size={28} />
              )}
            </div>

            <h3 className="text-sm font-bold text-slate-800">
              {activeTab === 'unread'
                ? 'Tuyệt vời! Bạn không còn văn bản chưa đọc nào'
                : activeTab === 'need_action'
                  ? 'Không có văn bản nào đang chờ bạn phê duyệt'
                  : activeTab === 'read'
                    ? 'Chưa có văn bản nào đã đọc'
                    : 'Hộp thư đến của bạn hiện đang trống'}
            </h3>

            <p className="text-xs text-slate-500 max-w-sm">
              {activeTab === 'unread'
                ? 'Toàn bộ văn bản gửi đến bạn đã được xem qua và cập nhật trạng thái.'
                : 'Các văn bản quy chế, quyết định hoặc tài liệu nội bộ gửi đến bạn sẽ xuất hiện tại đây.'}
            </p>

            {(search || documentType) && (
              <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2 text-xs">
                Xóa bộ lọc tìm kiếm
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayItems.map((doc) => (
              <InboxItemRow
                key={doc.id}
                document={doc}
                onOpenDetail={handleOpenDetail}
                onMarkAsRead={handleQuickMarkAsRead}
                currentUserId={currentUser?.id}
              />
            ))}
          </div>
        )}

        {/* 5. Pagination Footer */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:px-5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600">
            <div>
              Hiển thị <span className="font-semibold text-slate-800">{(page - 1) * limit + 1}</span> -{' '}
              <span className="font-semibold text-slate-800">{Math.min(page * limit, totalItems)}</span> trên tổng số{' '}
              <span className="font-semibold text-slate-800">{totalItems}</span> văn bản
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  leftIcon={<ChevronLeft size={14} />}
                >
                  Trước
                </Button>

                <span className="px-2.5 py-1 rounded bg-white border border-slate-200 font-semibold text-slate-700">
                  {page} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  rightIcon={<ChevronRight size={14} />}
                >
                  Sau
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Document Detail Modal */}
      <DocumentDetailModal
        isOpen={detailDocOpen}
        onClose={() => {
          setDetailDocOpen(false);
          setSelectedDoc(null);
        }}
        document={selectedDoc}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({ queryKey: ['inbox-unread-count'] });
          queryClient.invalidateQueries({ queryKey: ['inbox-read-count'] });
          queryClient.invalidateQueries({ queryKey: ['inbox-total-count'] });
        }}
      />
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<div className="w-full flex items-center justify-center min-h-[300px] text-slate-500 text-xs">Đang tải Hộp thư đến...</div>}>
      <InboxPageContent />
    </Suspense>
  );
}
