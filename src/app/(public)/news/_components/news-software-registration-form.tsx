'use client';

import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input, Textarea } from '@/components';
import { isValidEmail, isValidVnPhone } from '@/utils/validators';

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  companyName: string;
  requirements: string;
}

const INITIAL_FORM: FormState = {
  fullName: '',
  phone: '',
  email: '',
  companyName: '',
  requirements: '',
};

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  companyName?: string;
}

export function NewsSoftwareRegistrationForm() {
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!isValidVnPhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại không đúng định dạng';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Vui lòng nhập tên xưởng / doanh nghiệp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Vui lòng kiểm tra lại thông tin đăng ký');
      return;
    }

    setIsSubmitting(true);
    // UI only - không gọi API
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success('Đã gửi yêu cầu đăng ký sử dụng phần mềm thành công!');
    }, 400);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
      {/* Tiêu đề & Giới thiệu form */}
      <div className="border-b border-slate-100 pb-4">
        <h3 className="mt-2 text-lg font-bold text-primary tracking-tight">Nhận phần mềm miễn phí ngay </h3>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
          Đăng ký trải nghiệm hệ thống quản trị sản xuất & vận hành xưởng nhôm kính nội thất may đo riêng từ{' '}
          <span className="font-semibold text-primary">XTTECH</span>.
        </p>
      </div>

      {isSubmitted ? (
        /* Màn hình gửi thành công */
        <div className="py-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-base font-bold text-slate-900">Gửi yêu cầu thành công!</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cảm ơn <span className="font-semibold text-slate-900">{formData.fullName}</span> (
              <span className="font-medium text-slate-700">{formData.companyName}</span>). Đội ngũ chuyên gia XTTECH sẽ liên hệ qua SĐT{' '}
              <span className="font-semibold text-primary">{formData.phone}</span> để tư vấn demo trực tiếp.
            </p>
          </div>
          <div className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Gửi thêm yêu cầu khác</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Form nhập liệu: Bố cục 1 cột full-width chuẩn xác, không bị đè lệch icon hay vỡ lỗi */
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5" noValidate>
          {/* Họ và tên */}
          <Input
            label="Họ và tên *"
            type="text"
            placeholder="VD: Nguyễn Văn A"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            error={errors.fullName}
            fullWidth
            className="h-9.5 text-xs"
          />

          {/* Số điện thoại */}
          <Input
            label="Số điện thoại *"
            type="tel"
            placeholder="VD: 0987 654 321"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            fullWidth
            className="h-9.5 text-xs"
          />

          {/* Email */}
          <Input
            label="Email *"
            type="email"
            placeholder="VD: contact@doanhnghiep.vn"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            fullWidth
            className="h-9.5 text-xs"
          />

          {/* Tên doanh nghiệp */}
          <Input
            label="Tên doanh nghiệp / Xưởng *"
            type="text"
            placeholder="VD: Công ty Nhôm Kính Thịnh Phát"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            error={errors.companyName}
            fullWidth
            className="h-9.5 text-xs"
          />

          {/* Yêu cầu cụ thể */}
          <Textarea
            label="Yêu cầu cụ thể"
            rows={3}
            placeholder="Mô tả nhu cầu quản lý: quy mô thợ, kho vật tư, tính giá thành, tiến độ công trình..."
            value={formData.requirements}
            onChange={(e) => handleChange('requirements', e.target.value)}
            fullWidth
            className="text-xs resize-none"
          />

          {/* 2 nút hành động: Gửi đăng ký & Hủy */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={isSubmitting} className="w-full text-xs">
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting} className="w-full gap-1.5 text-xs font-semibold">
              <Send className="h-3.5 w-3.5" />
              <span>Gửi đăng ký</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
