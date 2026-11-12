'use client';

import React, { useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { isValidEmail, isValidVnPhone } from '@/utils/validators';
import { CITY_OPTIONS, JOB_OPTIONS } from './hero.constants';
import { ConsultationSelectField, ConsultationTextField } from './hero-consultation-fields';

interface ConsultationFormState {
  fullName: string;
  companyName: string;
  email: string;
  companyAddress: string;
  phone: string;
  jobTitle: string;
}

const INITIAL_FORM: ConsultationFormState = {
  fullName: '',
  companyName: '',
  email: '',
  companyAddress: '',
  phone: '',
  jobTitle: '',
};

export function HeroConsultationForm() {
  const [formData, setFormData] = useState<ConsultationFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ConsultationFormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ConsultationFormState, string>> = {};

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

  const handleChange = (field: keyof ConsultationFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    setIsSubmitting(true);
    // UI only - giả lập gửi thành công
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success('Đăng ký nhận tư vấn thành công! XTTech sẽ liên hệ bạn ngay.');
    }, 450);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <div className="lg:col-span-7 space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Đăng ký nhận thông tin{' '}
          <span className="text-primary  font-black">tư vấn</span>
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
          Chúng tôi sẽ liên hệ ngay trong <span className="font-bold text-slate-900">2h làm việc!</span>
        </p>
      </div>

      {isSubmitted ? (
        /* Trạng thái xác nhận thành công */
        <div className="p-8 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">Gửi yêu cầu tư vấn thành công!</h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Cảm ơn <span className="font-bold text-slate-900">{formData.fullName}</span>.
              Chuyên viên giải pháp XTTECH sẽ liên hệ qua số điện thoại{' '}
              <span className="font-bold text-primary">{formData.phone}</span> trong vòng 2h làm việc để tư vấn chi tiết.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Gửi thêm yêu cầu khác</span>
          </button>
        </div>
      ) : (
        /* Form nhập liệu 6 trường bố cục 2 cột */
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Hàng 1: Họ và tên | Tên công ty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ConsultationTextField
              placeholder="Họ và tên *"
              value={formData.fullName}
              onChange={(v) => handleChange('fullName', v)}
              error={errors.fullName}
            />
            <ConsultationTextField
              placeholder="Tên công ty / Xưởng"
              value={formData.companyName}
              onChange={(v) => handleChange('companyName', v)}
            />
          </div>

          {/* Hàng 2: Email | Địa chỉ công ty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ConsultationTextField
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(v) => handleChange('email', v)}
              error={errors.email}
            />
            <ConsultationSelectField
              placeholder="Địa chỉ công ty (Khu vực)"
              value={formData.companyAddress}
              options={CITY_OPTIONS}
              onChange={(v) => handleChange('companyAddress', v)}
            />
          </div>

          {/* Hàng 3: Số điện thoại | Chức vụ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ConsultationTextField
              type="tel"
              placeholder="Số điện thoại *"
              value={formData.phone}
              onChange={(v) => handleChange('phone', v)}
              error={errors.phone}
            />
            <ConsultationSelectField
              placeholder="Chức vụ / Job title"
              value={formData.jobTitle}
              options={JOB_OPTIONS}
              onChange={(v) => handleChange('jobTitle', v)}
            />
          </div>

          {/* Nút gửi NHẬN TƯ VẤN & BÁO GIÁ (Không hover: bg trắng, text primary, border primary | Hover: text trắng, bg primary) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white hover:border-primary active:scale-[0.99] font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'ĐANG GỬI THÔNG TIN...' : 'NHẬN TƯ VẤN & BÁO GIÁ'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
