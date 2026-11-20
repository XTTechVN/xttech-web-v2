'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/components';
import { getVoucher } from '@/actions/finance';
import type { VoucherDetail, VoucherType } from '@/types';
import type { VoucherEditorMode } from '../voucher-editor';
import { VoucherFormBody } from './voucher-form-body';

export interface VoucherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherId?: number | null;
  initialData?: VoucherDetail | null;
  defaultMode?: VoucherEditorMode;
  defaultVoucherType?: VoucherType;
  defaultBankAccountId?: number | null;
  defaultHasValidInvoice?: boolean;
  onSuccess?: (voucher: VoucherDetail) => void;
}

export function VoucherFormModal({
  isOpen,
  onClose,
  voucherId = null,
  initialData = null,
  defaultMode = 'workshop',
  defaultVoucherType = 'cash_payment',
  defaultBankAccountId = null,
  defaultHasValidInvoice = false,
  onSuccess,
}: VoucherFormModalProps) {
  const shouldFetch = isOpen && Boolean(voucherId) && !initialData;
  const { data: fetchedVoucher, isLoading } = useQuery({
    queryKey: ['finance', 'voucher', voucherId],
    queryFn: () => getVoucher(voucherId as number),
    enabled: shouldFetch,
  });

  const resolvedData = initialData || fetchedVoucher || null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        resolvedData
          ? `Chỉnh sửa chứng từ ${resolvedData.voucherNo}`
          : 'Lập chứng từ Kế toán / Phiếu Thu Chi'
      }
    >
      {isOpen && (
        shouldFetch && isLoading ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Đang tải dữ liệu chứng từ...
          </div>
        ) : (
          <VoucherFormBody
            key={`${resolvedData?.id ?? 'new'}-${defaultMode}-${defaultVoucherType}-${defaultBankAccountId ?? ''}-${defaultHasValidInvoice}`}
            initialData={resolvedData}
            defaultMode={defaultMode}
            defaultVoucherType={defaultVoucherType}
            defaultBankAccountId={defaultBankAccountId}
            defaultHasValidInvoice={defaultHasValidInvoice}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        )
      )}
    </Modal>
  );
}
