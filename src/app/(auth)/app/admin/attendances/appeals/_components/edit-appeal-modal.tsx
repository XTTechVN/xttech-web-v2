'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AttendanceAdjustmentRequest, RequestType } from '../../api';

interface Props {
  open: boolean;
  data: AttendanceAdjustmentRequest | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EditForm {
  requestType: RequestType;
  workDate: string;
  oldCheckIn: string;
  oldCheckOut: string;
  requestedCheckIn: string;
  requestedCheckOut: string;
  reason: string;
}

function FormItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      {children}
    </div>
  );
}

export default function EditAppealModal({ open, data, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<EditForm>({
    requestType: 'both',
    workDate: '',
    oldCheckIn: '',
    oldCheckOut: '',
    requestedCheckIn: '',
    requestedCheckOut: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Đồng bộ form khi data thay đổi
  useEffect(() => {
    if (data) {
      setForm({
        requestType: data.requestType,
        workDate: data.workDate ?? '',
        oldCheckIn: data.oldCheckIn ?? '',
        oldCheckOut: data.oldCheckOut ?? '',
        requestedCheckIn: data.requestedCheckIn ?? '',
        requestedCheckOut: data.requestedCheckOut ?? '',
        reason: data.reason ?? '',
      });
    }
  }, [data]);

  const updateField = <K extends keyof EditForm>(field: K, value: EditForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.reason) {
      toast.error('Vui lòng nhập lý do khiếu nại');
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Cập nhật khiếu nại thành công');
      onSuccess?.();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open || !data) return null;

  const showCheckIn = form.requestType === 'check_in' || form.requestType === 'both';
  const showCheckOut = form.requestType === 'check_out' || form.requestType === 'both';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Chỉnh sửa khiếu nại #{data.id}</h2>
            <p className="mt-0.5 text-sm text-gray-500">Cập nhật thông tin yêu cầu điều chỉnh</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Loại yêu cầu */}
            <FormItem label="Loại khiếu nại">
              <select
                className="form-input w-full"
                value={form.requestType}
                onChange={(e) => updateField('requestType', e.target.value as RequestType)}
              >
                <option value="check_in">Điều chỉnh Check In</option>
                <option value="check_out">Điều chỉnh Check Out</option>
                <option value="both">Điều chỉnh cả hai</option>
              </select>
            </FormItem>

            {/* Ngày làm việc */}
            <FormItem label="Ngày làm việc">
              <input
                type="date"
                className="form-input w-full"
                value={form.workDate}
                onChange={(e) => updateField('workDate', e.target.value)}
              />
            </FormItem>

            {showCheckIn && (
              <FormItem label="Check In cũ">
                <input
                  type="time"
                  className="form-input w-full"
                  value={form.oldCheckIn}
                  onChange={(e) => updateField('oldCheckIn', e.target.value)}
                />
              </FormItem>
            )}
            {showCheckOut && (
              <FormItem label="Check Out cũ">
                <input
                  type="time"
                  className="form-input w-full"
                  value={form.oldCheckOut}
                  onChange={(e) => updateField('oldCheckOut', e.target.value)}
                />
              </FormItem>
            )}
            {showCheckIn && (
              <FormItem label="Check In yêu cầu">
                <input
                  type="time"
                  className="form-input w-full"
                  value={form.requestedCheckIn}
                  onChange={(e) => updateField('requestedCheckIn', e.target.value)}
                />
              </FormItem>
            )}
            {showCheckOut && (
              <FormItem label="Check Out yêu cầu">
                <input
                  type="time"
                  className="form-input w-full"
                  value={form.requestedCheckOut}
                  onChange={(e) => updateField('requestedCheckOut', e.target.value)}
                />
              </FormItem>
            )}
          </div>

          <FormItem label="Lý do khiếu nại">
            <textarea
              className="form-input w-full min-h-[100px] resize-y"
              placeholder="Nhập lý do khiếu nại..."
              value={form.reason}
              onChange={(e) => updateField('reason', e.target.value)}
            />
          </FormItem>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>
    </div>
  );
}
