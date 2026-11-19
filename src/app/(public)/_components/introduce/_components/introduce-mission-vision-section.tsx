'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Image as ImageIcon, Sparkles, Target, Compass } from 'lucide-react';

export function IntroduceMissionVisionSection() {
  return (
    <section className="bg-white py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ===================== PHẦN 1: SỨ MỆNH (Chữ bên Trái - Ảnh bên Phải) ===================== */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Cột trái: Nội dung Sứ mệnh */}
          <div className="space-y-6 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
              <Compass className="h-3.5 w-3.5" />
              <span>Sứ mệnh XTTECH</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-[42px] lg:leading-[1.18]">
                Sứ mệnh
              </h2>
              <p className="text-base leading-relaxed text-slate-700 sm:text-lg">
                XTTECH đưa công nghệ trở thành công cụ vận hành{' '}
                <strong className="font-semibold text-slate-900">
                  dễ tiếp cận, hiệu quả và bền vững
                </strong>{' '}
                cho mọi doanh nghiệp vừa và nhỏ tại Việt Nam.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
                Chúng tôi giúp doanh nghiệp:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-slate-800">
                      Quản trị nội bộ thông minh:
                    </strong>{' '}
                    Tiết kiệm thời gian và chi phí vận hành.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-slate-800">
                      Áp dụng AI xây dựng thương hiệu số:
                    </strong>{' '}
                    Thông qua hệ thống app/web mang dấu ấn riêng.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-slate-800">
                      Kết nối cộng đồng doanh nghiệp cùng ngành:
                    </strong>{' '}
                    Chia sẻ nguồn lực và cơ hội phát triển.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-primary hover:text-primary hover:shadow-sm"
              >
                <span>Khám phá giải pháp</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Cột phải: Khung ảnh Sứ mệnh (Để trống cho bạn thêm ảnh) */}
          <div className="lg:col-span-6">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 bg-linear-to-br from-slate-50 to-slate-100/60 shadow-xs transition-all hover:border-primary/40">
              {/* ===== CHỖ BẠN TỰ THÊM ẢNH SỨ MỆNH TẠI ĐÂY ===== */}
              {/* Thay khối div bên dưới bằng thẻ <img> hoặc <Image /> khi bạn thêm ảnh:
                  <img
                    src="/your-image-path.jpg"
                    alt="Sứ mệnh XTTECH"
                    className="h-full w-full object-cover"
                  />
              */}
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
                  <ImageIcon className="h-7 w-7 text-slate-400" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Khu vực hình ảnh Sứ mệnh
                </p>
                <p className="mt-1 max-w-xs text-xs text-slate-500">
                  Khung ảnh tỉ lệ 4:3 bo tròn chuẩn phong cách tối giản. Bạn có thể chèn link ảnh vào đây.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== ĐƯỜNG PHÂN CÁCH ===================== */}
        <div className="my-16 border-t border-slate-200/80 sm:my-24" />

        {/* ===================== PHẦN 2: TẦM NHÌN (Ảnh bên Trái - Chữ bên Phải) ===================== */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Cột trái: Khung ảnh Tầm nhìn (Trên mobile hiển thị sau chữ để mạch đọc tự nhiên) */}
          <div className="order-2 lg:order-1 lg:col-span-6">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 bg-linear-to-br from-slate-50 to-slate-100/60 shadow-xs transition-all hover:border-primary/40">
              {/* ===== CHỖ BẠN TỰ THÊM ẢNH TẦM NHÌN TẠI ĐÂY ===== */}
              {/* Thay khối div bên dưới bằng thẻ <img> hoặc <Image /> khi bạn thêm ảnh:
                  <img
                    src="/your-image-path.jpg"
                    alt="Tầm nhìn XTTECH"
                    className="h-full w-full object-cover"
                  />
              */}
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
                  <ImageIcon className="h-7 w-7 text-slate-400" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Khu vực hình ảnh Tầm nhìn
                </p>
                <p className="mt-1 max-w-xs text-xs text-slate-500">
                  Khung ảnh tỉ lệ 4:3 bo tròn chuẩn phong cách tối giản. Bạn có thể chèn link ảnh vào đây.
                </p>
              </div>
            </div>
          </div>

          {/* Cột phải: Nội dung Tầm nhìn */}
          <div className="order-1 space-y-6 lg:order-2 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
              <Target className="h-3.5 w-3.5" />
              <span>Tầm nhìn XTTECH</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-[42px] lg:leading-[1.18]">
                Tầm nhìn
              </h2>
              <p className="text-base leading-relaxed text-slate-700 sm:text-lg">
                Trở thành{' '}
                <strong className="font-semibold text-slate-900">
                  đơn vị dẫn đầu
                </strong>{' '}
                trong lĩnh vực chuyển đổi số cho ngành nhôm cao cấp và xây dựng tại Việt Nam.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
                Định hướng phát triển trọng tâm:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-slate-800">
                      Đối tác công nghệ tin cậy:
                    </strong>{' '}
                    Đồng hành cùng các doanh nghiệp SME đang trên hành trình hiện đại hóa mô hình vận hành.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-slate-800">
                      Tiên phong chuẩn hóa ngành:
                    </strong>{' '}
                    Tích hợp toàn diện thiết kế CAD 2D/3D, bóc tách vật tư và quản lý thi công trên một nền tảng.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-slate-800">
                      Kiến tạo giá trị dài hạn:
                    </strong>{' '}
                    Giúp xưởng và nhà thầu nâng cao năng lực cạnh tranh và tối ưu hóa lợi nhuận.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-primary hover:text-primary hover:shadow-sm"
              >
                <span>Xem hệ sinh thái giải pháp</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
