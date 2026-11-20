'use client';

import React from 'react';
import { Modal } from '@/components';
import type { ParsedEinvoiceXml, TaxInvoice, TaxInvoiceDirection } from '@/types';
import { TaxInvoiceFormBody } from './tax-invoice-form-body';

export interface TaxInvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: TaxInvoice | null;
  defaultDirection?: TaxInvoiceDirection;
  defaultVoucherId?: number | null;
  prefillXml?: ParsedEinvoiceXml | null;
  onSuccess?: (invoice: TaxInvoice) => void;
}

export function TaxInvoiceFormModal({
  isOpen,
  onClose,
  initialData,
  defaultDirection,
  defaultVoucherId,
  prefillXml,
  onSuccess,
}: TaxInvoiceFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={initialData ? 'Cập nhật Hóa đơn GTGT' : 'Thêm Hóa đơn GTGT / Đọc XML HĐĐT'}
    >
      {isOpen && (
        <TaxInvoiceFormBody
          key={`${initialData?.id ?? 'new'}-${defaultDirection ?? 'input'}-${defaultVoucherId ?? ''}`}
          initialData={initialData}
          defaultDirection={defaultDirection}
          defaultVoucherId={defaultVoucherId}
          prefillXml={prefillXml}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
