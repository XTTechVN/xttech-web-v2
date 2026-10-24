import type { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  updateDocumentCategory,
  updateDocument,
  copyDocument,
  deleteDocumentCategory,
  deleteDocument,
} from '@/actions/document';
import {
  RULE_DOC_TYPES,
  type DocumentCategory,
  type DocumentItem,
} from '@/types';
import { isDocumentOwner, isDocumentSharedWithUser } from './document-permissions';
import { isDescendant } from './document-folder-tree';
import { invalidateDocumentQueries } from './document-query-keys';

export interface ClipboardEntry {
  type: 'folder' | 'document';
  id: number;
  name: string;
  parentId: number | null;
  canMove?: boolean;
}

export interface DocumentClipboardState {
  mode: 'cut' | 'copy';
  items: ClipboardEntry[];
}

export function findFolderWithPermission(
  nodes: DocumentCategory[],
  targetId: number,
  inherited?: 'view' | 'edit',
): { folder: DocumentCategory; effectivePermission?: 'view' | 'edit' } | null {
  for (const node of nodes) {
    const perm = node.permission || inherited;
    if (node.id === targetId) return { folder: node, effectivePermission: perm };
    if (node.children?.length) {
      const found = findFolderWithPermission(node.children, targetId, perm);
      if (found) return found;
    }
  }
  return null;
}

export function filterExplorerDocuments(
  documentsData: any,
  currentFolderId: number | null,
  isSharedSection: boolean,
  allSharedCategoryIds: Set<number>,
  allMyCategoryIds: Set<number>,
  currentUser: any,
): DocumentItem[] {
  let rawItems: DocumentItem[] = [];
  if (Array.isArray(documentsData?.items)) rawItems = documentsData.items;
  else if (Array.isArray(documentsData)) rawItems = documentsData;
  else if (Array.isArray(documentsData?.data)) rawItems = documentsData.data;

  if (isSharedSection) {
    if (currentFolderId === null) {
      return rawItems.filter((doc) => {
        if (isDocumentOwner(doc, currentUser, allMyCategoryIds)) return false;
        if (!isDocumentSharedWithUser(doc, currentUser, allSharedCategoryIds)) return false;
        return doc.categoryId === null || doc.categoryId === undefined || !allSharedCategoryIds.has(doc.categoryId);
      });
    }
    return rawItems.filter((doc) => doc.categoryId === currentFolderId || doc.category?.id === currentFolderId);
  }

  if (currentFolderId === null) {
    return rawItems.filter((doc) => {
      const isRoot = doc.categoryId === null || doc.categoryId === undefined;
      if (!isRoot || RULE_DOC_TYPES.includes(doc.documentType)) return false;
      return isDocumentOwner(doc, currentUser, allMyCategoryIds);
    });
  }

  return rawItems.filter((doc) => {
    if (RULE_DOC_TYPES.includes(doc.documentType)) return false;
    if (
      (doc.categoryId === currentFolderId || doc.category?.id === currentFolderId) &&
      isDocumentOwner(doc, currentUser, allMyCategoryIds)
    ) {
      return true;
    }
    const isShortcut =
      (doc as any).isShortcut === true ||
      (Array.isArray(doc.savedFolders) && doc.savedFolders.includes(currentFolderId));
    if (isShortcut || !isDocumentOwner(doc, currentUser, allMyCategoryIds)) return true;
    return doc.categoryId !== currentFolderId && doc.category?.id !== currentFolderId;
  });
}

export async function executeClipboardPaste({
  clipboard,
  targetFolderId,
  safeCategoryTree,
  queryClient,
  onClearClipboard,
}: {
  clipboard: DocumentClipboardState;
  targetFolderId: number | null;
  safeCategoryTree: DocumentCategory[];
  queryClient: QueryClient;
  onClearClipboard: () => void;
}) {
  if (clipboard.mode === 'copy') {
    const docItems = clipboard.items.filter((it) => it.type === 'document');
    let okCount = 0;
    for (const docItem of docItems) {
      await copyDocument(docItem.id, targetFolderId)
        .then(() => { okCount += 1; })
        .catch(() => {});
    }
    if (okCount > 0) {
      toast.success(`Đã dán bản sao của ${okCount} tài liệu`);
      invalidateDocumentQueries(queryClient);
    } else {
      toast.error('Không thể dán bản sao tài liệu');
    }
    return;
  }

  const validItems = clipboard.items.filter((it) => {
    if (it.parentId === targetFolderId) return false;
    if (it.type === 'folder') {
      if (it.id === targetFolderId) return false;
      if (targetFolderId !== null && isDescendant(safeCategoryTree, it.id, targetFolderId)) return false;
    }
    return true;
  });

  if (validItems.length === 0) {
    toast('Các mục đã ở sẵn tại vị trí này hoặc vị trí đích không hợp lệ.', { icon: 'ℹ️' });
    onClearClipboard();
    return;
  }

  const results = await Promise.allSettled(
    validItems.map((it) =>
      it.type === 'folder'
        ? updateDocumentCategory(it.id, { parentId: targetFolderId })
        : updateDocument(it.id, { categoryId: targetFolderId }),
    ),
  );
  const okCount = results.filter((r) => r.status === 'fulfilled').length;
  if (okCount > 0) {
    toast.success(`Đã di chuyển ${okCount} mục tới đây`);
    onClearClipboard();
    invalidateDocumentQueries(queryClient);
  } else {
    toast.error('Không thể di chuyển các mục đã cắt');
  }
}

export async function executeExplorerBulkDelete(
  targets: { type: 'folder' | 'document'; id: number; name: string }[],
  currentFolderId: number | null,
  queryClient: QueryClient,
  onGoBack: () => void,
) {
  await Promise.all(targets.map((t) => (t.type === 'folder' ? deleteDocumentCategory(t.id) : deleteDocument(t.id))));
  if (targets.some((t) => t.type === 'folder' && t.id === currentFolderId)) onGoBack();
  toast.success(targets.length > 1 ? `Đã xóa ${targets.length} mục thành công` : `Đã xóa "${targets[0].name}"`);
  invalidateDocumentQueries(queryClient);
}

export async function executeExplorerDrop(
  entries: ClipboardEntry[],
  targetFolderId: number,
  queryClient: QueryClient,
) {
  await Promise.all(
    entries.map((it) =>
      it.type === 'folder'
        ? updateDocumentCategory(it.id, { parentId: targetFolderId })
        : updateDocument(it.id, { categoryId: targetFolderId }),
    ),
  );
  toast.success(entries.length > 1 ? `Đã di chuyển ${entries.length} mục thành công` : 'Di chuyển thành công');
  invalidateDocumentQueries(queryClient);
}

const isEditableElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toUpperCase();
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) return true;
  return Boolean(target.closest('[contenteditable="true"], [role="dialog"]'));
};

export interface ExplorerHotkeyActions {
  hasOpenModal: boolean;
  hasContextMenu: boolean;
  selectedCount: number;
  hasClipboard: boolean;
  onCloseContextMenu: () => void;
  onClearSelection: () => void;
  onClearClipboard: () => void;
  onSelectAll: () => void;
  onCopySelected: () => void;
  onCutSelected: () => void;
  onPasteToCurrentFolder: () => void;
  onDeleteSelected: () => void;
  onOpenFocusedItem: () => void;
  onRenameFocusedItem: () => void;
}

export function handleExplorerKeyDown(e: KeyboardEvent, opts: ExplorerHotkeyActions) {
  if (opts.hasOpenModal || isEditableElement(e.target)) return;

  if (e.key === 'Escape') {
    if (opts.hasContextMenu) {
      e.preventDefault();
      opts.onCloseContextMenu();
    } else if (opts.selectedCount > 0) {
      e.preventDefault();
      opts.onClearSelection();
    } else if (opts.hasClipboard) {
      e.preventDefault();
      opts.onClearClipboard();
    }
    return;
  }

  const isMod = e.ctrlKey || e.metaKey;
  const lowerKey = e.key.toLowerCase();
  if (isMod && !e.shiftKey && !e.altKey) {
    if (lowerKey === 'a') { e.preventDefault(); opts.onSelectAll(); return; }
    if (lowerKey === 'c' && opts.selectedCount > 0) { e.preventDefault(); opts.onCopySelected(); return; }
    if (lowerKey === 'x' && opts.selectedCount > 0) { e.preventDefault(); opts.onCutSelected(); return; }
    if (lowerKey === 'v' && opts.hasClipboard) { e.preventDefault(); opts.onPasteToCurrentFolder(); return; }
  }

  if ((e.key === 'Delete' || e.key === 'Backspace') && opts.selectedCount > 0) {
    e.preventDefault();
    opts.onDeleteSelected();
  } else if (e.key === 'Enter' && opts.selectedCount === 1) {
    e.preventDefault();
    opts.onOpenFocusedItem();
  } else if (e.key === 'F2' && opts.selectedCount === 1) {
    e.preventDefault();
    opts.onRenameFocusedItem();
  }
}
