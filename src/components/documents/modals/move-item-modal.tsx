'use client';

import React, { useState, useMemo } from 'react';
import { Modal, Button } from '@/components';
import { updateDocumentCategory, updateDocument, getDocumentCategoryTree, createDocumentCategory } from '@/actions/document';
import toast from 'react-hot-toast';
import { Folder, HardDrive, AlertCircle, FolderPlus } from 'lucide-react';
import type { DocumentCategory, DocumentItem } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn, isDescendant, DOC_QUERY_KEYS, invalidateDocumentQueries } from '@/utils';
import { FolderTreeView } from '../folder-tree-view';

export interface BulkMoveTarget {
  type: 'folder' | 'document';
  item: DocumentCategory | DocumentItem;
}

interface MoveItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'folder' | 'document' | 'bulk';
  item: DocumentCategory | DocumentItem | null;
  items?: BulkMoveTarget[];
  onSuccess: () => void;
}


export const MoveItemModal: React.FC<MoveItemModalProps> = ({
  isOpen,
  onClose,
  type,
  item,
  items,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [creatingParentId, setCreatingParentId] = useState<number | null | undefined>(undefined);
  const [createFolderLoading, setCreateFolderLoading] = useState(false);
  const [prevOpen, setPrevOpen] = useState(isOpen);

  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setSelectedFolderId(null);
      setCreatingParentId(undefined);
    }
  }

  const { data: tree = [], isLoading: isFetchingTree } = useQuery({
    queryKey: DOC_QUERY_KEYS.categories.tree,
    queryFn: getDocumentCategoryTree,
    enabled: isOpen,
  });

  const targetList = useMemo<BulkMoveTarget[]>(() => {
    if (items && items.length > 0) return items;
    if (item && type !== 'bulk') return [{ type, item }];
    return [];
  }, [items, item, type]);

  const isBulk = targetList.length > 1;
  const itemName = isBulk
    ? `${targetList.length} mục đã chọn`
    : item
      ? 'title' in item
        ? item.title
        : item.name
      : '';

  const isInvalidSelection = useMemo(() => {
    if (targetList.length === 0) return false;
    const allUnchanged = targetList.every((entry) => {
      const currParent =
        'categoryId' in entry.item
          ? (entry.item.categoryId ?? null)
          : ((entry.item as DocumentCategory).parentId ?? null);
      if (entry.type === 'folder') {
        return (
          selectedFolderId === entry.item.id ||
          selectedFolderId === currParent ||
          Boolean(selectedFolderId && isDescendant(tree, entry.item.id, selectedFolderId))
        );
      }
      return selectedFolderId === currParent;
    });
    const anyFolderIntoDescendant = targetList.some(
      (entry) =>
        entry.type === 'folder' &&
        (selectedFolderId === entry.item.id ||
          Boolean(selectedFolderId && isDescendant(tree, entry.item.id, selectedFolderId))),
    );
    return allUnchanged || anyFolderIntoDescendant;
  }, [targetList, selectedFolderId, tree]);

  const handleMove = async () => {
    if (targetList.length === 0) return;
    if (isInvalidSelection) return void toast.error('Vị trí đích không hợp lệ');

    try {
      setLoading(true);
      await Promise.all(
        targetList.map((entry) => {
          if (entry.type === 'folder') {
            return updateDocumentCategory(entry.item.id, { parentId: selectedFolderId });
          }
          const doc = entry.item as DocumentItem;
          return updateDocument(doc.id, {
            title: doc.title,
            documentType: doc.documentType,
            status: doc.status,
            shareScope: doc.shareScope,
            categoryId: selectedFolderId,
          });
        }),
      );
      toast.success(
        isBulk
          ? `Đã di chuyển ${targetList.length} mục thành công`
          : `Di chuyển ${targetList[0].type === 'folder' ? 'thư mục' : 'tài liệu'} thành công`,
      );
      invalidateDocumentQueries(queryClient);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra khi di chuyển');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolderConfirm = async (name: string, parentId: number | null) => {
    try {
      setCreateFolderLoading(true);
      const created = await createDocumentCategory({
        name,
        parentId,
      });
      toast.success(`Đã tạo thư mục "${created.name}"`);
      setCreatingParentId(undefined);
      await queryClient.invalidateQueries({ queryKey: DOC_QUERY_KEYS.categories.tree });
      setSelectedFolderId(created.id);
    } catch (error: any) {
      toast.error(error?.message || 'Không thể tạo thư mục mới');
    } finally {
      setCreateFolderLoading(false);
    }
  };

  if (targetList.length === 0) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <Folder className="text-primary" size={20} />
          <span>
            {isBulk
              ? `Di chuyển ${targetList.length} mục`
              : `Di chuyển ${targetList[0].type === 'folder' ? 'thư mục' : 'tài liệu'}`}
          </span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end w-full gap-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleMove}
            loading={loading}
            disabled={loading || selectedFolderId === undefined || isInvalidSelection}
          >
            Di chuyển tới đây
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
          Bạn đang di chuyển: <strong className="text-slate-800">{itemName}</strong>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-700">Chọn vị trí đích:</label>
            <button
              type="button"
              onClick={() => setCreatingParentId(selectedFolderId)}
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium px-2 py-0.5 rounded hover:bg-primary/5 transition-colors cursor-pointer"
              title="Tạo thư mục mới tại vị trí đang chọn"
            >
              <FolderPlus size={14} />
              <span>Thư mục mới</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg max-h-[40vh] overflow-y-auto bg-white p-2">
            {isFetchingTree ? (
              <div className="text-xs text-slate-500 text-center py-4">Đang tải cấu trúc thư mục...</div>
            ) : (
              <FolderTreeView
                categories={tree}
                activeCategoryId={selectedFolderId}
                onSelectCategory={setSelectedFolderId}
                rootLabel="Thư mục gốc (Tài liệu của tôi)"
                creatingParentId={creatingParentId}
                onCreateConfirm={handleCreateFolderConfirm}
                onCreateCancel={() => setCreatingParentId(undefined)}
                isCreatingLoading={createFolderLoading}
              />
            )}
          </div>
        </div>

        {isInvalidSelection && (
          <div className="flex items-center gap-1.5 text-xs text-rose-500 bg-rose-50 p-2 rounded">
            <AlertCircle size={14} />
            <span>Vị trí đã chọn không hợp lệ (cùng vị trí hiện tại hoặc là thư mục con).</span>
          </div>
        )}
      </div>
    </Modal>
  );
};
