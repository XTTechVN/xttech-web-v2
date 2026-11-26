import { Activity, BarChart3, FolderKanban, PieChart } from 'lucide-react';
import { PROJECT_STAGES } from './hero-dashboard-mockup.constants';

export function DashboardProjectReportCard() {
  return (
    <div className="rounded-lg border border-slate-200/60 bg-white p-2 shadow-2xs">
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-start gap-1.5">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary">
            <FolderKanban className="h-2.5 w-2.5" />
          </span>
          <div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <span className="text-[7px] font-extrabold text-slate-800">
                Báo cáo dự án
              </span>
              <span className="rounded bg-primary/10 px-1 py-0.2 text-[5.2px] font-semibold text-primary">
                4 công trình
              </span>
              <span className="rounded bg-slate-100 px-1 py-0.2 text-[5.2px] text-slate-600">
                28 bộ cửa · 79.56 m²
              </span>
            </div>
            <div className="text-[5.2px] text-slate-400">
              Tổng hợp dòng tiền hợp đồng, tiến độ sản xuất cửa và bảo hành toàn công ty
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5 rounded-md border border-slate-200 p-0.5 text-[5.2px] whitespace-nowrap">
          <span className="inline-flex items-center gap-0.5 rounded bg-primary px-1 py-0.5 font-bold text-white">
            <BarChart3 className="h-2 w-2" /> Cột
          </span>
          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 text-slate-500">
            <PieChart className="h-2 w-2" /> Tròn
          </span>
          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 text-slate-500">
            <Activity className="h-2 w-2" /> Sóng
          </span>
        </div>
      </div>

      {/* 3 Financial Boxes */}
      <div className="mt-1.5 grid grid-cols-3 gap-1 text-[5.8px] whitespace-nowrap">
        <div className="rounded-md border border-slate-200/70 bg-slate-50/40 p-1.5">
          <div className="text-slate-400">Giá trị hợp đồng</div>
          <div className="mt-0.5 font-mono text-[8px] font-black text-slate-900">
            315.562.575 ₫
          </div>
        </div>
        <div className="rounded-md border border-emerald-200/70 bg-emerald-50/30 p-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Đã thu</span>
            <span className="rounded bg-emerald-100 px-1 text-[5px] font-bold text-emerald-700">
              32%
            </span>
          </div>
          <div className="mt-0.5 font-mono text-[8px] font-black text-primary">
            100.000.000 ₫
          </div>
        </div>
        <div className="rounded-md border border-slate-200/70 bg-slate-50/40 p-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Còn phải thu</span>
            <span className="rounded bg-slate-200 px-1 text-[5px] font-bold text-slate-600">
              68%
            </span>
          </div>
          <div className="mt-0.5 font-mono text-[8px] font-black text-slate-900">
            215.562.575 ₫
          </div>
        </div>
      </div>

      {/* Progress Bar + Labels */}
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-[32%] rounded-full bg-primary" />
      </div>
      <div className="mt-0.5 flex items-center justify-between text-[5px] text-slate-500">
        <span className="flex items-center gap-0.5">
          <span className="h-1 w-1 rounded-full bg-primary" />
          Đã thanh toán: <b>32%</b> (100.000.000 ₫)
        </span>
        <span className="flex items-center gap-0.5">
          <span className="h-1 w-1 rounded-full bg-slate-400" />
          Công nợ còn lại: <b>68%</b> (215.562.575 ₫)
        </span>
      </div>

      {/* Giai đoạn công trình (4) */}
      <div className="mt-1.5">
        <div className="text-[5.5px] font-semibold text-slate-600">
          Giai đoạn công trình (4)
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[5px] whitespace-nowrap">
          {PROJECT_STAGES.map((stage) => (
            <span
              key={stage}
              className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1 py-0.2 font-medium text-slate-700"
            >
              <span className="h-1 w-1 rounded-full bg-primary" />
              {stage}
            </span>
          ))}
        </div>
      </div>

      {/* Chart Sub-tabs + Bars */}
      <div className="mt-1.5 flex items-center justify-between text-[5px]">
        <div className="inline-flex rounded bg-slate-100 p-0.5">
          <span className="rounded bg-white px-1.5 py-0.2 font-bold text-slate-800 shadow-2xs">
            Tiến độ bộ cửa (Bộ & m²)
          </span>
          <span className="px-1.5 py-0.2 text-slate-500">Giai đoạn công trình</span>
        </div>
        <span className="text-slate-400">Tổng cộng 28 bộ cửa (79.56 m²)</span>
      </div>

      <div className="mt-1 flex items-end gap-4 border-b border-slate-100 pb-0.5 pl-2 h-8 text-[5px] text-slate-400">
        <div className="flex flex-col justify-between h-full pr-1">
          <span>12</span>
          <span>9</span>
        </div>
        <div className="h-7 w-4 rounded-t bg-primary" />
        <div className="h-4 w-4 rounded-t bg-primary" />
      </div>
    </div>
  );
}
