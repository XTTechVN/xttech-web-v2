'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Input, Textarea, Select } from '@/components';
import { Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePermission } from '@/hooks';
import { createAdjustmentRequest, getUsers } from '@/actions';
import { useQuery } from '@tanstack/react-query';
import type { AttendanceAdjustmentRequestCreate } from '@/types';

interface OvertimeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function OvertimeModal({ open, onClose, onSuccess }: OvertimeModalProps) {
  // Chỉ cho phép admin, super, hr chọn nhân viên khác; các role khác chỉ được đăng ký cho chính mình
  const { user: currentUser, isManager: canSelectOtherUser } = usePermission();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [userId, setUserId] = useState<string>('');
  const [workDate, setWorkDate] = useState<string>(todayStr);
  const [startTime, setStartTime] = useState<string>('17:30');
  const [endTime, setEndTime] = useState<string>('20:30');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Danh sách nhân viên nếu có quyền chọn người khác (admin, super, hr)
  const { data: usersList } = useQuery({
    queryKey: ['users-list-for-overtime'],
    queryFn: () => getUsers(),
    enabled: Boolean(canSelectOtherUser && open),
  });

  const employeeOptions = useMemo(() => {
    const items = usersList?.items ?? [];
    return [
      { value: '', label: '-- Chọn nhân sự --' },
      ...items.map((u) => ({
        value: u.id,
        label: `${u.fullName || u.username} (${u.email})`,
      })),
    ];
  }, [usersList]);

  // Reset form khi mở modal
  useEffect(() => {
    if (open) {
      setUserId(currentUser?.id || '');
      setWorkDate(new Date().toISOString().split('T')[0]);
      setStartTime('17:30');
      setEndTime('20:30');
      setReason('');
    }
  }, [open, currentUser]);

  // Tính số giờ OT dự kiến
  const estimatedHours = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const diffMinutes = endH * 60 + endM - (startH * 60 + startM);
    if (diffMinutes <= 0) return 0;
    return Number((diffMinutes / 60).toFixed(1));
  }, [startTime, endTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetUserId = userId || currentUser?.id;
    if (!targetUserId) {
      toast.error('Không tìm thấy thông tin nhân sự');
      return;
    }

    if (!workDate) {
      toast.error('Vui lòng chọn ngày tăng ca');
      return;
    }

    if (!startTime || !endTime) {
      toast.error('Vui lòng chọn khung giờ tăng ca đầy đủ');
      return;
    }

    if (estimatedHours <= 0) {
      toast.error('Giờ kết thúc phải lớn hơn giờ bắt đầu tăng ca');
      return;
    }

    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do / nội dung công việc tăng ca');
      return;
    }

    const payload: AttendanceAdjustmentRequestCreate = {
      userId: targetUserId,
      requestType: 'overtime',
      workDate,
      requestedCheckIn: `${startTime}:00`,
      requestedCheckOut: `${endTime}:00`,
      reason: reason.trim(),
      status: 'pending',
    };

    setIsSubmitting(true);
    try {
      await createAdjustmentRequest(payload);
      toast.success('Gửi yêu cầu đăng ký tăng ca thành công!');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Không thể tạo yêu cầu tăng ca';
      toast.error(typeof errorMsg === 'string' ? errorMsg : 'Có lỗi khi tạo yêu cầu tăng ca');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      size="md"
      isOpen={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <Clock className="text-amber-600" size={20} />
          <span>Đăng ký tăng ca (Overtime)</span>
        </div>
      }
      className="m-2 max-w-lg w-full"
      disabled={isSubmitting}
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="overtime-form"
            loading={isSubmitting}
            leftIcon={<Send size={15} />}
          >
            Gửi yêu cầu
          </Button>
        </div>
      }
    >
      <form id="overtime-form" onSubmit={handleSubmit} className="space-y-4 py-1">
        {/* Banner thông tin */}
        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
          Yêu cầu đăng ký tăng ca sẽ được gửi tới Quản lý / Bộ phận nhân sự phê duyệt. Sau khi được duyệt, số giờ tăng ca sẽ tự động cộng vào bảng công.
        </div>

        {/* Nhân sự */}
        {canSelectOtherUser ? (
          <Select
            label="Nhân sự đăng ký *"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            options={employeeOptions}
          />
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 select-none">Nhân sự</label>
            <div className="h-10 px-3 flex items-center text-sm font-medium bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {currentUser?.fullName || currentUser?.username} ({currentUser?.email})
            </div>
          </div>
        )}

        {/* Ngày tăng ca */}
        <Input
          label="Ngày tăng ca *"
          type="date"
          fullWidth
          value={workDate}
          onChange={(e) => setWorkDate(e.target.value)}
        />

        {/* Khung giờ */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Giờ bắt đầu OT *"
            type="time"
            fullWidth
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="Giờ kết thúc OT *"
            type="time"
            fullWidth
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        {/* Dự kiến thời gian */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/70 rounded-lg text-xs">
          <span className="text-slate-600">Thời gian tăng ca dự kiến:</span>
          <span className="font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200">
            {estimatedHours > 0 ? `${estimatedHours} giờ` : 'Khung giờ không hợp lệ'}
          </span>
        </div>

        {/* Lý do / Nội dung công việc */}
        <Textarea
          label="Lý do / Nội dung công việc tăng ca *"
          placeholder="Ví dụ: Tăng ca hoàn thiện gia công hệ nhôm cho dự án Vinhomes..."
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </form>
    </Modal>
  );
}

export default OvertimeModal;
