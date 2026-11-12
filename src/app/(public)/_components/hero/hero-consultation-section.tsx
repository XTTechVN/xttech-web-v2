import React from 'react';
import { HeroConsultationForm } from './hero-consultation-form';
import { HeroConsultationIllustration } from './hero-consultation-illustration';

export function HeroConsultationSection() {
  return (
    <section id="consultation" className="py-16 lg:py-24 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200/90 bg-linear-to-b from-slate-50/70 via-white to-white p-6 sm:p-10 lg:p-14 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* CỘT TRÁI: FORM ĐĂNG KÝ */}
            <HeroConsultationForm />

            {/* CỘT PHẢI: HÌNH ẢNH MINH HỌA TƯ VẤN VIÊN */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative w-full max-w-sm sm:max-w-md">
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
