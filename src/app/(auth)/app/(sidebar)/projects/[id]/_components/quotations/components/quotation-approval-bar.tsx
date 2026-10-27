'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CheckCircle2, Link2, Send, ShieldCheck, Undo2, UserCheck, UserX } from 'lucide-react';
import {
  approveQuotation,
  customerAcceptQuotation,
  customerRejectQuotation,
  requestQuotationSigning,
  returnQuotation,
  submitQuotation,
} from '@/actions';
import { Badge, Button, Input, Modal } from '@/components';
import { QUOTATION_STATUS_MAP } from '@/config';
import { usePermission } from '@/hooks/user-permission';
import { showErrorToast } from '@/utils';
import type { ProjectQuotationDetail, SignatureInput } from '@/types';
import { SignatureFields } from '../../shared';
import { invalidateQuotationQueries } from '../../hooks/use-active-quotation';

interface QuotationApprovalBarProps {
  projectId: number;
  quotation: ProjectQuotationDetail;
}

type ReasonAction = 'return' | 'reject';

const STEP_HINT: Record<string, string> = {
  draft: 'Báo giá đang nháp. Trình admin duyệt trước khi gửi khách.',
  pending_approval: 'Đang chờ admin duyệt giá, chiết khấu và biên lợi nhuận.',
  approved: 'Admin đã duyệt. Gửi link cho khách ký đồng ý, hoặc ghi nhận khách đồng ý trực tiếp.',
  sent: 'Đã gửi khách, đang chờ khách đồng ý.',
  accepted: 'Khách đã đồng ý báo giá. Sang tab Hợp đồng để lập hợp đồng.',
  rejected: 'Khách từ chối. Sửa cấu hình giá rồi bấm lưu để tạo phiên bản mới.',
  superseded: 'Báo giá đã được thay bằng phiên bản mới.',
  not_chosen: 'Khách không chọn phương án này.',
};

/** Vòng duyệt báo giá: sale trình -> admin duyệt -> gửi khách -> khách đồng ý / từ chối. */
export function QuotationApprovalBar({ projectId, quotation }: QuotationApprovalBarProps) {
  const { isAdmin, hasRole } = usePermission();
  const canSell = isAdmin || hasRole('sale');
  const [reasonAction, setReasonAction] = useState<ReasonAction | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const status = QUOTATION_STATUS_MAP[quotation.status] ?? { label: quotation.status, variant: 'default' };

  const run = useMutation({
    mutationFn: (action: () => Promise<unknown>) => action(),
    onSuccess: () => invalidateQuotationQueries(projectId),
    onError: (err) => showErrorToast(err, 'Không thực hiện được thao tác báo giá'),
  });
  const act = (action: () => Promise<unknown>, message: string) =>
    run.mutate(action, { onSuccess: () => toast.success(message) });

  const sendLink = () =>
    run.mutate(() => requestQuotationSigning(projectId, quotation.id), {
      onSuccess: async (res) => {
        const result = res as Awaited<ReturnType<typeof requestQuotationSigning>>;
        await navigator.clipboard?.writeText(result.signingUrl).catch(() => undefined);
        toast.success(
          result.emailSent
            ? `Đã gửi email link duyệt báo giá tới ${result.recipientEmail} (đã sao chép link)`
            : 'Đã tạo link duyệt báo giá và sao chép — chưa gửi được email (khách chưa có email)',
        );
      },
    });

  const canDecide = canSell && ['approved', 'sent'].includes(quotation.status);
  const isBlocked = quotation.isOutdated;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-2 text-xs text-slate-600">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-primary" />
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-800">
              {quotation.code} (v{quotation.version})
            </span>
            <Badge variant={status.variant} size="sm">
              {status.label}
            </Badge>
          </div>
          <p>{STEP_HINT[quotation.status]}</p>
          {quotation.reviewNote && (
            <p className="text-amber-700">Admin ghi chú: {quotation.reviewNote}</p>
          )}
          {quotation.customerNote && <p className="text-slate-500">Khách: {quotation.customerNote}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {quotation.status === 'draft' && canSell && (
          <Button
            size="sm"
            leftIcon={<Send size={14} />}
            disabled={isBlocked || run.isPending}
            onClick={() => act(() => submitQuotation(projectId, quotation.id), 'Đã trình admin duyệt')}
          >
            Trình duyệt
          </Button>
        )}
        {quotation.status === 'pending_approval' && isAdmin && (
          <>
            <Button size="sm" variant="outline" leftIcon={<Undo2 size={14} />} onClick={() => setReasonAction('return')}>
              Trả lại
            </Button>
            <Button
              size="sm"
              leftIcon={<CheckCircle2 size={14} />}
              disabled={isBlocked || run.isPending}
              onClick={() => act(() => approveQuotation(projectId, quotation.id), 'Đã duyệt báo giá')}
            >
              Duyệt báo giá
            </Button>
          </>
        )}
        {quotation.status === 'approved' && isAdmin && (
          <Button size="sm" variant="ghost" leftIcon={<Undo2 size={14} />} onClick={() => setReasonAction('return')}>
            Thu hồi duyệt
          </Button>
        )}
        {canDecide && (
          <>
            <Button size="sm" variant="outline" leftIcon={<Link2 size={14} />} disabled={isBlocked || run.isPending} onClick={sendLink}>
              {quotation.status === 'sent' ? 'Gửi lại link' : 'Gửi link cho khách'}
            </Button>
            <Button size="sm" variant="outline" leftIcon={<UserX size={14} />} onClick={() => setReasonAction('reject')}>
              Khách từ chối
            </Button>
            <Button size="sm" leftIcon={<UserCheck size={14} />} disabled={isBlocked} onClick={() => setIsAccepting(true)}>
              Khách đồng ý
            </Button>
          </>
        )}
      </div>

      <ReasonModal
        action={reasonAction}
        isSubmitting={run.isPending}
        onClose={() => setReasonAction(null)}
        onConfirm={(reason) =>
          run.mutate(
            () =>
              reasonAction === 'return'
                ? returnQuotation(projectId, quotation.id, reason)
                : customerRejectQuotation(projectId, quotation.id, reason),
            {
              onSuccess: () => {
                toast.success(reasonAction === 'return' ? 'Đã trả lại cho sale sửa' : 'Đã ghi nhận khách từ chối');
                setReasonAction(null);
              },
            },
          )
        }
      />
      <AcceptModal
        isOpen={isAccepting}
        isSubmitting={run.isPending}
        onClose={() => setIsAccepting(false)}
        onConfirm={(customerSignature, note) =>
          run.mutate(() => customerAcceptQuotation(projectId, quotation.id, { customerSignature, note }), {
            onSuccess: () => {
              toast.success('Khách đã đồng ý báo giá — có thể lập hợp đồng');
              setIsAccepting(false);
            },
          })
        }
      />
    </div>
  );
}

function ReasonModal({
  action,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  action: ReasonAction | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const title = action === 'return' ? 'Trả lại báo giá cho sale' : 'Khách từ chối báo giá';
  return (
    <Modal isOpen={!!action} onClose={onClose} title={title} className="max-w-md w-full">
      {action && <ReasonForm isSubmitting={isSubmitting} onClose={onClose} onConfirm={onConfirm} />}
    </Modal>
  );
}

// State nằm ở component con, chỉ mount khi modal mở nên luôn bắt đầu từ giá trị rỗng
function ReasonForm({
  isSubmitting,
  onClose,
  onConfirm,
}: {
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  return (
    <div className="space-y-4">
      <Input label="Lý do (bắt buộc)" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth />
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
        <Button
          size="sm"
          disabled={reason.trim().length < 3 || isSubmitting}
          loading={isSubmitting}
          onClick={() => onConfirm(reason.trim())}
        >
          Xác nhận
        </Button>
      </div>
    </div>
  );
}

function AcceptModal({
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (signature: SignatureInput | undefined, note: string | undefined) => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Khách đồng ý báo giá" className="max-w-lg w-full">
      {isOpen && <AcceptForm isSubmitting={isSubmitting} onClose={onClose} onConfirm={onConfirm} />}
    </Modal>
  );
}

function AcceptForm({
  isSubmitting,
  onClose,
  onConfirm,
}: {
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (signature: SignatureInput | undefined, note: string | undefined) => void;
}) {
  const [signature, setSignature] = useState<SignatureInput | null>(null);
  const [note, setNote] = useState('');
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Khách ký trực tiếp trên màn hình, hoặc bỏ trống chữ ký và ghi chú cách khách đồng ý (văn bản, Zalo...).
      </p>
      <SignatureFields title="Khách hàng ký đồng ý" defaultTitle="Chủ nhà" onChange={setSignature} />
      <Input label="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} fullWidth />
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
        <Button
          size="sm"
          disabled={(!signature && note.trim().length < 3) || isSubmitting}
          loading={isSubmitting}
          onClick={() => onConfirm(signature ?? undefined, note.trim() || undefined)}
        >
          Xác nhận khách đồng ý
        </Button>
      </div>
    </div>
  );
}
