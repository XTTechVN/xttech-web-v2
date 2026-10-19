'use client';

import React, { useState, useMemo } from 'react';
import { Modal, Button } from '@/components';
import { updateDocumentCategory, updateDocument, getDocumentCategoryTree } from '@/actions/document';
import toast from 'react-hot-toast';
import { Folder, HardDrive, AlertCircle } from 'lucide-react';
import type { DocumentCategory, DocumentItem } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/utils';
import { FolderTreeView } from './folder-tree-view';
import { DOC_QUERY_KEYS, invalidateDocumentQueries } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-query-keys';

interface MoveItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'folder' | 'document';
  item: DocumentCategory | DocumentItem | null;
  onSuccess: () => void;
}

// Hàm đệ quy kiểm tra xem targetId có nằm trong nhánh của sourceId không
const isDescendant = (categories: DocumentCategory[], sourceId: number, targetId: number): boolean => {
  for (const cat of categories) {
    if (cat.id === sourceId) {
      // Tìm thấy source, bây giờ kiểm tra xem targetId có nằm trong children của nó không
      const checkChildren = (children?: DocumentCategory[]): boolean => {
        if (!children) return false;
        if (children.some(c => c.id === targetId)) return true;
        return children.some(c => checkChildren(c.children));
      };
      return checkChildren(cat.children);
    }
    if (cat.children && cat.children.length > 0) {
      if (isDescendant(cat.children, sourceId, targetId)) return true;
    }
  }
  return false;
};

export const MoveItemModal: React.FC<MoveItemModalProps> = ({
  isOpen,
  onClose,
  type,
  item,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  // Reset selected folder when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(null);
    }
  }, [isOpen]);

  const { data: tree = [], isLoading: isFetchingTree } = useQuery({
    queryKey: DOC_QUERY_KEYS.categories.tree,
    queryFn: getDocumentCategoryTree,
    enabled: isOpen,
  });

  const itemName = item ? ('title' in item ? item.title : item.name) : '';
  const currentParentId = item 
    ? ('categoryId' in item ? item.categoryId : ('parentId' in item ? (item as any).parentId : null))
    : null;

  // Lọc cây thư mục để loại bỏ chính nó (nếu là folder)
  // Thực ra chỉ cần chặn lúc chọn là được
  
  const handleSelectFolder = (folderId: number | null) => {
    setSelectedFolderId(folderId);
  };

  const isInvalidSelection = useMemo(() => {
    if (!item) return false;
    if (type === 'folder') {
      const folderId = item.id;
      // Không được di chuyển vào chính nó
      if (selectedFolderId === folderId) return true;
      // Không được di chuyển vào cùng thư mục cha hiện tại
      if (selectedFolderId === currentParentId) return true;
      // Không được di chuyển vào thư mục con của chính nó
      if (selectedFolderId && isDescendant(tree, folderId, selectedFolderId)) return true;
    } else {
      // Document
      if (selectedFolderId === currentParentId) return true;
    }
    return false;
  }, [item, type, selectedFolderId, currentParentId, tree]);

  const handleMove = async () => {
    if (!item) return;
    
    if (isInvalidSelection) {
      toast.error('Vị trí đích không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      if (type === 'folder') {
        // payload update folder: { parentId: targetId }
        await updateDocumentCategory(item.id, { parentId: selectedFolderId });
        toast.success('Di chuyển thư mục thành công');
      } else {
        // payload update document
        if ('title' in item) {
          await updateDocument(item.id, {
            title: item.title,
            documentType: item.documentType,
            status: item.status,
            shareScope: item.shareScope,
            categoryId: selectedFolderId 
          });
        } else {
          await updateDocument(item.id, { categoryId: selectedFolderId });
        }
        toast.success('Di chuyển tài liệu thành công');
      }
      invalidateDocumentQueries(queryClient);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi di chuyển');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <Folder className="text-primary" size={20} />
          <span>Di chuyển {type === 'folder' ? 'thư mục' : 'tài liệu'}</span>
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
                {/* Thư mục gốc */}
                <div
                  onClick={() => handleSelectFolder(null)}
                  className={cn(
                    'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors select-none text-xs',
                    selectedFolderId === null
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <HardDrive size={15} className={selectedFolderId === null ? 'text-primary' : 'text-slate-500'} />
                  <span>Thư mục gốc (Tài liệu của tôi)</span>
                </div>
                
                {/* Cây thư mục */}
                {tree.length > 0 && (
                  <div className="mt-2 pl-1 border-l border-slate-100 ml-4">
                    <FolderTreeView
                      categories={tree}
                      activeCategoryId={selectedFolderId}
                      onSelectCategory={handleSelectFolder}
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
