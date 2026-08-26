'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Badge, Input, Textarea } from '@/components';
import { getRequestTypeLabel } from '@/types';
import type { AttendanceAdjustmentRequest } from '@/types';
import { AlertCircle } from 'lucide-react';

interface Props {
  open: boolean;
  data: AttendanceAdjustmentRequest | null;
  action: 'approved' | 'rejected' | null;
  onClose: () => void;
  onConfirm: (id: number, action: 'approved' | 'rejected', reviewNote: string) => Promise<void>;
  isLoading?: boolean;
}

export default function ReviewAdjustmentModal({ open, data, action, onClose, onConfirm, isLoading = false }: Props) {
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    if (open) {
      setReviewNote('');
    }
  }, [open]);

  if (!data) return null;

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

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        Hủy
      </Button>
      {(!action || action === 'rejected') && (
        <Button variant="danger" onClick={async () => await onConfirm(data.id, 'rejected', reviewNote)} disabled={isLoading}>
          {isLoading && action === 'rejected' ? 'Đang xử lý...' : 'Từ chối'}
        </Button>
      )}
      {(!action || action === 'approved') && (
        <Button variant="primary" onClick={async () => await onConfirm(data.id, 'approved', reviewNote)} disabled={isLoading}>
          {isLoading && action === 'approved' ? 'Đang xử lý...' : 'Duyệt khiếu nại'}
        </Button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={open}
      onClose={() => {
        if (!isLoading) onClose();
      }}
      title={`${action === 'rejected' ? 'Từ chối' : 'Phê duyệt'} khiếu nại #${data.id}`}
      size="lg"
      footer={footer}
    >
      <div className="space-y-4 py-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nhân sự" value={data.user?.fullName || ''} readOnly fullWidth />

          <Input label="Ngày làm việc" value={data.workDate || ''} readOnly fullWidth />

          <Input label="Loại khiếu nại" value={getRequestTypeLabel(data.requestType)} readOnly fullWidth />

          <div className="hidden sm:block" />

          {showCheckIn && <Input label="Check In cũ" value={data.oldCheckIn || '-'} readOnly fullWidth />}

          {showCheckOut && <Input label="Check Out cũ" value={data.oldCheckOut || '-'} readOnly fullWidth />}

          {showCheckIn && <Input label="Check In yêu cầu" value={data.requestedCheckIn || '-'} readOnly fullWidth />}

          {showCheckOut && <Input label="Check Out yêu cầu" value={data.requestedCheckOut || '-'} readOnly fullWidth />}
        </div>

        <Textarea label="Lý do khiếu nại của nhân viên" value={data.reason || ''} readOnly rows={3} fullWidth />

        {/* Ô nhập ghi chú xét duyệt */}
        <div className="pt-2 border-t border-slate-100/60">
          <Textarea
            label="Ghi chú xét duyệt (tuỳ chọn)"
            placeholder="Nhập ghi chú xét duyệt (nếu có)..."
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            rows={2}
            fullWidth
          />
        </div>
      </div>
    </Modal>
  );
}
