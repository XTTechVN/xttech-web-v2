import React from 'react';
import { Rocket } from 'lucide-react';

/* Màu nhấn (lime) – dùng chung với các section pricing khác */
const ACCENT = '#d6ff3d';

const InforBanner = () => {
  return (
    // Cùng padding + max-width với tab / bảng giá để thẳng lề
    <div className="w-full bg-white px-4 py-6 font-sans sm:px-8 lg:px-16 xl:px-24">
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
          {/* Hiệu ứng ánh sáng nhẹ ở góc phải nền banner */}
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-25 blur-3xl"
            style={{ background: `radial-gradient(circle, ${ACCENT} 0%, transparent 70%)` }}
          />
          <div className="pointer-events-none absolute -bottom-32 right-1/3 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-4">
            {/* Top Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm"
              style={{ color: ACCENT }}
            >
              <Rocket className="h-3.5 w-3.5" />
              Dịch vụ triển khai
            </div>

            {/* Main Title */}
            <h2 className="text-3xl font-extrabold leading-[1.15] tracking-tight text-white lg:text-5xl">
              Không chỉ phần mềm, <br className="hidden sm:block" />
              chúng tôi đồng hành tái cấu trúc xưởng
            </h2>

            {/* Description */}
            <p className="pt-2 text-sm leading-relaxed text-white/75 lg:text-base">
              Chọn mức đồng hành phù hợp. Tất cả gói đều bao gồm tài liệu, video, quy trình mẫu ISO xưởng nhôm &
              xây dựng.{' '}
              <span className="font-medium text-white">Cam kết hoàn tiền nếu không phù hợp sau 14 ngày.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InforBanner;