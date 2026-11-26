'use client';

import React from 'react';
import { Modal } from '@/components';
import type { AccountingRegime, AutoPostingTemplate } from '@/types';
import { AutoPostingFormBody } from './auto-posting-form-body';

export interface AutoPostingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: AutoPostingTemplate | null;
  defaultRegime?: AccountingRegime;
  onSuccess?: (template: AutoPostingTemplate) => void;
}

export function AutoPostingFormModal({
  isOpen,
  onClose,
  initialData,
  defaultRegime,
  onSuccess,
}: AutoPostingFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        initialData
          ? `Sửa Mẫu định khoản ${initialData.code}`
          : 'Thêm Mẫu Định Khoản Nhanh'
      }
    >
      {isOpen && (
        <AutoPostingFormBody
          key={`${initialData?.id ?? 'new'}-${defaultRegime ?? 'tt99'}`}
          initialData={initialData}
          defaultRegime={defaultRegime}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
