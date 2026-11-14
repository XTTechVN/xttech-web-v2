'use client';

import React from 'react';
import type { HeroSectionDemoProps } from './hero-story-pillars.constants';
import { Sparkles } from 'lucide-react';
import { HeroAiAssistantVisual } from '../hero-ai-assistant-visual';

export function AiAssistantSection({ onOpenDemo }: HeroSectionDemoProps) {
  return (
    <section className="relative overflow-hidden bg-white py-6 lg:py-8 border-b border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Tiêu đề đặc trưng theo Ảnh 5 */}
        <div className="mx-auto max-w-3xl space-y-2 mb-2">
        
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            <span className="text-primary">Công nghệ AI</span> giảm gánh nặng nhập liệu, tự động hóa mọi tác vụ tại công trường & xưởng
          </h2>
          <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-slate-900" />
        </div>

        {/* Toàn bộ hình ảnh Robot 3D, sóng âm Voice Note, Viewfinder AI Vision và 3 Card đều được CODE 100% */}
        <HeroAiAssistantVisual />

        {/* Nút ĐĂNG KÝ NHẬN DEMO: Bình thường bg trắng border primary text primary, hover bg primary text trắng border primary */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => onOpenDemo()}
            aria-label="Đăng ký nhận demo phần mềm XTTech"
            className="group inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-primary bg-white px-10 py-3.5 text-base font-bold uppercase tracking-wider text-primary shadow-md shadow-primary/10 transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-white hover:border-primary hover:shadow-xl hover:shadow-primary/25 cursor-pointer"
          >
            <Sparkles className="h-5 w-5 text-primary transition-all duration-300 group-hover:text-white group-hover:rotate-12" />
            <span>ĐĂNG KÝ NGAY</span>
          </button>
        </div>
      </div>
    </section>
  );
}
