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
    <div className="relative overflow-hidden rounded-2xl border-2 border-primary bg-white shadow-2xl shadow-primary/20 ring-4 ring-primary/8 transition-all duration-300 hover:shadow-primary/30">
      {/* Header nổi bật nền đậm thương hiệu */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#033942] via-primary to-teal-600 px-5 pt-5 pb-4 text-white">
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-amber-300/15 blur-2xl" />

        <div className="relative space-y-2">
        
          <h3 className="text-xl sm:text-[22px] font-black text-white tracking-tight leading-snug">
            Nhận phần mềm ngay
          </h3>

          <p className="text-xs text-teal-50/90 leading-relaxed font-medium">
            Đăng ký trải nghiệm hệ thống quản trị sản xuất & vận hành xưởng nhôm kính nội thất may đo riêng từ{' '}
            <span className="font-bold text-white">XTTECH</span>.
          </p>

          {/* 2 Lợi ích nhanh khẳng định giá trị */}
          <div className="mt-2.5 grid grid-cols-1 gap-1.5 rounded-xl bg-white/12 border border-white/15 px-3 py-2.5 text-[11px] text-white font-medium backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
              <span>Trải nghiệm 100% miễn phí — Triển khai nhanh</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
              <span>Tối ưu thẻ cắt A4 & xuất lệnh sản xuất tự động</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-b from-teal-50/40 via-white to-white p-5 sm:p-6">
        {isSubmitted ? (
          /* Màn hình gửi thành công */
          <div className="py-4 text-center space-y-4">
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
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {/* Họ và tên */}
            <Input
              label="Họ và tên *"
              type="text"
              placeholder="VD: Nguyễn Văn A"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              error={errors.fullName}
              fullWidth
              className="h-9.5 text-xs bg-white border-slate-300 shadow-2xs"
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
              className="h-9.5 text-xs bg-white border-slate-300 shadow-2xs"
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
              className="h-9.5 text-xs bg-white border-slate-300 shadow-2xs"
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
              className="h-9.5 text-xs bg-white border-slate-300 shadow-2xs"
            />

            {/* Yêu cầu cụ thể */}
            <Textarea
              label="Yêu cầu cụ thể"
              rows={3}
              placeholder="Mô tả nhu cầu quản lý: quy mô thợ, kho vật tư, tính giá thành, tiến độ công trình..."
              value={formData.requirements}
              onChange={(e) => handleChange('requirements', e.target.value)}
              fullWidth
              className="text-xs resize-none bg-white border-slate-300 shadow-2xs"
            />

            {/* Nút hành động nổi bật toàn chiều rộng */}
            <div className="pt-2 space-y-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSubmitting}
                className="w-full gap-2 text-xs sm:text-sm font-extrabold py-3.5 rounded-xl bg-gradient-to-r from-[#03444d] via-primary to-teal-600 shadow-lg shadow-primary/35 hover:shadow-xl hover:shadow-primary/45 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Đăng ký ngay</span>
              </Button>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Bảo mật thông tin 100%
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  Đặt lại
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
