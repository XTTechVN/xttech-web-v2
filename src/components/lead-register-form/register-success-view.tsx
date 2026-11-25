'use client';

import React from 'react';
import { CheckCircle2, Phone, RotateCcw } from 'lucide-react';
import { CONTACT_INFO } from '@/config/contact';
import type { RegisterFormState } from './register-form.types';

interface RegisterSuccessViewProps {
  formData: RegisterFormState;
  onReset: () => void;
  onBack: () => void;
}

export function RegisterSuccessView({ formData, onReset, onBack }: RegisterSuccessViewProps) {
  return (
    <div className="py-4 sm:py-5 text-center space-y-4">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200/80 p-1.5">
        <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
          <CheckCircle2 className="h-7 w-7" />
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
          Đã tiếp nhận yêu cầu
        </span>
        <h4 className="text-xl font-black text-slate-900 tracking-tight">Đăng ký thành công!</h4>
        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
          Chuyên viên kỹ thuật <strong className="text-primary">XTTECH</strong> sẽ liên hệ sớm để cấp tài khoản và
          hướng dẫn sử dụng.
        </p>
      </div>

      <div className="mx-auto max-w-sm rounded-xl border border-slate-200/90 bg-slate-50/80 p-3.5 text-left text-xs space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Khách hàng</span>
          <span className="font-bold text-slate-900 text-right">{formData.fullName}</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 pt-2">
          <span className="text-slate-500">Số điện thoại</span>
          <span className="font-bold text-primary font-mono">{formData.phone}</span>
        </div>
        {formData.companyName.trim() && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 pt-2">
            <span className="text-slate-500 shrink-0">Xưởng / DN</span>
            <span className="font-semibold text-slate-800 text-right truncate">{formData.companyName}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-red-500">
        <span>Cần hỗ trợ gấp?</span>
        <a
          href={`tel:${CONTACT_INFO.phone}`}
          className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
        >
          <Phone className="h-3 w-3" />
          <span>{CONTACT_INFO.phoneDisplay}</span>
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:border-primary/40 hover:text-primary cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Đăng ký xưởng khác</span>
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
        >
          Quay về trang chính
        </button>
      </div>
    </div>
  );
}
