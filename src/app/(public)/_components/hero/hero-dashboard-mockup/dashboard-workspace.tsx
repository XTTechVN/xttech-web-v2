import { DashboardActivityCard } from './dashboard-activity-card';
import { DashboardGpsCard } from './dashboard-gps-card';
import { DashboardKpiCards } from './dashboard-kpi-cards';
import { DashboardProjectReportCard } from './dashboard-project-report-card';
import { DashboardTasksCard } from './dashboard-tasks-card';
import { DashboardTopbar } from './dashboard-topbar';

/** Vùng làm việc bên phải của mockup dashboard desktop (10 cột). */
export function DashboardWorkspace() {
  return (
    <div className="col-span-12 sm:col-span-10 flex flex-col">
      <DashboardTopbar />

      {/* Dashboard Body */}
      <div className="space-y-1.5 p-2">
        {/* 4 Top KPI Cards */}
        <DashboardKpiCards />

        {/* Main 2 Columns (8 cols left + 4 cols right) */}
        <div className="grid grid-cols-12 gap-1.5">
          {/* Left 8 Cols */}
          <div className="col-span-8 space-y-1.5">
            <DashboardTasksCard />
            <DashboardProjectReportCard />
          </div>

          {/* Right 4 Cols: Live GPS + Hoạt động gần đây */}
          <div className="col-span-4 space-y-1.5">
            <DashboardGpsCard />
            <DashboardActivityCard />
          </div>
        </div>
      </div>
    </div>
  );
}
