import { HeroProjectReportsCarousel } from '../hero-project-reports-carousel';

export function ProjectReportsSection() {
  return (
    <section className="relative overflow-hidden bg-white py-6 lg:py-8 border-b border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề đặc trưng theo Ảnh 4: "Hàng loạt báo cáo thi công" màu vàng/cam + "được tự động tổng hợp cho CEO/ BQLDA" */}
        <div className="mb-4 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            <span className="text-primary">Báo cáo sản xuất &amp; tiến độ công trình</span>{' '}
            <span>tổng hợp trực quan cho Chủ xưởng</span>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Giao diện phần mềm XTTech minh họa quy trình theo dõi đơn hàng, bóc tách vật tư, lệnh sản xuất và nghiệm thu trên cùng một màn hình.
          </p>
        </div>

        {/* Carousel hiển thị tối đa 3 ảnh, trượt xoay vòng tròn */}
        <HeroProjectReportsCarousel />
      </div>
    </section>
  );
}
