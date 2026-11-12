import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardWorkspace } from './dashboard-workspace';
import { HeroPhoneMockup } from './hero-phone-mockup';

export function HeroDashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[660px] pt-2 pb-6 sm:pr-12 lg:pr-14 select-none">
      {/* ================= MACBOOK PRO MOCKUP (EXACT DESKTOP DASHBOARD UI) ================= */}
      <div className="relative z-10">
        {/* Laptop Top Lid / Screen Bezel */}
        <div className="relative mx-auto overflow-hidden rounded-t-[14px] border-[5px] border-[#1e242b] bg-[#1e242b] shadow-[0_20px_50px_rgba(0,0,0,0.45)] ring-1 ring-white/20">
          {/* Webcam dot */}
          <div className="flex justify-center bg-[#1e242b] pb-1">
            <span className="h-1 w-1 rounded-full bg-slate-600" />
          </div>

          {/* Inner Screen Viewport - Exact replica of Desktop Dashboard */}
          <div className="grid grid-cols-12 overflow-hidden rounded-t-[6px] bg-[#f5f7f9] text-slate-800">
            <DashboardSidebar />
            <DashboardWorkspace />
          </div>
        </div>

        {/* Realistic MacBook Aluminum Base / Deck */}
        <div className="relative -mx-2 sm:-mx-4">
          <div className="h-2.5 w-full rounded-t-[2px] rounded-b-lg bg-linear-to-r from-slate-400 via-slate-200 to-slate-400 shadow-md">
            <div className="mx-auto h-1 w-16 rounded-b-md bg-slate-500/70" />
          </div>
          <div className="mx-auto h-1 w-[94%] rounded-b-xl bg-slate-800/90 shadow-2xl" />
        </div>
      </div>

      {/* ================= IPHONE MOCKUP (OVERLAPPING BOTTOM-RIGHT) ================= */}
      <HeroPhoneMockup />
    </div>
  );
}
