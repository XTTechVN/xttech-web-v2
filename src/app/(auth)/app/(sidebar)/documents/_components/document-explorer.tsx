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
  LayoutGrid,
  List,
  ListChecks,
  Plus,
  Scissors,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCan, useDocumentExplorer, useExplorerPointerDrag } from '@/hooks';
import { hasFileTransfer } from '@/utils';
import { cn } from '@/utils/cn';
import { Button, Chip, PageHeading, SearchField, TabState } from '@/components-remake';
import { AccessDenied } from '@/components/access-denied';
import { Sheet } from './sheet';
import { ContextPanel } from './context-panel';
import { ExplorerDialogs } from './dialogs/explorer-dialogs';
import { buildExplorerMenu } from './explorer-menu';
import { UploadProgress } from './dialogs/upload-progress';
import { EntryCard, EntryRow, EntryTile, entryKey, nameOf, type Entry } from './explorer-entry';

const ICON_BTN =
  'flex size-11 flex-none items-center justify-center rounded-control border border-slate-200 bg-white md:size-10 text-slate-900 transition-[background-color,transform] duration-200 active:scale-95 active:bg-slate-50 md:hover:bg-slate-50';

const VIEW_KEY = 'documents-view';
type View = 'grid' | 'list';

function readView(): View {
  try {
    return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
}

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
  const [view, setViewState] = useState<View>(readView);
  const setView = (v: View) => {
    setViewState(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      // bỏ qua: chỉ là tùy chọn hiển thị
    }
  };
  const drag = useRef(0);

  const {
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
    handleDropItem,
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
  const { dragState, startDragTracking, badgeRef } = useExplorerPointerDrag({ selectedItemKeys, onDropItem: handleDropItem });
  const hasClipboard = Boolean(clipboard && clipboard.items.length > 0);
  const selectedCount = selectedItemKeys.size;
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

  if (!isReady) return null;
  if (!can('document:read')) return <AccessDenied />;

  const keyOf = (e: Entry) => ({ type: e.kind === 'folder' ? ('folder' as const) : ('document' as const), id: e.kind === 'folder' ? e.f.id : e.d.id });
  const activate = (e: Entry) => {
    if (e.kind === 'folder') setCurrentFolderId(e.f.id);
    else modals.actions.openPreviewDoc(e.d);
  };
  // Chuột: một lần nhấp chỉ chọn, nhấp đúp mới mở. Cảm ứng: chạm là mở.
  const open = (e: Entry, ev: React.MouseEvent) => {
    const { type, id } = keyOf(e);
    if (ev.ctrlKey || ev.metaKey || ev.shiftKey) return handleSelectItem(ev, type, id);
    if (picking) return toggleSelectItem(type, id);
    if (window.matchMedia('(pointer: coarse)').matches) return activate(e);
    handleSelectItem(ev, type, id);
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
    picking,
    onOpen: (ev: React.MouseEvent) => open(e, ev),
    onMenu: (ev: React.MouseEvent) => menu(e, ev),
    onActivate: () => !picking && activate(e),
    drag: {
      folderId: e.kind === 'folder' ? e.f.id : undefined,
      over: e.kind === 'folder' && dragState.hoverFolderId === e.f.id,
      onPointerDown: (ev: React.PointerEvent) => {
        if (ev.pointerType !== 'mouse') return;
        const doc = e.kind === 'doc';
        startDragTracking(ev, { type: doc ? 'document' : 'folder', id: doc ? e.d.id : e.f.id, title: nameOf(e) });
      },
    },
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
      className="relative min-h-[60dvh] p-4 font-body text-slate-900 md:p-6 [&_h1]:font-heading"
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
      <PageHeading title={title} description={description} />

      <div className="relative mb-3 flex items-center gap-2">
        <SearchField value={search} onChange={setSearch} label="Tìm tài liệu hoặc thư mục" placeholder="Tìm tài liệu, thư mục..." />
        <div role="group" aria-label="Kiểu hiển thị" className="ml-auto flex flex-none gap-1">
          {(
            [
              ['grid', LayoutGrid, 'Lưới'],
              ['list', List, 'Danh sách'],
            ] as const
          ).map(([v, Icon, label]) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              aria-label={label}
              title={label}
              onClick={() => setView(v)}
              className={cn(ICON_BTN, view === v && 'border-primary bg-primary/10 text-primary')}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-pressed={picking}
          aria-label="Chọn nhiều mục"
          title="Chọn nhiều mục"
          onClick={() => (picking ? (setPicking(false), clearSelection()) : setPicking(true))}
          className={cn(ICON_BTN, 'md:w-auto md:gap-2 md:px-3', picking && 'border-primary bg-primary/10 text-primary')}
        >
          <ListChecks size={18} />
          <span className="hidden text-sm font-medium md:inline">Chọn</span>
        </button>
        {canCreate && (
          <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={() => setAdding(true)}>
            Thêm
          </Button>
        )}
        {selectedCount > 0 && (
          <div
            role="toolbar"
            aria-label="Thao tác với mục đã chọn"
            className="absolute inset-0 z-10 flex items-center gap-1 rounded-control border border-primary bg-white px-3"
          >
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-primary">Đã chọn {selectedCount}</span>
            {(
              [
                [FolderInput, 'Di chuyển', handleOpenMoveSelected, can('document:update')],
                [Scissors, 'Cắt', handleCutSelected, can('document:update')],
                [Copy, 'Sao chép', handleCopySelected, can('document:create')],
                [Trash2, 'Xoá', handleOpenDeleteSelected, can('document:delete')],
                [X, 'Bỏ chọn', () => (clearSelection(), setPicking(false)), true],
              ] as const
            )
              .filter(([, , , allowed]) => allowed)
              .map(([Icon, label, fn]) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                onClick={fn}
                className={cn(
                  'flex size-11 items-center justify-center rounded-full text-primary transition-[background-color,transform] duration-200 active:scale-95 active:bg-slate-200',
                  label === 'Xoá' && 'text-red-600',
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
            <Chip key={label} selected={filterUnreadOnly === v} onClick={() => setFilterUnreadOnly(v)}>
              {label}
            </Chip>
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
            <p className="truncate text-xs text-slate-600">
              {foldersToDisplay.length} thư mục · {documents.length} tài liệu
            </p>
          </div>
        </div>
      )}

      {hasClipboard && canCreate && (
        <div className="mb-3 flex items-center gap-2 rounded-block border border-slate-200/80 bg-white px-3 py-1">
          <span className="min-w-0 flex-1 truncate text-sm">
            Đang giữ {clipboard!.items.length} mục ({clipboard!.mode === 'cut' ? 'cắt' : 'sao chép'})
          </span>
          <button
            type="button"
            disabled={isPasting}
            onClick={handlePasteToCurrentFolder}
            className="flex h-11 items-center gap-2 px-2 text-sm font-medium text-primary disabled:opacity-60"
          >
            <ClipboardPaste size={18} aria-hidden="true" />
            {isPasting ? 'Đang dán…' : 'Dán vào đây'}
          </button>
          <button type="button" aria-label="Bỏ clipboard" onClick={clearClipboard} className="flex size-11 items-center justify-center text-slate-500">
            <X size={18} />
          </button>
        </div>
      )}

      <TabState
        loading={loading}
        empty={entries.length === 0}
        emptyText={
          hasActiveFilters
            ? 'Không tìm thấy mục nào.'
            : currentFolder
              ? `Thư mục "${currentFolder.name}" đang trống.`
              : tab === 'shared'
                ? 'Chưa có gì được chia sẻ cho bạn.'
                : 'Chưa có thư mục hoặc tài liệu.'
        }
        emptyAction={
          hasActiveFilters ? (
            <Button variant="outline" onClick={handleResetFilters}>
              Bỏ bộ lọc
            </Button>
          ) : undefined
        }
      >
        {view === 'grid' ? (
          <div className="flex flex-col gap-5">
            {[
              ['Thư mục', 'minmax(min(100%,13rem),1fr)', entries.filter((e) => e.kind === 'folder')],
              ['Tệp', 'minmax(min(100%,9rem),1fr)', entries.filter((e) => e.kind === 'doc')],
            ].map(
              ([title, col, items]) =>
                (items as Entry[]).length > 0 && (
                  <section key={title as string}>
                    <h2 className="mb-2 text-sm font-medium text-slate-600">{title as string}</h2>
                    <ul className="grid gap-2" style={{ gridTemplateColumns: `repeat(auto-fill, ${col as string})` }}>
                      {(items as Entry[]).map((e) => (
                        <EntryCard key={entryKey(e)} e={e} {...shared(e)} />
                      ))}
                    </ul>
                  </section>
                ),
            )}
          </div>
        ) : (
          <>
        <ul aria-label="Thư mục và tài liệu" className="grid grid-cols-1 gap-2 md:hidden">
          {entries.map((e) => (
            <EntryTile key={entryKey(e)} e={e} {...shared(e)} />
          ))}
        </ul>
        <div className="hidden overflow-hidden rounded-block border border-slate-200/80 bg-white md:block">
              <table className="w-full table-fixed">
                <caption className="sr-only">Thư mục và tài liệu</caption>
                <thead>
                  <tr className="text-left text-xs text-slate-500">
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
          </>
        )}
      </TabState>

      {dragState.isDragging && (
        <div ref={badgeRef} className="pointer-events-none fixed left-0 top-0 z-50 max-w-60 truncate rounded-control bg-primary px-3 py-1.5 text-sm font-medium text-white shadow-md">
          {dragState.count > 1 ? `${dragState.count} mục` : dragState.title}
        </div>
      )}

      {dropping && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-block border-2 border-dashed border-primary bg-primary/10 text-sm font-medium text-primary">
          Thả tệp hoặc thư mục vào đây để tải lên
        </div>
      )}

      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilesChange} />
      {/* @ts-expect-error webkitdirectory là chuẩn của trình duyệt để chọn cả thư mục */}
      <input ref={folderInputRef} type="file" multiple webkitdirectory="" directory="" className="hidden" onChange={handleFolderChange} />

      <Sheet open={adding} onClose={() => setAdding(false)} title="Thêm mới">
        <ul className="divide-y divide-slate-200 py-4 pt-0">
          {(
            [
              [FolderPlus, 'Tạo thư mục', modals.actions.openCreateFolder, can('document_category:create')],
              [FileUp, 'Tải tệp lên', triggerFilesUpload, true],
              [FolderUp, 'Tải cả thư mục lên', triggerFolderUpload, true],
            ] as const
          )
            .filter(([, , , allowed]) => allowed)
            .map(([Icon, label, fn]) => (
            <li key={label}>
              <button
                type="button"
                onClick={addItem(fn)}
                className="flex min-h-11 w-full items-center gap-3 py-2 text-left text-sm text-slate-900 active:bg-slate-50"
              >
                <Icon size={18} className="flex-none text-primary" aria-hidden="true" />
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
