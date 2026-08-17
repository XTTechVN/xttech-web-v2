'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Badge, Textarea } from '@/components';
import { CheckCircle2, XCircle, Clock, Calendar, User, FileText, AlertCircle } from 'lucide-react';
import type { AttendanceAdjustmentRequest, RequestType } from '@/types';
import { formatDateVN } from '../attendance-modal';

interface Props {
  open: boolean;
  data: AttendanceAdjustmentRequest | null;
  action: 'approved' | 'rejected' | null;
  employeeName?: string;
  onClose: () => void;
  onConfirm: (id: number, action: 'approved' | 'rejected', reviewNote: string) => Promise<void>;
  isLoading?: boolean;
}

const REQUEST_TYPE_LABEL: Record<string, string> = {
  check_in: 'Điều chỉnh Check In',
  check_out: 'Điều chỉnh Check Out',
  forgot_attendance: 'Quên điểm danh',
  both: 'Điều chỉnh Check In & Out',
};

export default function ReviewAdjustmentModal({
  open,
  data,
  action,
  employeeName = 'Nhân sự',
  onClose,
  onConfirm,
  isLoading = false,
}: Props) {
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    if (open) {
      setReviewNote('');
    }
  }, [open]);

  if (!data) return null;

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        Hủy
      </Button>
      <Button
        className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/20"
        leftIcon={<XCircle size={16} />}
        onClick={async () => await onConfirm(data.id, 'rejected', reviewNote)}
        disabled={isLoading}
      >
        {isLoading ? 'Đang xử lý...' : 'Từ chối'}
      </Button>
      <Button
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
        leftIcon={<CheckCircle2 size={16} />}
        onClick={async () => await onConfirm(data.id, 'approved', reviewNote)}
        disabled={isLoading}
      >
        {isLoading ? 'Đang xử lý...' : 'Chấp thuận'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={open}
      onClose={() => { if (!isLoading) onClose(); }}
      title={`Xét duyệt khiếu nại #${data.id}`}
      size="md"
      footer={footer}
    >
      <div className="space-y-4 py-1">
        {/* Banner cảnh báo xem trước */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl border border-teal-200 bg-teal-50/80 text-teal-900 text-xs font-medium">
          <AlertCircle size={18} className="text-teal-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Xem trước thông tin điều chỉnh khiếu nại</p>
            <p className="mt-0.5 opacity-90">
              Vui lòng kiểm tra dữ liệu cũ và mới trước khi bấm <strong>Chấp thuận</strong> hoặc <strong>Từ chối</strong>.
            </p>
          </div>
        </div>

        {/* Thông tin nhân viên & yêu cầu */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
              <User size={13} className="text-slate-400" /> Nhân sự:
            </span>
            <span className="font-bold text-slate-900 text-sm">{employeeName}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200/50 pt-2">
            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" /> Ngày làm việc:
            </span>
            <span className="font-bold text-slate-800">{formatDateVN(data.workDate)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200/50 pt-2">
            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
              <FileText size={13} className="text-slate-400" /> Loại khiếu nại:
            </span>
            <Badge variant="info">{REQUEST_TYPE_LABEL[data.requestType] || data.requestType}</Badge>
          </div>
        </div>

        {/* Preview Thay đổi thời gian */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Clock size={13} /> Dữ liệu chấm công điều chỉnh
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Check In */}
            {(data.oldCheckIn || data.requestedCheckIn || data.requestType === 'check_in' || data.requestType === 'both' || data.requestType === 'forgot_attendance') && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Check In</span>
                <div className="flex items-center gap-2">
                  <span className="line-through text-slate-400 font-medium">{data.oldCheckIn || '--:--'}</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    {data.requestedCheckIn || '--:--'}
                  </span>
                </div>
              </div>
            )}
            {/* Check Out */}
            {(data.oldCheckOut || data.requestedCheckOut || data.requestType === 'check_out' || data.requestType === 'both' || data.requestType === 'forgot_attendance') && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Check Out</span>
                <div className="flex items-center gap-2">
                  <span className="line-through text-slate-400 font-medium">{data.oldCheckOut || '--:--'}</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    {data.requestedCheckOut || '--:--'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lý do của user */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Lý do khiếu nại của nhân viên</span>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 italic">
            &quot;{data.reason || 'Không có lý do'}&quot;
          </div>
        </div>

        {/* Ô nhập ghi chú xét duyệt */}
        <div>
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
