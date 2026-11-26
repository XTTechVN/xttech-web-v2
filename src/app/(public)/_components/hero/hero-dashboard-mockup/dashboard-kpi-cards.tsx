import { TrendingUp } from 'lucide-react';
import { DASHBOARD_KPIS } from './hero-dashboard-mockup.constants';

export function DashboardKpiCards() {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {DASHBOARD_KPIS.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className="rounded-lg border border-slate-200/60 bg-white p-1.5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-4 w-4 items-center justify-center rounded-md bg-primary/8 text-primary">
                <Icon className="h-2.5 w-2.5" />
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1 py-0.5 text-[5.5px] font-bold text-emerald-600">
                <TrendingUp className="h-2 w-2" /> 0%
              </span>
            </div>
            <div className="mt-1 truncate text-[6px] font-medium text-slate-500">
              {kpi.label}
            </div>
            <div className="text-[11px] font-black leading-tight text-primary">
              {kpi.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
