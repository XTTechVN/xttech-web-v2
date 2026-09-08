'use client';

import React, { useState } from 'react';
import { Modal, Textarea, Button } from '@/components';
import { SendHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

interface LeaveRequestReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'approved' | 'rejected';
  onSubmit: (reviewNote: string) => void;
  isPending: boolean;
}

export default function LeaveRequestReviewModal({ isOpen, onClose, type, onSubmit, isPending }: LeaveRequestReviewModalProps) {
  const [reviewNote, setReviewNote] = useState('');

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevType, setPrevType] = useState(type);

  if (isOpen !== prevIsOpen || type !== prevType) {
    setPrevIsOpen(isOpen);
    setPrevType(type);
    if (isOpen) {
      setReviewNote('');
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'rejected' && !reviewNote.trim()) {
      toast.error('Vui lòng nhập lý do từ chối đơn!');
      return;
    }
    onSubmit(reviewNote.trim());
  };

  const isApprove = type === 'approved';
  const title = isApprove ? 'Phê duyệt đơn nghỉ phép' : 'Từ chối đơn nghỉ phép';

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="outline" onClick={onClose} disabled={isPending}>
        Đóng
      </Button>
      <Button
        type="submit"
        variant="primary"
        className={
          isApprove ? 'bg-[#0CBFDF] hover:bg-[#0bb1ce] border-0 text-white font-bold' : 'bg-rose-500 hover:bg-rose-600 border-0 text-white font-bold'
        }
        onClick={handleSubmit}
        loading={isPending}
        disabled={isPending}
        leftIcon={<SendHorizontal className="w-4 h-4" />}
      >
        Gửi phản hồi
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md" footer={footer} disabled={isPending}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="text-sm text-slate-600">
          {isApprove
            ? 'Xác nhận phê duyệt đơn nghỉ phép này. Bạn có thể để lại lý do phê duyệt cho nhân viên (không bắt buộc).'
            : 'Vui lòng cung cấp lý do từ chối cụ thể để nhân viên nắm rõ thông tin.'}
        </div>
        <Textarea
          label={isApprove ? 'Lý do phê duyệt' : 'Lý do từ chối'}
          placeholder={
            isApprove ? 'Ví dụ: Đã kiểm tra lịch làm việc, đồng ý duyệt đơn.' : 'Ví dụ: Trùng lịch trực dự án quan trọng, đề nghị đổi ngày khác...'
          }
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          disabled={isPending}
          rows={4}
          fullWidth
          required={!isApprove}
        />
      </form>
    </Modal>
  );
}
