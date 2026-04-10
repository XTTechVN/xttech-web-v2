'use client';

import { useRouter } from 'next/navigation';
import { Shield, ArrowRight } from 'lucide-react';
import useUserStore from '@/stores/useUserStore';

export default function Home() {
  const router = useRouter();
  const { user } = useUserStore();

  console.log(user);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Dark blue top section */}
      <div className="bg-blue-dark text-white pt-8 pb-48 px-6 lg:px-20 relative overflow-hidden">
        {/* Navbar */}
        <div className="flex justify-between items-center max-w-6xl mx-auto mb-20 relative z-10">
          <div className="flex items-center gap-2 font-bold text-xl tracking-wide">
            <span className="text-white">Camera Vision AI</span>
          </div>
          {user && (
            <div className="text-sm font-medium text-slate-300">
              Chào mừng trở lại {user.fullName}
            </div>
          )}
          {!user && (
            <button
              onClick={() => router.push('/signin')}
              className="cursor-pointer group flex items-center justify-center gap-2 text-[#de6a40] hover:text-[#c4532b] transition-colors font-semibold text-sm"
            >
              Đăng nhập
            </button>
          )}
        </div>

        {/* Hero Content */}
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl tracking-tight mb-4 text-white">Bảng Điều Khiển</h1>
        </div>
      </div>

      {/* Overlapping Content Area */}
      <div className="max-w-6xl mx-auto px-6 lg:px-0 -mt-24 relative z-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Action Card */}
          <div className="bg-white shadow-xl p-8 md:col-span-2 border border-slate-100 border-t-4 border-t-slate-900">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl text-slate-900 mb-2 flex items-center gap-2">
                  <span className="bg-blue-dark p-1.5">
                    <Shield className="w-5 h-5 text-white" />
                  </span>
                  Tổng quan hệ thống
                </h2>
                <p className="text-slate-500 mt-2 text-sm max-w-md">
                  Chúng tôi đã phân tích và đề xuất các cấu hình hệ thống dựa trên thông số phần
                  cứng theo thời gian thực.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 mt-4">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-500 block mb-2 font-semibold">
                    Thiết bị hoạt động
                  </span>
                  <span className="text-xl font-bold text-slate-800">MẠNG LƯỚI CAMERA</span>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider text-slate-500 block mb-2 font-semibold">
                    Tải hệ thống
                  </span>
                  <span className="text-xl font-bold text-slate-800">52.78%</span>
                </div>
              </div>

              {/* Progress bar representing connectivity/uptime */}
              <div className="w-full bg-[#fde9df] rounded-full h-3 mb-8">
                <div className="bg-[#de6a40] h-3 rounded-full" style={{ width: '52.78%' }}></div>
              </div>

              <div className="flex justify-between border-t border-b border-slate-100 py-4 mb-6">
                <span className="text-slate-600 font-medium">
                  Mức độ cảnh báo hiện tại của hệ thống
                </span>
                <span className="text-2xl text-slate-900 font-bold">Ổn định</span>
              </div>

              <button
                onClick={() => {
                  if (user) {
                    router.push('/app');
                  } else {
                    router.push('/signin');
                  }
                }}
                className="cursor-pointer group flex items-center justify-center gap-2 text-[#de6a40] hover:text-[#c4532b] transition-colors font-semibold text-sm"
              >
                Chuyển đến trang quản lý
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Stats Cards Column */}
          <div className="flex flex-col gap-6">
            <div className="bg-white shadow-xl p-8 border border-slate-100">
              <h3 className="text-2xl text-slate-900 mb-6 font-bold">AI Phân Tích</h3>
              <div>
                <span className="text-sm font-semibold text-slate-600 block mb-1">
                  Số khung hình đã xử lý
                </span>
                <span className="text-4xl font-bold text-slate-900">8,324</span>
              </div>
              <div className="mt-8">
                <span className="text-xs uppercase text-[#de6a40] font-semibold flex items-center gap-1 cursor-pointer">
                  Xem báo cáo chi tiết
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            <div className="bg-blue-dark shadow-xl p-8 text-white h-full border border-[#173a61] flex flex-col justify-end min-h-[200px]">
              <h3 className="text-2xl tracking-wide leading-tight font-bold">
                Sơ đồ
                <br />
                Camera
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
