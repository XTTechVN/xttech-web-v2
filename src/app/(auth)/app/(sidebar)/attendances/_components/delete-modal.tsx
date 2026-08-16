'use client';

import { Modal, Button } from '@/components';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  appealId: number | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function DeleteAppealModal({ open, appealId, onClose, onConfirm, isLoading }: Props) {
  if (!appealId) return null;

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        Hủy
      </Button>
      <Button
        variant="danger"
        onClick={onConfirm}
        disabled={isLoading}
      >
        {isLoading ? 'Đang xóa...' : 'Xóa khiếu nại'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Xác nhận xóa"
      size="sm"
      footer={footer}
    >
      <div className="py-3 flex flex-col items-center text-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle size={22} />
        </div>
        <div>
          <p className="font-semibold text-slate-900">Xóa khiếu nại #{appealId}?</p>
          <p className="mt-1 text-xs text-slate-500">
            Hành động này không thể hoàn tác. Khiếu nại sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </p>
        </div>
      </div>
    </Modal>
  );
}
