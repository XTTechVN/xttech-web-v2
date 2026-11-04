'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Factory,
  Cpu,
  Layers,
  CheckCircle2,
  Users,
  Target,
  Workflow,
  Award,
  PhoneCall,
  ZoomIn,
  ZoomOut,
  Camera,
  Share2,
  Palette,
  FileSpreadsheet,
  ChevronUp,
  ChevronDown,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components';

/* Màu nhấn (lime) – đồng bộ nhận diện thương hiệu XTTech */
const ACCENT = '#d6ff3d';

// Mạng xã hội của XTTech (chủ đạo theo màu primary)
const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/vu.quyen.547476?locale=vi_VN',
    icon: (
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    badge: 'Facebook cá nhân',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/vquyeen_27/',
    icon: (
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    badge: '@vquyeen_27',
  },
  {
    name: 'Gmail',
    href: 'mailto:quyentph2705@gmail.com',
    icon: <Mail className="h-5 w-5" />,
    badge: 'quyentph2705@gmail.com',
  },
];

// Số liệu ấn tượng về năng lực của XTTech
const STATS = [
  { value: '500+', label: 'Xưởng nhôm & Nhà thầu tin dùng' },
  { value: '120,000+', label: 'Bộ cửa & Công trình hoàn thiện' },
  { value: '35%', label: 'Giảm chi phí vận hành & vật tư thừa' },
  { value: '99.8%', label: 'Độ chính xác bóc tách & thẻ cắt A4' },
];

// Lợi thế tư vấn & chốt đơn
const ADVISE_ADVANTAGES = [
  {
    icon: FileSpreadsheet,
    title: 'Lên phương án thiết kế cửa & gửi Bản vẽ ngay',
    desc: 'Xuất Báo giá và bản thảo Hợp đồng cho khách hàng ngay tại công trình chỉ trong vài phút.',
  },
  {
    icon: Camera,
    title: 'Chụp ảnh công trình & ghép mẫu cửa thực tế',
    desc: 'Khách hàng dễ dàng hình dung ngôi nhà hoàn thiện, linh hoạt đổi màu nhôm (vân gỗ, xám ghi, sâm panh).',
  },
  {
    icon: Layers,
    title: 'Trải nghiệm 3D sống động đóng mở cửa',
    desc: 'Mô phỏng chân thực cửa đi mở quay, cửa sổ lùa, cửa gấp xếp trượt, mở song song trực quan không cần cài app.',
  },
  {
    icon: Palette,
    title: 'Màu sắc theo catalogue chuẩn hãng',
    desc: 'Xingfa, PMA, Maxpro, Slim, Topal... hiển thị đúng tỷ lệ khung cánh và kính hoa đồng sắc nét.',
  },
  {
    icon: Share2,
    title: 'Gửi link 3D xem trực tiếp qua Zalo / SMS',
    desc: 'Khách hàng mở xem mượt mà trên iPhone/Android mà không cần cài thêm bất kỳ phần mềm nào.',
  },
  {
    icon: Workflow,
    title: 'Tự động đồng bộ khi sửa đổi thiết kế',
    desc: 'Mọi tinh chỉnh kích thước hay phụ kiện lập tức được cập nhật vào link đã gửi, không lo thất lạc bản vẽ.',
  },
];

// 4 Trụ cột giải pháp
const CORE_PILLARS = [
  {
    icon: Factory,
    title: 'Chuyên biệt ngành Cửa & Nhôm Kính',
    desc: 'Thiết kế may đo cho xưởng sản xuất, tự động bóc tách kỹ thuật, tối ưu thanh nhôm tránh vụn nhôm thừa và in thẻ cắt A4 phân ca.',
    tag: 'Sản xuất thông minh',
  },
  {
    icon: Workflow,
    title: 'Liền mạch từ Báo giá đến Công trường',
    desc: 'Chu trình khép kín: Khảo sát ô chờ, live pricing engine lãi gộp, ký hợp đồng số, lệnh sản xuất và KCS nghiệm thu qua mã QR.',
    tag: 'Quy trình chuẩn ISO',
  },
  {
    icon: Users,
    title: 'Đồng hành tái cấu trúc xưởng 1-1',
    desc: 'Không dừng lại ở phần mềm đóng gói, chuyên gia XTTech trực tiếp tới xưởng hướng dẫn văn phòng & thợ cơ khí, chuẩn hóa kho vật tư.',
    tag: 'Chuyển giao thực chiến',
  },
  {
    icon: Cpu,
    title: 'Công nghệ tiên phong & Đa nền tảng',
    desc: 'Hoạt động trên Web, Tablet và Mobile App. Tích hợp chấm công GPS chống gian lận, ký điện tử và quản lý tiến độ thời gian thực.',
    tag: 'Hệ sinh thái 4.0',
  },
];

// Tầm nhìn & Sứ mệnh
const MISSION_VISION = [
  {
    title: 'Tầm nhìn chiến lược',
    subtitle: 'Kiến tạo vị thế số 1',
    desc: 'Trở thành nền tảng công nghệ số hàng đầu chuyên sâu cho ngành cơ khí, nhôm kính và xây lắp công trình — nâng tầm năng lực số cho hàng chục ngàn doanh nghiệp.',
    highlight: 'Dẫn đầu công nghệ quản trị sản xuất nhôm kính thế hệ mới.',
  },
  {
    title: 'Sứ mệnh phụng sự',
    subtitle: 'Giải phóng sức lao động',
    desc: 'Biến những khâu thủ công phức tạp, nhầm lẫn và thất thoát vật tư trở nên minh bạch chỉ qua vài chạm, giúp chủ xưởng nắm chắc lãi lỗ từng công trình.',
    highlight: 'Mang lại sự an tâm tuyệt đối và lợi nhuận bền vững cho khách hàng.',
  },
];

export const Hero = () => {
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [activeTab, setActiveTab] = useState<'wood' | 'grey' | 'white'>('wood');
  // State quản lý việc ẩn / hiện thanh dock các nút liên hệ
  const [dockOpen, setDockOpen] = useState<boolean>(true);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-white font-sans text-gray-900 selection:bg-primary/10 selection:text-primary">
      {/* ===================== FLOATING QUICK CONTACT DOCK (ĐẦY ĐỦ ICON VÀ CÓ NÚT ẨN / HIỆN) ===================== */}
      <div className="fixed right-3 bottom-6 z-50 flex flex-col items-center gap-2.5 sm:right-6">
        {/* Nhóm các nút liên kết mạng xã hội (có thể thu gọn/ẩn đi hoặc mở ra) */}
        <div
          className={`flex flex-col items-center gap-2.5 transition-all duration-300 ease-in-out ${
            dockOpen ? 'pointer-events-auto max-h-[420px] scale-100 opacity-100' : 'pointer-events-none max-h-0 scale-75 overflow-hidden opacity-0'
          }`}
        >
          {/* 1. Nút Zalo: 0865853327 */}
          <a
            href="https://zalo.me/0865853327"
            target="_blank"
            rel="noopener noreferrer"
            title="Zalo: 0865 853 327"
            className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-lg shadow-blue-500/30 transition-transform duration-300 hover:scale-110"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="pointer-events-none absolute right-13 whitespace-nowrap rounded-lg bg-blue-600 px-2.5 py-1 text-xs text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              Zalo: 0865 853 327 - quyenn
            </span>
          </a>

          {/* 2. Nút Facebook: https://www.facebook.com/vu.quyen.547476?locale=vi_VN */}
          <a
            href="https://www.facebook.com/vu.quyen.547476?locale=vi_VN"
            target="_blank"
            rel="noopener noreferrer"
            title="Facebook cá nhân"
            className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg shadow-blue-600/30 transition-transform duration-300 hover:scale-110"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="pointer-events-none absolute right-13 whitespace-nowrap rounded-lg bg-blue-700 px-2.5 py-1 text-xs text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              Facebook: Vũ Quyên
            </span>
          </a>

          {/* 3. Nút Instagram: https://www.instagram.com/vquyeen_27/ */}
          <a
            href="https://www.instagram.com/vquyeen_27/"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram: @vquyeen_27"
            className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white shadow-lg shadow-pink-500/30 transition-transform duration-300 hover:scale-110"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span className="pointer-events-none absolute right-13 whitespace-nowrap rounded-lg bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] px-2.5 py-1 text-xs text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              Instagram: @vquyeen_27
            </span>
          </a>

          {/* 4. Nút Gmail: quyentph2705@gmail.com */}
          <a
            href="mailto:quyentph2705@gmail.com"
            title="Gửi Email tới quyentph2705@gmail.com"
            className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-[#EA4335] text-white shadow-lg shadow-red-500/30 transition-transform duration-300 hover:scale-110"
          >
            <Mail className="h-5 w-5" />
            <span className="pointer-events-none absolute right-13 whitespace-nowrap rounded-lg bg-[#EA4335] px-2.5 py-1 text-xs text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              quyentph2705@gmail.com
            </span>
          </a>

          {/* 5. Nút Gọi Hotline nhanh */}
          <a
            href="tel:0865853327"
            title="Gọi Hotline: 0865 853 327"
            className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform duration-300 hover:scale-110"
          >
            <PhoneCall className="h-5 w-5" />
            <span className="pointer-events-none absolute right-13 whitespace-nowrap rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              Hotline: 0865 853 327
            </span>
          </a>
        </div>

        {/* Nút ẨN / HIỆN CÁC NÚT (TOGGLE DOCK BUTTON) */}
        <button
          type="button"
          onClick={() => setDockOpen((prev) => !prev)}
          title={dockOpen ? 'Ẩn các nút liên hệ' : 'Hiện các nút liên hệ'}
          className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
            dockOpen ? 'bg-gray-800 text-white hover:bg-gray-900' : 'bg-primary text-white hover:bg-primary/90 ring-4 ring-primary/20'
          }`}
        >
          {dockOpen ? (
            <ChevronDown className="h-5 w-5 transition-transform duration-200" />
          ) : (
            <ChevronUp className="h-5 w-5 transition-transform duration-200" />
          )}
        </button>

        {/* Nút Cuộn lên đầu trang (Top) */}
        <button
          type="button"
          onClick={scrollToTop}
          title="Cuộn lên đầu trang"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition-all hover:bg-gray-100 hover:text-primary active:scale-90"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>

      {/* ===================== HERO TOP SECTION ===================== */}
      <section id="about" className="scroll-mt-20 relative overflow-hidden pt-8 pb-14 lg:pt-14 lg:pb-20">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-white to-white" />
        <div className="pointer-events-none absolute top-12 left-1/2 -z-10 h-72 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm sm:text-sm">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <span>Về chúng tôi — Hệ sinh thái XTTech</span>
            </div>

            {/* Tiêu đề chính */}
            <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 sm:text-6xl lg:leading-[1.15]">
              Tiên phong số hóa <br />
              <span className="text-primary">ngành nhôm & xây dựng</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
              XTTech kết nối liền mạch từ khảo sát ô chờ, bóc tách kỹ thuật, dự toán báo giá đến quản lý phân xưởng và nghiệm thu công trình.
            </p>

            {/* Nút hành động */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Link href="/signin" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-8 text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl sm:w-auto"
                >
                  <span>Khám phá giải pháp</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full border-gray-300 bg-white px-8 text-gray-800 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary sm:w-auto"
                >
                  Xem bảng giá dịch vụ
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-12 grid grid-cols-2 gap-4 rounded-3xl border border-primary/10 bg-white/80 p-6 shadow-xl shadow-primary/5 backdrop-blur-sm sm:p-8 lg:grid-cols-4 lg:gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <span className="text-3xl font-black tracking-tight text-primary sm:text-4xl lg:text-5xl">{stat.value}</span>
                <span className="mt-2 text-xs font-medium text-gray-600 sm:text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== KHỐI ẢNH MẪU 1: TƯ VẤN CỤ THỂ – BÁO GIÁ NHANH CHÓNG ===================== */}
      <section className="border-t border-gray-100 bg-[#FAF9F5] py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black tracking-tight text-[#16384C] uppercase sm:text-3xl lg:text-4xl">
              TƯ VẤN CỤ THỂ — BÁO GIÁ NHANH CHÓNG
            </h2>
            <div className="mx-auto mt-2 h-1 w-16 rounded-full" style={{ backgroundColor: '#D97706' }} />
            <p className="mt-4 text-sm text-gray-600 sm:text-base">
              Từ bản vẽ kỹ thuật sắc nét đến mô hình 3D sống động, mọi thứ đều có thể chia sẻ cho khách hàng chỉ với một liên kết.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Cột trái: Lợi thế tư vấn */}
            <div className="space-y-6 lg:col-span-6">
              <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Thiết kế & chốt phương án <span className="text-primary font-black">ngay tại công trình</span> bằng các lợi thế:
              </h3>

              <div className="space-y-4 pt-1">
                {ADVISE_ADVANTAGES.map((adv) => {
                  const Icon = adv.icon;
                  return (
                    <div key={adv.title} className="flex items-start gap-3.5 group">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{adv.title}</h4>
                        <p className="mt-0.5 text-xs leading-relaxed text-gray-600 sm:text-sm">{adv.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cột phải: Card preview Cửa 2D/3D kỹ thuật cao */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl shadow-gray-200/50 sm:p-7">
                {/* Thanh điều khiển trên Card */}
                <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="inline-flex rounded-full bg-gray-100 p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode('2D')}
                      className={`rounded-full px-4 py-1 text-xs font-bold transition-all ${
                        viewMode === '2D' ? 'bg-[#1e293b] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      2D Kỹ Thuật
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('3D')}
                      className={`rounded-full px-4 py-1 text-xs font-bold transition-all ${
                        viewMode === '3D' ? 'bg-[#1e293b] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      3D Sống Động
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab('wood')}
                      title="Nhôm vân gỗ cao cấp"
                      className={`h-5 w-5 rounded-full border-2 transition-all ${
                        activeTab === 'wood' ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-gray-300'
                      } bg-[#966b43]`}
                    />
                    <button
                      type="button"
                      onClick={() => setActiveTab('grey')}
                      title="Nhôm xám ghi Xingfa"
                      className={`h-5 w-5 rounded-full border-2 transition-all ${
                        activeTab === 'grey' ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-gray-300'
                      } bg-[#4b5563]`}
                    />
                    <button
                      type="button"
                      onClick={() => setActiveTab('white')}
                      title="Nhôm trắng sứ tĩnh điện"
                      className={`h-5 w-5 rounded-full border-2 transition-all ${
                        activeTab === 'white' ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-gray-300'
                      } bg-[#e2e8f0]`}
                    />
                  </div>

                  <div className="flex items-center gap-1 text-gray-500">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer">
                      <ZoomIn className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer">
                      <ZoomOut className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

                {/* Khung vẽ Bản vẽ Cửa CAD chuẩn tỷ lệ */}
                <div className="relative flex items-center justify-center rounded-2xl bg-white p-4 sm:p-6 min-h-[380px]">
                  <svg
                    viewBox="0 0 540 620"
                    className="w-full max-w-[420px] drop-shadow-md select-none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <pattern id="dot-grid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="0.75" fill="#cbd5e1" opacity="0.6" />
                    </pattern>
                    <rect x="0" y="0" width="540" height="620" fill="url(#dot-grid)" />

                    {/* Khuôn bao ngoài */}
                    <rect
                      x="70"
                      y="40"
                      width="340"
                      height="480"
                      rx="4"
                      fill={activeTab === 'wood' ? '#9a6a43' : activeTab === 'grey' ? '#4b5563' : '#e2e8f0'}
                      stroke="#2d3748"
                      strokeWidth="2.5"
                    />

                    {/* Lòng trong khuôn bao */}
                    <rect x="90" y="60" width="300" height="440" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />

                    {/* Cánh trái */}
                    <rect
                      x="94"
                      y="64"
                      width="144"
                      height="432"
                      fill={activeTab === 'wood' ? '#aa7a4f' : activeTab === 'grey' ? '#64748b' : '#f1f5f9'}
                      stroke="#334155"
                      strokeWidth="1.5"
                    />
                    <rect x="110" y="80" width="112" height="400" fill="#bbf7d0" fillOpacity="0.45" stroke="#10b981" strokeWidth="1" />
                    <line x1="110" y1="80" x2="222" y2="480" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2" />
                    <line x1="222" y1="80" x2="110" y2="480" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2" />
                    <circle cx="166" cy="280" r="14" fill="#fbbf24" fillOpacity="0.5" stroke="#b45309" strokeWidth="1" />
                    <line x1="166" y1="240" x2="166" y2="320" stroke="#b45309" strokeWidth="1.5" />
                    <line x1="130" y1="280" x2="202" y2="280" stroke="#b45309" strokeWidth="1.5" />

                    {/* Cánh phải */}
                    <rect
                      x="242"
                      y="64"
                      width="144"
                      height="432"
                      fill={activeTab === 'wood' ? '#aa7a4f' : activeTab === 'grey' ? '#64748b' : '#f1f5f9'}
                      stroke="#334155"
                      strokeWidth="1.5"
                    />
                    <rect x="258" y="80" width="112" height="400" fill="#bbf7d0" fillOpacity="0.45" stroke="#10b981" strokeWidth="1" />
                    <line x1="258" y1="80" x2="370" y2="480" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2" />
                    <line x1="370" y1="80" x2="258" y2="480" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2" />
                    <circle cx="314" cy="280" r="14" fill="#fbbf24" fillOpacity="0.5" stroke="#b45309" strokeWidth="1" />
                    <line x1="314" y1="240" x2="314" y2="320" stroke="#b45309" strokeWidth="1.5" />
                    <line x1="278" y1="280" x2="350" y2="280" stroke="#b45309" strokeWidth="1.5" />

                    {/* Tay nắm */}
                    <rect x="238" y="270" width="4" height="40" rx="2" fill="#0f172a" />
                    <rect x="234" y="282" width="12" height="6" rx="2" fill="#0f172a" />

                    {/* Kích thước */}
                    <line x1="430" y1="40" x2="430" y2="520" stroke="#2563eb" strokeWidth="1.5" />
                    <line x1="410" y1="40" x2="436" y2="40" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="410" y1="520" x2="436" y2="520" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="430" cy="40" r="2.5" fill="#2563eb" />
                    <circle cx="430" cy="520" r="2.5" fill="#2563eb" />
                    <text x="444" y="285" fill="#2563eb" fontSize="12" fontWeight="bold" transform="rotate(-90 444 285)">
                      2400
                    </text>

                    <line x1="50" y1="290" x2="50" y2="520" stroke="#2563eb" strokeWidth="1.5" />
                    <line x1="50" y1="290" x2="70" y2="290" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="50" y1="520" x2="70" y2="520" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="50" cy="290" r="2.5" fill="#2563eb" />
                    <circle cx="50" cy="520" r="2.5" fill="#2563eb" />
                    <text x="42" y="415" fill="#2563eb" fontSize="11" fontWeight="bold" transform="rotate(-90 42 415)">
                      1050
                    </text>

                    <line x1="70" y1="545" x2="240" y2="545" stroke="#2563eb" strokeWidth="1.5" />
                    <line x1="240" y1="545" x2="410" y2="545" stroke="#2563eb" strokeWidth="1.5" />
                    <line x1="70" y1="520" x2="70" y2="550" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="240" y1="520" x2="240" y2="550" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="410" y1="520" x2="410" y2="550" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="70" cy="545" r="2.5" fill="#2563eb" />
                    <circle cx="240" cy="545" r="2.5" fill="#2563eb" />
                    <circle cx="410" cy="545" r="2.5" fill="#2563eb" />
                    <text x="145" y="540" fill="#2563eb" fontSize="11" fontWeight="bold">
                      1000
                    </text>
                    <text x="315" y="540" fill="#2563eb" fontSize="11" fontWeight="bold">
                      1000
                    </text>

                    <line x1="70" y1="575" x2="410" y2="575" stroke="#2563eb" strokeWidth="2" />
                    <line x1="70" y1="545" x2="70" y2="580" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="410" y1="545" x2="410" y2="580" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="70" cy="575" r="3" fill="#2563eb" />
                    <circle cx="410" cy="575" r="3" fill="#2563eb" />
                    <text x="225" y="595" fill="#2563eb" fontSize="12" fontWeight="bold">
                      2000
                    </text>
                  </svg>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Hệ cửa đi 2 cánh mở quay Xingfa 55</span>
                  </div>
                  <span className="font-semibold text-primary">Tỉ lệ 1:20 • mm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== KHỐI BANNER TỐI ĐỈNH CAO: SẴN SÀNG THAY ĐỔI CÁCH THIẾT KẾ VÀ TƯ VẤN ===================== */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-[#03363D] px-6 py-12 text-white shadow-2xl sm:px-10 lg:px-14 lg:py-16">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-25 blur-3xl"
              style={{ background: `radial-gradient(circle, ${ACCENT} 0%, transparent 70%)` }}
            />
            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
              {/* Mockup Dashboard CAD */}
              <div className="w-full lg:col-span-6">
                <div className="relative mx-auto w-full max-w-xl rounded-2xl sm:rounded-3xl border border-white/20 bg-gradient-to-b from-gray-900/95 via-gray-900 to-gray-950 p-3 sm:p-5 shadow-2xl backdrop-blur-md">
                  {/* Window Bar */}
                  <div className="mb-3 sm:mb-4 flex items-center justify-between border-b border-white/10 pb-2.5 sm:pb-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-500" />
                      <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-amber-500" />
                      <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500" />
                      <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm font-bold text-gray-200">XTTech CAD Studio v2.4</span>
                    </div>
                    <span className="truncate text-[10px] sm:text-xs text-white/60">Dự án: Biệt thự Louis Riverside</span>
                  </div>

                  {/* Window Content */}
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12 sm:gap-3">
                    {/* Sidebar */}
                    <div className="col-span-1 flex flex-wrap gap-1 sm:col-span-4 sm:flex-col sm:space-y-2 rounded-xl bg-white/5 p-2.5 sm:p-3 text-[11px] sm:text-xs text-white/70">
                      <div className="w-full font-bold text-white uppercase text-[10px] sm:text-xs tracking-wider">DANH MỤC</div>
                      <div className="rounded-lg bg-primary px-2.5 py-1.5 font-medium text-white shadow-sm">Vị trí tầng 1</div>
                      <div className="px-2.5 py-1 text-white/70">Tầng 2 (4 cửa)</div>
                      <div className="px-2.5 py-1 text-white/70">Tầng 3 (6 cửa)</div>
                      <div className="w-full mt-2 sm:mt-3 font-bold text-white uppercase text-[10px] sm:text-xs tracking-wider">VẬT TƯ KHO</div>
                      <div className="px-2.5 py-1 text-white/70">Xingfa Nhập</div>
                      <div className="px-2.5 py-1 text-white/70">Phụ kiện Kinlong</div>
                    </div>

                    {/* Main Workspace */}
                    <div className="col-span-1 rounded-xl bg-white/10 p-2.5 sm:col-span-8 sm:p-3.5 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-1 border-b border-white/10 pb-2 mb-2.5 text-xs">
                          <span className="font-bold text-white">Báo giá: DA-2026-00091</span>
                          <span className="text-[#d6ff3d] font-bold text-[11px] sm:text-xs">Tự tính mBOM & Thẻ A4</span>
                        </div>

                        {/* 3 Cửa preview */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 py-1 sm:py-2">
                          <div className="rounded-lg border border-primary/40 bg-white/5 p-2 sm:p-2.5 text-center transition-transform hover:scale-105">
                            <div className="mx-auto h-14 sm:h-16 w-9 sm:w-10 rounded border-2 border-amber-500/70 bg-amber-500/10 mb-1.5 shadow-inner" />
                            <span className="block text-[10px] sm:text-[11px] font-medium text-white/90">Cửa C1 (2.4x2m)</span>
                          </div>
                          <div className="rounded-lg border border-primary/40 bg-white/5 p-2 sm:p-2.5 text-center transition-transform hover:scale-105">
                            <div className="mx-auto h-14 sm:h-16 w-11 sm:w-12 rounded border-2 border-blue-500/70 bg-blue-500/10 mb-1.5 shadow-inner" />
                            <span className="block text-[10px] sm:text-[11px] font-medium text-white/90">Cửa Sổ S2</span>
                          </div>
                          <div className="rounded-lg border border-primary/40 bg-white/5 p-2 sm:p-2.5 text-center transition-transform hover:scale-105">
                            <div className="mx-auto h-14 sm:h-16 w-10 sm:w-11 rounded border-2 border-emerald-500/70 bg-emerald-500/10 mb-1.5 shadow-inner" />
                            <span className="block text-[10px] sm:text-[11px] font-medium text-white/90">Vách Kính V1</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer bar */}
                      <div className="mt-3 rounded-lg bg-black/50 p-2 sm:p-2.5 text-[11px] sm:text-xs text-white/80 flex flex-wrap items-center justify-between gap-1 border border-white/5">
                        <span className="text-white/80">Vốn: <b className="text-white">184.500.000đ</b></span>
                        <span className="text-[#d6ff3d] font-bold">Lãi gộp: 32.4%</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Badge Mobile App - Responsive */}
                  <div className="mt-3 sm:mt-0 sm:absolute sm:-bottom-5 sm:-right-5 rounded-2xl border border-white/30 bg-[#045863]/95 p-3.5 shadow-2xl backdrop-blur-md text-white sm:max-w-[220px]">
                    <div className="flex items-center gap-1.5 font-bold text-[#d6ff3d] text-xs sm:text-sm">
                      <Sparkles className="h-4 w-4 shrink-0 text-[#d6ff3d]" />
                      <span>Đồng bộ Mobile App</span>
                    </div>
                    <p className="mt-1 text-[11px] text-white/90 leading-snug">
                      Thợ xưởng nhận ngay Thẻ cắt A4 và quét mã QR bàn giao tại chân công trình.
                    </p>
                  </div>
                </div>
              </div>

              {/* Nội dung bên phải */}
              <div className="space-y-6 lg:col-span-6">
                <div
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm"
                  style={{ color: ACCENT }}
                >
                  XTTECH PLATFORM
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-tight">
                  Sẵn sàng thay đổi <br />
                  cách thiết kế và tư vấn bán hàng?
                </h2>
                <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                  Không chỉ là phần mềm thiết kế, XTTech giúp doanh nghiệp đồng bộ quy trình từ tư vấn, thiết kế, báo giá, sản xuất đến thi công trên
                  cùng một hệ thống.
                </p>
                <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                  XTTech giúp hạn chế sai sót, nâng cao năng suất làm việc, giúp tạo hình ảnh chuyên nghiệp hơn trong mắt khách hàng.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link href="/signin">
                    <Button
                      size="lg"
                      className="w-full rounded-full font-extrabold text-primary shadow-xl transition-all duration-300 hover:scale-105 sm:w-auto"
                      style={{ backgroundColor: ACCENT }}
                    >
                      ĐĂNG KÝ DÙNG THỬ
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full rounded-full border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 sm:w-auto"
                    >
                      Xem các gói bảng giá
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CÂU CHUYỆN & SỨ MỆNH ===================== */}
      <section className="bg-gray-50/60 py-3 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                <Target className="h-3.5 w-3.5" />
                <span>Câu chuyện của XTTech</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Sinh ra từ chính trăn trở <br className="hidden sm:inline" />
                của người làm xưởng thực tế
              </h2>
              <p className="text-base leading-relaxed text-gray-600">
                Thấu hiểu những nỗi đau lớn nhất của ngành nhôm kính: tính toán barem thủ công dễ sai lệch, phụ thuộc thợ kỹ thuật cắt nhôm thừa
                thiếu, báo giá chậm làm tuột mất khách hàng và quản lý sổ sách nợ nần rời rạc.
              </p>
              <p className="text-base leading-relaxed text-gray-600">
                XTTech ra đời với mục tiêu trở thành **hệ điều hành phân xưởng thông minh**, chuẩn hóa toàn bộ tri thức kỹ thuật thành công nghệ tự
                động hóa, giúp chủ doanh nghiệp dễ dàng mở rộng quy mô mà vẫn kiểm soát tối đa từng đồng chi phí.
              </p>
            </div>

            {/* Cột phải: 2 Card Tầm nhìn & Sứ mệnh */}
            <div className="space-y-6 lg:col-span-6">
              {MISSION_VISION.map((box, idx) => (
                <div
                  key={box.title}
                  className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
                    idx === 0
                      ? 'border border-primary/20 bg-primary text-white shadow-xl hover:shadow-2xl'
                      : 'border border-gray-200 bg-white text-gray-900 shadow-sm hover:border-primary/30 hover:shadow-lg'
                  }`}
                >
                  {idx === 0 && (
                    <div
                      className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-25 blur-3xl"
                      style={{ background: `radial-gradient(circle, ${ACCENT} 0%, transparent 70%)` }}
                    />
                  )}
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wider ${idx === 0 ? 'text-[#d6ff3d]' : 'text-primary'}`}>
                        {box.subtitle}
                      </span>
                      <Award className={`h-5 w-5 ${idx === 0 ? 'text-[#d6ff3d]' : 'text-primary'}`} />
                    </div>
                    <h3 className={`text-2xl font-black ${idx === 0 ? 'text-white' : 'text-gray-900'}`}>{box.title}</h3>
                    <p className={`text-sm leading-relaxed ${idx === 0 ? 'text-white/80' : 'text-gray-600'}`}>{box.desc}</p>
                    <div className={`pt-2 text-xs font-semibold italic ${idx === 0 ? 'text-white/95' : 'text-primary font-bold'}`}>
                      &ldquo;{box.highlight}&rdquo;
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TRỤ CỘT GIÁ TRỊ CỐT LÕI ===================== */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Layers className="h-3.5 w-3.5" />
              <span>Giá trị cốt lõi</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">Vì sao doanh nghiệp chọn XTTech?</h2>
            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Chúng tôi không chỉ cung cấp công cụ, chúng tôi chuyển giao cả phương pháp quản trị hiện đại đã được kiểm chứng.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CORE_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="group relative flex flex-col justify-between rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl"
                >
                  <div className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="inline-block rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary">{pillar.tag}</span>
                    <h3 className="text-lg font-bold text-gray-900">{pillar.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-600">{pillar.desc}</p>
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
              className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-25 blur-3xl"
              style={{ background: `radial-gradient(circle, ${ACCENT} 0%, transparent 70%)` }}
            />
            <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center justify-between gap-8 text-center lg:flex-row lg:text-left">
              <div className="max-w-2xl space-y-4">
                <div
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm"
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
                  Đội ngũ chuyên gia của XTTech luôn sẵn sàng tư vấn giải pháp, khảo sát thực tế và demo trực tiếp các tính năng phù hợp nhất với quy
                  mô của bạn.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <Link href="/signin">
                  <Button
                    size="lg"
                    className="w-full rounded-full font-bold text-primary shadow-lg transition-transform hover:scale-105 sm:w-auto"
                    style={{ backgroundColor: ACCENT }}
                  >
                    Đăng ký dùng thử ngay
                  </Button>
                </Link>
                <a href="tel:0865853327">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full rounded-full border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 sm:w-auto"
                  >
                    Hotline: 0865 853 327
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
