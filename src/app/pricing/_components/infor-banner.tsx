import React from 'react';
import { Rocket } from 'lucide-react';

const InforBanner = () => {
  return (
    <div className="w-full py-8 px-4 font-sans">
          <div className="w-full bg-white px-20 py-4 font-sans text-[#0A192F]">
      <div className="w-full space-y-4">
          
          {/* Hiệu ứng ánh sáng nhẹ ở góc phải nền banner */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-transparent to-transparent rounded-full pointer-events-none"></div>

          <div className="max-w-3xl relative z-10 space-y-4">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-primary px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase backdrop-blur-sm">
              <Rocket className="w-3.5 h-3.5 text-primary" />
              Dịch vụ triển khai
            </div>

            {/* Main Title */}
            <h2 className="text-3xl lg:text-5xl font-extrabold text-black tracking-tight leading-[1.15]">
              Không chỉ phần mềm, <br className="hidden sm:block" />
              chúng tôi đồng hành{' '}
              <span className="text-primary">tái cấu trúc xưởng</span>
            </h2>

            {/* Description */}
            <p className="text-gray-500 text-sm lg:text-base leading-relaxed pt-2">
              Chọn mức đồng hành phù hợp. Tất cả gói đều bao gồm tài liệu, video, quy trình mẫu ISO xưởng nhôm & xây dựng.{' '}
              <span className="text-gray-300 font-medium">Cam kết hoàn tiền nếu không phù hợp sau 14 ngày.</span>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InforBanner;