import React from 'react';
import { HeroConsultationForm } from './hero-consultation-form';
import { HeroConsultationIllustration } from './hero-consultation-illustration';

export function HeroConsultationSection() {
  return (
    <section id="consultation" className="py-6 sm:py-8 lg:py-10 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200/90 bg-linear-to-b from-slate-50/70 via-white to-white p-5 sm:p-7 lg:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* CỘT TRÁI: FORM ĐĂNG KÝ */}
            <HeroConsultationForm />

            {/* CỘT PHẢI: HÌNH ẢNH MINH HỌA TƯ VẤN VIÊN */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative w-full max-w-xs sm:max-w-sm">
                <HeroConsultationIllustration />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroConsultationSection;
