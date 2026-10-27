import React from 'react';
import {
  FolderOpen, Eye, Download, Edit2, Edit3, Copy, Scissors, ClipboardPaste,
  Share2, Bookmark, FolderMinus, Trash2, FolderPlus, FileUp, FolderUp, CheckSquare, XCircle,
} from 'lucide-react';
import type { DocumentCategory, DocumentItem } from '@/types';
import type { DocumentModalsHook } from '@/hooks/use-document-modals';
import type { ExplorerContextMenuState } from '@/hooks/use-document-explorer-actions';
import type { ExplorerContextMenuItem } from './explorer-context-menu';
import { getDocumentPermissions, getFileUrl, type DocumentPermissionsResult } from '@/utils';

export function buildFolderDropdownItems(params: {
  folder: DocumentCategory;
  canEdit: boolean;
  canMove: boolean;
  canShare: boolean;
  canDelete: boolean;
  canPaste: boolean;
  onOpen: (folder: DocumentCategory) => void;
  onViewDetail?: (folder: DocumentCategory) => void;
  onDownload?: (folder: DocumentCategory) => void;
  onPasteIntoFolder?: (folder: DocumentCategory) => void;
  onShare?: (folder: DocumentCategory) => void;
  onEdit?: (folder: DocumentCategory) => void;
  onCut?: (folder: DocumentCategory) => void;
  onMove?: (folder: DocumentCategory) => void;
  onDelete?: (folder: DocumentCategory) => void;
}): ExplorerContextMenuItem[] {
  const { folder, canEdit, canMove, canShare, canDelete, canPaste, onOpen, onViewDetail, onDownload, onPasteIntoFolder, onShare, onEdit, onCut, onMove, onDelete } = params;
  return [
    { label: 'Mở thư mục', icon: <FolderOpen size={15} className="text-primary" />, shortcut: 'Enter', onClick: () => onOpen(folder) },
    ...(onViewDetail ? [{ label: 'Xem chi tiết', icon: <Eye size={15} className="text-primary" />, onClick: () => onViewDetail(folder) }] : []),
    ...(onDownload ? [{ label: 'Tải xuống (.zip)', icon: <Download size={15} className="text-primary" />, onClick: () => onDownload(folder), dividerAfter: true }] : []),
    ...(canPaste && onPasteIntoFolder ? [{ label: 'Dán vào thư mục này', icon: <ClipboardPaste size={15} className="text-emerald-600" />, shortcut: 'Ctrl+V', onClick: () => onPasteIntoFolder(folder), dividerAfter: true }] : []),
    ...(canShare && onShare ? [{ label: 'Chia sẻ', icon: <Share2 size={15} className="text-primary" />, onClick: () => onShare(folder) }] : []),
    ...(canEdit && onEdit ? [{ label: 'Đổi tên / Sửa', icon: <Edit2 size={15} className="text-primary" />, shortcut: 'F2', onClick: () => onEdit(folder) }] : []),
    ...(canMove && onCut ? [{ label: 'Cắt (Ctrl+X)', icon: <Scissors size={15} className="text-primary" />, shortcut: 'Ctrl+X', onClick: () => onCut(folder) }] : []),
    ...(canMove && onMove ? [{ label: 'Di chuyển...', icon: <FolderOpen size={15} className="text-primary" />, onClick: () => onMove(folder), dividerAfter: true }] : []),
    ...(canDelete && onDelete ? [{ label: 'Xóa thư mục', icon: <Trash2 size={15} className="text-rose-500" />, shortcut: 'Del', danger: true, onClick: () => onDelete(folder) }] : []),
  ];
}

export function buildDocDropdownItems(params: {
  doc: DocumentItem;
  downloadUrl: string | null;
  perms: DocumentPermissionsResult;
  canEditProp?: boolean;
  canDeleteProp?: boolean;
  onOpenPrimary: () => void;
  onView: (doc: DocumentItem) => void;
  onCopy?: (doc: DocumentItem) => void;
  onCut?: (doc: DocumentItem) => void;
  onSaveToFolder?: (doc: DocumentItem) => void;
  onEdit?: (doc: DocumentItem) => void;
  onShare?: (doc: DocumentItem) => void;
  onMove?: (doc: DocumentItem) => void;
  onRemoveFromFolder?: (doc: DocumentItem) => void;
  onDelete?: (doc: DocumentItem) => void;
}): ExplorerContextMenuItem[] {
  const { doc, downloadUrl, perms, canEditProp = true, canDeleteProp = true, onOpenPrimary, onView, onCopy, onCut, onSaveToFolder, onEdit, onShare, onMove, onRemoveFromFolder, onDelete } = params;
  const canEditDoc = canEditProp && perms.canEdit;
  const canShareDoc = canEditProp && perms.canShare;
  const canMoveDoc = canEditProp && perms.canMove;
  const canDeleteDoc = canDeleteProp && perms.canDelete;

  return [
    { label: 'Mở xem trước', icon: <Eye size={15} className="text-primary" />, shortcut: 'Enter', onClick: onOpenPrimary },
    { label: 'Xem chi tiết', icon: <Eye size={15} className="text-primary" />, onClick: () => onView(doc) },
    ...(downloadUrl ? [{ label: 'Tải xuống', icon: <Download size={15} className="text-primary" />, onClick: () => window.open(downloadUrl, '_blank', 'noopener,noreferrer') }] : []),
    ...(onCopy ? [{ label: 'Sao chép (Ctrl+C)', icon: <Copy size={15} className="text-primary" />, shortcut: 'Ctrl+C', onClick: () => onCopy(doc), dividerAfter: !canMoveDoc }] : []),
    ...(canMoveDoc && onCut ? [{ label: 'Cắt (Ctrl+X)', icon: <Scissors size={15} className="text-primary" />, shortcut: 'Ctrl+X', onClick: () => onCut(doc), dividerAfter: true }] : []),
    ...(onSaveToFolder && perms.canSaveToFolder ? [{ label: 'Lưu vào thư mục cá nhân', icon: <Bookmark size={15} className="text-primary" />, onClick: () => onSaveToFolder(doc) }] : []),
    ...(canEditDoc && onEdit ? [{ label: 'Chỉnh sửa', icon: <Edit3 size={15} className="text-primary" />, shortcut: 'F2', onClick: () => onEdit(doc) }] : []),
    ...(canShareDoc && onShare ? [{ label: 'Chia sẻ', icon: <Share2 size={15} className="text-primary" />, onClick: () => onShare(doc) }] : []),
    ...(canMoveDoc && onMove ? [{ label: 'Di chuyển...', icon: <FolderOpen size={15} className="text-primary" />, onClick: () => onMove(doc) }] : []),
    ...(onRemoveFromFolder && perms.canRemoveShortcut ? [{ label: 'Gỡ khỏi thư mục này', icon: <FolderMinus size={15} className="text-amber-600" />, danger: true, onClick: () => onRemoveFromFolder(doc) }] : []),
    ...(canDeleteDoc && onDelete ? [{ label: 'Xóa tài liệu', icon: <Trash2 size={15} className="text-rose-500" />, shortcut: 'Del', danger: true, onClick: () => onDelete(doc) }] : []),
  ];
}

export function buildSingleFolderMenuItems(params: {
  folder: DocumentCategory;
  isOwnerOrAdmin: boolean;
  hasClipboard: boolean;
  modals: DocumentModalsHook;
  onNavigateFolder: (id: number | null) => void;
  onDownloadFolder?: (folder: DocumentCategory) => void;
  onCutFolder: (folder: DocumentCategory) => void;
  onPasteIntoFolder: (folder: DocumentCategory) => void;
}): ExplorerContextMenuItem[] {
  const { folder, isOwnerOrAdmin, hasClipboard, modals, onNavigateFolder, onDownloadFolder, onCutFolder, onPasteIntoFolder } = params;
  const canEditFolder = isOwnerOrAdmin || folder.permission === 'edit';
  const canMoveFolder = isOwnerOrAdmin || folder.permission === 'edit';
  return buildFolderDropdownItems({
    folder,
    canEdit: canEditFolder,
    canMove: canMoveFolder,
    canShare: isOwnerOrAdmin,
    canDelete: isOwnerOrAdmin,
    canPaste: hasClipboard && canEditFolder,
    onOpen: (f) => onNavigateFolder(f.id),
    onViewDetail: modals.actions.openDetailFolder,
    onDownload: onDownloadFolder,
    onPasteIntoFolder,
    onShare: modals.actions.openShareFolder,
    onEdit: modals.actions.openEditFolder,
    onCut: onCutFolder,
    onMove: modals.actions.openMoveFolder,
    onDelete: (f) => modals.actions.openDeleteFolder(f.id, f.name),
  });
}

export function buildSingleDocMenuItems(params: {
  doc: DocumentItem;
  user: any;
  isSharedSection: boolean;
  canManageDocuments: boolean;
  myCategoryIds: Set<number>;
  currentFolderId: number | null;
  currentFolderPermission?: 'view' | 'edit' | string;
  modals: DocumentModalsHook;
  onCopyDoc: (doc: DocumentItem) => void;
  onCutDoc: (doc: DocumentItem) => void;
  onRemoveFromFolder: (doc: DocumentItem) => void;
}): ExplorerContextMenuItem[] {
  const { doc, user, isSharedSection, canManageDocuments, myCategoryIds, currentFolderId, currentFolderPermission, modals, onCopyDoc, onCutDoc, onRemoveFromFolder } = params;
  const perms = getDocumentPermissions(doc, user, {
    isSharedSection,
    folderPermission: (doc.category as any)?.permission || currentFolderPermission,
    canManageDocuments,
    myCategoryIds,
    currentFolderId,
  });
  const ver = doc.currentVersion;
  const downloadUrl = ver?.downloadUrl || (ver?.filePath ? getFileUrl(ver.filePath) : null);

  return buildDocDropdownItems({
    doc,
    downloadUrl,
    perms,
    onOpenPrimary: () => modals.actions.openPreviewDoc(doc),
    onView: modals.actions.openDetailDoc,
    onCopy: onCopyDoc,
    onCut: onCutDoc,
    onSaveToFolder: modals.actions.openSaveToFolder,
    onEdit: modals.actions.openEditDoc,
    onShare: modals.actions.openShareDoc,
    onMove: modals.actions.openMoveDoc,
    onRemoveFromFolder,
    onDelete: (d) => modals.actions.openDeleteDoc(d.id, d.title),
  });
}

export function buildBulkMenuItems(params: {
  selectedCount: number;
  onMoveSelected: () => void;
  onCutSelected: () => void;
  onCopySelected: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
}): ExplorerContextMenuItem[] {
  const { selectedCount, onMoveSelected, onCutSelected, onCopySelected, onDeleteSelected, onClearSelection } = params;
  return [
    { label: `Di chuyển ${selectedCount} mục...`, icon: <FolderOpen size={15} className="text-primary" />, onClick: onMoveSelected },
    { label: `Cắt ${selectedCount} mục`, icon: <Scissors size={15} className="text-primary" />, shortcut: 'Ctrl+X', onClick: onCutSelected },
    { label: 'Sao chép tài liệu đã chọn', icon: <Copy size={15} className="text-primary" />, shortcut: 'Ctrl+C', onClick: onCopySelected, dividerAfter: true },
    { label: `Xóa ${selectedCount} mục`, icon: <Trash2 size={15} className="text-rose-500" />, shortcut: 'Del', danger: true, onClick: onDeleteSelected, dividerAfter: true },
    { label: 'Bỏ chọn tất cả', icon: <XCircle size={15} className="text-slate-500" />, shortcut: 'Esc', onClick: onClearSelection },
  ];
}

export function buildBackgroundMenuItems(params: {
  canCreate: boolean;
  hasClipboard: boolean;
  totalItems: number;
  onPasteHere: () => void;
  onCreateFolder: () => void;
  onUploadFiles: () => void;
  onUploadFolder: () => void;
  onSelectAll: () => void;
}): ExplorerContextMenuItem[] {
  const { canCreate, hasClipboard, totalItems, onPasteHere, onCreateFolder, onUploadFiles, onUploadFolder, onSelectAll } = params;
  return [
    ...(hasClipboard && canCreate ? [{ label: 'Dán vào đây', icon: <ClipboardPaste size={15} className="text-emerald-600" />, shortcut: 'Ctrl+V', onClick: onPasteHere, dividerAfter: true }] : []),
    ...(canCreate
      ? [
          { label: 'Tạo thư mục mới', icon: <FolderPlus size={15} className="text-primary" />, onClick: onCreateFolder, dividerAfter: true },
          { label: 'Tải tệp lên', icon: <FileUp size={15} className="text-primary" />, onClick: onUploadFiles },
          { label: 'Tải thư mục lên', icon: <FolderUp size={15} className="text-primary" />, onClick: onUploadFolder, dividerAfter: totalItems > 0 },
        ]
      : []),
    ...(totalItems > 0 ? [{ label: 'Chọn tất cả', icon: <CheckSquare size={15} className="text-primary" />, shortcut: 'Ctrl+A', onClick: onSelectAll }] : []),
  ];
}

export function resolveExplorerContextMenu(params: {
  contextMenu?: ExplorerContextMenuState;
  locationName: string;
  canCreate: boolean;
  hasClipboard: boolean;
  totalItems: number;
  selectedCount: number;
  currentUser: any;
  isSharedSection: boolean;
  canManageDocuments: boolean;
  allMyCategoryIds: Set<number>;
  currentFolderId: number | null;
  currentFolderPermission?: 'view' | 'edit' | string;
  modals: DocumentModalsHook;
  isFolderOwnerOrAdmin: (folder: DocumentCategory) => boolean;
  onNavigateFolder: (id: number | null) => void;
  onPasteToCurrentFolder: () => void;
  onPasteIntoFolder: (folder: DocumentCategory) => void;
  onUploadFiles: () => void;
  onUploadFolder: () => void;
  onSelectAll: () => void;
  onMoveSelected: () => void;
  onCutSelected: () => void;
  onCopySelected: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
  onCopySingleDoc: (doc: DocumentItem) => void;
  onCutSingleDoc: (doc: DocumentItem) => void;
  onCutSingleFolder: (folder: DocumentCategory) => void;
  onDownloadFolder?: (folder: DocumentCategory) => void;
  onRemoveFromFolder: (doc: DocumentItem) => void;
}): { menuTitle?: string; menuItems: ExplorerContextMenuItem[] } {
  const { contextMenu, locationName, canCreate, hasClipboard, totalItems, selectedCount } = params;
  if (!contextMenu?.isOpen) return { menuTitle: undefined, menuItems: [] };
  if (contextMenu.targetType === 'background') {
    return {
      menuTitle: locationName,
      menuItems: buildBackgroundMenuItems({
        canCreate,
        hasClipboard,
        totalItems,
        onPasteHere: params.onPasteToCurrentFolder,
        onCreateFolder: params.modals.actions.openCreateFolder,
        onUploadFiles: params.onUploadFiles,
        onUploadFolder: params.onUploadFolder,
        onSelectAll: params.onSelectAll,
      }),
    };
  }
  if (selectedCount > 1) {
    return {
      menuTitle: `Đã chọn ${selectedCount} mục`,
      menuItems: buildBulkMenuItems({
        selectedCount,
        onMoveSelected: params.onMoveSelected,
        onCutSelected: params.onCutSelected,
        onCopySelected: params.onCopySelected,
        onDeleteSelected: params.onDeleteSelected,
        onClearSelection: params.onClearSelection,
      }),
    };
  }
  if (contextMenu.targetType === 'folder' && contextMenu.targetFolder) {
    const folder = contextMenu.targetFolder;
    return {
      menuTitle: folder.name,
      menuItems: buildSingleFolderMenuItems({
        folder,
        isOwnerOrAdmin: params.isFolderOwnerOrAdmin(folder),
        hasClipboard,
        modals: params.modals,
        onNavigateFolder: params.onNavigateFolder,
        onDownloadFolder: params.onDownloadFolder,
        onCutFolder: params.onCutSingleFolder,
        onPasteIntoFolder: params.onPasteIntoFolder,
      }),
    };
  }
  if (contextMenu.targetType === 'document' && contextMenu.targetDoc) {
    const doc = contextMenu.targetDoc;
    return {
      menuTitle: doc.title,
      menuItems: buildSingleDocMenuItems({
        doc,
        user: params.currentUser,
        isSharedSection: params.isSharedSection,
        canManageDocuments: params.canManageDocuments,
        myCategoryIds: params.allMyCategoryIds,
        currentFolderId: params.currentFolderId,
        currentFolderPermission: params.currentFolderPermission,
        modals: params.modals,
        onCopyDoc: params.onCopySingleDoc,
        onCutDoc: params.onCutSingleDoc,
        onRemoveFromFolder: params.onRemoveFromFolder,
      }),
    };
  }
  return { menuTitle: undefined, menuItems: [] };
}
