'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Select, Input, Textarea } from '@/components';
import toast from 'react-hot-toast';
import { updateAdjustmentRequest } from "@/actions";
import type { AttendanceAdjustmentRequest, RequestType, AttendanceAdjustmentRequestUpdate } from "@/types";

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

export default function EditAdjustmentModal({ open, data, onClose, onSuccess }: Props) {
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
    if (!data) return;
    if (!form.reason) {
      toast.error('Vui lòng nhập lý do khiếu nại');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: AttendanceAdjustmentRequestUpdate = {
        requestType: form.requestType,
        requestedCheckIn: form.requestedCheckIn || null,
        requestedCheckOut: form.requestedCheckOut || null,
        reason: form.reason,
        workDate: form.workDate,
        status: data.status ?? "pending",
      };
      await updateAdjustmentRequest(data.id, payload);
      toast.success('Cập nhật khiếu nại thành công');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail?.[0]?.msg || "Cập nhật thất bại"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!data) return null;

  const showCheckIn = form.requestType === 'check_in' || form.requestType === 'both';
  const showCheckOut = form.requestType === 'check_out' || form.requestType === 'both';

  const requestTypeOptions = [
    { value: "check_in", label: "Điều chỉnh Check In" },
    { value: "check_out", label: "Điều chỉnh Check Out" },
    { value: "both", label: "Điều chỉnh cả hai" },
  ];

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
        Hủy
      </Button>
      <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={`Chỉnh sửa khiếu nại #${data.id}`}
      size="lg"
      footer={footer}
    >
      <div className="space-y-4 py-2">
        <p className="text-xs text-slate-500 mb-2">Cập nhật thông tin yêu cầu điều chỉnh</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Loại khiếu nại"
            options={requestTypeOptions}
            value={form.requestType}
            onChange={(e) => updateField('requestType', e.target.value as RequestType)}
            fullWidth
          />

          <Input
            label="Ngày làm việc"
            type="date"
            value={form.workDate}
            onChange={(e) => updateField('workDate', e.target.value)}
            fullWidth
          />

          {showCheckIn && (
            <Input
              label="Check In cũ"
              type="time"
              value={form.oldCheckIn}
              onChange={(e) => updateField('oldCheckIn', e.target.value)}
              fullWidth
            />
          )}

          {showCheckOut && (
            <Input
              label="Check Out cũ"
              type="time"
              value={form.oldCheckOut}
              onChange={(e) => updateField('oldCheckOut', e.target.value)}
              fullWidth
            />
          )}

          {showCheckIn && (
            <Input
              label="Check In yêu cầu"
              type="time"
              value={form.requestedCheckIn}
              onChange={(e) => updateField('requestedCheckIn', e.target.value)}
              fullWidth
            />
          )}

          {showCheckOut && (
            <Input
              label="Check Out yêu cầu"
              type="time"
              value={form.requestedCheckOut}
              onChange={(e) => updateField('requestedCheckOut', e.target.value)}
              fullWidth
            />
          )}
        </div>

        <Textarea
          label="Lý do khiếu nại"
          placeholder="Nhập lý do khiếu nại..."
          value={form.reason}
          onChange={(e) => updateField('reason', e.target.value)}
          rows={3}
          fullWidth
        />
      </div>
    </Modal>
  );
}
