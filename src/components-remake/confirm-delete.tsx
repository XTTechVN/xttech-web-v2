'use client';

import { Button } from './button';
import { Modal } from '@/components';

interface Props {
  isOpen: boolean;
  title: string;
  /** Nội dung xác nhận; nên in đậm tên đối tượng bị xóa */
  children: React.ReactNode;
  pending: boolean;
  /** Mặc định 'Xác nhận xóa'; đổi khi hành động không phải xóa */
  confirmLabel?: string;
  /** Mặc định cảnh báo không hoàn tác; truyền chuỗi rỗng để bỏ */
  warning?: string;
  onClose: () => void;
  onConfirm: () => void;
}

/** Hộp xác nhận xóa ngắn dùng chung; hành động phá hủy luôn đi qua đây */
export function ConfirmDelete({ isOpen, title, children, pending, confirmLabel = 'Xác nhận xóa', warning = 'Hành động này không thể hoàn tác.', onClose, onConfirm }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 w-full max-w-md">
      <p className="py-2 text-sm leading-relaxed text-slate-600">{children}{warning && ` ${warning}`}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={pending}>
          Hủy
        </Button>
        <Button variant="danger" loading={pending} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
