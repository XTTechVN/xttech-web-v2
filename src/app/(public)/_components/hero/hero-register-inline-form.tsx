'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Flame, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components';
import { isValidEmail, isValidVnPhone } from '@/utils/validators';

export const REGISTER_MODAL_STORAGE_KEY = 'xttech_register_modal_handled';
export const REGISTER_INTERACTED_EVENT = 'xttech:register-interacted';

export function markRegisterInteracted() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(REGISTER_MODAL_STORAGE_KEY, 'true');
    window.dispatchEvent(new Event(REGISTER_INTERACTED_EVENT));
  }
}

export interface HeroRegisterInlineFormProps {
  onBack: () => void;
  variant?: 'inline' | 'modal';
  onSuccess?: () => void;
}

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  companyName: string;
  taxCode: string;
  note: string;
}

const INITIAL_FORM: FormState = {
  fullName: '',
  phone: '',
  email: '',
  companyName: '',
  taxCode: '',
  note: '',
};

type FormErrors = Partial<Record<keyof FormState, string>>;

// Chu kỳ reset ưu đãi sau mỗi 6 ngày (tính bằng ms)
const CYCLE_MS = 6 * 24 * 60 * 60 * 1000;

export function HeroRegisterInlineForm({
  onBack,
  variant = 'inline',
  onSuccess,
}: HeroRegisterInlineFormProps) {
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Timer đếm ngược chu kỳ 6 ngày có thanh tiến trình
  const [isMounted, setIsMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 5,
    hours: 23,
    minutes: 59,
    seconds: 59,
    progress: 82,
  });

  useEffect(() => {
    setIsMounted(true);
    const updateCountdown = () => {
      const now = Date.now();
      const elapsed = now % CYCLE_MS;
      const remaining = CYCLE_MS - elapsed;

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((remaining / (1000 * 60)) % 60);
      const seconds = Math.floor((remaining / 1000) % 60);

      // Tiến trình phần trăm đăng ký (từ 72% đến 96% theo chu kỳ)
      const progress = Math.min(96, Math.max(72, Math.round(((CYCLE_MS - remaining) / CYCLE_MS) * 100)));

      setTimeLeft({ days, hours, minutes, seconds, progress });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

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

    if (!formData.taxCode.trim()) {
      newErrors.taxCode = 'Vui lòng nhập mã số thuế';
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
      markRegisterInteracted();
      onSuccess?.();
      toast.success('Đăng ký nhận phần mềm thành công! Đội ngũ XTTECH sẽ liên hệ hỗ trợ bạn ngay.');
    }, 500);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <div
      className={
        variant === 'inline'
          ? 'relative overflow-hidden rounded-2xl bg-white p-5 sm:p-7 shadow-2xl shadow-black/40 border border-white/50 text-slate-800'
          : 'relative text-slate-800'
      }
    >
      {/* Nút quay lại & Header thanh điều hướng form (chỉ hiển thị ở chế độ inline) */}
      {variant === 'inline' && (
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
      )}

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
        <form onSubmit={handleSubmit} className={variant === 'inline' ? 'space-y-3 pt-3' : 'space-y-3'}>
          {/* Thanh timer đếm ngược & thanh tiến trình ưu đãi 6 ngày */}
          <div className="rounded-xl border border-primary/20 bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 p-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/15 text-orange-600">
                  <Flame className="h-3.5 w-3.5 fill-orange-500 animate-pulse" />
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Ưu đãi kết thúc sau:
                </span>
              </div>

              {/* Countdown Digits */}
              <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-primary">
                <span className="rounded bg-white px-1.5 py-0.5 shadow-xs border border-primary/20">
                  {isMounted ? String(timeLeft.days).padStart(2, '0') : '05'}d
                </span>
                <span className="text-slate-400">:</span>
                <span className="rounded bg-white px-1.5 py-0.5 shadow-xs border border-primary/20">
                  {isMounted ? String(timeLeft.hours).padStart(2, '0') : '23'}h
                </span>
                <span className="text-slate-400">:</span>
                <span className="rounded bg-white px-1.5 py-0.5 shadow-xs border border-primary/20">
                  {isMounted ? String(timeLeft.minutes).padStart(2, '0') : '59'}m
                </span>
                <span className="text-slate-400">:</span>
                <span className="rounded bg-white px-1.5 py-0.5 shadow-xs border border-primary/20">
                  {isMounted ? String(timeLeft.seconds).padStart(2, '0') : '59'}s
                </span>
              </div>
            </div>

            {/* Thanh chạy tiến trình */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-600">
                <span>Tiến trình ưu đãi kỳ này</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
                <div
                  className="h-full rounded-full bg-linear-to-r from-[var(--hero-accent-from)] to-[var(--hero-accent-to)] transition-all duration-1000 ease-out"
                  style={{ width: `${isMounted ? timeLeft.progress : 82}%` }}
                />
              </div>
            </div>
          </div>

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
                  <span>Đăng ký ngay</span>
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

