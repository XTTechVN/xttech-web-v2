'use client';

import React, { useState } from 'react';
import { Button, Modal } from '@/components';
import type { ContractTerms, ProjectContractItem } from '@/types';
import { ContractTermsEditor } from '../components/contract-terms-editor';

interface ContractTermsModalProps {
  contract: ProjectContractItem | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSave: (contract: ProjectContractItem, terms: ContractTerms) => void;
}

export function ContractTermsModal({ contract, isSubmitting, onClose, onSave }: ContractTermsModalProps) {
  return (
    <Modal
      isOpen={!!contract}
      onClose={onClose}
      title={contract ? `Điều khoản hợp đồng ${contract.contractCode}` : 'Điều khoản hợp đồng'}
      size="lg"
      className="md:!max-w-3xl w-full"
    >
      {contract && (
        <ContractTermsForm
          contract={contract}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </Modal>
  );
}

interface ContractTermsFormProps extends Omit<ContractTermsModalProps, 'contract'> {
  contract: ProjectContractItem;
}

// State nằm ở component con, chỉ mount khi modal mở nên luôn lấy nội dung mới nhất của hợp đồng
function ContractTermsForm({ contract, isSubmitting, onClose, onSave }: ContractTermsFormProps) {
  const [terms, setTerms] = useState<ContractTerms>(contract.contractTerms ?? {});
  // Chỉ hợp đồng nháp mới được sửa (backend chặn các trạng thái khác)
  const isReadOnly = contract.status !== 'draft';

  return (
    <div className="space-y-4">
      {isReadOnly && (
        <p className="text-[11px] text-slate-500">
          Hợp đồng đã ký hoặc đã hủy nên chỉ xem, không chỉnh sửa được.
        </p>
      )}
      <ContractTermsEditor terms={terms} isReadOnly={isReadOnly} onChange={setTerms} />
      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <Button variant="outline" size="sm" onClick={onClose}>
          {isReadOnly ? 'Đóng' : 'Hủy'}
        </Button>
        {!isReadOnly && (
          <Button
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            loading={isSubmitting}
            onClick={() => onSave(contract, terms)}
          >
            Lưu điều khoản
          </Button>
        )}
      </div>
    </div>
  );
}
