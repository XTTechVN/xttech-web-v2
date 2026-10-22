'use client';

import React, { useEffect, useState } from 'react';
import { Button, Input, Modal } from '@/components';

interface FloorCreateModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function FloorCreateModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: FloorCreateModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (!isOpen) setName('');
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm tầng" className="max-w-md w-full">
      <div className="space-y-4">
        <Input
          label="Tên tầng *"
          placeholder="Ví dụ: Tầng 1, Tầng 2, Tum..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!name.trim() || isSubmitting}
            loading={isSubmitting}
            onClick={() => onSubmit(name.trim())}
          >
            Lưu tầng
          </Button>
        </div>
      </div>
    </Modal>
  );
}

