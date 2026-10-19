'use client';

import React, { useState } from 'react';
import { Modal, Button } from '@/components';
import { saveDocumentToFolder, getDocumentCategoryTree } from '@/actions/document';
import toast from 'react-hot-toast';
import { Bookmark, Folder, Check } from 'lucide-react';
import type { DocumentCategory, DocumentItem } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/utils';
import { FolderTreeView } from './folder-tree-view';
import { DOC_QUERY_KEYS, invalidateDocumentQueries } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-query-keys';

interface SaveToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  onSuccess?: () => void;
}

export const SaveToFolderModal: React.FC<SaveToFolderModalProps> = ({ isOpen, onClose, document: doc, onSuccess }) => {
  const queryClient = useQueryClient();
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(null);
    }
  }, [isOpen]);

  const { data: tree = [], isLoading } = useQuery({
    queryKey: DOC_QUERY_KEYS.categories.tree,
    queryFn: getDocumentCategoryTree,
    enabled: isOpen,
  });

  // Chỉ cho phép lưu lối tắt vào thư mục cá nhân (isOwner !== false / !isShared)
  const personalFolders = React.useMemo(() => {
    const filterPersonal = (nodes: DocumentCategory[]): DocumentCategory[] => {
      return nodes
        .filter((node) => node.isOwner !== false && !node.isShared)
        .map((node) => ({
          ...node,
          children: node.children ? filterPersonal(node.children) : [],
        }));
    };
    return filterPersonal(tree);
  }, [tree]);

  // Kiểm tra chống lưu trùng
  const alreadySaved = React.useMemo(() => {
    if (!doc || !selectedFolderId) return false;
    if (doc.categoryId === selectedFolderId) return true;
    if (Array.isArray(doc.savedFolders) && doc.savedFolders.includes(selectedFolderId)) return true;
    return false;
  }, [doc, selectedFolderId]);

  const saveMutation = useMutation({
    mutationFn: async (folderId: number) => {
      if (!doc?.id) throw new Error('Không tìm thấy tài liệu');
      return saveDocumentToFolder(doc.id, folderId);
    },
    onSuccess: () => {
      toast.success('Đã lưu lối tắt vào thư mục cá nhân thành công!');
      invalidateDocumentQueries(queryClient);
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể lưu vào thư mục');
    },
  });

  const handleConfirm = () => {
    if (!selectedFolderId) {
      toast.error('Vui lòng chọn một thư mục cá nhân đích');
      return;
    }
    if (alreadySaved) {
      toast.error('Tài liệu này đã tồn tại trong thư mục đã chọn');
      return;
    }
    saveMutation.mutate(selectedFolderId);
  };

  const loading = saveMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lưu lối tắt vào thư mục cá nhân"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="danger" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleConfirm} loading={loading} disabled={loading || !selectedFolderId || alreadySaved}>
            Lưu lối tắt
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {doc && (
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Tài liệu:</span> {doc.title}
          </div>
        )}

        <p className="text-xs text-slate-500">
          Chọn một thư mục cá nhân của bạn để lưu lối tắt truy cập nhanh. Lưu lối tắt không làm di chuyển hoặc thay đổi tài liệu gốc.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center p-8 text-xs text-slate-500">Đang tải danh sách thư mục...</div>
        ) : personalFolders.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed rounded-xl">
            Bạn chưa có thư mục cá nhân nào. Hãy tạo một thư mục mới trước.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl max-h-64 overflow-y-auto p-2">
            <FolderTreeView categories={personalFolders} activeCategoryId={selectedFolderId} onSelectCategory={(id) => setSelectedFolderId(id)} />
          </div>
        )}

        {alreadySaved && selectedFolderId && (
          <p className="text-[11px] text-amber-600 font-medium">⚠️ Tài liệu này đã có lối tắt trong thư mục được chọn.</p>
        )}
      </div>
    </Modal>
  );
};
