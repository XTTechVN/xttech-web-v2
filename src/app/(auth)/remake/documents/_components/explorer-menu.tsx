import {
  Bookmark,
  CheckSquare,
  ClipboardPaste,
  Copy,
  Download,
  Eye,
  FileUp,
  FolderInput,
  FolderMinus,
  FolderOpen,
  FolderPlus,
  FolderUp,
  Pencil,
  Scissors,
  Share2,
  Trash2,
  XCircle,
} from 'lucide-react';
import type { DocumentModalsHook } from '@/hooks';
import type { ExplorerContextMenuState } from '@/hooks/use-document-explorer-actions';
import type { DocumentCategory, DocumentItem } from '@/types';
import { getDocumentPermissions, getFileUrl } from '@/utils';

export interface MenuItem {
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  onClick: () => void;
  danger?: boolean;
  dividerAfter?: boolean;
}

const I = 16;
const item = (label: string, icon: React.ReactNode, onClick: () => void, o: Partial<MenuItem> = {}): MenuItem => ({ label, icon, onClick, ...o });

interface Params {
  contextMenu: ExplorerContextMenuState;
  locationName: string;
  canCreate: boolean;
  hasClipboard: boolean;
  totalItems: number;
  selectedCount: number;
  currentUser: { id?: string | number; email?: string } | null | undefined;
  isSharedSection: boolean;
  canManageDocuments: boolean;
  allMyCategoryIds: Set<number>;
  currentFolderId: number | null;
  currentFolderPermission?: string;
  modals: DocumentModalsHook;
  isFolderOwnerOrAdmin: (f: DocumentCategory) => boolean;
  onNavigateFolder: (id: number | null) => void;
  onPasteToCurrentFolder: () => void;
  onPasteIntoFolder: (f: DocumentCategory) => void;
  onDownloadFolder: (f: DocumentCategory) => void;
  onUploadFiles: () => void;
  onUploadFolder: () => void;
  onSelectAll: () => void;
  onMoveSelected: () => void;
  onCutSelected: () => void;
  onCopySelected: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
  onCopySingleDoc: (d: DocumentItem) => void;
  onCutSingleDoc: (d: DocumentItem) => void;
  onCutSingleFolder: (f: DocumentCategory) => void;
  onRemoveFromFolder: (d: DocumentItem) => void;
}

function folderItems(f: DocumentCategory, p: Params): MenuItem[] {
  const owner = p.isFolderOwnerOrAdmin(f);
  const canEdit = owner || f.permission === 'edit';
  const a = p.modals.actions;
  return [
    item('Mở thư mục', <FolderOpen size={I} />, () => p.onNavigateFolder(f.id), { shortcut: 'Enter' }),
    item('Xem thông tin', <Eye size={I} />, () => a.openDetailFolder(f)),
    item('Tải xuống (.zip)', <Download size={I} />, () => p.onDownloadFolder(f), { dividerAfter: true }),
    ...(p.hasClipboard && canEdit
      ? [item('Dán vào thư mục này', <ClipboardPaste size={I} />, () => p.onPasteIntoFolder(f), { shortcut: 'Ctrl+V', dividerAfter: true })]
      : []),
    ...(owner ? [item('Chia sẻ', <Share2 size={I} />, () => a.openShareFolder(f))] : []),
    ...(canEdit
      ? [
          item('Đổi tên / sửa', <Pencil size={I} />, () => a.openEditFolder(f), { shortcut: 'F2' }),
          item('Cắt', <Scissors size={I} />, () => p.onCutSingleFolder(f), { shortcut: 'Ctrl+X' }),
          item('Di chuyển…', <FolderInput size={I} />, () => a.openMoveFolder(f), { dividerAfter: true }),
        ]
      : []),
    ...(owner ? [item('Xoá thư mục', <Trash2 size={I} />, () => a.openDeleteFolder(f.id, f.name), { danger: true, shortcut: 'Del' })] : []),
  ];
}

function docItems(d: DocumentItem, p: Params): MenuItem[] {
  const perms = getDocumentPermissions(d, p.currentUser, {
    isSharedSection: p.isSharedSection,
    folderPermission: d.category?.permission || p.currentFolderPermission,
    canManageDocuments: p.canManageDocuments,
    myCategoryIds: p.allMyCategoryIds,
    currentFolderId: p.currentFolderId,
  });
  const v = d.currentVersion;
  const url = v?.downloadUrl || (v?.filePath ? getFileUrl(v.filePath) : null);
  const a = p.modals.actions;
  return [
    item('Xem trước', <Eye size={I} />, () => a.openPreviewDoc(d), { shortcut: 'Enter' }),
    ...(url ? [item('Tải xuống', <Download size={I} />, () => window.open(url, '_blank', 'noopener,noreferrer'))] : []),
    item('Sao chép', <Copy size={I} />, () => p.onCopySingleDoc(d), { shortcut: 'Ctrl+C', dividerAfter: !perms.canMove }),
    ...(perms.canMove ? [item('Cắt', <Scissors size={I} />, () => p.onCutSingleDoc(d), { shortcut: 'Ctrl+X', dividerAfter: true })] : []),
    ...(perms.canSaveToFolder ? [item('Lưu vào thư mục cá nhân', <Bookmark size={I} />, () => a.openSaveToFolder(d))] : []),
    ...(perms.canEdit ? [item('Sửa thông tin', <Pencil size={I} />, () => a.openEditDoc(d), { shortcut: 'F2' })] : []),
    ...(perms.canShare ? [item('Chia sẻ', <Share2 size={I} />, () => a.openShareDoc(d))] : []),
    ...(perms.canMove ? [item('Di chuyển…', <FolderInput size={I} />, () => a.openMoveDoc(d))] : []),
    ...(perms.canRemoveShortcut ? [item('Gỡ khỏi thư mục này', <FolderMinus size={I} />, () => p.onRemoveFromFolder(d), { danger: true })] : []),
    ...(perms.canDelete ? [item('Xoá tài liệu', <Trash2 size={I} />, () => a.openDeleteDoc(d.id, d.title), { danger: true, shortcut: 'Del' })] : []),
  ];
}

// Menu chuột phải / nút ⋮: theo mục đang chọn (thư mục, tài liệu, nhiều mục) hoặc vùng trống.
export function buildExplorerMenu(p: Params): { title?: string; items: MenuItem[] } {
  const c = p.contextMenu;
  if (!c.isOpen) return { items: [] };
  if (c.targetType === 'background') {
    return {
      title: p.locationName,
      items: [
        ...(p.hasClipboard && p.canCreate
          ? [item('Dán vào đây', <ClipboardPaste size={I} />, p.onPasteToCurrentFolder, { shortcut: 'Ctrl+V', dividerAfter: true })]
          : []),
        ...(p.canCreate
          ? [
              item('Tạo thư mục mới', <FolderPlus size={I} />, p.modals.actions.openCreateFolder, { dividerAfter: true }),
              item('Tải tệp lên', <FileUp size={I} />, p.onUploadFiles),
              item('Tải thư mục lên', <FolderUp size={I} />, p.onUploadFolder, { dividerAfter: p.totalItems > 0 }),
            ]
          : []),
        ...(p.totalItems > 0 ? [item('Chọn tất cả', <CheckSquare size={I} />, p.onSelectAll, { shortcut: 'Ctrl+A' })] : []),
      ],
    };
  }
  if (p.selectedCount > 1) {
    return {
      title: `Đã chọn ${p.selectedCount} mục`,
      items: [
        item(`Di chuyển ${p.selectedCount} mục…`, <FolderInput size={I} />, p.onMoveSelected),
        item(`Cắt ${p.selectedCount} mục`, <Scissors size={I} />, p.onCutSelected, { shortcut: 'Ctrl+X' }),
        item('Sao chép tài liệu đã chọn', <Copy size={I} />, p.onCopySelected, { shortcut: 'Ctrl+C', dividerAfter: true }),
        item(`Xoá ${p.selectedCount} mục`, <Trash2 size={I} />, p.onDeleteSelected, { danger: true, shortcut: 'Del', dividerAfter: true }),
        item('Bỏ chọn tất cả', <XCircle size={I} />, p.onClearSelection, { shortcut: 'Esc' }),
      ],
    };
  }
  if (c.targetType === 'folder' && c.targetFolder) return { title: c.targetFolder.name, items: folderItems(c.targetFolder, p) };
  if (c.targetType === 'document' && c.targetDoc) return { title: c.targetDoc.title, items: docItems(c.targetDoc, p) };
  return { items: [] };
}
