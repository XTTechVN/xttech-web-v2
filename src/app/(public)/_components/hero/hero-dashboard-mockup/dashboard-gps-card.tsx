import { ArrowUpRight, Navigation } from 'lucide-react';
import { GPS_STAFF } from './hero-dashboard-mockup.constants';

export function DashboardGpsCard() {
  return (
    <div className="rounded-lg border border-slate-200/60 bg-white p-2 shadow-2xs">
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-center gap-1">
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded bg-primary/8 text-primary">
            <Navigation className="h-2 w-2" />
          </span>
          <div className="leading-none">
            <div className="text-[6.2px] font-extrabold text-slate-800">
              Nhân sự thực địa (Live GPS)
            </div>
            <div className="mt-0.5 text-[5px] text-slate-400">
              Kỹ thuật viên đang bật định vị
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1 py-0.2 text-[5px] font-bold text-emerald-600 whitespace-nowrap">
          <span className="h-1 w-1 rounded-full bg-emerald-500" /> 8 online
        </span>
      </div>

      <div className="mt-1.5 space-y-1">
        {GPS_STAFF.map((staff) => (
          <div
            key={staff.name}
            className="flex items-center justify-between rounded border border-slate-100 bg-slate-50/60 px-1.5 py-0.5 whitespace-nowrap"
          >
            <div className="flex items-center gap-1 min-w-0">
              <span
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[5.5px] font-bold ${staff.bg}`}
              >
                {staff.init}
              </span>
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[5.8px] font-bold text-slate-800">
                  {staff.name}
                </div>
                <div className="font-mono text-[5px] text-emerald-600">
                  {staff.coords}
                </div>
              </div>
            </div>
            <span className="font-mono text-[5px] text-slate-400">{staff.time}</span>
          </div>
        ))}
      </div>

      <div className="mt-1.5 flex items-center justify-between border-t border-slate-100 pt-1 text-[5.2px] font-semibold text-primary">
        <span>Mở bản đồ giám sát toàn màn hình</span>
        <ArrowUpRight className="h-2 w-2" />
      </div>
    </div>
  );
}
