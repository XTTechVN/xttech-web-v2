'use client';

import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  Search,
  ArrowRight,
  Cctv,
  Cpu,
  LineChart,
  Phone,
  MessageCircle,
} from 'lucide-react';
import useUserStore from '@/stores/useUserStore';

export default function Home() {
  const router = useRouter();
  const { user } = useUserStore();

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-white py-4 px-6 lg:px-20 flex justify-between items-center shadow-sm relative z-50">
        {/* Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
          <img
            src="https://blueai.vn/wp-content/uploads/2022/03/Logo-Vifenkaa-AI.svg"
            alt="Vifence AI Logo"
            className="h-10"
          />
        </div>

        {/* Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-[15px] font-semibold text-gray-800">
          <div className="flex items-center gap-1 cursor-pointer hover:text-[#f26522] transition">
            Giới thiệu <ChevronDown size={14} className="mt-0.5" />
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-[#f26522] transition">
            Công nghệ
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-[#f26522] transition">
            Giải pháp <ChevronDown size={14} className="mt-0.5" />
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-[#f26522] transition">
            Lĩnh vực <ChevronDown size={14} className="mt-0.5" />
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-[#f26522] transition">
            Báo giá
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-[#f26522] transition">
            Thư viện <ChevronDown size={14} className="mt-0.5" />
          </div>
          <div className="cursor-pointer hover:text-[#f26522] transition ml-2">
            <Search size={18} />
          </div>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          {!user ? (
            <button
              onClick={() => router.push('/signin')}
              className="hidden lg:block text-sm font-semibold text-gray-800 hover:text-[#f26522] transition cursor-pointer"
            >
              Đăng nhập
            </button>
          ) : (
            <button
              onClick={() => router.push('/app')}
              className="hidden lg:block text-sm font-semibold text-gray-800 hover:text-[#f26522] transition cursor-pointer"
            >
              Vào ứng dụng
            </button>
          )}
          <button className="bg-[#f26522] hover:bg-[#d9581c] text-white text-[15px] font-semibold px-6 py-2.5 rounded-full transition shadow-sm">
            Yêu cầu demo
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center py-24 lg:py-40 px-6 lg:px-20"
        style={{
          backgroundImage:
            "url('https://blueai.vn/wp-content/uploads/2021/12/background-phenikaa-ai.jpg')",
        }}
      >
        {/* Lớp phủ màu xanh đậm (nếu cần để làm nổi bật text hơn ảnh gốc) */}
        <div className="absolute inset-0 bg-[#0d2a58]/20 mix-blend-multiply" />

        <div className="relative z-10 max-w-4xl">
          <p className="text-[#f26522] font-bold text-sm md:text-base tracking-wider uppercase mb-4">
            VIFENCE AI PLATFORM
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Phân tích video với AI & Machine Learning
          </h1>
          <p className="text-lg md:text-xl text-white/95 mb-10 max-w-3xl leading-relaxed">
            Tích hợp công nghệ trí tuệ nhân tạo giúp hệ thống camera giám sát trở nên thông minh và
            hoạt động hiệu quả hơn
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button className="bg-[#f26522] hover:bg-[#d9581c] text-white text-sm md:text-base font-semibold px-8 py-3 rounded-full transition shadow-lg">
              Yêu cầu demo
            </button>
            <button className="bg-white hover:bg-gray-50 text-[#0d2a58] text-sm md:text-base font-semibold px-8 py-3 rounded-full transition shadow-lg flex items-center gap-2">
              Báo giá
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="pt-24 pb-20 px-6 lg:px-20 bg-white">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Nâng cấp camera giám sát với Vifence AI
          </h2>
          <p className="text-gray-700 text-[17px] leading-relaxed max-w-3xl mx-auto">
            Giải pháp <strong>phân tích video</strong> tích hợp lên hệ thống giám sát cho phép{' '}
            <strong>sử dụng các tính năng AI ngay trên camera IP</strong>
            <br />
            Vifence AI là nền tảng duy nhất có thể hoạt động với hầu hết camera ip phổ biến hiện nay
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-3 text-lg font-bold text-[#0d2a58] uppercase">
              <Cctv className="text-[#3b629b]" size={28} strokeWidth={1.5} />
              Giám sát tự động
            </div>
            {/* Hình ảnh minh hoạ (placeholder) */}
            <div className="w-full h-56 bg-gray-100 rounded-lg overflow-hidden mt-4 border border-gray-200/50 relative shadow-sm group cursor-pointer">
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10" />
              {/* Note: Sử dụng link ảnh tạm do không có link thực trong mô tả */}
              <img
                src="https://blueai.vn/wp-content/uploads/2021/12/giam-sat-tu-dong.jpg"
                alt="Giám sát tự động"
                className="w-full h-full object-cover"
                onError={(e) =>
                  (e.currentTarget.src =
                    'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80')
                }
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-3 text-lg font-bold text-[#0d2a58] uppercase">
              <Cpu className="text-[#3b629b]" size={28} strokeWidth={1.5} />
              Module AI tuỳ chỉnh
            </div>
            <div className="w-full h-56 bg-gray-100 rounded-lg overflow-hidden mt-4 border border-gray-200/50 relative shadow-sm group cursor-pointer">
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10" />
              <img
                src="https://blueai.vn/wp-content/uploads/2021/12/module-ai-tuy-chinh.jpg"
                alt="Module AI tuỳ chỉnh"
                className="w-full h-full object-cover"
                onError={(e) =>
                  (e.currentTarget.src =
                    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80')
                }
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-3 text-lg font-bold text-[#0d2a58] uppercase">
              <LineChart className="text-[#3b629b]" size={28} strokeWidth={1.5} />
              Khai thác dữ liệu video
            </div>
            <div className="w-full h-56 bg-gray-100 rounded-lg overflow-hidden mt-4 border border-gray-200/50 relative shadow-sm group cursor-pointer">
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10" />
              <img
                src="https://blueai.vn/wp-content/uploads/2021/12/khai-thac-du-lieu-video.jpg"
                alt="Khai thác dữ liệu video"
                className="w-full h-full object-cover"
                onError={(e) =>
                  (e.currentTarget.src =
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80')
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* Nút liên hệ/call góc dưới */}
      <div className="fixed bottom-6 left-6 flex flex-col gap-3 z-50">
        <button className="bg-[#0084ff] text-white w-12 h-12 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center">
          <MessageCircle size={24} className="fill-white" />
        </button>
        <button className="bg-[#f26522] text-white pl-3 pr-4 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2 font-bold text-[15px]">
          <Phone size={20} className="fill-white" />
          0813262228
        </button>
      </div>
    </div>
  );
}
