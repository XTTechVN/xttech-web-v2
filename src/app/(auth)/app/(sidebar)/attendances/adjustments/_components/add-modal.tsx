'use client';

import { useMemo, useState, useEffect } from 'react';
import { Modal, Button, Select, Input, Textarea } from '@/components';
import toast from 'react-hot-toast';
import { createAdjustmentRequest, getUsers } from '@/actions';
import type { RequestType, AttendanceAdjustmentRequestCreate, Attendance, AdjustmentForm } from '@/types';
import { useAttendances } from '@/stores';
import { usePermission } from '@/hooks';
import { useQuery } from '@tanstack/react-query';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  data?: Attendance | null;
}

export default function AddAdjustmentModal({ open, onClose, onSuccess, data }: Props) {
  const { user: currentUser, isManager: isAdmin } = usePermission();

  const [form, setForm] = useState<AdjustmentForm>({
    userId: '',
    attendanceId: '',
    requestType: 'check_in',
    workDate: '',
    oldCheckIn: '',
    oldCheckOut: '',
    requestedCheckIn: '',
    requestedCheckOut: '',
    reason: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert time ISO/string -> HH:mm
  const formatTime = (value?: string | null): string => {
    if (!value) return '';
    if (value.includes('T')) {
      return value.substring(11, 16);
    }
    return value.substring(0, 5);
  };

  useEffect(() => {
    if (open) {
      if (data) {
        // Trường hợp 1: Có dữ liệu attendance truyền vào (từ bảng chấm công)
        const uId = data.userId || data.user?.id || (currentUser && !isAdmin ? currentUser.id : '');
        const wDate = data.workDate ? String(data.workDate).slice(0, 10) : '';
        setForm({
          userId: uId,
          attendanceId: data.id ? String(data.id) : '',
          requestType: 'check_in',
          workDate: wDate,
          oldCheckIn: formatTime(data.checkIn),
          oldCheckOut: formatTime(data.checkOut),
          requestedCheckIn: '',
          requestedCheckOut: '',
          reason: '',
        });
      } else {
        // Trường hợp 2: Được render từ trang danh sách khiếu nại (không có data)
        setForm({
          userId: currentUser && !isAdmin ? currentUser.id : '',
          attendanceId: '',
          requestType: 'forgot_attendance',
          workDate: '',
          oldCheckIn: '',
          oldCheckOut: '',
          requestedCheckIn: '',
          requestedCheckOut: '',
          reason: '',
        });
      }
    }
  }, [open, data, currentUser, isAdmin]);

  // USERS LIST
  const { data: usersList, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => getUsers({ limit: 9999 }),
  });

  const employees = useMemo(() => usersList?.items ?? [], [usersList]);

  const employeeOptions = useMemo(() => {
    const list = [...employees] as any[];
    console.log('--- employeeOptions ---');
    console.log('currentUser:', currentUser);
    console.log('employees list:', list);

    if (data?.user && !list.some((u) => u.id === data.user?.id)) {
      list.unshift(data.user);
    }
    // Đưa bản thân lên đầu danh sách chọn
    if (currentUser?.id) {
      list.sort((a, b) => {
        const aId = String(a.id);
        const bId = String(b.id);
        const currentId = String(currentUser.id);
        if (aId === currentId) return -1;
        if (bId === currentId) return 1;
        return 0;
      });
    }

    console.log('sorted list:', list);

    return [
      {
        value: '',
        label: 'Chọn nhân viên',
      },
      ...list.map((user) => ({
        value: user?.id ?? '',
        label: user?.fullName ?? user?.email ?? 'Không tên',
      })),
    ];
  }, [employees, data, currentUser]);

  // ATTENDANCES LIST
  const { data: attendancesData, isLoading: isLoadingAttendances } = useAttendances();

  const attendances: Attendance[] = useMemo(() => attendancesData?.items ?? [], [attendancesData]);

  const resetForm = () => {
    if (data) {
      const uId = data.userId || data.user?.id || (currentUser && !isAdmin ? currentUser.id : '');
      const wDate = data.workDate ? String(data.workDate).slice(0, 10) : '';
      setForm({
        userId: uId,
        attendanceId: data.id ? String(data.id) : '',
        requestType: 'check_in',
        workDate: wDate,
        oldCheckIn: formatTime(data.checkIn),
        oldCheckOut: formatTime(data.checkOut),
        requestedCheckIn: '',
        requestedCheckOut: '',
        reason: '',
      });
    } else {
      setForm({
        userId: currentUser && !isAdmin ? currentUser.id : '',
        attendanceId: '',
        requestType: 'forgot_attendance',
        workDate: '',
        oldCheckIn: '',
        oldCheckOut: '',
        requestedCheckIn: '',
        requestedCheckOut: '',
        reason: '',
      });
    }
  };

  const handleCreateError = (err: any) => {
    console.error('Create adjustment error:', err);
    const responseData = err?.response?.data;

    if (Array.isArray(responseData?.detail)) {
      responseData.detail.forEach((item: any) => {
        toast.error(item?.msg ?? 'Dữ liệu không hợp lệ');
      });
      return;
    }

    if (typeof responseData?.detail === 'string') {
      toast.error(responseData.detail);
      return;
    }

    if (typeof responseData?.message === 'string') {
      toast.error(responseData.message);
      return;
    }

    if (err?.response?.status) {
      toast.error(`Lỗi server (${err.response.status})`);
      return;
    }

    toast.error('Không thể tạo khiếu nại');
  };

  const isMissingAttendance = !data && form.requestType === 'forgot_attendance';

  const selectedAttendance = useMemo(() => {
    if (data) {
      return data;
    }
    if (!form.userId || !form.workDate || isMissingAttendance) {
      return undefined;
    }
    return attendances.find((attendance) => {
      const attendanceUserId = attendance.userId ?? attendance.user?.id;
      const attendanceDate = attendance.workDate;
      return String(attendanceUserId) === String(form.userId) && String(attendanceDate).slice(0, 10) === form.workDate;
    });
  }, [data, attendances, form.userId, form.workDate, isMissingAttendance]);

  const handleSelectUser = (userId: string) => {
    setForm((prev) => ({
      ...prev,
      userId,
      attendanceId: '',
      workDate: '',
      oldCheckIn: '',
      oldCheckOut: '',
      requestedCheckIn: '',
      requestedCheckOut: '',
    }));
  };

  const handleSelectWorkDate = (date: string) => {
    if (form.requestType === 'forgot_attendance') {
      setForm((prev) => ({
        ...prev,
        workDate: date,
        attendanceId: '',
        oldCheckIn: '',
        oldCheckOut: '',
      }));
      return;
    }

    const attendance = attendances.find((item) => String(item.userId) === String(form.userId) && String(item.workDate).slice(0, 10) === date);

    setForm((prev) => ({
      ...prev,
      workDate: date,
      attendanceId: attendance?.id != null ? String(attendance.id) : '',
      oldCheckIn: formatTime(attendance?.checkIn),
      oldCheckOut: formatTime(attendance?.checkOut),
    }));
  };

  const handleChangeRequestType = (requestType: RequestType) => {
    if (data) {
      setForm((prev) => ({
        ...prev,
        requestType,
        attendanceId: data.id ? String(data.id) : '',
        oldCheckIn: formatTime(data.checkIn),
        oldCheckOut: formatTime(data.checkOut),
        requestedCheckIn: '',
        requestedCheckOut: '',
      }));
      return;
    }

    if (requestType === 'forgot_attendance') {
      setForm((prev) => ({
        ...prev,
        requestType,
        attendanceId: '',
        oldCheckIn: '',
        oldCheckOut: '',
        requestedCheckIn: '',
        requestedCheckOut: '',
      }));
      return;
    }

    let attendance: Attendance | undefined;
    if (form.userId && form.workDate) {
      attendance = attendances.find((item) => String(item.userId) === String(form.userId) && String(item.workDate).slice(0, 10) === form.workDate);
    }

    setForm((prev) => ({
      ...prev,
      requestType,
      attendanceId: attendance?.id != null ? String(attendance.id) : '',
      oldCheckIn: attendance ? formatTime(attendance.checkIn) : '',
      oldCheckOut: attendance ? formatTime(attendance.checkOut) : '',
      requestedCheckIn: '',
      requestedCheckOut: '',
    }));
  };

  const updateField = <K extends keyof AdjustmentForm>(field: K, value: AdjustmentForm[K]) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.userId) {
      toast.error('Vui lòng chọn nhân viên');
      return;
    }

    if (!form.workDate) {
      toast.error('Vui lòng chọn ngày làm việc');
      return;
    }

    if (!form.reason.trim()) {
      toast.error('Vui lòng nhập lý do');
      return;
    }

    // TH 2: Render từ trang danh sách khiếu nại (Quên chấm công)
    if (!data && form.requestType === 'forgot_attendance') {
      if (!form.requestedCheckIn && !form.requestedCheckOut) {
        toast.error('Vui lòng nhập Check In hoặc Check Out yêu cầu');
        return;
      }

      const payload: AttendanceAdjustmentRequestCreate = {
        attendanceId: undefined,
        userId: form.userId,
        requestType: form.requestType,
        workDate: form.workDate,
        oldCheckIn: undefined,
        oldCheckOut: undefined,
        requestedCheckIn: form.requestedCheckIn || undefined,
        requestedCheckOut: form.requestedCheckOut || undefined,
        reason: form.reason.trim(),
        status: 'pending',
      };

      setIsSubmitting(true);
      try {
        await createAdjustmentRequest(payload);
        toast.success('Tạo khiếu nại thành công');
        resetForm();
        onSuccess?.();
        onClose();
      } catch (err: any) {
        handleCreateError(err);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // TH 1: Khi có dữ liệu attendance truyền vào (Quên checkin hoặc Quên checkout)
    const targetAttendance = data;
    if (!targetAttendance) {
      toast.error('Không tìm thấy dữ liệu chấm công trong ngày này');
      return;
    }

    if (form.requestType === 'check_in' && !form.requestedCheckIn) {
      toast.error('Vui lòng nhập Check In yêu cầu');
      return;
    }

    if (form.requestType === 'check_out' && !form.requestedCheckOut) {
      toast.error('Vui lòng nhập Check Out yêu cầu');
      return;
    }

    const payload: AttendanceAdjustmentRequestCreate = {
      attendanceId: Number(targetAttendance.id),
      userId: form.userId,
      requestType: form.requestType,
      workDate: form.workDate,
      oldCheckIn: form.requestType === 'check_in' ? form.oldCheckIn || undefined : undefined,
      oldCheckOut: form.requestType === 'check_out' ? form.oldCheckOut || undefined : undefined,
      requestedCheckIn: form.requestType === 'check_in' ? form.requestedCheckIn || undefined : undefined,
      requestedCheckOut: form.requestType === 'check_out' ? form.requestedCheckOut || undefined : undefined,
      reason: form.reason.trim(),
      status: 'pending',
    };

    setIsSubmitting(true);
    try {
      const res = await createAdjustmentRequest(payload);
      // console.log(res);
      toast.success('Tạo khiếu nại thành công');
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      // handleCreateError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showOldCheckIn = Boolean(data) && form.requestType === 'check_in';
  const showOldCheckOut = Boolean(data) && form.requestType === 'check_out';

  const showRequestedCheckIn = form.requestType === 'check_in' || form.requestType === 'both' || form.requestType === 'forgot_attendance';

  const showRequestedCheckOut = form.requestType === 'check_out' || form.requestType === 'both' || form.requestType === 'forgot_attendance';

  // RequestType Options
  // 1. Khi có data truyền vào: Chỉ hiển thị "Quên checkin" hoặc "Quên checkout"
  // 2. Khi không có data (render từ trang danh sách khiếu nại): Chỉ hiển thị "Quên chấm công"
  const requestTypeOptions = useMemo(() => {
    if (data) {
      return [
        {
          value: 'check_in',
          label: 'Quên checkin',
        },
        {
          value: 'check_out',
          label: 'Quên checkout',
        },
      ];
    }
    return [
      {
        value: 'forgot_attendance',
        label: 'Quên chấm công',
      },
    ];
  }, [data]);

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
        Hủy
      </Button>

      <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Đang lưu...' : 'Tạo khiếu nại'}
      </Button>
    </div>
  );

  return (
    <Modal isOpen={open} onClose={onClose} title="Thêm khiếu nại" size="lg" footer={footer}>
      <div className="space-y-4 py-2">
        <p className="text-xs text-slate-500 mb-2">Tạo yêu cầu điều chỉnh chấm công mới</p>
        {/* USER + DATE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Nhân viên *"
            options={employeeOptions}
            value={form.userId}
            onChange={(e) => handleSelectUser(e.target.value)}
            disabled={Boolean(data) || isLoadingUsers || !isAdmin}
            fullWidth
          />

          <Input
            label="Ngày làm việc *"
            value={form.workDate}
            onChange={(e) => handleSelectWorkDate(e.target.value)}
            disabled={Boolean(data)}
            fullWidth
            type="date"
          />
        </div>

        {/* REQUEST TYPE */}
        <Select
          label="Loại khiếu nại *"
          options={requestTypeOptions}
          value={form.requestType}
          onChange={(e) => handleChangeRequestType(e.target.value as RequestType)}
          fullWidth
        />

        {/* ATTENDANCE STATUS INFO */}
        {/* {form.userId && form.workDate && !isMissingAttendance && (
          <div className="text-xs">
            {isLoadingAttendances ? (
              <p className="text-slate-500">
                Đang tìm dữ liệu chấm công...
              </p>
            ) : selectedAttendance ? (
              <p className="text-green-600">
                Đã tìm thấy dữ liệu chấm công ngày {form.workDate}.
              </p>
            ) : (
              <p className="text-red-500">
                Không tìm thấy dữ liệu chấm công ngày {form.workDate}.
              </p>
            )}
          </div>
        )} */}

        {/* OLD CHECK IN */}
        {showOldCheckIn && (
          <Input
            label="Check In cũ"
            type="time"
            value={form.oldCheckIn}
            onChange={(e) => updateField('oldCheckIn', e.target.value)}
            disabled
            fullWidth
          />
        )}

        {/* OLD CHECK OUT */}
        {showOldCheckOut && (
          <Input
            label="Check Out cũ"
            type="time"
            value={form.oldCheckOut}
            onChange={(e) => updateField('oldCheckOut', e.target.value)}
            disabled
            fullWidth
          />
        )}

        {/* REQUESTED CHECK IN */}
        {showRequestedCheckIn && (
          <Input
            label={data ? 'Check In yêu cầu *' : 'Check In yêu cầu'}
            type="time"
            value={form.requestedCheckIn}
            onChange={(e) => updateField('requestedCheckIn', e.target.value)}
            fullWidth
          />
        )}

        {/* REQUESTED CHECK OUT */}
        {showRequestedCheckOut && (
          <Input
            label={data ? 'Check Out yêu cầu *' : 'Check Out yêu cầu'}
            type="time"
            value={form.requestedCheckOut}
            onChange={(e) => updateField('requestedCheckOut', e.target.value)}
            fullWidth
          />
        )}

        {/* REASON */}
        <Textarea
          label="Lý do khiếu nại *"
          placeholder="Nhập lý do khiếu nại..."
          value={form.reason}
          onChange={(e) => updateField('reason', e.target.value)}
          rows={3}
          fullWidth
        />

        {/* MISSING ATTENDANCE INFO BOX */}
        {isMissingAttendance && (
          <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700">
            Tạo yêu cầu cho ngày quên chấm công. Vui lòng nhập thời gian Check In và/hoặc Check Out yêu cầu.
          </div>
        )}
      </div>
    </Modal>
  );
}
