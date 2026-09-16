'use client';

import { Modal, Button, Badge, Input, Textarea } from '@/components';
import { getRequestTypeLabel } from '@/types';
import type { AttendanceAdjustmentRequest } from '@/types';

interface Props {
  open: boolean;
  data: AttendanceAdjustmentRequest | null;
  onClose: () => void;
  isAdmin?: boolean;
  onReview?: (data: AttendanceAdjustmentRequest, action: 'approved' | 'rejected') => void;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' }> = {
  pending: { label: 'Chờ duyệt', variant: 'warning' },
  approved: { label: 'Đã duyệt', variant: 'success' },
  rejected: { label: 'Từ chối', variant: 'danger' },
};

export default function AdjustmentDetailModal({ open, data, onClose, isAdmin = false, onReview }: Props) {
  if (!data) return null;

  const statusConfig = STATUS_CONFIG[data.status] ?? STATUS_CONFIG['pending'];

  const showCheckIn =
    data.requestType === 'check_in' ||
    data.requestType === 'both' ||
    data.requestType === 'forgot_attendance' ||
    (data.requestType as string) === 'forget_checkin';
  const showCheckOut =
    data.requestType === 'check_out' ||
    data.requestType === 'both' ||
    data.requestType === 'forgot_attendance' ||
    (data.requestType as string) === 'forget_checkout';

  const isPending = data.status === 'pending';

  const footer = (
    <div className="flex items-center justify-end gap-2.5 w-full">
      <Button variant="outline" onClick={onClose}>
        Đóng
      </Button>
      {isAdmin && isPending && onReview && (
        <>
          <Button variant="danger" onClick={() => onReview(data, 'rejected')}>
            Từ chối
          </Button>
          <Button variant="primary" onClick={() => onReview(data, 'approved')}>
            Duyệt khiếu nại
          </Button>
        </>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <span>Chi tiết khiếu nại #{data.id}</span>
          <Badge variant={statusConfig.variant} pill className="text-[11px] font-bold">
            {statusConfig.label}
          </Badge>
        </div>
      }
      size="lg"
      footer={footer}
    >
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Loại khiếu nại" value={getRequestTypeLabel(data.requestType)} readOnly fullWidth />

          <Input label="Ngày làm việc" value={data.workDate || ''} readOnly fullWidth />

          {showCheckIn && <Input label="Check In cũ" value={data.oldCheckIn || '-'} readOnly fullWidth />}

          {showCheckOut && <Input label="Check Out cũ" value={data.oldCheckOut || '-'} readOnly fullWidth />}

          {showCheckIn && <Input label="Check In yêu cầu" value={data.requestedCheckIn || '-'} readOnly fullWidth />}

          {showCheckOut && <Input label="Check Out yêu cầu" value={data.requestedCheckOut || '-'} readOnly fullWidth />}
        </div>

        <Textarea label="Lý do khiếu nại" value={data.reason || ''} readOnly rows={3} fullWidth />

        {/* Thông tin duyệt (nếu đã xử lý) */}
        {(data.reviewedBy || data.reviewNote) && (
          <div className="">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.reviewedBy && <Input label="Người duyệt" value={data.reviewedBy} readOnly fullWidth />}
              {data.reviewedAt && <Input label="Thời điểm duyệt" value={new Date(data.reviewedAt).toLocaleString('vi-VN')} readOnly fullWidth />}
            </div>
            {data.reviewNote && <Textarea label="Ghi chú xét duyệt" value={data.reviewNote} readOnly rows={2} fullWidth />}
          </div>
        )}
      </div>
    </Modal>
  );
}
