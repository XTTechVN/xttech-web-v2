'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Search,
  RotateCcw,
  LayoutGrid,
  List,
  AlertCircle,
  SearchX,
  Trash2,
} from 'lucide-react';
import { Select, Button } from '@/components';
import { getTrashItems, restoreTrashItem, purgeTrashItem } from '@/actions/trash';
import type { TrashItem, TrashItemType } from '@/types';
import { TrashHeader } from './trash-header';
import { TrashCard } from './trash-card';
import { TrashListItem } from './trash-list-item';
import { RestoreConfirmModal } from './restore-confirm-modal';
import { PurgeConfirmModal } from './purge-confirm-modal';
import { DOC_QUERY_KEYS, invalidateDocumentQueries } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-query-keys';

const ITEM_TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả loại mục' },
  { value: 'folder', label: 'Chỉ thư mục' },
  { value: 'document', label: 'Chỉ tài liệu' },
];

/** Lấy tên hiển thị an toàn của mục trong thùng rác */
const getItemDisplayName = (item: TrashItem): string => {
  return item.title || (item as any).name || (item as any).folder_name || (item as any).fileName || 'mục';
};

export const TrashTab: React.FC = () => {
  const queryClient = useQueryClient();

  // Toolbar & View state
  const [search, setSearch] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | TrashItemType>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal states
  const [restoreItem, setRestoreItem] = useState<TrashItem | null>(null);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);

  const [purgeItem, setPurgeItem] = useState<TrashItem | null>(null);
  const [isPurgeOpen, setIsPurgeOpen] = useState(false);

  const [activeRestoringId, setActiveRestoringId] = useState<number | null>(null);
  const [activePurgingId, setActivePurgingId] = useState<number | null>(null);

  // 1. Fetch Trash Items
  const {
    data: rawTrashItems = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<TrashItem[]>({
    queryKey: DOC_QUERY_KEYS.trash.root,
    queryFn: getTrashItems,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const trashItems: TrashItem[] = useMemo(() => {
    if (Array.isArray(rawTrashItems)) return rawTrashItems;
    if (Array.isArray((rawTrashItems as any)?.items)) return (rawTrashItems as any).items;
    if (Array.isArray((rawTrashItems as any)?.data)) return (rawTrashItems as any).data;
    return [];
  }, [rawTrashItems]);

  // 2. Mutations
  const restoreMutation = useMutation({
    mutationFn: async (item: TrashItem) => {
      setActiveRestoringId(item.id);
      return restoreTrashItem({
        itemType: item.itemType,
        itemId: item.id,
      });
    },
    onSuccess: (_, item) => {
      const name = getItemDisplayName(item);
      toast.success(`Đã khôi phục ${item.itemType === 'folder' ? 'thư mục' : 'tài liệu'} "${name}" thành công!`);
      // Đồng bộ toàn bộ các query liên quan
      invalidateDocumentQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: DOC_QUERY_KEYS.trash.root });
      setIsRestoreOpen(false);
      setRestoreItem(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Không thể khôi phục mục đã chọn');
    },
    onSettled: () => {
      setActiveRestoringId(null);
    },
  });

  const purgeMutation = useMutation({
    mutationFn: async (item: TrashItem) => {
      setActivePurgingId(item.id);
      return purgeTrashItem({
        itemType: item.itemType,
        itemId: item.id,
      });
    },
    onSuccess: (_, item) => {
      const name = getItemDisplayName(item);
      toast.success(`Đã xóa vĩnh viễn ${item.itemType === 'folder' ? 'thư mục' : 'tài liệu'} "${name}"!`);
      invalidateDocumentQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: DOC_QUERY_KEYS.trash.root });
      setIsPurgeOpen(false);
      setPurgeItem(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Không thể xóa vĩnh viễn mục đã chọn');
    },
    onSettled: () => {
      setActivePurgingId(null);
    },
  });

  // Filter items
  const filteredItems = useMemo(() => {
    return trashItems.filter((item) => {
      if (itemTypeFilter !== 'all' && item.itemType !== itemTypeFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const title = (item.title || (item as any).name || (item as any).folder_name || '').toLowerCase();
        const code = (item.code || '').toLowerCase();
        const fileName = (item.fileName || '').toLowerCase();
        const category = (item.categoryName || '').toLowerCase();
        const deletedBy = (item.deletedByName || '').toLowerCase();

        if (!title.includes(q) && !code.includes(q) && !fileName.includes(q) && !category.includes(q) && !deletedBy.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [trashItems, search, itemTypeFilter]);

  const folderCount = useMemo(
    () => filteredItems.filter((i) => i.itemType === 'folder').length,
    [filteredItems]
  );
  const docCount = useMemo(
    () => filteredItems.filter((i) => i.itemType === 'document').length,
    [filteredItems]
  );

  const hasActiveFilters = Boolean(search.trim() || itemTypeFilter !== 'all');

  const handleResetFilters = useCallback(() => {
    setSearch('');
    setItemTypeFilter('all');
  }, []);

  const handleOpenRestore = useCallback((item: TrashItem) => {
    setRestoreItem(item);
    setIsRestoreOpen(true);
  }, []);

  const handleCloseRestore = useCallback(() => {
    if (!restoreMutation.isPending) {
      setIsRestoreOpen(false);
      setRestoreItem(null);
    }
  }, [restoreMutation.isPending]);

  const handleConfirmRestore = useCallback(() => {
    if (restoreItem) {
      restoreMutation.mutate(restoreItem);
    }
  }, [restoreItem, restoreMutation]);

  const handleOpenPurge = useCallback((item: TrashItem) => {
    setPurgeItem(item);
    setIsPurgeOpen(true);
  }, []);

  const handleClosePurge = useCallback(() => {
    if (!purgeMutation.isPending) {
      setIsPurgeOpen(false);
      setPurgeItem(null);
    }
  }, [purgeMutation.isPending]);

  const handleConfirmPurge = useCallback(() => {
    if (purgeItem) {
      purgeMutation.mutate(purgeItem);
    }
  }, [purgeItem, purgeMutation]);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white select-none">
      {/* 1. Thanh công cụ Tìm kiếm, Bộ lọc & Nút chuyển chế độ xem (Lưới / Danh sách) */}
      <div className="bg-white border-b border-slate-200/80 p-4 shrink-0 shadow-2xs">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Trái: Tìm kiếm & Lọc loại mục */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap flex-1 min-w-0">
            {/* Input tìm kiếm */}
            <div className="relative w-full sm:w-60 md:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã, tiêu đề..."
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Bộ lọc loại mục */}
            <div className="w-44 sm:w-48 shrink-0">
              <Select
                value={itemTypeFilter}
                onChange={(e) => setItemTypeFilter(e.target.value as 'all' | TrashItemType)}
                options={ITEM_TYPE_OPTIONS}
                placeholder="Tất cả loại mục"
                className="h-9 text-xs"
              />
            </div>

            {/* Nút đặt lại bộ lọc */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 px-2.5 rounded-lg border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw size={14} />
              </Button>
            )}
          </div>

          {/* Phải: Chuyển chế độ xem [ ⊞ Lưới | ☰ Danh sách ] */}
          <div className="flex items-center p-0.5 rounded-xl border border-slate-200 bg-slate-100/80 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-primary shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng lưới"
            >
              <LayoutGrid size={15} />
              <span className="text-xs">Lưới</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-primary shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng danh sách"
            >
              <List size={15} />
              <span className="text-xs">Danh sách</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Nội dung chính toàn chiều rộng */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header đếm số lượng thư mục & tài liệu */}
        <TrashHeader
          folderCount={folderCount}
          docCount={docCount}
          isLoading={isLoading}
        />

        {/* Nội dung danh sách / lưới */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-slate-200/60 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-14 text-center">
            <div className="flex flex-col items-center justify-center max-w-sm mx-auto gap-3 text-slate-500">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
              <p className="font-semibold text-slate-800 text-sm">Không thể tải thùng rác</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RotateCcw size={14} />}>
                Thử lại
              </Button>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center">
            <div className="flex flex-col items-center justify-center max-w-sm mx-auto gap-2.5 text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                {hasActiveFilters ? <SearchX size={22} /> : <Trash2 size={24} />}
              </div>
              <p className="font-semibold text-slate-800 text-sm">
                {hasActiveFilters ? 'Không tìm thấy kết quả phù hợp' : 'Thùng rác trống'}
              </p>
              <p className="text-xs text-slate-400">
                {hasActiveFilters
                  ? 'Thử thay đổi từ khóa hoặc xóa bộ lọc tìm kiếm.'
                  : 'Không có tài liệu hoặc thư mục nào trong thùng rác.'}
              </p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* 1. HIỂN THỊ DẠNG LƯỚI THẺ (GRID) */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map((item) => (
              <TrashCard
                key={`${item.itemType}-${item.id}`}
                item={item}
                onRestore={handleOpenRestore}
                onPurge={handleOpenPurge}
                isRestoring={activeRestoringId === item.id}
                isPurging={activePurgingId === item.id}
              />
            ))}
          </div>
        ) : (
          /* 2. HIỂN THỊ DẠNG DANH SÁCH (GOOGLE DRIVE STYLE LIST) */
          <div className="flex flex-col gap-0 border-t border-slate-200/80">
            {/* Table Header kiểu Google Drive */}
            <div className="flex items-center justify-between py-2.5 px-3.5 border-b border-slate-200 text-xs font-medium text-slate-600 select-none">
              <div className="flex-1 min-w-[260px] pr-3">Tên</div>
              <div className="w-56 hidden sm:block">Lần sửa đổi gần đây nhất</div>
              <div className="w-44 hidden md:block">Chủ sở hữu</div>
              <div className="w-48 hidden lg:block">Vị trí</div>
              <div className="w-20 text-right"></div>
            </div>

            {/* Rows */}
            {filteredItems.map((item) => (
              <TrashListItem
                key={`${item.itemType}-${item.id}`}
                item={item}
                onRestore={handleOpenRestore}
                onPurge={handleOpenPurge}
                isRestoring={activeRestoringId === item.id}
                isPurging={activePurgingId === item.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Restore Confirm Modal */}
      <RestoreConfirmModal
        isOpen={isRestoreOpen}
        onClose={handleCloseRestore}
        item={restoreItem}
        onConfirm={handleConfirmRestore}
        loading={restoreMutation.isPending}
      />

      {/* Purge Confirm Modal */}
      <PurgeConfirmModal
        isOpen={isPurgeOpen}
        onClose={handleClosePurge}
        item={purgeItem}
        onConfirm={handleConfirmPurge}
        loading={purgeMutation.isPending}
      />
    </div>
  );
};
