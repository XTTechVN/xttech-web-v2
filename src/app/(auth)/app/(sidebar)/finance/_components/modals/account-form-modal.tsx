'use client';

import React from 'react';
import { Modal } from '@/components';
import type { Account } from '@/types';
import { AccountFormBody } from './account-form-body';

export interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Account | null;
  defaultParentId?: number | null;
  accounts?: Account[];
  onSuccess?: (account: Account) => void;
}

export function AccountFormModal({
  isOpen,
  onClose,
  initialData,
  defaultParentId,
  accounts,
  onSuccess,
}: AccountFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        initialData
          ? `Sửa tài khoản ${initialData.accountCode}`
          : 'Thêm Tài khoản Kế toán'
      }
    >
      {isOpen && (
        <AccountFormBody
          key={`${initialData?.id ?? 'new'}-${defaultParentId ?? ''}`}
          initialData={initialData}
          defaultParentId={defaultParentId}
          accounts={accounts}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
