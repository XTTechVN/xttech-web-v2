import { ArrowRight, Calendar, Clock, Menu, ShieldCheck, Sparkles } from 'lucide-react';
import { MOBILE_UTILITIES } from './hero-dashboard-mockup.constants';

export function HeroPhoneMockup() {
  return (
    <div className="mt-5 mx-auto w-[190px] sm:mt-0 sm:mx-0 sm:w-[175px] lg:w-[185px] sm:absolute sm:right-0 sm:bottom-0 z-20">
      <div className="overflow-hidden rounded-[26px] border-[5px] border-[#181d23] bg-[#f4f7f8] shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/30">
        {/* iPhone Notch */}
        <div className="bg-white pt-1">
          <div className="mx-auto h-2 w-14 rounded-full bg-[#181d23]" />
        </div>

        {/* Mobile App Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-2.5 py-1">
          <Menu className="h-3 w-3 text-slate-700" />
          <span className="text-[7.5px] font-bold text-primary">Trang chủ</span>
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[6.5px] font-bold text-slate-700">
            SA
          </div>
        </div>

        <div className="space-y-1.5 p-2">
          {/* Greeting Card */}
          <div className="rounded-xl border border-slate-100 bg-white p-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-[8.5px] font-black text-primary">
                S
              </div>
              <div className="min-w-0 leading-tight">
                <div className="flex items-center gap-0.5 text-[6.5px] text-slate-500">
                  <span>Chào buổi chiều</span>
                  <Sparkles className="h-2 w-2 text-amber-500" />
                </div>
                <div className="truncate text-[7.5px] font-extrabold text-slate-900">
                  System Administrator
                </div>
                <div className="text-[6px] font-semibold text-primary">Trưởng phòng</div>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-1 border-t border-slate-100 pt-1 text-[6px] text-slate-500">
              <Calendar className="h-2 w-2 text-primary" />
              <span>Thứ Ba, 10/11/2026</span>
            </div>
          </div>

          {/* Dark Teal Attendance Card */}
          <div className="rounded-xl bg-linear-to-br from-primary to-[#023840] p-2 text-white shadow-xs">
            <div className="flex items-center justify-between gap-1 whitespace-nowrap">
              <div className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5 text-teal-200 shrink-0" />
                <div className="leading-tight">
                  <div className="text-[7px] font-bold">Ca làm việc linh hoạt</div>
                  <div className="text-[5.5px] text-teal-100/80">Thời gian làm việc linh hoạt</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-white/15 px-1 py-0.5 text-[5.5px] font-semibold text-teal-100">
                <ShieldCheck className="h-2 w-2" /> Chính thức
              </span>
            </div>

            <div className="mt-1.5 grid grid-cols-2 rounded-lg bg-black/20 p-1 text-[6px] whitespace-nowrap">
              <div className="border-r border-white/10 pr-1">
                <div className="text-teal-100/70">GIỜ VÀO</div>
                <div className="mt-0.5 font-bold text-hero-accent">Chưa vào ca</div>
              </div>
              <div className="pl-1.5">
                <div className="text-teal-100/70">GIỜ RA</div>
                <div className="mt-0.5 font-mono text-white/80">--:--</div>
              </div>
            </div>

            <div className="mt-1.5 flex items-center justify-center gap-1 rounded-lg bg-white py-1 text-[7px] font-bold text-primary whitespace-nowrap">
              <span>Chấm công vào ca ngay</span>
              <ArrowRight className="h-2 w-2" />
            </div>
          </div>

          {/* Tiện ích doanh nghiệp (10 tính năng) */}
          <div className="rounded-xl border border-slate-100 bg-white p-1.5 shadow-2xs">
            <div className="flex items-center justify-between text-[6px] whitespace-nowrap">
              <span className="font-extrabold uppercase tracking-wider text-slate-800">
                TIỆN ÍCH DOANH NGHIỆP
              </span>
              <span className="text-slate-400">10 tính năng</span>
            </div>

            <div className="mt-1 grid grid-cols-4 gap-y-1 gap-x-0.5 text-center text-[5.5px] font-medium text-slate-700 whitespace-nowrap">
              {MOBILE_UTILITIES.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex flex-col items-center gap-0.5">
                    <div
                      className={`relative flex h-5 w-5 items-center justify-center rounded-md ${item.bg}`}
                    >
                      <Icon className="h-2.5 w-2.5" />
                      {item.badge && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 items-center justify-center rounded-full bg-red-500 text-[4.5px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="bg-white pb-1 pt-0.5">
          <div className="mx-auto h-0.5 w-12 rounded-full bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
