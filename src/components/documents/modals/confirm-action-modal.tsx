 'use client';

import React from 'react';
import { Modal, Button } from '@/components';

export interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description: React.ReactNode;
  warningNote?: React.ReactNode;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  containerClassName?: string;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  warningNote,
  onConfirm,
  loading = false,
  confirmText = 'Xác nhận xóa',
  cancelText = 'Hủy',
  variant = 'danger',
  containerClassName,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="m-2 max-w-md w-full"
      containerClassName={containerClassName}
    >
      <div className="flex flex-col gap-2 py-2">
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        {warningNote && <p className="text-xs text-rose-500 font-medium">{warningNote}</p>}
      </div>
      <div className="flex gap-3 justify-end w-full mt-6">
        <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={variant} size="sm" onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export const DeleteConfirmModal = ConfirmActionModal;
