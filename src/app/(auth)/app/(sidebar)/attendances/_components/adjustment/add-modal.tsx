'use client';

import { useState } from 'react';
import { Modal, Button, Select, Input, Textarea } from '@/components';
import toast from 'react-hot-toast';
import { createAdjustmentRequest } from "@/actions";
import type {
  RequestType,
  AttendanceAdjustmentRequestCreate,
  Attendance,
  AdjustmentForm
} from "@/types";
import { useAttendances } from "@/stores";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddAdjustmentModal({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<AdjustmentForm>({
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

  const { data, isLoading } = useAttendances();

  const attendances: Attendance[] = data?.items ?? [];
  const employees = Array.from(
    new Map(
      attendances
        .filter(item => item.user)
        .map(item => [item.userId, item.user])
    ).values()
  );

  const handleSelectAttendance = (id: string) => {
    const attendance = attendances.find(item => String(item.id) === id);
    if (!attendance) return;
    setForm(prev => ({
      ...prev,
      attendanceId: String(attendance.id),
      userId: attendance.userId,
      workDate: attendance.workDate,
      oldCheckIn: attendance.checkIn ?? "",
      oldCheckOut: attendance.checkOut ?? "",
    }));
  };

  const handleSelectUser = (userId: string) => {
    setForm(prev => ({
      ...prev,
      userId,
      attendanceId: "",
      workDate: "",
      oldCheckIn: "",
      oldCheckOut: ""
    }));
  };

  const filteredAttendances = form.userId
    ? attendances.filter(item => item.userId === form.userId)
    : attendances;

  const updateField = <K extends keyof AdjustmentForm>(field: K, value: AdjustmentForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.userId) {
      toast.error("Vui lòng chọn nhân viên");
      return;
    }

    if (!form.workDate) {
      toast.error("Vui lòng chọn ngày làm việc");
      return;
    }

    if (!form.reason.trim()) {
      toast.error("Vui lòng nhập lý do");
      return;
    }

    if (
      (form.requestType === "check_in" || form.requestType === "both") &&
      !form.requestedCheckIn
    ) {
      toast.error("Vui lòng nhập Check In yêu cầu");
      return;
    }

    if (
      (form.requestType === "check_out" || form.requestType === "both") &&
      !form.requestedCheckOut
    ) {
      toast.error("Vui lòng nhập Check Out yêu cầu");
      return;
    }

    if (form.attendanceId && Number.isNaN(Number(form.attendanceId))) {
      toast.error("Mã chấm công phải là số");
      return;
    }

    const payload: AttendanceAdjustmentRequestCreate = {
      attendanceId: form.attendanceId ? Number(form.attendanceId) : undefined,
      userId: form.userId,
      requestType: form.requestType,
      workDate: form.workDate,
      oldCheckIn: form.oldCheckIn || undefined,
      oldCheckOut: form.oldCheckOut || undefined,
      requestedCheckIn:
        form.requestType !== "check_out" ? form.requestedCheckIn || undefined : undefined,
      requestedCheckOut:
        form.requestType !== "check_in" ? form.requestedCheckOut || undefined : undefined,
      reason: form.reason.trim(),
      status: "pending",
    };

    setIsSubmitting(true);
    try {
      await createAdjustmentRequest(payload);
      toast.success("Tạo khiếu nại thành công");
      setForm({
        userId: "",
        attendanceId: "",
        requestType: "both",
        workDate: "",
        oldCheckIn: "",
        oldCheckOut: "",
        requestedCheckIn: "",
        requestedCheckOut: "",
        reason: "",
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const errors = err?.response?.data?.detail;
      if (Array.isArray(errors)) {
        errors.forEach((item: any) => {
          toast.error(item.msg);
        });
      } else {
        toast.error(err?.response?.data?.message ?? "Không thể tạo khiếu nại");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const showCheckIn = form.requestType === 'check_in' || form.requestType === 'both';
  const showCheckOut = form.requestType === 'check_out' || form.requestType === 'both';

  const handleSelectWorkDate = (date: string) => {
    const attendance = filteredAttendances.find(item => item.workDate === date);
    if (attendance) {
      handleSelectAttendance(String(attendance.id));
    }
  };

  const employeeOptions = [
    { value: "", label: "-- Chọn nhân viên --" },
    ...employees.map(user => ({ value: user?.id ?? "", label: user?.fullName ?? "Không tên" }))
  ];

  const requestTypeOptions = [
    { value: "check_in", label: "Điều chỉnh Check In" },
    { value: "check_out", label: "Điều chỉnh Check Out" },
    { value: "both", label: "Điều chỉnh cả hai" },
  ];

  const workDateOptions = [
    { value: "", label: "-- Chọn ngày --" },
    ...filteredAttendances.map(item => ({ value: item.workDate, label: item.workDate }))
  ];

  const attendanceOptions = [
    { value: "", label: "-- Chọn mã chấm công --" },
    ...filteredAttendances.map(item => ({
      value: String(item.id),
      label: `#${item.id}. (${item.workDate}. ${item.user?.fullName})`
    }))
  ];

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
        Hủy
      </Button>
      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Đang lưu...' : 'Tạo khiếu nại'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Thêm khiếu nại"
      size="lg"
      footer={footer}
    >
      <div className="space-y-4 py-2">
        <p className="text-xs text-slate-500 mb-2">Tạo yêu cầu điều chỉnh chấm công mới</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Nhân viên *"
            options={employeeOptions}
            value={form.userId}
            onChange={(e) => handleSelectUser(e.target.value)}
            disabled={isLoading}
            fullWidth
          />

          <Select
            label="Loại khiếu nại *"
            options={requestTypeOptions}
            value={form.requestType}
            onChange={(e) => updateField('requestType', e.target.value as RequestType)}
            fullWidth
          />

          <Select
            label="Ngày làm việc *"
            options={workDateOptions}
            value={form.workDate}
            onChange={(e) => handleSelectWorkDate(e.target.value)}
            fullWidth
          />

          <Select
            label="Mã chấm công"
            options={attendanceOptions}
            value={form.attendanceId}
            onChange={(e) => handleSelectAttendance(e.target.value)}
            fullWidth
          />

          {showCheckIn && (
            <Input
              label="Check In cũ"
              type="time"
              value={form.oldCheckIn}
              readOnly
              fullWidth
            />
          )}

          {showCheckOut && (
            <Input
              label="Check Out cũ"
              type="time"
              value={form.oldCheckOut}
              readOnly
              fullWidth
            />
          )}

          {showCheckIn && (
            <Input
              label="Check In yêu cầu *"
              type="time"
              value={form.requestedCheckIn}
              onChange={(e) => updateField('requestedCheckIn', e.target.value)}
              fullWidth
            />
          )}

          {showCheckOut && (
            <Input
              label="Check Out yêu cầu *"
              type="time"
              value={form.requestedCheckOut}
              onChange={(e) => updateField('requestedCheckOut', e.target.value)}
              fullWidth
            />
          )}
        </div>

        <Textarea
          label="Lý do khiếu nại *"
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
