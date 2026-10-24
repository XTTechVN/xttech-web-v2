'use client';

import { useState, useCallback } from 'react';
import type { DocumentCategory, DocumentItem } from '@/types';

export interface BulkDeleteTarget {
  type: 'folder' | 'document';
  id: number;
  name: string;
}

export interface DeleteModalState {
  isOpen: boolean;
  type: 'folder' | 'document' | 'bulk';
  id: number;
  name: string;
  items?: BulkDeleteTarget[];
  loading: boolean;
}

export interface BulkMoveTarget {
  type: 'folder' | 'document';
  item: DocumentCategory | DocumentItem;
}

export interface ItemToMoveState {
  type: 'folder' | 'document' | 'bulk';
  item: DocumentCategory | DocumentItem | null;
  items?: BulkMoveTarget[];
}

export function useDocumentModals() {
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [editFolderOpen, setEditFolderOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<DocumentCategory | null>(null);
  const [detailFolderOpen, setDetailFolderOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<DocumentCategory | null>(null);

  const [editDocOpen, setEditDocOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [detailDocOpen, setDetailDocOpen] = useState(false);
  const [previewDocOpen, setPreviewDocOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState<ItemToMoveState | null>(null);

  const [shareFolderOpen, setShareFolderOpen] = useState(false);
  const [sharingFolder, setSharingFolder] = useState<DocumentCategory | null>(null);
  const [sharingDoc, setSharingDoc] = useState<DocumentItem | null>(null);

  const [saveToFolderDoc, setSaveToFolderDoc] = useState<DocumentItem | null>(null);

  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    type: 'folder',
    id: 0,
    name: '',
    loading: false,
  });

  const openCreateFolder = useCallback(() => setCreateFolderOpen(true), []);
  const openEditFolder = useCallback((folder: DocumentCategory) => {
    setEditingFolder(folder);
    setEditFolderOpen(true);
  }, []);
  const openDetailFolder = useCallback((folder: DocumentCategory) => {
    setSelectedFolder(folder);
    setDetailFolderOpen(true);
  }, []);
  const openEditDoc = useCallback((doc: DocumentItem) => {
    setEditingDoc(doc);
    setEditDocOpen(true);
  }, []);
  const openDetailDoc = useCallback((doc: DocumentItem) => {
    setSelectedDoc(doc);
    setDetailDocOpen(true);
  }, []);
  const openPreviewDoc = useCallback((doc: DocumentItem) => {
    setSelectedDoc(doc);
    setPreviewDocOpen(true);
  }, []);
  const openShareFolder = useCallback((folder: DocumentCategory) => {
    setSharingFolder(folder);
    setSharingDoc(null);
    setShareFolderOpen(true);
  }, []);
  const openShareDoc = useCallback((doc: DocumentItem) => {
    setSharingDoc(doc);
    setSharingFolder(null);
    setShareFolderOpen(true);
  }, []);
  const openSaveToFolder = useCallback((doc: DocumentItem) => setSaveToFolderDoc(doc), []);

  const openMoveFolder = useCallback((folder: DocumentCategory) => {
    setItemToMove({ type: 'folder', item: folder, items: [{ type: 'folder', item: folder }] });
    setMoveModalOpen(true);
  }, []);
  const openMoveDoc = useCallback((doc: DocumentItem) => {
    setItemToMove({ type: 'document', item: doc, items: [{ type: 'document', item: doc }] });
    setMoveModalOpen(true);
  }, []);
  const openMoveItem = useCallback((type: 'folder' | 'document', item: DocumentCategory | DocumentItem) => {
    setItemToMove({ type, item, items: [{ type, item }] });
    setMoveModalOpen(true);
  }, []);
  const openBulkMoveModal = useCallback((items: BulkMoveTarget[]) => {
    if (items.length === 0) return;
    setItemToMove({
      type: items.length === 1 ? items[0].type : 'bulk',
      item: items[0].item,
      items,
    });
    setMoveModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((type: 'folder' | 'document', id: number, name: string) => {
    setDeleteModal({ isOpen: true, type, id, name, items: [{ type, id, name }], loading: false });
  }, []);
  const openDeleteFolder = useCallback(
    (id: number, name: string) => openDeleteModal('folder', id, name),
    [openDeleteModal],
  );
  const openDeleteDoc = useCallback(
    (id: number, name: string) => openDeleteModal('document', id, name),
    [openDeleteModal],
  );
  const openBulkDeleteModal = useCallback((items: BulkDeleteTarget[]) => {
    if (items.length === 0) return;
    setDeleteModal({
      isOpen: true,
      type: items.length === 1 ? items[0].type : 'bulk',
      id: items[0].id,
      name: items.length === 1 ? items[0].name : `${items.length} mục đã chọn`,
      items,
      loading: false,
    });
  }, []);

  const hasOpenModal =
    createFolderOpen ||
    editFolderOpen ||
    detailFolderOpen ||
    editDocOpen ||
    detailDocOpen ||
    previewDocOpen ||
    moveModalOpen ||
    shareFolderOpen ||
    Boolean(saveToFolderDoc) ||
    deleteModal.isOpen;

  return {
    hasOpenModal,
    state: {
      createFolderOpen, editFolderOpen, editingFolder, detailFolderOpen, selectedFolder,
      editDocOpen, editingDoc, detailDocOpen, previewDocOpen, selectedDoc,
      moveModalOpen, itemToMove, shareFolderOpen, sharingFolder, sharingDoc,
      saveToFolderDoc, deleteModal,
    },
    setters: {
      setCreateFolderOpen, setEditFolderOpen, setEditingFolder, setDetailFolderOpen, setSelectedFolder,
      setEditDocOpen, setEditingDoc, setDetailDocOpen, setPreviewDocOpen, setSelectedDoc,
      setMoveModalOpen, setItemToMove, setShareFolderOpen, setSharingFolder, setSharingDoc,
      setSaveToFolderDoc, setDeleteModal,
    },
    actions: {
      openCreateFolder, openEditFolder, openDetailFolder, openEditDoc, openDetailDoc, openPreviewDoc,
      openShareFolder, openShareDoc, openSaveToFolder, openMoveFolder, openMoveDoc, openMoveItem,
      openBulkMoveModal, openDeleteFolder, openDeleteDoc, openDeleteModal, openBulkDeleteModal,
    },
  };
}

export type DocumentModalsHook = ReturnType<typeof useDocumentModals>;
