import Link from 'next/link';

// Thành phần dùng chung cho components
import { Button } from '@/components';

// Các icons trong lucide - react
import { ArrowRight, Sparkles } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative pt-6 lg:pt-20 lg:pb-4 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-50 via-white to-white"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 text-primary text-sm font-semibold mb-8 backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          <span>Giải pháp quản trị doanh nghiệp 2.0</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight mb-8 leading-tight">
          Quản trị thông minh <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/70">
            hiệu quả, toàn diện
          </span>
        </h1>
        <p className="mt-4 text-base md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Hệ thống XTTech cung cấp các công cụ mạnh mẽ để quản lý nhân sự, tối ưu hóa quy trình và nâng cao năng suất cho doanh nghiệp của bạn.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/app">
            <Button size="lg" className="group relative w-full sm:w-auto rounded-full px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 text-white overflow-hidden">
              <span className="inline-flex transition-all duration-300 group-hover:-translate-y-8 group-hover:opacity-0">
                Bắt đầu ngay
              </span>
              <div className="absolute inset-0 flex items-center justify-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <ArrowRight className="w-5 h-5" />
              </div>
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8 bg-white hover:bg-gray-50">
              Tìm hiểu thêm
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
