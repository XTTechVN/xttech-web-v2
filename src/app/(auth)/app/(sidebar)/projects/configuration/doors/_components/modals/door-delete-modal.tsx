'use client';

import React from 'react';
import { Button, Modal } from '@/components';

interface DoorDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  doorName?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function DoorDeleteModal({
  isOpen,
  onClose,
  doorName,
  onConfirm,
  isPending = false,
}: DoorDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa thiết kế cửa" className="m-2 max-w-md w-full">
      <div className="flex gap-4 items-center py-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa thiết kế cửa <strong className="text-gray-900 font-semibold">{doorName}</strong>?
          </p>
        </div>
      </div>
      <div className="flex gap-3 justify-end w-full mt-6">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
          Hủy
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm} loading={isPending}>
          Xác nhận xóa
        </Button>
      </div>
    </Modal>
  );
}
