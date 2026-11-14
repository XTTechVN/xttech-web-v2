'use client';

import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components';
import { isValidEmail, isValidVnPhone } from '@/utils/validators';

export interface HeroRegisterInlineFormProps {
  onBack: () => void;
}

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  companyName: string;
  note: string;
}

const INITIAL_FORM: FormState = {
  fullName: '',
  phone: '',
  email: '',
  companyName: '',
  note: '',
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export function HeroRegisterInlineForm({ onBack }: HeroRegisterInlineFormProps) {
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

    if (formData.email.trim() && !isValidEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success('Đăng ký nhận phần mềm thành công! Đội ngũ XTTECH sẽ liên hệ hỗ trợ bạn ngay.');
    }, 500);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-5 sm:p-7 shadow-2xl shadow-black/40 border border-white/50 text-slate-800">
      {/* Nút quay lại & Header thanh điều hướng form */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Quay lại trang giới thiệu</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="Đóng form"
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isSubmitted ? (
        /* Màn hình gửi thành công */
        <div className="py-8 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm animate-bounce">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-xl font-black text-slate-900 tracking-tight">Đăng ký thành công!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Cảm ơn <strong className="text-slate-900">{formData.fullName}</strong>. Chuyên viên kỹ thuật XTTECH sẽ liên hệ qua SĐT{' '}
              <strong className="text-slate-900">{formData.phone}</strong> để cung cấp tài khoản và hướng dẫn cài đặt.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Đăng ký thêm xưởng khác
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all cursor-pointer"
            >
              Quay về trang chính
            </button>
          </div>
        </div>
      ) : (
        /* Form nhập liệu */
        <form onSubmit={handleSubmit} className="space-y-3 pt-3">
          <div>
            <h3 className="text-xl sm:text-[22px] font-black text-slate-900 tracking-tight leading-snug">
              Nhận phần mềm <span className="text-primary">XTTECH XMS Fab</span>
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 font-medium">
              Số hóa quy trình sản xuất, bóc tách nhôm kính & quản trị xưởng may đo riêng.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <Input
              label="Họ và tên *"
              placeholder="VD: Nguyễn Văn An"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              error={errors.fullName}
              fullWidth
              className="h-9 text-xs"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                label="Số điện thoại *"
                type="tel"
                placeholder="VD: 0987 654 321"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                error={errors.phone}
                fullWidth
                className="h-9 text-xs"
              />
              <Input
                label="Email (tùy chọn)"
                type="email"
                placeholder="VD: contact@doanhnghiep.vn"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                fullWidth
                className="h-9 text-xs"
              />
            </div>

            <Input
              label="Tên doanh nghiệp / Xưởng"
              placeholder="VD: Công ty Nhôm Kính Thịnh Phát"
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              fullWidth
              className="h-9 text-xs"
            />

            <Input
              label="Nhu cầu cụ thể của xưởng"
              placeholder="VD: Bóc tách cửa nhôm, thẻ cắt A4, quản lý thợ & kho vật tư..."
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              fullWidth
              className="h-9 text-xs"
            />
          </div>

          {/* Nút gửi form */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold py-3 text-sm shadow-md transition-all hover:shadow-lg hover:shadow-primary/20 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Đang xử lý đăng ký...</span>
              ) : (
                <>
                  <span>Gửi yêu cầu đăng ký ngay</span>
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default HeroRegisterInlineForm;

