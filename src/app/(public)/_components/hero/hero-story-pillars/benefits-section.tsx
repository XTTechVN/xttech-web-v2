import { Briefcase, CheckCircle2, HardHat, Sparkles, TrendingUp, Zap } from 'lucide-react';
import Image from 'next/image';

export function BenefitsSection() {
  return (
    <section className="relative overflow-hidden bg-white py-6 lg:py-8 border-b border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header trung tâm */}
        <div className="max-w-3xl space-y-2 mb-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <Zap className="h-3.5 w-3.5" />
            <span>Giải pháp toàn diện</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Cải tiến quản lý sản xuất & thi công với <span className="text-primary">XTTech</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Phần mềm quản lý tiến độ, vật tư, bóc tách bareme & tối ưu sản xuất ngành Nhôm Kính hàng đầu Việt Nam
          </p>
        </div>

        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Cột trái: 2 Card lợi ích thiết kế sạch, màu sắc cân bằng hài hòa */}
          <div className="space-y-3.5 lg:col-span-5">
            {/* Card 1: Giám đốc & BQL Dự án */}
            <div className="group rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 p-4.5 sm:p-5 shadow-sm transition-all duration-300 hover:border-amber-300 hover:shadow-lg">
              <div className="flex items-center gap-3 pb-3 border-b border-amber-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/30">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Lợi ích cho</span>
                  <h3 className="text-base font-black text-slate-900">Giám đốc & Ban Quản Lý Dự Án</h3>
                </div>
              </div>

              <ul className="space-y-2.5 pt-3 text-xs sm:text-[13px] leading-relaxed text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <strong className="font-bold text-slate-900">Theo sát tiến độ từng bộ cửa realtime:</strong>{' '}
                    Nắm bắt tình trạng gia công xưởng và tiến độ lắp ráp công trường tức thì mà không cần có mặt trực tiếp.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <strong className="font-bold text-slate-900">Báo cáo tài chính & lãi gộp chính xác:</strong>{' '}
                    Kiểm soát chặt chẽ giá vốn vật tư, tiền công thợ và biên lợi nhuận từng dự án ngay từ khâu báo giá.
                  </div>
                </li>
              </ul>
            </div>

            {/* Card 2: Nhân viên & Thợ xưởng */}
            <div className="group rounded-2xl border border-teal-200/90 bg-gradient-to-br from-teal-50/80 via-white to-teal-50/40 p-4.5 sm:p-5 shadow-sm transition-all duration-300 hover:border-teal-300 hover:shadow-lg">
              <div className="flex items-center gap-3 pb-3 border-b border-teal-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/30">
                  <HardHat className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Lợi ích cho</span>
                  <h3 className="text-base font-black text-slate-900">Kỹ Thuật, Kế Toán & Thợ Xưởng</h3>
                </div>
              </div>

              <ul className="space-y-2.5 pt-3 text-xs sm:text-[13px] leading-relaxed text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <strong className="font-bold text-slate-900">Với Giám sát & Thợ công trình:</strong>{' '}
                    Báo cáo vật tư, khối lượng lắp ráp trực tiếp tại công trường qua điện thoại; quét mã QR nghiệm thu bàn giao nhanh gọn.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <strong className="font-bold text-slate-900">Với Kỹ thuật bóc tách & Xưởng cắt:</strong>{' '}
                    Tự động xuất lệnh sản xuất (LSX), in thẻ cắt A4 tối ưu thanh nhôm, giảm tỷ lệ nhôm vụn thừa xuống dưới 2%.
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Cột phải: Mockup Giao diện Phần mềm XTTECH thực tế sắc nét (Enterprise Application Window) */}
          <div className="lg:col-span-7">
            <div className="relative">
              {/* Hào quang nền phía sau */}
              <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-linear-to-r from-primary/10 via-amber-500/10 to-teal-500/10 blur-xl opacity-70" />

              {/* Khung Window ứng dụng XTTech */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-300/80 bg-white shadow-2xl">
                {/* Top Header thanh ứng dụng */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100/90 px-4 py-2.5 backdrop-blur-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                      <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                      <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="ml-2 text-xs font-bold text-slate-700 hidden sm:inline">
                      XTTECH XMS • Chi tiết dự án #4 Nhôm Hàn Góc Roland 134
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Hệ thống Live v2.1.2</span>
                  </div>
                </div>

                {/* Ảnh chụp giao diện thực tế 100% nguyên vẹn - Hiển thị toàn bộ tỷ lệ gốc không bị cắt */}
                <div className="w-full bg-white overflow-hidden">
                  <Image
                    src="/images/projects/project-production.png"
                    alt="Giao diện lệnh sản xuất và tiến độ phần mềm XTTech"
                    width={1024}
                    height={490}
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="w-full h-auto block object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Floating Badge 1: Tiến độ trực quan */}
              <div className="hidden sm:flex absolute -top-4 right-4 z-20 items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md animate-float-slow">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-500">Tỷ lệ hao hụt nhôm</div>
                  <div className="text-xs font-black text-emerald-600">&lt; 2.0% (Tối ưu hóa AI)</div>
                </div>
              </div>

              {/* Floating Badge 2: Mobile App đồng bộ */}
              <div className="hidden sm:flex absolute -bottom-4 left-4 z-20 items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md animate-float-delayed">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-500">Đồng bộ tức thời</div>
                  <div className="text-xs font-black text-slate-800">Xưởng ↔ Công trường</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
