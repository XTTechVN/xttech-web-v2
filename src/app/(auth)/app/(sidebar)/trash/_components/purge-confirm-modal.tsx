'use client';

import React from 'react';
import { Modal, Button } from '@/components';
import type { TrashItem } from '@/types';

interface PurgeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: TrashItem | null;
  onConfirm: () => void;
  loading?: boolean;
}

export const PurgeConfirmModal: React.FC<PurgeConfirmModalProps> = ({
  isOpen,
  onClose,
  item,
  onConfirm,
  loading = false,
}) => {
  if (!item) return null;

  const isFolder = item.itemType === 'folder';
  const itemName = item.title || (item as any).name || (item as any).fileName || (item as any).folder_name || '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận xóa"
      className="m-2 max-w-md w-full"
    >
      <div className="flex flex-col gap-2 py-2">
        <p className="text-gray-600 text-sm leading-relaxed">
          Bạn có chắc chắn muốn xóa vĩnh viễn {isFolder ? 'thư mục' : 'tài liệu'}{' '}
          <strong className="text-gray-900 font-semibold">{itemName}</strong>?
        </p>
        <p className="text-xs text-rose-500 font-medium">
          * Hành động này không thể hoàn tác. Dữ liệu và các tệp liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống.
        </p>
      </div>

      <div className="flex gap-3 justify-end w-full mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={onConfirm}
          loading={loading}
        >
          Xác nhận xóa
        </Button>
      </div>
    </Modal>
  );
};
