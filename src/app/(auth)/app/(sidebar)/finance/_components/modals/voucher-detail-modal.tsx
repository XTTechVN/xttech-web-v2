'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Modal } from '@/components';
import { getVoucher } from '@/actions/finance';
import {
  getTaxDeductibleBadge,
  VOUCHER_STATUS_MAP,
  VOUCHER_TYPE_MAP,
} from '@/config/finance';
import { showErrorToast, showSuccessToast } from '@/utils/error';
import type { VoucherDetail } from '@/types';
import { VoucherDetailActions } from './voucher-detail-actions';
import { VoucherDetailBody } from './voucher-detail-body';

export interface VoucherDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherId: number | null;
  onEdit?: (voucher: VoucherDetail) => void;
  onVoid?: (voucher: VoucherDetail) => void;
  onSuccess?: (voucher: VoucherDetail) => void;
}

export function VoucherDetailModal({
  isOpen,
  onClose,
  voucherId,
  onEdit,
  onVoid,
  onSuccess,
}: VoucherDetailModalProps) {
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(false);

  const { data: voucher, isLoading } = useQuery({
    queryKey: ['finance', 'voucher', voucherId],
    queryFn: () => getVoucher(voucherId as number),
    enabled: isOpen && Boolean(voucherId),
  });

  const runAction = async (
    fn: (id: number) => Promise<VoucherDetail>,
    successMsg: string,
  ) => {
    if (!voucher) return;
    setActionLoading(true);
    try {
      const updated = await fn(voucher.id);
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      showSuccessToast(successMsg);
      onSuccess?.(updated);
    } catch (err) {
      showErrorToast(err, 'Thao tác chứng từ thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const statusMeta = voucher ? VOUCHER_STATUS_MAP[voucher.status] : null;
  const typeMeta = voucher ? VOUCHER_TYPE_MAP[voucher.voucherType] : null;
  const taxBadge = voucher ? getTaxDeductibleBadge(voucher.isTaxDeductible) : null;
  const isCashVoucher =
    voucher?.voucherType === 'cash_receipt' || voucher?.voucherType === 'cash_payment';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        voucher ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono font-bold text-slate-900">{voucher.voucherNo}</span>
            {typeMeta && (
              <Badge variant={typeMeta.variant} size="sm">
                {typeMeta.shortLabel || typeMeta.label}
              </Badge>
            )}
            {statusMeta && (
              <Badge variant={statusMeta.variant} size="sm">
                {statusMeta.shortLabel || statusMeta.label}
              </Badge>
            )}
            {taxBadge && (
              <Badge variant={taxBadge.variant} size="sm">
                {taxBadge.shortLabel || taxBadge.label}
              </Badge>
            )}
            {voucher.approvedById && (
              <Badge variant="info" size="sm">
                Đã duyệt nội bộ: {voucher.approvedByName || 'Quản lý'}
              </Badge>
            )}
            {isCashVoucher && voucher.cashierConfirmedById && (
              <Badge variant="success" size="sm">
                Thủ quỹ xác nhận: {voucher.cashierConfirmedByName || 'Thủ quỹ'}
              </Badge>
            )}
          </div>
        ) : (
          'Chi tiết chứng từ kế toán'
        )
      }
      footer={
        voucher && (
          <VoucherDetailActions
            voucher={voucher}
            actionLoading={actionLoading}
            onRunAction={runAction}
            onClose={onClose}
            onEdit={onEdit}
            onVoid={onVoid}
          />
        )
      }
    >
      {isLoading || !voucher ? (
        <div className="py-12 text-center text-sm text-slate-400">
          Đang tải chi tiết chứng từ...
        </div>
      ) : (
        <VoucherDetailBody voucher={voucher} />
      )}
    </Modal>
  );
}
