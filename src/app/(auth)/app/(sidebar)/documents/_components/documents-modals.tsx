import React from 'react';
import type { DocumentCategory, DocumentItem } from '@/types';

// Modals
import { CreateFolderModal } from './create-folder-modal';
import { EditFolderModal } from './edit-folder-modal';
import { FolderDetailModal } from './folder-detail-modal';
import { CreateDocumentModal } from './create-document-modal';
import { EditDocumentModal } from './edit-document-modal';
import { DocumentDetailModal } from './document-detail-modal';
import { DocumentPreviewModal } from './document-preview-modal';
import { MoveItemModal } from './move-item-modal';
import { DeleteConfirmModal } from './delete-confirm-modal';
import { ShareFolderModal } from './share-folder-modal';

export interface DeleteModalState {
  isOpen: boolean;
  type: 'folder' | 'document';
  id: number;
  name: string;
  loading: boolean;
}

export interface ItemToMoveState {
  type: 'folder' | 'document';
  item: DocumentCategory | DocumentItem;
}

interface DocumentsModalsProps {
  // Folder Creation / Edit / Detail
  createFolderOpen: boolean;
  setCreateFolderOpen: (open: boolean) => void;
  editFolderOpen: boolean;
  setEditFolderOpen: (open: boolean) => void;
  editingFolder: DocumentCategory | null;
  setEditingFolder: (folder: DocumentCategory | null) => void;
  detailFolderOpen: boolean;
  setDetailFolderOpen: (open: boolean) => void;
  selectedFolder: DocumentCategory | null;
  setSelectedFolder: (folder: DocumentCategory | null) => void;

  // Document Creation / Edit / Detail / Preview
  createDocOpen: boolean;
  setCreateDocOpen: (open: boolean) => void;
  editDocOpen: boolean;
  setEditDocOpen: (open: boolean) => void;
  editingDoc: DocumentItem | null;
  setEditingDoc: (doc: DocumentItem | null) => void;
  detailDocOpen: boolean;
  setDetailDocOpen: (open: boolean) => void;
  previewDocOpen: boolean;
  setPreviewDocOpen: (open: boolean) => void;
  selectedDoc: DocumentItem | null;
  setSelectedDoc: (doc: DocumentItem | null) => void;

  // Move Modal
  moveModalOpen: boolean;
  setMoveModalOpen: (open: boolean) => void;
  itemToMove: ItemToMoveState | null;
  setItemToMove: (item: ItemToMoveState | null) => void;

  // Share Modal
  shareFolderOpen: boolean;
  setShareFolderOpen: (open: boolean) => void;
  sharingFolder: DocumentCategory | null;
  setSharingFolder: (folder: DocumentCategory | null) => void;
  sharingDoc: DocumentItem | null;
  setSharingDoc: (doc: DocumentItem | null) => void;

  // Delete Modal
  deleteModal: DeleteModalState;
  setDeleteModal: React.Dispatch<React.SetStateAction<DeleteModalState>>;
  onConfirmDelete: () => void;

  // Context & Callbacks
  currentFolderId: number | null;
  currentFolder: DocumentCategory | null;
  safeCategoryTree: DocumentCategory[];
  onRefetchCategories: () => void;
  onRefetchDocuments: () => void;
}

export const DocumentsModals: React.FC<DocumentsModalsProps> = ({
  createFolderOpen,
  setCreateFolderOpen,
  editFolderOpen,
  setEditFolderOpen,
  editingFolder,
  setEditingFolder,
  detailFolderOpen,
  setDetailFolderOpen,
  selectedFolder,
  setSelectedFolder,

  createDocOpen,
  setCreateDocOpen,
  editDocOpen,
  setEditDocOpen,
  editingDoc,
  setEditingDoc,
  detailDocOpen,
  setDetailDocOpen,
  previewDocOpen,
  setPreviewDocOpen,
  selectedDoc,
  setSelectedDoc,

  moveModalOpen,
  setMoveModalOpen,
  itemToMove,
  setItemToMove,

  shareFolderOpen,
  setShareFolderOpen,
  sharingFolder,
  setSharingFolder,
  sharingDoc,
  setSharingDoc,

  deleteModal,
  setDeleteModal,
  onConfirmDelete,

  currentFolderId,
  currentFolder,
  safeCategoryTree,
  onRefetchCategories,
  onRefetchDocuments,
}) => {
  return (
    <>
      {/* 1. Create Folder Modal */}
      <CreateFolderModal
        isOpen={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        parentId={currentFolderId}
        parentFolder={currentFolder}
        onSuccess={onRefetchCategories}
      />

      {/* 2. Edit Folder Modal */}
      <EditFolderModal
        isOpen={editFolderOpen}
        onClose={() => {
          setEditFolderOpen(false);
          setEditingFolder(null);
        }}
        folder={editingFolder}
        onSuccess={onRefetchCategories}
      />

      {/* 3. Create / Upload Document Modal */}
      <CreateDocumentModal
        isOpen={createDocOpen}
        onClose={() => setCreateDocOpen(false)}
        currentFolderId={currentFolderId}
        currentFolder={currentFolder}
        categories={safeCategoryTree}
        onSuccess={onRefetchDocuments}
      />

      {/* 3.5 Edit Document Modal */}
      <EditDocumentModal
        isOpen={editDocOpen}
        onClose={() => {
          setEditDocOpen(false);
          setEditingDoc(null);
        }}
        document={editingDoc}
        categories={safeCategoryTree}
        onSuccess={onRefetchDocuments}
      />

      {/* 4. Document Detail Modal */}
      <DocumentDetailModal
        isOpen={detailDocOpen}
        onClose={() => {
          setDetailDocOpen(false);
          setSelectedDoc(null);
        }}
        document={selectedDoc}
        onSuccess={onRefetchDocuments}
      />

      {/* 4.5 Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewDocOpen}
        onClose={() => {
          setPreviewDocOpen(false);
          setSelectedDoc(null);
        }}
        document={selectedDoc}
      />

      {/* 4.6 Move Item Modal */}
      <MoveItemModal
        isOpen={moveModalOpen}
        onClose={() => {
          setMoveModalOpen(false);
          setItemToMove(null);
        }}
        type={itemToMove?.type || 'folder'}
        item={itemToMove?.item || null}
        onSuccess={() => {
          onRefetchCategories();
          onRefetchDocuments();
        }}
      />

      {/* 5. Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        title={deleteModal.type === 'folder' ? 'Xác nhận xóa thư mục' : 'Xác nhận xóa tài liệu'}
        description={
          deleteModal.type === 'folder' ? (
            <>
              Bạn có chắc chắn muốn xóa thư mục{' '}
              <strong className="text-gray-900 font-semibold">{deleteModal.name}</strong>?
            </>
          ) : (
            <>
              Bạn có chắc chắn muốn xóa tài liệu{' '}
              <strong className="text-gray-900 font-semibold">{deleteModal.name}</strong>?
            </>
          )
        }
        onConfirm={onConfirmDelete}
        loading={deleteModal.loading}
      />

      {/* 6. Share Folder / Document Modal */}
      <ShareFolderModal
        isOpen={shareFolderOpen}
        onClose={() => {
          setShareFolderOpen(false);
          setSharingFolder(null);
          setSharingDoc(null);
        }}
        folder={sharingFolder}
        document={sharingDoc}
        onSuccess={() => {
          onRefetchCategories();
          onRefetchDocuments();
        }}
      />

      {/* 7. Folder Detail Modal */}
      <FolderDetailModal
        isOpen={detailFolderOpen}
        onClose={() => {
          setDetailFolderOpen(false);
          setSelectedFolder(null);
        }}
        folder={selectedFolder}
      />
    </>
  );
};
