'use client';

import { useState } from 'react';
import { Button } from '@/components';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { RequestType } from '../../api';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AppealForm {
  userId: string;
  attendanceId: string;
  requestType: RequestType;
  workDate: string;
  oldCheckIn: string;
  oldCheckOut: string;
  requestedCheckIn: string;
  requestedCheckOut: string;
  reason: string;
}

function FormItem({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-900">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const mockEmployees = [
  { value: '1', label: 'Nguyễn Văn A' },
  { value: '2', label: 'Trần Thị B' },
  { value: '3', label: 'Lê Văn C' },
  { value: '4', label: 'Phạm Thị D' },
  { value: '5', label: 'Hoàng Văn E' },
];

export default function AddAppealModal({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<AppealForm>({
    userId: '',
    attendanceId: '',
    requestType: 'both',
    workDate: '',
    oldCheckIn: '',
    oldCheckOut: '',
    requestedCheckIn: '',
    requestedCheckOut: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof AppealForm>(field: K, value: AppealForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.userId || !form.workDate || !form.reason) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Tạo khiếu nại thành công');
      onSuccess?.();
      onClose();
      setForm({
        userId: '',
        attendanceId: '',
        requestType: 'both',
        workDate: '',
        oldCheckIn: '',
        oldCheckOut: '',
        requestedCheckIn: '',
        requestedCheckOut: '',
        reason: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const showCheckIn = form.requestType === 'check_in' || form.requestType === 'both';
  const showCheckOut = form.requestType === 'check_out' || form.requestType === 'both';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Thêm khiếu nại</h2>
            <p className="mt-0.5 text-sm text-gray-500">Tạo yêu cầu điều chỉnh chấm công</p>
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
            {/* Nhân viên */}
            <FormItem label="Nhân viên" required>
              <select
                className="form-input w-full"
                value={form.userId}
                onChange={(e) => updateField('userId', e.target.value)}
              >
                <option value="">-- Chọn nhân viên --</option>
                {mockEmployees.map((emp) => (
                  <option key={emp.value} value={emp.value}>
                    {emp.label}
                  </option>
                ))}
              </select>
            </FormItem>

            {/* Loại yêu cầu */}
            <FormItem label="Loại khiếu nại" required>
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
            <FormItem label="Ngày làm việc" required>
              <input
                type="date"
                className="form-input w-full"
                value={form.workDate}
                onChange={(e) => updateField('workDate', e.target.value)}
              />
            </FormItem>

            {/* Attendance ID */}
            <FormItem label="Mã chấm công">
              <input
                type="text"
                className="form-input w-full"
                placeholder="Nhập mã chấm công"
                value={form.attendanceId}
                onChange={(e) => updateField('attendanceId', e.target.value)}
              />
            </FormItem>

            {/* Old times */}
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

            {/* Requested times */}
            {showCheckIn && (
              <FormItem label="Check In yêu cầu" required>
                <input
                  type="time"
                  className="form-input w-full"
                  value={form.requestedCheckIn}
                  onChange={(e) => updateField('requestedCheckIn', e.target.value)}
                />
              </FormItem>
            )}
            {showCheckOut && (
              <FormItem label="Check Out yêu cầu" required>
                <input
                  type="time"
                  className="form-input w-full"
                  value={form.requestedCheckOut}
                  onChange={(e) => updateField('requestedCheckOut', e.target.value)}
                />
              </FormItem>
            )}
          </div>

          {/* Lý do */}
          <FormItem label="Lý do khiếu nại" required>
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
            {isSubmitting ? 'Đang lưu...' : 'Tạo khiếu nại'}
          </Button>
        </div>
      </div>
    </div>
  );
}
