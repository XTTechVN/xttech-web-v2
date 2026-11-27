'use client';

import { Button, Modal } from '@/components';

interface Props {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// Xác nhận ngắn cho hành động phá hủy (gỡ thành viên, xóa chức vụ, xóa ca)
export function ConfirmModal({ isOpen, title, message, confirmText, isPending, onClose, onConfirm }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 w-full max-w-md">
      <p className="py-2 text-sm leading-relaxed text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
          Hủy
        </Button>
        <Button variant="danger" size="sm" loading={isPending} onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
