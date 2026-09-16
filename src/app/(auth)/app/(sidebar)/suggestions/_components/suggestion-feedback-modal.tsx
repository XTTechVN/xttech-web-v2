'use client';

import React, { useState } from 'react';
import { Modal, Textarea, Button } from '@/components';
import toast from 'react-hot-toast';

interface SuggestionFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'approve' | 'reject';
  onSubmit: (reviewText: string) => void;
  isPending: boolean;
}

export default function SuggestionFeedbackModal({ isOpen, onClose, type, onSubmit, isPending }: SuggestionFeedbackModalProps) {
  const [review, setReview] = useState('');

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevType, setPrevType] = useState(type);

  if (isOpen !== prevIsOpen || type !== prevType) {
    setPrevIsOpen(isOpen);
    setPrevType(type);
    if (isOpen) {
      setReview('');
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi đề xuất!');
      return;
    }
    onSubmit(review.trim());
  };

  const title = type === 'approve' ? 'Phê duyệt đề xuất' : 'Từ chối đề xuất';

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="outline" onClick={onClose} disabled={isPending}>
        Đóng
      </Button>
      <Button
        variant="primary"
        className={
          type === 'approve'
            ? 'bg-[#0CBFDF] hover:bg-[#0bb1ce] border-0 text-white font-bold'
            : 'bg-rose-500 hover:bg-rose-600 border-0 text-white font-bold'
        }
        onClick={handleSubmit}
        loading={isPending}
        disabled={isPending}
      >
        Gửi phản hồi
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md" footer={footer} disabled={isPending}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="text-sm font-medium text-slate-600 mb-1">
          {type === 'approve'
            ? 'Vui lòng nhập ý kiến phê duyệt hoặc hướng dẫn thực hiện cho đề xuất này.'
            : 'Vui lòng cung cấp lý do từ chối cụ thể để phản hồi lại cho người gửi.'}
        </div>
        <Textarea
          label="Nội dung phản hồi đề xuất"
          placeholder={
            type === 'approve'
              ? 'Ví dụ: Đề xuất rất hữu ích, Ban Giám Đốc phê duyệt triển khai từ ngày...'
              : 'Ví dụ: Đề xuất chưa phù hợp với định hướng hiện tại của công ty do...'
          }
          value={review}
          onChange={(e) => setReview(e.target.value)}
          disabled={isPending}
          rows={4}
          fullWidth
          required
        />
      </form>
    </Modal>
  );
}
