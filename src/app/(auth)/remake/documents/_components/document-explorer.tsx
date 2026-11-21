'use client';

import { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ClipboardPaste,
  Copy,
  FolderInput,
  FolderPlus,
  FileUp,
  FolderUp,
  ListChecks,
  LayoutGrid,
  List,
  Plus,
  Scissors,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCan, useDocumentExplorer } from '@/hooks';
import { hasFileTransfer } from '@/utils';
import { cn } from '@/utils/cn';
import { INPUT } from '../../_components/form';
import { PageHeader } from '../../_components/page-header';
import { Sheet } from '../../_components/sheet';
import { EmptyState, ListSkeleton } from '../../_components/state-views';
import { ContextPanel } from './context-panel';
import { ExplorerDialogs } from './dialogs/explorer-dialogs';
import { buildExplorerMenu } from './explorer-menu';
import { UploadProgress } from './dialogs/upload-progress';
import { EntryRow, EntryTile, entryKey, type Entry } from './explorer-entry';

const ICON_BTN =
  'flex size-11 flex-none items-center justify-center rounded-rm border border-rm-line bg-rm-surface md:size-rm-control text-rm-text transition-[background-color,transform] duration-(--rm-dur-fast) active:scale-95 active:bg-rm-bg md:hover:bg-rm-bg';
const SEG = 'flex h-full w-10 items-center justify-center rounded-rm transition-[background-color] duration-(--rm-dur-fast)';

interface Props {
  tab: 'my' | 'shared';
  title: string;
  description: string;
}

// Trình quản lý tài liệu: thư mục, lưới/bảng, chuột phải, chọn nhiều, cắt/dán, tải lên (kéo thả được).
// Dữ liệu và quyền dùng lại hook của trang cũ; hộp thoại (chia sẻ, di chuyển, xem trước…) còn dùng bản cũ.
export function DocumentExplorer({ tab, title, description }: Props) {
  const { can, isReady } = useCan();
  const explorer = useDocumentExplorer({ tab });
  const [picking, setPicking] = useState(false);
  const [adding, setAdding] = useState(false);
  const [dropping, setDropping] = useState(false);
  const drag = useRef(0);

  const {
    viewMode,
    setViewMode,
    search,
    setSearch,
    hasActiveFilters,
    handleResetFilters,
    currentFolderId,
    currentFolder,
    setCurrentFolderId,
    handleGoBack,
    foldersToDisplay,
    displayedDocuments: documents,
    isLoadingCategories,
    isLoadingDocuments,
    selectedItemKeys,
    toggleSelectItem,
    clearSelection,
    selectAll,
    orderedKeys,
    cutKeySet,
    clipboard,
    clearClipboard,
    isPasting,
    modals,
    canCreate,
    canEditCurrentFolder,
    contextMenu,
    closeContextMenu,
    handleSelectItem,
    handleContextMenuFolder,
    handleContextMenuDoc,
    handleContextMenuBackground,
    handlePasteToCurrentFolder,
    handlePasteIntoFolder,
    handleCopySelected,
    handleCutSelected,
    handleCopySingleDoc,
    handleCutSingleDoc,
    handleCutSingleFolder,
    handleDownloadFolder,
    handleOpenMoveSelected,
    handleOpenDeleteSelected,
    handleRemoveFromFolder,
    isFolderOwnerOrAdmin,
    currentUser,
    isSharedSection,
    canManageDocuments,
    allMyCategoryIds,
    currentFolderPermission,
    triggerFilesUpload,
    triggerFolderUpload,
    fileInputRef,
    folderInputRef,
    handleFilesChange,
    handleFolderChange,
    handleDroppedDataTransfer,
    uploadQueue,
    isDrawerOpen,
    closeDrawer,
    retryItem,
    cancelItem,
    filterUnreadOnly,
    setFilterUnreadOnly,
    unreadCount,
    rawDocuments,
  } = explorer;

  const entries = useMemo<Entry[]>(
    () => [...foldersToDisplay.map((f) => ({ kind: 'folder', f }) as const), ...documents.map((d) => ({ kind: 'doc', d }) as const)],
    [foldersToDisplay, documents],
  );
  const hasClipboard = Boolean(clipboard && clipboard.items.length > 0);
  const selectedCount = selectedItemKeys.size;
  const inPickMode = picking || selectedCount > 0;
  const loading = isLoadingCategories || isLoadingDocuments;
  const locationName = currentFolder ? currentFolder.name : tab === 'shared' ? 'Được chia sẻ với tôi' : 'Tài liệu của tôi';

  const ctxMenu = buildExplorerMenu({
    contextMenu,
    locationName,
    canCreate,
    hasClipboard,
    totalItems: entries.length,
    selectedCount,
    currentUser,
    isSharedSection,
    canManageDocuments,
    allMyCategoryIds,
    currentFolderId,
    currentFolderPermission,
    modals,
    isFolderOwnerOrAdmin,
    onNavigateFolder: setCurrentFolderId,
    onPasteToCurrentFolder: handlePasteToCurrentFolder,
    onPasteIntoFolder: handlePasteIntoFolder,
    onDownloadFolder: handleDownloadFolder,
    onUploadFiles: triggerFilesUpload,
    onUploadFolder: triggerFolderUpload,
    onSelectAll: () => selectAll(orderedKeys),
    onMoveSelected: handleOpenMoveSelected,
    onCutSelected: handleCutSelected,
    onCopySelected: handleCopySelected,
    onDeleteSelected: handleOpenDeleteSelected,
    onClearSelection: clearSelection,
    onCopySingleDoc: handleCopySingleDoc,
    onCutSingleDoc: handleCutSingleDoc,
    onCutSingleFolder: handleCutSingleFolder,
    onRemoveFromFolder: handleRemoveFromFolder,
  });

  if (!isReady) return <ListSkeleton />;
  if (!can('document:read')) return <EmptyState title="Bạn chưa có quyền xem mục này" description="Liên hệ quản trị viên để được cấp quyền." />;

  const open = (e: Entry, ev: React.MouseEvent) => {
    if (ev.ctrlKey || ev.metaKey || ev.shiftKey)
      return handleSelectItem(ev, e.kind === 'folder' ? 'folder' : 'document', e.kind === 'folder' ? e.f.id : e.d.id);
    if (inPickMode) return toggleSelectItem(e.kind === 'folder' ? 'folder' : 'document', e.kind === 'folder' ? e.f.id : e.d.id);
    if (e.kind === 'folder') setCurrentFolderId(e.f.id);
    else modals.actions.openPreviewDoc(e.d);
  };
  const menu = (e: Entry, ev: React.MouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (e.kind === 'folder') handleContextMenuFolder(ev, e.f);
    else handleContextMenuDoc(ev, e.d);
  };
  const shared = (e: Entry) => ({
    selected: selectedItemKeys.has(entryKey(e)),
    cut: cutKeySet.has(entryKey(e)),
    picking: inPickMode,
    onOpen: (ev: React.MouseEvent) => open(e, ev),
    onMenu: (ev: React.MouseEvent) => menu(e, ev),
  });

  const onDrop = (ev: React.DragEvent) => {
    if (!hasFileTransfer(ev.dataTransfer)) return;
    ev.preventDefault();
    drag.current = 0;
    setDropping(false);
    if (!canCreate && !canEditCurrentFolder) return void toast.error('Bạn không có quyền tải tệp vào thư mục này');
    void handleDroppedDataTransfer(ev.dataTransfer);
  };
  const addItem = (fn: () => void) => () => {
    setAdding(false);
    fn();
  };

  return (
    <div
      className="relative min-h-[60dvh]"
      onClick={(ev) => {
        if ((ev.target as HTMLElement).closest('[data-explorer-item="true"],button,input,a')) return;
        closeContextMenu();
        if (selectedCount > 0) clearSelection();
      }}
      onContextMenu={handleContextMenuBackground}
      onDragEnter={(ev) => hasFileTransfer(ev.dataTransfer) && (ev.preventDefault(), (drag.current += 1) === 1 && setDropping(true))}
      onDragOver={(ev) => hasFileTransfer(ev.dataTransfer) && ev.preventDefault()}
      onDragLeave={(ev) => hasFileTransfer(ev.dataTransfer) && (drag.current -= 1) <= 0 && ((drag.current = 0), setDropping(false))}
      onDrop={onDrop}
    >
      <PageHeader title={title} description={description} />

      <div className="sticky top-0 z-10 -mx-rm-gutter mb-3 flex items-center gap-2 bg-rm-bg px-rm-gutter pb-2 pt-1">
        <div className="relative min-w-0 flex-1">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
          <input
            type="search"
            aria-label="Tìm tài liệu hoặc thư mục"
            placeholder="Tìm tài liệu, thư mục"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${INPUT} pl-10`}
          />
        </div>
        <div
          role="group"
          aria-label="Kiểu hiển thị"
          className="hidden h-rm-control flex-none overflow-hidden rounded-rm border border-rm-line bg-rm-surface md:flex"
        >
          {(
            [
              ['grid', LayoutGrid, 'Dạng lưới'],
              ['table', List, 'Dạng bảng'],
            ] as const
          ).map(([mode, Icon, label]) => (
            <button
              key={mode}
              type="button"
              aria-pressed={viewMode === mode}
              aria-label={label}
              onClick={() => setViewMode(mode)}
              className={cn(SEG, viewMode === mode ? 'bg-rm-primary-soft text-rm-primary' : 'text-rm-muted md:hover:bg-rm-bg')}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-pressed={picking}
          aria-label="Chọn nhiều mục"
          onClick={() => (picking ? (setPicking(false), clearSelection()) : setPicking(true))}
          className={cn(ICON_BTN, picking && 'border-rm-primary bg-rm-primary-soft text-rm-primary')}
        >
          <ListChecks size={18} />
        </button>
        {canCreate && (
          <button
            type="button"
            aria-label="Thêm mới"
            onClick={() => setAdding(true)}
            className="flex h-11 flex-none items-center justify-center gap-2 rounded-rm bg-rm-primary md:h-rm-control px-3 text-sm font-medium text-rm-on-primary transition-[background-color,transform] duration-(--rm-dur-fast) active:scale-95 md:hover:bg-rm-primary-hover md:px-4"
          >
            <Plus size={18} aria-hidden="true" />
            <span className="hidden md:inline">Thêm</span>
          </button>
        )}
        {selectedCount > 0 && (
          <div
            role="toolbar"
            aria-label="Thao tác với mục đã chọn"
            className="absolute inset-x-rm-gutter inset-y-0 bottom-2 top-1 z-10 flex items-center gap-1 rounded-rm bg-rm-primary-soft px-3"
          >
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-rm-primary">Đã chọn {selectedCount}</span>
            {(
              [
                [FolderInput, 'Di chuyển', handleOpenMoveSelected],
                [Scissors, 'Cắt', handleCutSelected],
                [Copy, 'Sao chép', handleCopySelected],
                [Trash2, 'Xoá', handleOpenDeleteSelected],
                [X, 'Bỏ chọn', () => (clearSelection(), setPicking(false))],
              ] as const
            ).map(([Icon, label, fn]) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                onClick={fn}
                className={cn(
                  'flex size-11 items-center justify-center rounded-full text-rm-primary transition-[background-color,transform] duration-(--rm-dur-fast) active:scale-95 active:bg-rm-line',
                  label === 'Xoá' && 'text-rm-danger',
                )}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === 'shared' && (
        <div className="mb-3 flex gap-2" role="group" aria-label="Lọc theo trạng thái đọc">
          {(
            [
              [false, `Tất cả (${rawDocuments.length})`],
              [true, `Chưa đọc${unreadCount ? ` (${unreadCount})` : ''}`],
            ] as const
          ).map(([v, label]) => (
            <button
              key={label}
              type="button"
              aria-pressed={filterUnreadOnly === v}
              onClick={() => setFilterUnreadOnly(v)}
              className={cn(
                'h-9 rounded-rm px-3 text-sm transition-[background-color] duration-(--rm-dur-fast)',
                filterUnreadOnly === v ? 'bg-rm-primary text-rm-on-primary' : 'border border-rm-line bg-rm-surface text-rm-text',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {currentFolderId !== null && (
        <div className="mb-3 flex items-center gap-2">
          <button type="button" onClick={handleGoBack} aria-label="Lên thư mục cha" className={ICON_BTN}>
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{locationName}</p>
            <p className="truncate text-xs text-rm-muted">
              {foldersToDisplay.length} thư mục · {documents.length} tài liệu
            </p>
          </div>
        </div>
      )}

      {hasClipboard && canCreate && (
        <div className="mb-3 flex items-center gap-2 rounded-rm-xl border border-rm-edge bg-rm-surface px-3 py-1">
          <span className="min-w-0 flex-1 truncate text-sm">
            Đang giữ {clipboard!.items.length} mục ({clipboard!.mode === 'cut' ? 'cắt' : 'sao chép'})
          </span>
          <button
            type="button"
            disabled={isPasting}
            onClick={handlePasteToCurrentFolder}
            className="flex h-11 items-center gap-2 px-2 text-sm font-medium text-rm-primary disabled:opacity-60"
          >
            <ClipboardPaste size={18} aria-hidden="true" />
            {isPasting ? 'Đang dán…' : 'Dán vào đây'}
          </button>
          <button type="button" aria-label="Bỏ clipboard" onClick={clearClipboard} className="flex size-11 items-center justify-center text-rm-muted">
            <X size={18} />
          </button>
        </div>
      )}

      {loading && <ListSkeleton />}
      {!loading && entries.length === 0 && (
        <EmptyState
          title={
            hasActiveFilters
              ? 'Không tìm thấy mục nào'
              : currentFolder
                ? `Thư mục "${currentFolder.name}" đang trống`
                : tab === 'shared'
                  ? 'Chưa có gì được chia sẻ cho bạn'
                  : 'Chưa có thư mục hoặc tài liệu'
          }
          description={
            hasActiveFilters
              ? 'Thử từ khoá khác hoặc bỏ bộ lọc.'
              : canCreate
                ? 'Bấm Thêm để tạo thư mục hoặc tải tệp lên, hoặc kéo thả tệp vào đây.'
                : ' '
          }
          actionLabel={hasActiveFilters ? 'Bỏ bộ lọc' : undefined}
          onAction={hasActiveFilters ? handleResetFilters : undefined}
        />
      )}

      {!loading && entries.length > 0 && (
        <>
          <ul
            aria-label="Thư mục và tài liệu"
            className={cn('grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-4', viewMode === 'table' && 'md:hidden')}
          >
            {entries.map((e) => (
              <EntryTile key={entryKey(e)} e={e} {...shared(e)} />
            ))}
          </ul>
          {viewMode === 'table' && (
            <div className="hidden overflow-hidden rounded-rm-xl border border-rm-edge bg-rm-surface md:block">
              <table className="w-full table-fixed">
                <caption className="sr-only">Thư mục và tài liệu</caption>
                <thead>
                  <tr className="text-left text-xs text-rm-muted">
                    <th scope="col" className="px-3 py-2 font-medium">
                      Tên
                    </th>
                    <th scope="col" className="w-32 px-3 font-medium">
                      Loại
                    </th>
                    <th scope="col" className="hidden w-40 px-3 font-medium xl:table-cell">
                      Người tạo
                    </th>
                    <th scope="col" className="w-28 px-3 font-medium">
                      Cập nhật
                    </th>
                    <th scope="col" className="w-24 px-3 text-right font-medium">
                      Kích thước
                    </th>
                    <th scope="col" className="w-12">
                      <span className="sr-only">Thao tác</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <EntryRow key={entryKey(e)} e={e} {...shared(e)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {dropping && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-rm-xl border-2 border-dashed border-rm-primary bg-rm-primary-soft/80 text-sm font-medium text-rm-primary">
          Thả tệp hoặc thư mục vào đây để tải lên
        </div>
      )}

      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilesChange} />
      {/* @ts-expect-error webkitdirectory là chuẩn của trình duyệt để chọn cả thư mục */}
      <input ref={folderInputRef} type="file" multiple webkitdirectory="" directory="" className="hidden" onChange={handleFolderChange} />

      <Sheet open={adding} onClose={() => setAdding(false)} title="Thêm mới">
        <ul className="divide-y divide-rm-line p-rm-gutter pt-0">
          {(
            [
              [FolderPlus, 'Tạo thư mục', modals.actions.openCreateFolder],
              [FileUp, 'Tải tệp lên', triggerFilesUpload],
              [FolderUp, 'Tải cả thư mục lên', triggerFolderUpload],
            ] as const
          ).map(([Icon, label, fn]) => (
            <li key={label}>
              <button
                type="button"
                onClick={addItem(fn)}
                className="flex min-h-rm-tap w-full items-center gap-3 py-2 text-left text-sm active:bg-rm-bg"
              >
                <Icon size={18} className="flex-none text-rm-primary" aria-hidden="true" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>

      <ContextPanel
        open={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        title={ctxMenu.title}
        items={ctxMenu.items}
        onClose={closeContextMenu}
      />
      <UploadProgress items={uploadQueue} open={isDrawerOpen} onClose={closeDrawer} onRetry={retryItem} onCancel={cancelItem} />
      <ExplorerDialogs explorer={explorer} />
    </div>
  );
}
