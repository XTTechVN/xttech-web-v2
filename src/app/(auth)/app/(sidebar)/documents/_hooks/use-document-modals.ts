'use client';

import { useState, useCallback } from 'react';
import type { DocumentCategory, DocumentItem } from '@/types';

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

export function useDocumentModals() {
  // Folder modals
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [editFolderOpen, setEditFolderOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<DocumentCategory | null>(null);
  const [detailFolderOpen, setDetailFolderOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<DocumentCategory | null>(null);

  // Document modals
  const [createDocOpen, setCreateDocOpen] = useState(false);
  const [editDocOpen, setEditDocOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [detailDocOpen, setDetailDocOpen] = useState(false);
  const [previewDocOpen, setPreviewDocOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  // Move & Share modals
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState<ItemToMoveState | null>(null);

  const [shareFolderOpen, setShareFolderOpen] = useState(false);
  const [sharingFolder, setSharingFolder] = useState<DocumentCategory | null>(null);
  const [sharingDoc, setSharingDoc] = useState<DocumentItem | null>(null);

  // Save to folder shortcut modal
  const [saveToFolderDoc, setSaveToFolderDoc] = useState<DocumentItem | null>(null);

  // Delete confirm modal
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    type: 'folder',
    id: 0,
    name: '',
    loading: false,
  });

  // Action helpers
  const openCreateFolder = useCallback(() => {
    setCreateFolderOpen(true);
  }, []);

  const openEditFolder = useCallback((folder: DocumentCategory) => {
    setEditingFolder(folder);
    setEditFolderOpen(true);
  }, []);

  const openDetailFolder = useCallback((folder: DocumentCategory) => {
    setSelectedFolder(folder);
    setDetailFolderOpen(true);
  }, []);

  const openCreateDoc = useCallback(() => {
    setCreateDocOpen(true);
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

  const openSaveToFolder = useCallback((doc: DocumentItem) => {
    setSaveToFolderDoc(doc);
  }, []);

  const openMoveFolder = useCallback((folder: DocumentCategory) => {
    setItemToMove({ type: 'folder', item: folder });
    setMoveModalOpen(true);
  }, []);

  const openMoveDoc = useCallback((doc: DocumentItem) => {
    setItemToMove({ type: 'document', item: doc });
    setMoveModalOpen(true);
  }, []);

  const openDeleteFolder = useCallback((id: number, name: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'folder',
      id,
      name,
      loading: false,
    });
  }, []);

  const openDeleteDoc = useCallback((id: number, name: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'document',
      id,
      name,
      loading: false,
    });
  }, []);

  return {
    // States
    state: {
      createFolderOpen,
      editFolderOpen,
      editingFolder,
      detailFolderOpen,
      selectedFolder,
      createDocOpen,
      editDocOpen,
      editingDoc,
      detailDocOpen,
      previewDocOpen,
      selectedDoc,
      moveModalOpen,
      itemToMove,
      shareFolderOpen,
      sharingFolder,
      sharingDoc,
      saveToFolderDoc,
      deleteModal,
    },
    // Raw Setters (khi cần set thủ công)
    setters: {
      setCreateFolderOpen,
      setEditFolderOpen,
      setEditingFolder,
      setDetailFolderOpen,
      setSelectedFolder,
      setCreateDocOpen,
      setEditDocOpen,
      setEditingDoc,
      setDetailDocOpen,
      setPreviewDocOpen,
      setSelectedDoc,
      setMoveModalOpen,
      setItemToMove,
      setShareFolderOpen,
      setSharingFolder,
      setSharingDoc,
      setSaveToFolderDoc,
      setDeleteModal,
    },
    // High-level Actions
    actions: {
      openCreateFolder,
      openEditFolder,
      openDetailFolder,
      openCreateDoc,
      openEditDoc,
      openDetailDoc,
      openPreviewDoc,
      openShareFolder,
      openShareDoc,
      openSaveToFolder,
      openMoveFolder,
      openMoveDoc,
      openDeleteFolder,
      openDeleteDoc,
    },
  };
}

export type DocumentModalsHook = ReturnType<typeof useDocumentModals>;
