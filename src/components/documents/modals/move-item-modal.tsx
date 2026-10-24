'use client';

import React, { useState, useMemo } from 'react';
import { Modal, Button } from '@/components';
import { updateDocumentCategory, updateDocument, getDocumentCategoryTree } from '@/actions/document';
import toast from 'react-hot-toast';
import { Folder, HardDrive, AlertCircle } from 'lucide-react';
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
  const [prevOpen, setPrevOpen] = useState(isOpen);

  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) setSelectedFolderId(null);
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
          <label className="block text-xs font-semibold text-slate-700 mb-2">Chọn vị trí đích:</label>
          <div className="border border-slate-200 rounded-lg max-h-[40vh] overflow-y-auto bg-white p-2">
            {isFetchingTree ? (
              <div className="text-xs text-slate-500 text-center py-4">Đang tải cấu trúc thư mục...</div>
            ) : (
              <div className="space-y-1">
                <div
                  onClick={() => setSelectedFolderId(null)}
                  className={cn(
                    'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors select-none text-xs',
                    selectedFolderId === null
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  <HardDrive size={15} className={selectedFolderId === null ? 'text-primary' : 'text-slate-500'} />
                  <span>Thư mục gốc (Tài liệu của tôi)</span>
                </div>

                {tree.length > 0 && (
                  <div className="mt-2 pl-1 border-l border-slate-100 ml-4">
                    <FolderTreeView
                      categories={tree}
                      activeCategoryId={selectedFolderId}
                      onSelectCategory={setSelectedFolderId}
                    />
                  </div>
                )}
              </div>
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
