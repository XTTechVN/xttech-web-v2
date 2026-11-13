import { HeroProjectReportsCarousel } from '../hero-project-reports-carousel';

export function ProjectReportsSection() {
  return (
    <section className="relative overflow-hidden bg-slate-50/70 py-6 lg:py-8 border-b border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề đặc trưng theo Ảnh 4: "Hàng loạt báo cáo thi công" màu vàng/cam + "được tự động tổng hợp cho CEO/ BQLDA" */}
        <div className="mb-4 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            <span className="text-primary">Hàng loạt báo cáo thi công & dự án</span>{' '}
            <span>được tự động tổng hợp cho CEO / BQLDA</span>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Dữ liệu số hóa trực tiếp từ dự án thực tế #4 Nhôm Hàn Góc Roland 134 – Tự động cập nhật tức thời trên nền tảng XTTech
          </p>
        </div>

        {/* Carousel hiển thị tối đa 3 ảnh, trượt xoay vòng tròn */}
        <HeroProjectReportsCarousel />
      </div>
    </section>
  );
}
