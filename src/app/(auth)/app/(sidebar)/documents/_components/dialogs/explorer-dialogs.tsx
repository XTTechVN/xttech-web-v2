'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { DocumentExplorerHook } from '@/hooks';
import { ViewerOverlay } from '../viewer-overlay';
import { ConfirmSheet } from './confirm-sheet';
import { EditDocSheet } from './edit-doc-sheet';
import { FolderInfoSheet } from './folder-info-sheet';
import { FolderSheet } from './folder-sheet';
import { MoveSheet, SaveToFolderSheet } from './move-sheet';
import { ShareSheet } from './share-sheet';

// Gom mọi hộp thoại của trình quản lý tài liệu; trạng thái mở/đóng lấy từ hook `modals` của explorer.
export function ExplorerDialogs({ explorer }: { explorer: DocumentExplorerHook }) {
  const router = useRouter();
  const { modals, currentFolderId, subFolders, handleConfirmDelete } = explorer;
  const { state: s, setters: set } = modals;

  // Bấm tài liệu = xem toàn màn hình; "Chi tiết" (menu hoặc nút trong khung xem) mở trang riêng
  const goDetail = (id: number) => {
    set.setPreviewDocOpen(false);
    set.setDetailDocOpen(false);
    router.push(`/app/documents/${id}`);
  };
  const detailId = s.detailDocOpen ? s.selectedDoc?.id : undefined;
  useEffect(() => {
    if (detailId) goDetail(detailId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailId]);

  const closeFolderForm = () => {
    set.setCreateFolderOpen(false);
    set.setEditFolderOpen(false);
    set.setEditingFolder(null);
  };
  const closeShare = () => {
    set.setShareFolderOpen(false);
    set.setSharingFolder(null);
    set.setSharingDoc(null);
  };
  const del = s.deleteModal;
  const moveTargets = s.itemToMove?.items ?? [];

  return (
    <>
      <ViewerOverlay
        doc={s.previewDocOpen ? s.selectedDoc : null}
        onClose={() => set.setPreviewDocOpen(false)}
        onDetail={() => s.selectedDoc && goDetail(s.selectedDoc.id)}
      />
      <FolderSheet
        key={s.editFolderOpen ? `e-${s.editingFolder?.id}` : s.createFolderOpen ? 'new' : 'folder-idle'}
        open={s.createFolderOpen || s.editFolderOpen}
        onClose={closeFolderForm}
        folder={s.editFolderOpen ? s.editingFolder : null}
        parentId={currentFolderId}
        siblings={subFolders}
      />
      <FolderInfoSheet folder={s.detailFolderOpen ? s.selectedFolder : null} onClose={() => set.setDetailFolderOpen(false)} />
      <EditDocSheet
        key={s.editDocOpen ? `d-${s.editingDoc?.id}` : 'editdoc-idle'}
        doc={s.editDocOpen ? s.editingDoc : null}
        onClose={() => set.setEditDocOpen(false)}
      />
      <MoveSheet
        key={s.moveModalOpen ? 'mv' : 'move-idle'}
        open={s.moveModalOpen}
        onClose={() => set.setMoveModalOpen(false)}
        targets={moveTargets}
      />
      <SaveToFolderSheet
        key={s.saveToFolderDoc ? `sv-${s.saveToFolderDoc.id}` : 'save-idle'}
        doc={s.saveToFolderDoc}
        onClose={() => set.setSaveToFolderDoc(null)}
      />
      <ShareSheet
        key={s.shareFolderOpen ? `sh-${s.sharingFolder?.id ?? s.sharingDoc?.id}` : 'share-idle'}
        folder={s.shareFolderOpen ? s.sharingFolder : null}
        doc={s.shareFolderOpen ? s.sharingDoc : null}
        onClose={closeShare}
      />
      <ConfirmSheet
        open={del.isOpen}
        title={del.type === 'bulk' ? `Xoá ${del.items?.length ?? 0} mục` : del.type === 'folder' ? 'Xoá thư mục' : 'Xoá tài liệu'}
        message={
          <>
            Chuyển <strong>{del.name}</strong> vào thùng rác? Có thể khôi phục lại từ thùng rác.
          </>
        }
        confirmLabel="Xoá"
        busy={del.loading}
        onClose={() => set.setDeleteModal((p) => ({ ...p, isOpen: false }))}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
