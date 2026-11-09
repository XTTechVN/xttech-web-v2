import React from 'react';
import Link from 'next/link';
import { Award, Layers, PhoneCall, Target } from 'lucide-react';
import { Button } from '@/components';
import { ACCENT, CORE_PILLARS, MISSION_VISION } from './hero.constants';

export const HeroStoryPillarsSection = () => {
  return (
    <>
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
                  className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-300 sm:p-8 ${
                    idx === 0
                      ? 'border border-primary/20 bg-primary text-white shadow-xl hover:shadow-2xl'
                      : 'border border-gray-200 bg-white text-gray-900 shadow-sm hover:border-primary/30 hover:shadow-lg'
                  }`}
                >
                  {idx === 0 && (
                    <div
                      className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full opacity-25 blur-3xl"
                      style={{ background: `radial-gradient(circle, ${ACCENT} 0%, transparent 70%)` }}
                    />
                  )}
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold tracking-wider uppercase ${idx === 0 ? 'text-[#d6ff3d]' : 'text-primary'}`}>
                        {box.subtitle}
                      </span>
                      <Award className={`h-5 w-5 ${idx === 0 ? 'text-[#d6ff3d]' : 'text-primary'}`} />
                    </div>
                    <h3 className={`text-2xl font-black ${idx === 0 ? 'text-white' : 'text-gray-900'}`}>{box.title}</h3>
                    <p className={`text-sm leading-relaxed ${idx === 0 ? 'text-white/80' : 'text-gray-600'}`}>{box.desc}</p>
                    <div className={`pt-2 text-xs italic ${idx === 0 ? 'font-semibold text-white/95' : 'font-bold text-primary'}`}>
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
                  Đội ngũ chuyên gia của XTTech luôn sẵn sàng tư vấn giải pháp, khảo sát thực tế và demo trực tiếp các tính năng phù hợp nhất với quy
                  mô của bạn.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <Link href="/">
                  <Button
                    size="lg"
                    className="w-full rounded-full font-bold text-primary shadow-lg transition-transform hover:scale-105 sm:w-auto"
                    style={{ backgroundColor: ACCENT }}
                  >
                    Đăng ký dùng thử ngay
                  </Button>
                </Link>
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
    </>
  );
};
