'use client';

import { useState } from 'react';
import { Button } from '@/components';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createAdjustmentRequest
} from "@/actions";
import type {
  RequestType,
  AttendanceAdjustmentRequestCreate,
  Attendance,
  AdjustmentForm
} from "@/types";
import {
  useAttendances
} from "@/stores";
import FormItem from "../form-item";
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

  const {
    data,
    isLoading
  } = useAttendances();


  const attendances: Attendance[] =
    data?.items ?? [];
  const employees = Array.from(
    new Map(
      attendances
        .filter(item => item.user)
        .map(item => [
          item.userId,
          item.user
        ])
    ).values()
  );
  const handleSelectAttendance = (
    id: string
  ) => {
    const attendance =
      attendances.find(
        item =>
          String(item.id) === id
      );
    if (!attendance)
      return;
    setForm(prev => ({
      ...prev,
      attendanceId:
        String(attendance.id),
      userId:
        attendance.userId,
      workDate:
        attendance.workDate,
      oldCheckIn:
        attendance.checkIn ?? "",
      oldCheckOut:
        attendance.checkOut ?? "",
    }));
  };

  const handleSelectUser = (
    userId: string
  ) => {
    setForm(prev => ({
      ...prev,
      userId,
      attendanceId: "",
      workDate: "",
      oldCheckIn: "",
      oldCheckOut: ""
    }));

  };

  const filteredAttendances =
    form.userId
      ?
      attendances.filter(
        item =>
          item.userId === form.userId
      )
      :
      attendances;

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
      (form.requestType === "check_in" ||
        form.requestType === "both") &&
      !form.requestedCheckIn
    ) {
      toast.error("Vui lòng nhập Check In yêu cầu");
      return;
    }

    if (
      (form.requestType === "check_out" ||
        form.requestType === "both") &&
      !form.requestedCheckOut
    ) {
      toast.error("Vui lòng nhập Check Out yêu cầu");
      return;
    }
    if (
      form.attendanceId &&
      Number.isNaN(Number(form.attendanceId))
    ) {
      toast.error("Mã chấm công phải là số");
      return;
    }

    const payload: AttendanceAdjustmentRequestCreate = {
      attendanceId: form.attendanceId
        ? Number(form.attendanceId)
        : undefined,
      userId: form.userId,
      requestType: form.requestType,
      workDate: form.workDate,
      oldCheckIn: form.oldCheckIn || undefined,
      oldCheckOut: form.oldCheckOut || undefined,
      requestedCheckIn:
        form.requestType !== "check_out"
          ? form.requestedCheckIn || undefined
          : undefined,
      requestedCheckOut:
        form.requestType !== "check_in"
          ? form.requestedCheckOut || undefined
          : undefined,
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
        toast.error(
          err?.response?.data?.message ??
          "Không thể tạo khiếu nại"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!open) return null;
  const showCheckIn = form.requestType === 'check_in' || form.requestType === 'both';
  const showCheckOut = form.requestType === 'check_out' || form.requestType === 'both';
  const handleSelectWorkDate = (
    date: string
  ) => {
    const attendance =
      filteredAttendances.find(
        item => item.workDate === date
      );
    if (attendance) {
      handleSelectAttendance(
        String(attendance.id)
      );
    }
  }
  if (isLoading) {
    return (
      <div>
        Đang tải dữ liệu chấm công...
      </div>
    )
  }
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
                onChange={(e) =>
                  handleSelectUser(e.target.value)
                }
              >
                <option value="">
                  -- Chọn nhân viên --
                </option>
                {
                  employees.map(user => (
                    <option
                      key={user?.id}
                      value={user?.id}
                    >
                      {user?.fullName}
                    </option>
                  ))
                }
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
              <select
                className="form-input w-full"
                value={form.workDate}
                onChange={(e) =>
                  handleSelectWorkDate(e.target.value)
                }
              >
                <option value="">
                  -- Chọn ngày --
                </option>
                {
                  filteredAttendances.map(item => (
                    <option
                      key={item.id}
                      value={item.workDate}
                    >
                      {item.workDate}
                    </option>
                  ))
                }
              </select>
            </FormItem>

            {/* Attendance ID */}
            <FormItem label="Mã chấm công">
              <select
                className="form-input w-full"
                value={form.attendanceId}
                onChange={(e) =>
                  handleSelectAttendance(
                    e.target.value
                  )
                }
              >
                <option value="">
                  -- Chọn mã chấm công --
                </option>
                {
                  filteredAttendances.map(item => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      #{item.id}.{" ("}
                      {item.workDate}.{" "}
                      {item.user?.fullName}{")"}
                    </option>
                  ))
                }
              </select>
            </FormItem>

            {/* Old times */}
            {showCheckIn && (
              <FormItem label="Check In cũ">
                <input
                  type="time"
                  className="form-input w-full"
                  value={form.oldCheckIn}
                  readOnly
                />
              </FormItem>
            )}
            {showCheckOut && (
              <FormItem label="Check Out cũ">
                <input
                  type="time"
                  value={form.oldCheckOut}
                  readOnly
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
