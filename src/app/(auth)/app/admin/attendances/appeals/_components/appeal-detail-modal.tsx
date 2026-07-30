'use client';

import { Badge } from '@/components';
import { X, Clock, Calendar, User, FileText, CheckCircle, XCircle } from 'lucide-react';
import type { AttendanceAdjustmentRequest } from '../../api';

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
  both: 'Điều chỉnh cả hai',
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' }> = {
  pending: { label: 'Chờ duyệt', variant: 'warning' },
  approved: { label: 'Đã duyệt', variant: 'success' },
  rejected: { label: 'Từ chối', variant: 'danger' },
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm font-medium text-slate-500 shrink-0">{label}</span>
      <span className="text-sm text-slate-800 text-right">{value || '-'}</span>
    </div>
  );
}

export default function AppealDetailModal({ open, data, onClose, onApprove, onReject, canReview }: Props) {
  if (!open || !data) return null;

  const statusConfig = STATUS_CONFIG[data.status] ?? STATUS_CONFIG['pending'];
  const isPending = data.status === 'pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Chi tiết khiếu nại #{data.id}</h2>
            <p className="mt-0.5 text-sm text-slate-500">Yêu cầu điều chỉnh chấm công</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-5">
          {/* Trạng thái */}
          <div className="flex items-center gap-2">
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
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
          <div className="text-xs text-slate-400 space-y-0.5">
            {data.createdAt && <p>Tạo lúc: {new Date(data.createdAt).toLocaleString('vi-VN')}</p>}
            {data.updatedAt && <p>Cập nhật: {new Date(data.updatedAt).toLocaleString('vi-VN')}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          {canReview && isPending && (
            <>
              <button
                onClick={() => onReject?.(data.id)}
                className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition"
              >
                <XCircle size={15} />
                Từ chối
              </button>
              <button
                onClick={() => onApprove?.(data.id)}
                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
              >
                <CheckCircle size={15} />
                Phê duyệt
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
