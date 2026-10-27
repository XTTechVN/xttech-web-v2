import React from 'react';
import { ShieldCheck, RefreshCw, Zap, ArrowRight } from 'lucide-react';

const ServiceBanner = () => {
  return (
    <div className="w-full bg-white py-4 px-4 lg:px-4 font-sans">
      <div className="w-full px-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
        {/* Phần bên trái: Tiêu đề & Mô tả */}
        <div className="flex-1 max-w-2xl flex flex-col gap-2">
          {/* Top Badge */}
          <span className="uppercase text-primary font-bold">XT Tech • Mindmap Pricing • Google One Style</span>

          {/* Main Title */}
          <h1 className="text-4xl lg:text-5xl font-extrabold text-black tracking-tight leading-[1.15] mb-6">
            Bảng giá minh bạch kiểu <span className="text-primary">Google One</span> cho 3 ngành
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-base leading-relaxed mb-8">
            Thiết kế theo yêu cầu: màu <span className="bg-[#0A192F] text-white px-1.5 py-0.5 rounded text-xs font-mono font-medium">#0A192F</span> +{' '}
            <span className="bg-primary text-[#0A192F] px-1.5 py-0.5 rounded text-xs font-mono font-bold">#CCFF00</span> như mindmap. Mỗi ô dùng số
            giới hạn + icon check, không dùng chữ Có/Không. Highlight cột Tái Cấu Trúc là Bán chạy nhất.
          </p>

          {/* Bottom Action Badges / Features */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full text-xs font-medium text-gray-700 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-gray-500" />
              Không giới hạn ẩn, minh bạch
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full text-xs font-medium text-gray-700 shadow-xs">
              <RefreshCw className="w-4 h-4 text-gray-500" />
              Tự động reset
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full text-xs font-medium text-gray-700 shadow-xs">
              <Zap className="w-4 h-4 text-primary fill-primary" />
              Mua thêm lẻ 99k
            </div>
          </div>
        </div>

        {/* Phần bên phải: Thẻ xem trước giá theo năm */}
        <div className="w-full lg:w-auto bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm relative">
          {/* Badge -20% */}
          <div className="absolute -top-3 right-6 bg-primary text-[#0A192F] text-xs font-bold px-3 py-1 rounded-full shadow-xs">-20%</div>

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Tiết kiệm khi trả theo năm</div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Gói 1 */}
            <div className="bg-[#F4F5F0] border border-gray-100 rounded-xl p-3 text-center flex flex-col justify-between">
              <div>
                <div className="text-lg font-bold text-[#0A192F]">590k</div>
                <div className="text-[10px] text-gray-400 line-through mt-0.5">~5.9tr/năm</div>
              </div>
              <div className="text-[10px] font-medium text-emerald-600 mt-2 bg-emerald-50 py-0.5 px-1 rounded">Tiết kiệm 1.18tr</div>
            </div>

            {/* Gói 2 (Highlighted Dark) */}
            <div className="bg-[#0A192F] text-white rounded-xl p-3 text-center flex flex-col justify-between shadow-md">
              <div>
                <div className="text-lg font-bold text-primary">1.29tr</div>
                <div className="text-[10px] text-gray-300 line-through mt-0.5">~12.9tr/năm</div>
              </div>
              <div className="text-[10px] font-medium text-primary mt-2 bg-white/10 py-0.5 px-1 rounded">Tiết kiệm 2.58tr</div>
            </div>

            {/* Gói 3 */}
            <div className="bg-[#F4F5F0] border border-gray-100 rounded-xl p-3 text-center flex flex-col justify-between">
              <div>
                <div className="text-base font-bold text-[#0A192F]">29.9tr</div>
                <div className="text-[10px] text-gray-500 mt-0.5 font-medium">Tổng Thầu</div>
              </div>
              <div className="text-[10px] font-medium text-gray-500 mt-2 bg-gray-200/60 py-0.5 px-1 rounded">1TB • ∞</div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-[11px] text-gray-400 leading-relaxed border-t border-gray-100 pt-3">
            * Gói Tổng Thầu chỉ có theo năm. Giá đã bao gồm VAT, hỗ trợ 1-1. Mua thêm lẻ áp dụng khi vượt hạn mức.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceBanner;
