'use client';

import React from 'react';
import type { DocumentCategory, DocumentItem } from '@/types';
import type { DocumentModalsHook, DeleteModalState, ItemToMoveState } from '@/app/(auth)/app/(sidebar)/documents/_hooks/use-document-modals';

// Modals
import { FolderFormModal } from '@/app/(auth)/app/(sidebar)/documents/_components/folder-form-modal';
import { FolderDetailModal } from '@/app/(auth)/app/(sidebar)/documents/_components/folder-detail-modal';
import { CreateDocumentModal } from '@/app/(auth)/app/(sidebar)/documents/_components/create-document-modal';
import { EditDocumentModal } from '@/app/(auth)/app/(sidebar)/documents/_components/edit-document-modal';
import { DocumentDetailModal } from '@/app/(auth)/app/(sidebar)/documents/_components/document-detail-modal';
import { DocumentPreviewModal } from '@/app/(auth)/app/(sidebar)/documents/_components/document-preview-modal';
import { MoveItemModal } from '@/app/(auth)/app/(sidebar)/documents/_components/move-item-modal';
import { DeleteConfirmModal } from '@/app/(auth)/app/(sidebar)/documents/_components/delete-confirm-modal';
import { ShareFolderModal } from '@/app/(auth)/app/(sidebar)/documents/_components/share-folder-modal';
import { SaveToFolderModal } from '@/app/(auth)/app/(sidebar)/documents/_components/save-to-folder-modal';

export type { DeleteModalState, ItemToMoveState };

export interface DocumentsModalsProps {
  modals: DocumentModalsHook;
  currentFolderId?: number | null;
  currentFolder?: DocumentCategory | null;
  safeCategoryTree: DocumentCategory[];
  onConfirmDelete: () => void;
  onRefetchCategories?: () => void;
  onRefetchDocuments?: () => void;
  defaultGroup?: 'rules' | 'personal';
}

export const DocumentsModals: React.FC<DocumentsModalsProps> = ({
  modals,
  currentFolderId = null,
  currentFolder = null,
  safeCategoryTree,
  onConfirmDelete,
  onRefetchCategories = () => {},
  onRefetchDocuments = () => {},
  defaultGroup = 'personal',
}) => {
  const { state, setters } = modals;

  return (
    <>
      {/* 1. Folder Form Modal (Tạo mới & Chỉnh sửa thư mục dùng chung 1 modal theo chuẩn form-modal) */}
      <FolderFormModal
        isOpen={state.createFolderOpen || state.editFolderOpen}
        onClose={() => {
          setters.setCreateFolderOpen(false);
          setters.setEditFolderOpen(false);
          setters.setEditingFolder(null);
        }}
        initialData={state.editingFolder}
        parentId={currentFolderId}
        parentFolder={currentFolder}
        onSuccess={onRefetchCategories}
      />

      {/* 2. Create / Upload Document Modal */}
      <CreateDocumentModal
        isOpen={state.createDocOpen}
        onClose={() => setters.setCreateDocOpen(false)}
        currentFolderId={currentFolderId}
        currentFolder={currentFolder}
        categories={safeCategoryTree}
        onSuccess={onRefetchDocuments}
        defaultGroup={defaultGroup}
      />

      {/* 3. Edit Document Modal */}
      <EditDocumentModal
        isOpen={state.editDocOpen}
        onClose={() => {
          setters.setEditDocOpen(false);
          setters.setEditingDoc(null);
        }}
        document={state.editingDoc}
        categories={safeCategoryTree}
        onSuccess={onRefetchDocuments}
      />

      {/* 4. Document Detail Modal */}
      <DocumentDetailModal
        isOpen={state.detailDocOpen}
        onClose={() => {
          setters.setDetailDocOpen(false);
          setters.setSelectedDoc(null);
        }}
        document={state.selectedDoc}
        onSuccess={onRefetchDocuments}
        onEdit={(d) => {
          setters.setDetailDocOpen(false);
          setters.setEditingDoc(d);
          setters.setEditDocOpen(true);
        }}
        onDelete={(d) => {
          setters.setDetailDocOpen(false);
          setters.setDeleteModal({
            isOpen: true,
            type: 'document',
            id: d.id,
            name: d.title,
            loading: false,
          });
        }}
        onShare={(d) => {
          setters.setSharingDoc(d);
          setters.setShareFolderOpen(true);
        }}
        onPreview={(d) => {
          setters.setSelectedDoc(d);
          setters.setPreviewDocOpen(true);
        }}
      />

      {/* 5. Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={state.previewDocOpen}
        onClose={() => {
          setters.setPreviewDocOpen(false);
          setters.setSelectedDoc(null);
        }}
        document={state.selectedDoc}
      />

      {/* 6. Move Item Modal */}
      <MoveItemModal
        isOpen={state.moveModalOpen}
        onClose={() => {
          setters.setMoveModalOpen(false);
          setters.setItemToMove(null);
        }}
        type={state.itemToMove?.type || 'folder'}
        item={state.itemToMove?.item || null}
        onSuccess={() => {
          onRefetchCategories();
          onRefetchDocuments();
        }}
      />

      {/* 7. Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={state.deleteModal.isOpen}
        onClose={() => setters.setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        title={state.deleteModal.type === 'folder' ? 'Xác nhận xóa thư mục' : 'Xác nhận xóa tài liệu'}
        description={
          state.deleteModal.type === 'folder' ? (
            <>
              Bạn có chắc chắn muốn xóa thư mục{' '}
              <strong className="text-gray-900 font-semibold">{state.deleteModal.name}</strong>?
            </>
          ) : (
            <>
              Bạn có chắc chắn muốn xóa tài liệu{' '}
              <strong className="text-gray-900 font-semibold">{state.deleteModal.name}</strong>?
            </>
          )
        }
        onConfirm={onConfirmDelete}
        loading={state.deleteModal.loading}
      />

      {/* 8. Share Folder / Document Modal */}
      <ShareFolderModal
        isOpen={state.shareFolderOpen}
        onClose={() => {
          setters.setShareFolderOpen(false);
          setters.setSharingFolder(null);
          setters.setSharingDoc(null);
        }}
        folder={state.sharingFolder}
        document={state.sharingDoc}
        onSuccess={() => {
          onRefetchCategories();
          onRefetchDocuments();
        }}
      />

      {/* 9. Folder Detail Modal */}
      <FolderDetailModal
        isOpen={state.detailFolderOpen}
        onClose={() => {
          setters.setDetailFolderOpen(false);
          setters.setSelectedFolder(null);
        }}
        folder={state.selectedFolder}
      />

      {/* 10. Save To Folder Modal (Shortcut) */}
      <SaveToFolderModal
        isOpen={Boolean(state.saveToFolderDoc)}
        onClose={() => setters.setSaveToFolderDoc(null)}
        document={state.saveToFolderDoc}
        onSuccess={onRefetchDocuments}
      />
    </>
  );
};
