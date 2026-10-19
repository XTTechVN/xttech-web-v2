'use client';

import React from 'react';
import { Modal, Button } from '@/components';
import type { TrashItem } from '@/types';

interface RestoreConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: TrashItem | null;
  onConfirm: () => void;
  loading?: boolean;
}

export const RestoreConfirmModal: React.FC<RestoreConfirmModalProps> = ({
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
      title="Xác nhận khôi phục"
      className="m-2 max-w-md w-full"
    >
      <div className="flex gap-4 items-center py-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn khôi phục {isFolder ? 'thư mục' : 'tài liệu'}{' '}
            <strong className="text-gray-900 font-semibold">{itemName}</strong>?
          </p>
        </div>
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
          variant="primary"
          size="sm"
          onClick={onConfirm}
          loading={loading}
        >
          Xác nhận khôi phục
        </Button>
      </div>
    </Modal>
  );
};
