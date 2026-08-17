'use client';

import { Modal, Button } from '@/components';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  appealId: number | null;
  title?: string;
  description?: string;
  confirmText?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function DeleteAppealModal({
  open,
  appealId,
  title,
  description,
  confirmText,
  onClose,
  onConfirm,
  isLoading,
}: Props) {
  if (!appealId) return null;

  const displayTitle = title || `Xóa khiếu nại #${appealId}?`;
  const displayDesc = description || 'Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa khỏi hệ thống.';
  const displayConfirm = confirmText || 'Xóa';

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
        {isLoading ? 'Đang xóa...' : displayConfirm}
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
          <p className="font-semibold text-slate-900">{displayTitle}</p>
          <p className="mt-1 text-xs text-slate-500">
            {displayDesc}
          </p>
        </div>
      </div>
    </Modal>
  );
}
