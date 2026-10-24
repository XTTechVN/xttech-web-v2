'use client';

import React from 'react';
import { Search, RotateCcw, LayoutGrid, List, AlertCircle, SearchX, Trash2 } from 'lucide-react';
import { Select, Button } from '@/components';
import type { TrashItemType } from '@/types';
import { toExplorerItemKey } from '@/hooks';
import { ExplorerContextMenu, ConfirmActionModal } from '@/components/documents';
import { TrashHeader } from './trash-header';
import { TrashCard } from './trash-card';
import { TrashListItem } from './trash-list-item';
import { useTrashExplorer } from '../_hooks/use-trash-explorer';
import { getTrashItemDisplayName } from '../_utils/trash-helpers';

const ITEM_TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả loại mục' },
  { value: 'folder', label: 'Chỉ thư mục' },
  { value: 'document', label: 'Chỉ tài liệu' },
];

export const TrashTab: React.FC = () => {
  const {
    currentFolderId,
    setCurrentFolderId,
    currentFolder,
    parentFolder,
    breadcrumbs,
    search,
    setSearch,
    itemTypeFilter,
    setItemTypeFilter,
    viewMode,
    setViewMode,
    filteredItems,
    folderCount,
    docCount,
    hasAnyTrash,
    hasActiveFilters,
    isLoading,
    isError,
    refetchAll,
    handleGoBack,
    handleResetFilters,
    selectedItemKeys,
    clearSelection,
    handleSelectItem,
    handleContextMenuItem,
    handleContextMenuBackground,
    contextMenu,
    closeContextMenu,
    resolvedContextMenu,
    restoreModal,
    setRestoreModal,
    purgeModal,
    setPurgeModal,
    openSingleRestore,
    openSinglePurge,
    openEmptyTrashModal,
    restoreMutation,
    purgeMutation,
    activeRestoringId,
    activePurgingId,
  } = useTrashExplorer();

  const restoreSingle = restoreModal.items[0];
  const restoreIsBulk = restoreModal.items.length > 1;
  const purgeSingle = purgeModal.items[0];

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white select-none">
      <div className="bg-white border-b border-slate-200/80 p-4 shrink-0 shadow-2xs">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap flex-1 min-w-0">
            <div className="relative w-full sm:w-60 md:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã, tiêu đề..."
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="w-44 sm:w-48 shrink-0">
              <Select
                value={itemTypeFilter}
                onChange={(e) => setItemTypeFilter(e.target.value as 'all' | TrashItemType)}
                options={ITEM_TYPE_OPTIONS}
                placeholder="Tất cả loại mục"
                className="h-9 text-xs"
              />
            </div>

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

          <div className="flex items-center p-0.5 rounded-xl border border-slate-200 bg-slate-100/80 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-primary shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
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
                viewMode === 'list' ? 'bg-white text-primary shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng danh sách"
            >
              <List size={15} />
              <span className="text-xs">Danh sách</span>
            </button>
          </div>
        </div>
      </div>

      <div
        onClick={() => {
          closeContextMenu();
          if (selectedItemKeys.size > 0) clearSelection();
        }}
        onContextMenu={handleContextMenuBackground}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <TrashHeader
          currentFolderId={currentFolderId}
          currentFolder={currentFolder}
          parentFolder={parentFolder}
          breadcrumbs={breadcrumbs}
          folderCount={folderCount}
          docCount={docCount}
          isLoading={isLoading}
          hasAnyTrash={hasAnyTrash}
          onGoBack={handleGoBack}
          onNavigateFolder={setCurrentFolderId}
          onEmptyTrash={openEmptyTrashModal}
        />

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
              <Button variant="outline" size="sm" onClick={refetchAll} leftIcon={<RotateCcw size={14} />}>
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
                {hasActiveFilters
                  ? 'Không tìm thấy kết quả phù hợp'
                  : currentFolder
                    ? `Thư mục "${currentFolder.name}" đang trống`
                    : 'Thùng rác trống'}
              </p>
              <p className="text-xs text-slate-400">
                {hasActiveFilters ? 'Thử thay đổi từ khóa hoặc xóa bộ lọc tìm kiếm.' : 'Không có tài liệu hoặc thư mục nào tại đây.'}
              </p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map((item) => {
              const key = toExplorerItemKey(item.itemType, item.id);
              return (
                <TrashCard
                  key={key}
                  item={item}
                  isSelected={selectedItemKeys.has(key)}
                  onSelectItem={handleSelectItem}
                  onOpenFolder={setCurrentFolderId}
                  onContextMenuItem={handleContextMenuItem}
                  onRestore={openSingleRestore}
                  onPurge={openSinglePurge}
                  isRestoring={activeRestoringId === item.id}
                  isPurging={activePurgingId === item.id}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-0 border-t border-slate-200/80">
            <div className="flex items-center justify-between py-2.5 px-3.5 border-b border-slate-200 text-xs font-medium text-slate-600 select-none">
              <div className="flex-1 min-w-[260px] pr-3">Tên</div>
              <div className="w-56 hidden sm:block">Thời gian xóa</div>
              <div className="w-44 hidden md:block">Chủ sở hữu</div>
              <div className="w-48 hidden lg:block">Vị trí</div>
              <div className="w-20 text-right"></div>
            </div>

            {filteredItems.map((item) => {
              const key = toExplorerItemKey(item.itemType, item.id);
              return (
                <TrashListItem
                  key={key}
                  item={item}
                  isSelected={selectedItemKeys.has(key)}
                  onSelectItem={handleSelectItem}
                  onOpenFolder={setCurrentFolderId}
                  onContextMenuItem={handleContextMenuItem}
                  onRestore={openSingleRestore}
                  onPurge={openSinglePurge}
                  isRestoring={activeRestoringId === item.id}
                  isPurging={activePurgingId === item.id}
                />
              );
            })}
          </div>
        )}
      </div>

      <ExplorerContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        title={resolvedContextMenu.title}
        items={resolvedContextMenu.items}
        onClose={closeContextMenu}
      />

      <ConfirmActionModal
        isOpen={restoreModal.isOpen && restoreModal.items.length > 0}
        onClose={() => { if (!restoreMutation.isPending) setRestoreModal((prev) => ({ ...prev, isOpen: false })); }}
        title="Xác nhận khôi phục"
        description={
          restoreIsBulk ? (
            <>Bạn có chắc chắn muốn khôi phục <strong className="text-gray-900 font-semibold">{restoreModal.items.length} mục đã chọn</strong> từ thùng rác?</>
          ) : (
            <>Bạn có chắc chắn muốn khôi phục {restoreSingle?.itemType === 'folder' ? 'thư mục' : 'tài liệu'} <strong className="text-gray-900 font-semibold">{restoreSingle ? getTrashItemDisplayName(restoreSingle) : ''}</strong>?</>
          )
        }
        confirmText={restoreIsBulk ? `Khôi phục (${restoreModal.items.length})` : 'Xác nhận khôi phục'}
        variant="primary"
        onConfirm={() => restoreMutation.mutate(restoreModal.items)}
        loading={restoreMutation.isPending}
      />

      <ConfirmActionModal
        isOpen={purgeModal.isOpen && (purgeModal.mode === 'emptyAll' || purgeModal.items.length > 0)}
        onClose={() => { if (!purgeMutation.isPending) setPurgeModal((prev) => ({ ...prev, isOpen: false })); }}
        title={purgeModal.mode === 'emptyAll' ? 'Dọn sạch thùng rác' : 'Xác nhận xóa vĩnh viễn'}
        description={
          purgeModal.mode === 'emptyAll' ? (
            <>Bạn có chắc chắn muốn <strong className="text-gray-900 font-semibold">dọn sạch toàn bộ thùng rác</strong>? Tất cả thư mục và tài liệu trong thùng rác sẽ bị xóa vĩnh viễn.</>
          ) : purgeModal.mode === 'bulk' || purgeModal.items.length > 1 ? (
            <>Bạn có chắc chắn muốn xóa vĩnh viễn <strong className="text-gray-900 font-semibold">{purgeModal.items.length} mục đã chọn</strong>?</>
          ) : (
            <>Bạn có chắc chắn muốn xóa vĩnh viễn {purgeSingle?.itemType === 'folder' ? 'thư mục' : 'tài liệu'} <strong className="text-gray-900 font-semibold">{purgeSingle ? getTrashItemDisplayName(purgeSingle) : ''}</strong>?</>
          )
        }
        warningNote="* Hành động này không thể hoàn tác. Dữ liệu và các tệp đính kèm sẽ bị xóa vĩnh viễn khỏi hệ thống."
        confirmText={purgeModal.mode === 'emptyAll' ? 'Dọn sạch ngay' : purgeModal.items.length > 1 ? `Xóa vĩnh viễn (${purgeModal.items.length})` : 'Xác nhận xóa'}
        variant="danger"
        onConfirm={() => purgeMutation.mutate({ mode: purgeModal.mode, items: purgeModal.items })}
        loading={purgeMutation.isPending}
      />
    </div>
  );
};
