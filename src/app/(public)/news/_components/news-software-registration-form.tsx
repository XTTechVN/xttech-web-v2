'use client';

import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, Send, Sparkles, ShieldCheck } from 'lucide-react';
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-teal-50/70 via-white to-slate-50/80 p-5 sm:p-6 shadow-xl shadow-slate-200/70 transition-all duration-300 hover:shadow-2xl">
      {/* Quầng sáng trang trí nền */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-teal-500/10 blur-2xl" />


      {/* Tiêu đề & Giới thiệu form */}
      <div className="border-b border-slate-200/70 pb-3.5 mt-2">
        <h3 className="text-xl sm:text-[22px] font-black text-slate-900 tracking-tight leading-snug">
          Nhận phần mềm <span className="bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">MIỄN PHÍ</span> ngay
        </h3>
        <p className="mt-1 text-xs text-slate-600 leading-relaxed font-medium">
          Đăng ký trải nghiệm hệ thống quản trị sản xuất & vận hành xưởng nhôm kính nội thất may đo riêng từ{' '}
          <span className="font-bold text-primary">XTTECH</span>.
        </p>

        {/* 2 Lợi ích nhanh khẳng định giá trị */}
        <div className="mt-3 grid grid-cols-1 gap-1.5 pt-2.5 border-t border-slate-200/60 text-[11px] text-slate-700 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Trải nghiệm 100% miễn phí — Triển khai nhanh</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Tối ưu thẻ cắt A4 & xuất lệnh sản xuất tự động</span>
          </div>
        </div>
      </div>

      {isSubmitted ? (
        /* Màn hình gửi thành công */
        <div className="py-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
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
        /* Form nhập liệu */
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
            className="h-9.5 text-xs bg-white/95"
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
            className="h-9.5 text-xs bg-white/95"
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
            className="h-9.5 text-xs bg-white/95"
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
            className="h-9.5 text-xs bg-white/95"
          />

          {/* Yêu cầu cụ thể */}
          <Textarea
            label="Yêu cầu cụ thể"
            rows={3}
            placeholder="Mô tả nhu cầu quản lý: quy mô thợ, kho vật tư, tính giá thành, tiến độ công trình..."
            value={formData.requirements}
            onChange={(e) => handleChange('requirements', e.target.value)}
            fullWidth
            className="text-xs resize-none bg-white/95"
          />

          {/* Nút hành động nổi bật toàn chiều rộng */}
          <div className="pt-2 space-y-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting}
              className="w-full gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider py-3 rounded-xl bg-gradient-to-r from-primary via-teal-600 to-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Gửi đăng ký trải nghiệm ngay</span>
            </Button>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-medium text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Bảo mật thông tin 100%
              </span>
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
