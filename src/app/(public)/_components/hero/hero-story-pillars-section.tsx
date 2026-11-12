'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle,
  Bot,
  Briefcase,
  Camera,
  CheckCircle2,
  FileCheck2,
  HardHat,
  Layers,
  Mic,
  Monitor,
  PhoneCall,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Wrench,
  XCircle,
  Zap,
} from 'lucide-react';
import { Button } from '@/components';
import { ACCENT, XTTECH_PILLAR_CARDS } from './hero.constants';
import { HeroAiAssistantVisual } from './hero-ai-assistant-visual';
import { HeroDemoModal } from './hero-demo-modal';
import { HeroProjectReportsCarousel } from './hero-project-reports-carousel';

export const HeroStoryPillarsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'workshop' | 'site'>('all');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const filteredPillars = XTTECH_PILLAR_CARDS.filter((card) => {
    if (selectedCategory === 'all') return true;
    return card.category === selectedCategory;
  });

  return (
    <>
      {/* ===================== KHỐI 1: THỰC TRẠNG DOANH NGHIỆP (THIẾT KẾ CHUẨN THEO ẢNH MẪU 2, THOÁNG ĐÃNG & SANG TRỌNG) ===================== */}
      <section className="relative overflow-hidden bg-white py-16 lg:py-24 border-b border-slate-100">
        {/* Họa tiết lưới mờ nhẹ phong cách kiến trúc */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
            {/* Cột trái: Tiêu đề lớn & 4 Nỗi đau thoáng đãng (không đóng khung hộp cứng nhắc) */}
            <div className="space-y-7 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-600 border border-rose-200/70 shadow-2xs">
                <AlertTriangle className="h-4 w-4" />
                <span>Thực trạng ngành nhôm kính & xây lắp</span>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[40px] lg:leading-tight">
                  Doanh nghiệp bạn có đang...
                </h2>
                <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
                  Những rào cản cố hữu khiến các chủ xưởng và nhà thầu khó mở rộng quy mô, thất thoát chi phí và phụ thuộc nhân sự.
                </p>
              </div>

              {/* Danh sách 4 gạch đầu dòng icon X tròn đỏ thoáng mắt (theo đúng chuẩn Ảnh 2 mẫu) */}
              <div className="space-y-5 pt-1">
                {/* Nỗi đau 1 */}
                <div className="flex items-start gap-4 group">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-2xs transition-transform group-hover:scale-110">
                    <XCircle className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700">
                    <strong className="font-bold text-slate-900">Khó khăn trong quản lý các dự án có quy mô lớn</strong>, nhiều hạng mục cửa và vách nhôm kính, nhiều nhân sự tham gia. Nhiều dự án triển khai đồng thời cũng gây khó để kiểm soát vật tư thanh nhôm, kính và phụ kiện công trình.
                  </p>
                </div>

                {/* Nỗi đau 2 */}
                <div className="flex items-start gap-4 group">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-2xs transition-transform group-hover:scale-110">
                    <XCircle className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700">
                    <strong className="font-bold text-slate-900">Công việc bóc tách bareme phụ thuộc chồng chéo</strong> gây rối ren khi giám sát tiến độ. Dữ liệu chỉ nằm trong sổ sách hoặc trí nhớ của 1 vài thợ lành nghề, thợ tự tính đề-xê gây hao hụt nhôm nghiêm trọng.
                  </p>
                </div>

                {/* Nỗi đau 3 */}
                <div className="flex items-start gap-4 group">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-2xs transition-transform group-hover:scale-110">
                    <XCircle className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700">
                    <strong className="font-bold text-slate-900">Nguy cơ chậm tiến độ, kéo dài thời gian thi công</strong> do không giám sát được chặt chẽ tiến độ từng hạng mục nhỏ: từ khảo sát đo đạc ô chờ, gia công ép góc tại xưởng đến lắp dựng và bàn giao hiện trường.
                  </p>
                </div>

                {/* Nỗi đau 4 */}
                <div className="flex items-start gap-4 group">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-2xs transition-transform group-hover:scale-110">
                    <XCircle className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700">
                    <strong className="font-bold text-slate-900">Không có môi trường trao đổi tập trung</strong>, cập nhật thông tin dự án xuyên suốt giữa các bộ phận. Trao đổi, báo cáo qua Zalo, gọi điện, nhắn tin... dẫn đến các thông tin nhận được không đồng nhất, dễ thất lạc số liệu và phát sinh tranh chấp.
                  </p>
                </div>
              </div>
            </div>

            {/* Cột phải: Vòng tròn công nghệ lớn bề thế (tỷ lệ lớn chuẩn theo Ảnh 2 mẫu) */}
            <div className="flex items-center justify-center lg:col-span-5">
              <div className="relative flex items-center justify-center py-6">
                {/* Quầng sáng nền mờ */}
                <div className="absolute h-96 w-96 sm:h-[450px] sm:w-[450px] lg:h-[500px] lg:w-[500px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none animate-pulse-glow" />

                {/* Các vòng viền công nghệ nhiều lớp (Tech Ring Layers) */}
                <div className="absolute h-88 w-88 sm:h-[420px] sm:w-[420px] lg:h-[460px] lg:w-[460px] rounded-full border border-slate-200/90" />
                <div className="absolute h-80 w-80 sm:h-[390px] sm:w-[390px] lg:h-[430px] lg:w-[430px] rounded-full border border-dashed border-primary/20 animate-spin-slow" />
                <div className="absolute h-72 w-72 sm:h-[360px] sm:w-[360px] lg:h-[400px] lg:w-[400px] rounded-full border-2 border-slate-300/60" />

                {/* Khung ảnh tròn trung tâm bề thế, sắc nét */}
                <div className="relative h-64 w-64 sm:h-80 sm:w-80 lg:h-[350px] lg:w-[350px] overflow-hidden rounded-full border-6 border-white shadow-2xl ring-4 ring-slate-100/90">
                  <Image
                    src="/images/projects/pain-points-workshop.jpg"
                    alt="Thợ gia công phân xưởng nhôm kính và cơ khí"
                    fill
                    sizes="(max-width: 640px) 256px, (max-width: 1024px) 320px, 350px"
                    className="object-cover object-center transition-transform duration-700 hover:scale-105"
                    priority
                  />
                  {/* Quầng sáng nhẹ từ tia lửa */}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/30 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating Badge 1: Cảnh báo hao hụt (Góc trên trái) */}
                <div className="absolute top-2 -left-2 sm:top-4 sm:-left-4 rounded-2xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md animate-float-slow">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Hao hụt vật tư</div>
                      <div className="text-xs font-black text-rose-600">10% - 15% Phôi nhôm</div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 2: Cảnh báo chi phí (Góc dưới phải) */}
                <div className="absolute -bottom-2 right-0 sm:-bottom-3 sm:right-2 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-xl backdrop-blur-md animate-float-delayed">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 font-black text-sm">
                      15%
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        Lãng phí ngân sách
                      </div>
                      <div className="text-xs font-black text-rose-600">
                        Nếu quản lý thủ công
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== KHỐI 2: CẢI TIẾN QUẢN LÝ VỚI XTTECH (THIẾT KẾ SAAS ENTERPRISE SANG TRỌNG) ===================== */}
      <section className="relative overflow-hidden bg-white py-16 lg:py-24 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header trung tâm */}
          <div className="max-w-3xl space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              <Zap className="h-3.5 w-3.5" />
              <span>Giải pháp toàn diện</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Cải tiến quản lý sản xuất & thi công với <span className="text-primary">XTTech</span>
            </h2>
            <p className="text-base text-slate-600">
              Phần mềm quản lý tiến độ, vật tư, bóc tách bareme & tối ưu sản xuất ngành Nhôm Kính hàng đầu Việt Nam
            </p>
          </div>

          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Cột trái: 2 Card lợi ích thiết kế sạch, màu sắc cân bằng hài hòa */}
            <div className="space-y-5 lg:col-span-5">
              {/* Card 1: Giám đốc & BQL Dự án */}
              <div className="group rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 p-6 shadow-sm transition-all duration-300 hover:border-amber-300 hover:shadow-lg">
                <div className="flex items-center gap-3 pb-4 border-b border-amber-100">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/30">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Lợi ích cho</span>
                    <h3 className="text-base font-black text-slate-900">Giám đốc & Ban Quản Lý Dự Án</h3>
                  </div>
                </div>

                <ul className="space-y-3.5 pt-4 text-xs sm:text-[13px] leading-relaxed text-slate-700">
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
              <div className="group rounded-2xl border border-teal-200/90 bg-gradient-to-br from-teal-50/80 via-white to-teal-50/40 p-6 shadow-sm transition-all duration-300 hover:border-teal-300 hover:shadow-lg">
                <div className="flex items-center gap-3 pb-4 border-b border-teal-100">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/30">
                    <HardHat className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Lợi ích cho</span>
                    <h3 className="text-base font-black text-slate-900">Kỹ Thuật, Kế Toán & Thợ Xưởng</h3>
                  </div>
                </div>

                <ul className="space-y-3.5 pt-4 text-xs sm:text-[13px] leading-relaxed text-slate-700">
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
                    <img
                      src="/images/projects/project-production.png"
                      alt="Giao diện lệnh sản xuất và tiến độ phần mềm XTTech"
                      className="w-full h-auto block object-contain"
                      loading="eager"
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

      {/* ===================== KHỐI 3: HÀNG LOẠT BÁO CÁO THI CÔNG & DỰ ÁN (CIRCULAR CAROUSEL) ===================== */}
      <section className="relative overflow-hidden bg-slate-50/70 py-16 lg:py-24 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Tiêu đề đặc trưng theo Ảnh 4: "Hàng loạt báo cáo thi công" màu vàng/cam + "được tự động tổng hợp cho CEO/ BQLDA" */}
          <div className="mb-14 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              <span className="text-primary">Hàng loạt báo cáo thi công & dự án</span>{' '}
              <span>được tự động tổng hợp cho CEO / BQLDA</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Dữ liệu số hóa trực tiếp từ dự án thực tế #4 Nhôm Hàn Góc Roland 134 – Tự động cập nhật tức thời trên nền tảng XTTech
            </p>
          </div>

          {/* Carousel hiển thị tối đa 3 ảnh, trượt xoay vòng tròn */}
          <HeroProjectReportsCarousel />
        </div>
      </section>

      {/* ===================== KHỐI 4: CÔNG NGHỆ AI TRỢ LÝ THÔNG MINH (CODE 100% SVG & VISUAL TƯƠNG TÁC SỐNG ĐỘNG) ===================== */}
      <section className="relative overflow-hidden bg-white py-16 lg:py-24 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Tiêu đề đặc trưng theo Ảnh 5 */}
          <div className="mx-auto max-w-3xl space-y-3 mb-6">
        
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              <span className="text-primary">Công nghệ AI</span> giảm gánh nặng nhập liệu, tự động hóa mọi tác vụ tại công trường & xưởng
            </h2>
            <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-slate-900" />
          </div>

          {/* Toàn bộ hình ảnh Robot 3D, sóng âm Voice Note, Viewfinder AI Vision và 3 Card đều được CODE 100% */}
          <HeroAiAssistantVisual />

          {/* Nút ĐĂNG KÝ NHẬN DEMO: Bình thường bg trắng border primary text primary, hover bg primary text trắng border primary */}
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              aria-label="Đăng ký nhận demo phần mềm XTTech"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-primary bg-white px-10 py-3.5 text-base font-bold uppercase tracking-wider text-primary shadow-md shadow-primary/10 transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-white hover:border-primary hover:shadow-xl hover:shadow-primary/25 cursor-pointer"
            >
              <Sparkles className="h-5 w-5 text-primary transition-all duration-300 group-hover:text-white group-hover:rotate-12" />
              <span>ĐĂNG KÝ NHẬN DEMO</span>
            </button>
          </div>
        </div>
      </section>

      {/* ===================== KHỐI 5: 8 TRỤ CỘT GIẢI PHÁP CỐT LÕI XTTECH ===================== */}
      <section className="py-16 lg:py-24 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Layers className="h-3.5 w-3.5" />
              <span>Giá trị cốt lõi</span>
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-primary sm:text-4xl">
              Vì sao doanh nghiệp chọn XTTech?
            </h2>
            <p className="mt-3 text-sm text-gray-600 sm:text-base leading-relaxed">
              Chúng tôi không chỉ cung cấp công cụ, chúng tôi chuyển giao cả phương pháp quản trị hiện đại đã được kiểm chứng cho ngành nhôm kính.
            </p>

            {/* Bộ lọc giải pháp */}
            <div className="mt-8 flex items-center justify-center">
              <div className="inline-flex items-center p-1 rounded-full bg-slate-100 border border-slate-200/80 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả giải pháp (08)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('workshop')}
                  className={`px-4.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    selectedCategory === 'workshop'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Phân xưởng sản xuất
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('site')}
                  className={`px-4.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    selectedCategory === 'site'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Thi công công trình
                </button>
              </div>
            </div>
          </div>

          {/* Lưới 8 Thẻ giải pháp (Lưới 4x2 với Badge số lượn sóng) */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl"
                >
                  {/* Badge số thứ tự bo góc lượn sóng ở góc trên bên phải */}
                  <div className="absolute top-0 right-0">
                    <div className="rounded-bl-2xl bg-primary px-4 py-1 text-sm font-black tracking-wider text-white shadow-xs transition-colors group-hover:bg-primary-dark">
                      {pillar.number}
                    </div>
                  </div>

                  <div className="space-y-4 flex-1 flex flex-col">
                    {/* Icon ở góc trên bên trái */}
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon className="h-5.5 w-5.5 transition-colors" />
                    </div>

                    {/* Tiêu đề in hoa đậm chất kỹ thuật */}
                    <h3 className="text-base font-black tracking-tight text-slate-900 uppercase">
                      {pillar.title}
                    </h3>

                    {/* Danh sách gạch đầu dòng */}
                    <ul className="space-y-2.5 pt-1 flex-1">
                      {pillar.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-[13px] leading-relaxed text-slate-600">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary fill-primary/15" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== BANNER LIÊN HỆ ĐỒNG HÀNH ===================== */}
      <section className="pb-16 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-white shadow-2xl sm:px-12 lg:px-16 lg:py-16">
            <div
              className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full opacity-25 blur-3xl"
              style={{ background: `radial-gradient(circle, ${ACCENT} 0%, transparent 70%)` }}
            />
            <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center justify-between gap-8 text-center lg:flex-row lg:text-left">
              <div className="max-w-2xl space-y-4">
                <div
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase backdrop-blur-sm"
                  style={{ color: ACCENT }}
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  Sẵn sàng chuyển đổi số
                </div>
                <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl lg:leading-tight">
                  Bắt đầu hành trình <br className="hidden sm:inline" />
                  nâng tầm doanh nghiệp ngay hôm nay
                </h2>
                <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                  Đội ngũ chuyên gia của XTTech luôn sẵn sàng tư vấn giải pháp, khảo sát thực tế và demo trực tiếp các tính năng phù hợp nhất với quy mô của bạn.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <Button
                  size="lg"
                  onClick={() => setIsDemoModalOpen(true)}
                  className="w-full rounded-full font-bold text-primary shadow-lg transition-transform hover:scale-105 sm:w-auto cursor-pointer"
                  style={{ backgroundColor: ACCENT }}
                >
                  Đăng ký dùng thử ngay
                </Button>
                <a href="tel:0776710766">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full rounded-full border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 sm:w-auto"
                  >
                    Hotline: 0776 710 766
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal đăng ký Demo khi bấm nút */}
      <HeroDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};

export default HeroStoryPillarsSection;
