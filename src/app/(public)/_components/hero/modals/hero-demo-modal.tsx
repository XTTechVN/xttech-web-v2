'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input, Modal } from '@/components';
import { isValidEmail } from '@/utils/validators';

export interface HeroDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DemoFormState {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  region: string;
  interestLevel: string;
  note: string;
}

const INITIAL_FORM: DemoFormState = {
  fullName: '',
  email: '',
  phone: '',
  companyName: '',
  region: '',
  interestLevel: '',
  note: '',
};

export function HeroDemoModal({ isOpen, onClose }: HeroDemoModalProps) {
  const [form, setForm] = useState<DemoFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof DemoFormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof DemoFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Partial<Record<keyof DemoFormState, string>> = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Vui lòng nhập họ và tên';
    }
    if (!form.phone.trim()) {
      nextErrors.phone = 'Vui lòng nhập số điện thoại';
    }
    if (form.email.trim() && !isValidEmail(form.email)) {
      nextErrors.email = 'Email không hợp lệ';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    // UI only - giả lập gửi thành công
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Đăng ký trải nghiệm Demo thành công! Đội ngũ XTTech sẽ liên hệ tư vấn ngay.');
      setForm(INITIAL_FORM);
      setErrors({});
      onClose();
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      className="max-w-lg overflow-hidden rounded-lg border border-primary/20 p-0"
      bodyClassName="p-0"
      title="Đăng ký trải nghiệm Demo XTTech"
    >
      <form onSubmit={handleSubmit} className="space-y-3 bg-white p-5">
        <Input
          label="Họ và Tên *"
          placeholder="Nhập họ và tên của bạn"
          value={form.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          error={errors.fullName}
          fullWidth
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            placeholder="Nhập địa chỉ email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            fullWidth
          />
          <Input
            label="Số điện thoại *"
            type="tel"
            placeholder="Nhập số điện thoại liên hệ"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            fullWidth
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Tên công ty / Xưởng"
            placeholder="Nhập tên doanh nghiệp hoặc xưởng"
            value={form.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            fullWidth
          />
          <Input
            label="Khu vực"
            placeholder="VD: Hà Nội, TP.HCM, Đà Nẵng..."
            value={form.region}
            onChange={(e) => handleChange('region', e.target.value)}
            fullWidth
          />
        </div>

        <Input
          label="Mức độ quan tâm của bạn"
          placeholder="VD: Cần triển khai ngay, Đang tìm hiểu giải pháp..."
          value={form.interestLevel}
          onChange={(e) => handleChange('interestLevel', e.target.value)}
          fullWidth
        />

        <Input
          label="Chia sẻ thêm nhu cầu của bạn"
          placeholder="VD: Bóc tách cửa nhôm kính, quản lý kho, chấm công GPS..."
          value={form.note}
          onChange={(e) => handleChange('note', e.target.value)}
          fullWidth
        />

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3.5">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Đóng
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSubmitting}
              leftIcon={<Send className="h-3.5 w-3.5" />}
            >
              Đăng ký ngay
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
