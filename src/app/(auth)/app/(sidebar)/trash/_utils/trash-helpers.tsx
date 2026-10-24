import React from 'react';
import { FolderOpen, RotateCcw, Trash2, CheckSquare, XCircle } from 'lucide-react';
import type { DocumentCategory, DocumentItem, TrashItem } from '@/types';
import type { ExplorerContextMenuItem } from '@/components/documents';

export interface TrashBreadcrumbNode {
  id: number | null;
  name: string;
}

export interface TrashContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  targetType: 'folder' | 'document' | 'background';
  targetItem?: TrashItem;
}

const RETENTION_DAYS = 30;

export function calculateDaysLeft(deletedAt?: string | null): number {
  if (!deletedAt) return RETENTION_DAYS;
  const delTime = new Date(deletedAt).getTime();
  if (Number.isNaN(delTime)) return RETENTION_DAYS;
  const elapsedDays = (Date.now() - delTime) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.floor(RETENTION_DAYS - elapsedDays));
}

export function getTrashItemDisplayName(item: TrashItem): string {
  return item.title || item.fileName || 'Không có tên';
}

export function findTrashFolderContext(
  nodes: DocumentCategory[],
  targetId: number | null,
): {
  currentFolder: DocumentCategory | null;
  parentFolder: DocumentCategory | null;
  breadcrumbs: TrashBreadcrumbNode[];
  subFolders: DocumentCategory[];
} {
  if (targetId === null) {
    return {
      currentFolder: null,
      parentFolder: null,
      breadcrumbs: [],
      subFolders: [],
    };
  }

  let foundFolder: DocumentCategory | null = null;
  let foundParent: DocumentCategory | null = null;
  let foundTrail: TrashBreadcrumbNode[] = [];

  const dfs = (
    list: DocumentCategory[],
    parent: DocumentCategory | null,
    trail: TrashBreadcrumbNode[],
  ): boolean => {
    for (const node of list) {
      const nextTrail = [...trail, { id: node.id, name: node.name }];
      if (node.id === targetId) {
        foundFolder = node;
        foundParent = parent;
        foundTrail = nextTrail;
        return true;
      }
      if (node.children?.length && dfs(node.children, node, nextTrail)) {
        return true;
      }
    }
    return false;
  };

  dfs(nodes, null, []);
  const children = foundFolder ? (foundFolder as DocumentCategory).children || [] : [];

  return {
    currentFolder: foundFolder,
    parentFolder: foundParent,
    breadcrumbs: foundTrail,
    subFolders: children,
  };
}

export function mapCategoryToTrashItem(
  cat: DocumentCategory,
  parentName: string | null,
): TrashItem {
  const deletedAt = cat.deletedAt || cat.updatedAt || cat.createdAt || new Date().toISOString();
  return {
    id: cat.id,
    itemType: 'folder',
    code: cat.code || '',
    title: cat.name,
    categoryId: cat.parentId ?? null,
    categoryName: parentName,
    documentType: null,
    fileName: null,
    filePath: null,
    fileSize: null,
    deletedAt,
    deletedByName: cat.createdByName || 'Tôi',
    daysLeft: calculateDaysLeft(deletedAt),
  };
}

export function mapDocumentToTrashItem(
  doc: DocumentItem,
  folderName: string | null,
): TrashItem {
  const deletedAt = doc.deletedAt || doc.updatedAt || doc.createdAt || new Date().toISOString();
  const ver = doc.currentVersion;
  return {
    id: doc.id,
    itemType: 'document',
    code: doc.code || '',
    title: doc.title,
    categoryId: doc.categoryId ?? null,
    categoryName: folderName || doc.category?.name || null,
    documentType: doc.documentType || null,
    fileName: ver?.fileName || null,
    filePath: ver?.filePath || null,
    fileSize: ver?.fileSize ?? null,
    deletedAt,
    deletedByName: doc.createdBy?.fullName || 'Tôi',
    daysLeft: calculateDaysLeft(deletedAt),
  };
}

export function buildTrashContextMenu(params: {
  contextMenu: TrashContextMenuState;
  selectedCount: number;
  totalItems: number;
  currentFolderName: string;
  onOpenFolder: (folderId: number) => void;
  onRestoreSingle: (item: TrashItem) => void;
  onPurgeSingle: (item: TrashItem) => void;
  onRestoreSelected: () => void;
  onPurgeSelected: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onEmptyTrash: () => void;
}): { title?: string; items: ExplorerContextMenuItem[] } {
  const { contextMenu, selectedCount, totalItems, currentFolderName } = params;
  if (!contextMenu.isOpen) return { items: [] };

  if (contextMenu.targetType === 'background') {
    const items: ExplorerContextMenuItem[] = [];
    if (totalItems > 0) {
      items.push({
        label: 'Chọn tất cả',
        icon: <CheckSquare size={15} className="text-primary" />,
        shortcut: 'Ctrl+A',
        onClick: params.onSelectAll,
        dividerAfter: true,
      });
      items.push({
        label: 'Dọn sạch thùng rác',
        icon: <Trash2 size={15} className="text-rose-500" />,
        danger: true,
        onClick: params.onEmptyTrash,
      });
    }
    return { title: currentFolderName, items };
  }

  if (selectedCount > 1) {
    return {
      title: `Đã chọn ${selectedCount} mục`,
      items: [
        {
          label: `Khôi phục ${selectedCount} mục`,
          icon: <RotateCcw size={15} className="text-primary" />,
          onClick: params.onRestoreSelected,
        },
        {
          label: `Xóa vĩnh viễn ${selectedCount} mục`,
          icon: <Trash2 size={15} className="text-rose-500" />,
          shortcut: 'Del',
          danger: true,
          onClick: params.onPurgeSelected,
          dividerAfter: true,
        },
        {
          label: 'Bỏ chọn tất cả',
          icon: <XCircle size={15} className="text-slate-500" />,
          shortcut: 'Esc',
          onClick: params.onClearSelection,
        },
      ],
    };
  }

  const target = contextMenu.targetItem;
  if (!target) return { items: [] };

  const isFolder = target.itemType === 'folder';
  const items: ExplorerContextMenuItem[] = [];

  if (isFolder) {
    items.push({
      label: 'Mở thư mục',
      icon: <FolderOpen size={15} className="text-primary" />,
      shortcut: 'Enter',
      onClick: () => params.onOpenFolder(target.id),
      dividerAfter: true,
    });
  }

  items.push(
    {
      label: 'Khôi phục',
      icon: <RotateCcw size={15} className="text-primary" />,
      onClick: () => params.onRestoreSingle(target),
    },
    {
      label: 'Xóa vĩnh viễn',
      icon: <Trash2 size={15} className="text-rose-500" />,
      shortcut: 'Del',
      danger: true,
      onClick: () => params.onPurgeSingle(target),
    },
  );

  return { title: getTrashItemDisplayName(target), items };
}
