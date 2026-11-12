import { AlertTriangle, XCircle } from 'lucide-react';
import Image from 'next/image';
import { PAIN_POINTS } from './hero-story-pillars.constants';

export function PainPointsSection() {
  return (
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
              {PAIN_POINTS.map((item) => (
                <div key={item.lead} className="flex items-start gap-4 group">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-2xs transition-transform group-hover:scale-110">
                    <XCircle className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700">
                    <strong className="font-bold text-slate-900">{item.lead}</strong>
                    {item.text}
                  </p>
                </div>
              ))}
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
  );
}
