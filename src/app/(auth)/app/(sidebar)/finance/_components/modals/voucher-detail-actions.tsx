'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BookCheck,
  CheckCheck,
  Edit3,
  Printer,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components';
import {
  approveInternalVoucher,
  cashierConfirmVoucher,
  getFinanceSetting,
  getMyFinancePermissions,
  postVoucher,
  unpostVoucher,
} from '@/actions/finance';
import { useAuthStore } from '@/stores';
import type { VoucherDetail } from '@/types';
import { printAccountingVoucher } from '../../_utils';
import { ApproveInternalModal } from './approve-internal-modal';
import { UnpostVoucherModal } from './unpost-voucher-modal';

export interface VoucherDetailActionsProps {
  voucher: VoucherDetail;
  actionLoading: boolean;
  onRunAction: (
    fn: (id: number) => Promise<VoucherDetail>,
    successMsg: string,
  ) => Promise<void>;
  onClose: () => void;
  onEdit?: (voucher: VoucherDetail) => void;
  onVoid?: (voucher: VoucherDetail) => void;
}

export function VoucherDetailActions({
  voucher,
  actionLoading,
  onRunAction,
  onClose,
  onEdit,
  onVoid,
}: VoucherDetailActionsProps) {
  const currentUser = useAuthStore((state) => state.user);
  const [unpostModalOpen, setUnpostModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);

  const { data: setting } = useQuery({
    queryKey: ['finance', 'settings'],
    queryFn: getFinanceSetting,
    staleTime: 60_000,
  });

  const { data: myPermissions } = useQuery({
    queryKey: ['finance', 'permissions', 'me'],
    queryFn: getMyFinancePermissions,
    staleTime: 60_000,
  });

  const enforceMakerChecker = setting?.enforceMakerChecker ?? true;
  const isSameMaker =
    Boolean(currentUser?.id) &&
    Boolean(voucher.createdById) &&
    String(currentUser?.id) === String(voucher.createdById);
  const canPostByRole = myPermissions?.canPostVoucher ?? false;
  const postBlockedByMakerChecker = enforceMakerChecker && isSameMaker;
  const isCashVoucher =
    voucher.voucherType === 'cash_receipt' || voucher.voucherType === 'cash_payment';

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 w-full">
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<Printer size={15} />}
          onClick={() =>
            printAccountingVoucher(voucher, {
              accountingRegime: setting?.accountingRegime,
            })
          }
        >
          In chứng từ
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {!voucher.hasValidInvoice &&
            !voucher.approvedById &&
            voucher.status !== 'voided' &&
            myPermissions?.canApproveNonInvoice && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={actionLoading}
                leftIcon={<ShieldCheck size={14} />}
                onClick={() => setApproveModalOpen(true)}
              >
                Duyệt nội bộ
              </Button>
            )}

          {isCashVoucher &&
            !voucher.cashierConfirmedById &&
            voucher.status !== 'voided' &&
            myPermissions?.canCashierConfirm && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={actionLoading}
                leftIcon={<CheckCheck size={14} />}
                onClick={() =>
                  onRunAction(
                    cashierConfirmVoucher,
                    'Thủ quỹ đã xác nhận thu/chi tiền mặt thực tế.',
                  )
                }
              >
                Thủ quỹ xác nhận
              </Button>
            )}

          {voucher.status === 'draft' && onEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={actionLoading}
              leftIcon={<Edit3 size={14} />}
              onClick={() => {
                onClose();
                onEdit(voucher);
              }}
            >
              Sửa phiếu
            </Button>
          )}

          {voucher.status === 'draft' && (
            <span
              title={
                !canPostByRole
                  ? 'Bạn không có quyền Ghi sổ cái (canPostVoucher)'
                  : postBlockedByMakerChecker
                    ? 'Chế độ Người lập ≠ Người ghi sổ đang bật: người tạo chứng từ không thể tự ghi sổ'
                    : undefined
              }
            >
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={actionLoading}
                disabled={!canPostByRole || postBlockedByMakerChecker}
                leftIcon={<BookCheck size={14} />}
                onClick={() => onRunAction(postVoucher, 'Đã ghi sổ cái thành công!')}
              >
                {postBlockedByMakerChecker ? 'Chờ người khác ghi sổ' : 'Ghi sổ cái'}
              </Button>
            </span>
          )}

          {voucher.status === 'posted' && myPermissions?.canUnpostVoucher && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={actionLoading}
              leftIcon={<RotateCcw size={14} />}
              onClick={() => setUnpostModalOpen(true)}
            >
              Bỏ ghi sổ
            </Button>
          )}

          {voucher.status !== 'voided' && onVoid && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={actionLoading}
              leftIcon={<XCircle size={14} />}
              onClick={() => {
                onClose();
                onVoid(voucher);
              }}
            >
              Hủy phiếu
            </Button>
          )}

          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>

      <UnpostVoucherModal
        isOpen={unpostModalOpen}
        onClose={() => setUnpostModalOpen(false)}
        voucher={voucher}
        loading={actionLoading}
        onConfirm={async (reason) => {
          await onRunAction(
            (id) => unpostVoucher(id, { reason }),
            'Đã bỏ ghi sổ cái chứng từ và lưu Nhật ký Kiểm toán.',
          );
          setUnpostModalOpen(false);
        }}
      />

      <ApproveInternalModal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        voucherNo={voucher.voucherNo}
        loading={actionLoading}
        onConfirm={async (note) => {
          await onRunAction(
            (id) => approveInternalVoucher(id, { approvalNote: note }),
            'Đã duyệt nội bộ chứng từ!',
          );
          setApproveModalOpen(false);
        }}
      />
    </>
  );
}
