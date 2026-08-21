'use client';

import { Modal, Button, Badge } from '@/components';
import { Clock, Calendar, User, FileText, CheckCircle, XCircle } from 'lucide-react';
import type { AttendanceAdjustmentRequest } from '@/types';

interface Props {
  open: boolean;
  data: AttendanceAdjustmentRequest | null;
  onClose: () => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  canReview?: boolean;
}

const REQUEST_TYPE_LABEL: Record<string, string> = {
  check_in: 'Điều chỉnh Check In',
  check_out: 'Điều chỉnh Check Out',
  forgot_attendance: 'Quên điểm danh',
  both: 'Điều chỉnh cả hai',
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' }> = {
  pending: { label: 'Chờ duyệt', variant: 'warning' },
  approved: { label: 'Đã duyệt', variant: 'success' },
  rejected: { label: 'Từ chối', variant: 'danger' },
};

function InfoRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm font-medium text-slate-500 shrink-0">{label}</span>
      <span className="text-sm text-slate-800 text-right">{value || '-'}</span>
    </div>
  );
}

export default function AdjustmentDetailModal({ open, data, onClose, onApprove, onReject, canReview }: Props) {
  if (!data) return null;

  const statusConfig = STATUS_CONFIG[data.status] ?? STATUS_CONFIG['pending'];
  const isPending = data.status === 'pending';

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="outline" onClick={onClose}>
        Đóng
      </Button>
      {canReview && isPending && (
        <>
          <Button
            variant="primary"
            className="bg-rose-500 hover:bg-rose-600 border-0 text-white font-bold"
            onClick={() => onReject?.(data.id)}
          >
            Từ chối
          </Button>
          <Button
            variant="primary"
            className="bg-[#0CBFDF] hover:bg-[#0bb1ce] border-0 text-white font-bold"
            onClick={() => onApprove?.(data.id)}
          >
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
      title={`Chi tiết khiếu nại #${data.id}`}
      size="md"
      footer={footer}
    >
      <div className="space-y-4 py-2">
        {/* Status */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs text-slate-500 font-medium">Trạng thái xử lý</span>
          <Badge variant={statusConfig.variant} pill>{statusConfig.label}</Badge>
        </div>

        {/* Thông tin cơ bản */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-1">
          <InfoRow
            label={<><Calendar size={13} className="inline mr-1" />Ngày làm việc</>}
            value={data.workDate}
          />
          <InfoRow
            label={<><FileText size={13} className="inline mr-1" />Loại yêu cầu</>}
            value={REQUEST_TYPE_LABEL[data.requestType] ?? data.requestType}
          />
          {data.attendanceId && (
            <InfoRow label="Mã chấm công" value={`#${data.attendanceId}`} />
          )}
        </div>

        {/* Thời gian Check In */}
        {(data.oldCheckIn || data.requestedCheckIn) && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Clock size={12} className="inline mr-1" />Check In
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-1 text-xs text-slate-400">Giá trị cũ</p>
                <p className="text-sm font-semibold text-slate-700">{data.oldCheckIn || '-'}</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                <p className="mb-1 text-xs text-blue-400">Yêu cầu điều chỉnh</p>
                <p className="text-sm font-semibold text-blue-700">{data.requestedCheckIn || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Thời gian Check Out */}
        {(data.oldCheckOut || data.requestedCheckOut) && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Clock size={12} className="inline mr-1" />Check Out
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-1 text-xs text-slate-400">Giá trị cũ</p>
                <p className="text-sm font-semibold text-slate-700">{data.oldCheckOut || '-'}</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                <p className="mb-1 text-xs text-blue-400">Yêu cầu điều chỉnh</p>
                <p className="text-sm font-semibold text-blue-700">{data.requestedCheckOut || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Lý do */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Lý do khiếu nại</p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            {data.reason || '-'}
          </div>
        </div>

        {/* Thông tin duyệt (nếu đã xử lý) */}
        {(data.reviewedBy || data.reviewNote) && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <User size={12} className="inline mr-1" />Thông tin xét duyệt
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-1">
              {data.reviewedBy && <InfoRow label="Người duyệt" value={data.reviewedBy} />}
              {data.reviewedAt && <InfoRow label="Thời điểm duyệt" value={new Date(data.reviewedAt).toLocaleString('vi-VN')} />}
              {data.reviewNote && <InfoRow label="Ghi chú" value={data.reviewNote} />}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-slate-400 space-y-0.5 pt-1">
          {data.createdAt && <p>Tạo lúc: {new Date(data.createdAt).toLocaleString('vi-VN')}</p>}
          {data.updatedAt && <p>Cập nhật: {new Date(data.updatedAt).toLocaleString('vi-VN')}</p>}
        </div>
      </div>
    </Modal>
  );
}
