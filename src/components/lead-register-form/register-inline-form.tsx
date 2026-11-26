'use client';

import React, { useState } from 'react';
import { ArrowLeft, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitPublicLeadRegistration } from '@/actions';
import { Input } from '@/components/input';
import { showErrorToast } from '@/utils/error';
import { isValidEmail, isValidVnPhone } from '@/utils/validators';
import { RegisterCountdownBanner } from './register-countdown-banner';
import {
  INITIAL_REGISTER_FORM,
  type RegisterFormErrors,
  type RegisterFormState,
  type RegisterInlineFormProps,
} from './register-form.types';
import { RegisterSuccessView } from './register-success-view';

export function RegisterInlineForm({
  onBack,
  variant = 'inline',
  onSuccess,
}: RegisterInlineFormProps) {
  const [formData, setFormData] = useState<RegisterFormState>(INITIAL_REGISTER_FORM);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: RegisterFormErrors = {};

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

    if (!formData.taxCode.trim()) {
      newErrors.taxCode = 'Vui lòng nhập mã số thuế';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof RegisterFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await submitPublicLeadRegistration({
        source: 'hero_software_register',
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        companyName: formData.companyName.trim() || undefined,
        taxCode: formData.taxCode.trim() || undefined,
        note: formData.note.trim() || undefined,
        pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      });
      setIsSubmitted(true);
      onSuccess?.();
      toast.success('Đăng ký nhận phần mềm thành công! Đội ngũ XTTECH sẽ liên hệ hỗ trợ bạn ngay.');
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_REGISTER_FORM);
    setErrors({});
    setIsSubmitted(false);
  };

  const handleBack = () => {
    setErrors({});
    onBack();
  };

  return (
    <div
      className={
        variant === 'inline'
          ? 'relative overflow-hidden rounded-2xl bg-white p-5 sm:p-7 shadow-2xl shadow-black/40 border border-white/50 text-slate-800'
          : 'relative text-slate-800'
      }
    >
      {variant === 'inline' && (
        <div className="relative z-30 flex items-center justify-between border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 py-2 pr-3 text-xs font-bold text-slate-600 hover:text-primary active:text-primary transition-colors cursor-pointer touch-manipulation group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Quay lại trang giới thiệu</span>
          </button>

          <button
            type="button"
            onClick={handleBack}
            aria-label="Đóng form"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 active:bg-slate-200 transition-colors cursor-pointer touch-manipulation"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      )}

      {isSubmitted ? (
        <RegisterSuccessView formData={formData} onReset={handleReset} onBack={handleBack} />
      ) : (
        <form onSubmit={handleSubmit} className={variant === 'inline' ? 'space-y-3 pt-3' : 'space-y-3'}>
          <RegisterCountdownBanner />

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                label="Tên doanh nghiệp / Xưởng"
                placeholder="VD: Công ty Nhôm Kính Thịnh Phát"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                fullWidth
                className="h-9 text-xs"
              />
              <Input
                label="Mã số thuế *"
                placeholder="VD: 0102030405"
                value={formData.taxCode}
                onChange={(e) => handleChange('taxCode', e.target.value)}
                error={errors.taxCode}
                fullWidth
                className="h-9 text-xs"
              />
            </div>

            <Input
              label="Nhu cầu cụ thể của xưởng"
              placeholder="VD: Bóc tách cửa nhôm, thẻ cắt A4, quản lý thợ & kho vật tư..."
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              fullWidth
              className="h-9 text-xs"
            />
          </div>

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
                  <span>Đăng ký sử dụng miễn phí</span>
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

export const HeroRegisterInlineForm = RegisterInlineForm;
export default RegisterInlineForm;
