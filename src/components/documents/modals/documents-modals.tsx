'use client';

import React from 'react';
import type { DocumentCategory } from '@/types';
import type { DocumentModalsHook } from '@/hooks/use-document-modals';
import { FolderFormModal } from './folder-form-modal';
import { FolderDetailModal } from './folder-detail-modal';
import { EditDocumentModal } from './edit-document-modal';
import { DocumentDetailModal } from './document-detail-modal';
import { DocumentPreviewModal } from './document-preview-modal';
import { MoveItemModal } from './move-item-modal';
import { ConfirmActionModal } from './confirm-action-modal';
import { ShareFolderModal } from './share-folder-modal';
import { SaveToFolderModal } from './save-to-folder-modal';

export interface DocumentsModalsProps {
  modals: DocumentModalsHook;
  currentFolderId?: number | null;
  currentFolder?: DocumentCategory | null;
  safeCategoryTree: DocumentCategory[];
  onConfirmDelete: () => void;
  onRefetchCategories?: () => void;
  onRefetchDocuments?: () => void;
}

export const DocumentsModals: React.FC<DocumentsModalsProps> = ({
  modals,
  currentFolderId = null,
  currentFolder = null,
  safeCategoryTree,
  onConfirmDelete,
  onRefetchCategories = () => {},
  onRefetchDocuments = () => {},
}) => {
  const { state, setters } = modals;

  const deleteTitle =
    state.deleteModal.type === 'bulk'
      ? `Xác nhận xóa ${state.deleteModal.items?.length || 0} mục`
      : state.deleteModal.type === 'folder'
        ? 'Xác nhận xóa thư mục'
        : 'Xác nhận xóa tài liệu';

  const deleteDescription =
    state.deleteModal.type === 'bulk' ? (
      <>
        Bạn có chắc chắn muốn xóa{' '}
        <strong className="text-gray-900 font-semibold">{state.deleteModal.name}</strong>?
      </>
    ) : state.deleteModal.type === 'folder' ? (
      <>
        Bạn có chắc chắn muốn xóa thư mục{' '}
        <strong className="text-gray-900 font-semibold">{state.deleteModal.name}</strong>?
      </>
    ) : (
      <>
        Bạn có chắc chắn muốn xóa tài liệu{' '}
        <strong className="text-gray-900 font-semibold">{state.deleteModal.name}</strong>?
      </>
    );

  return (
    <>
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
            items: [{ type: 'document', id: d.id, name: d.title }],
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

      <DocumentPreviewModal
        isOpen={state.previewDocOpen}
        onClose={() => {
          setters.setPreviewDocOpen(false);
          setters.setSelectedDoc(null);
        }}
        document={state.selectedDoc}
      />

      <MoveItemModal
        isOpen={state.moveModalOpen}
        onClose={() => {
          setters.setMoveModalOpen(false);
          setters.setItemToMove(null);
        }}
        type={state.itemToMove?.type || 'folder'}
        item={state.itemToMove?.item || null}
        items={state.itemToMove?.items}
        onSuccess={() => {
          onRefetchCategories();
          onRefetchDocuments();
        }}
      />

      <ConfirmActionModal
        isOpen={state.deleteModal.isOpen}
        onClose={() => setters.setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        title={deleteTitle}
        description={deleteDescription}
        onConfirm={onConfirmDelete}
        loading={state.deleteModal.loading}
      />

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

      <FolderDetailModal
        isOpen={state.detailFolderOpen}
        onClose={() => {
          setters.setDetailFolderOpen(false);
          setters.setSelectedFolder(null);
        }}
        folder={state.selectedFolder}
      />

      <SaveToFolderModal
        isOpen={Boolean(state.saveToFolderDoc)}
        onClose={() => setters.setSaveToFolderDoc(null)}
        document={state.saveToFolderDoc}
        onSuccess={onRefetchDocuments}
      />
    </>
  );
};
