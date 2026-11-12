import { Search } from 'lucide-react';

export function DashboardTopbar() {
  return (
    <>
      {/* Top Bar: Search + User Profile */}
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-2.5 py-1">
        <div className="flex items-center gap-1 rounded-md border border-slate-200/70 bg-slate-50 px-2 py-0.5 text-[6px] text-slate-400 w-44">
          <Search className="h-2 w-2" />
          <span>Tìm kiếm hệ thống...</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="text-right leading-none">
            <div className="text-[6.5px] font-bold text-slate-800">System Administrator</div>
            <div className="mt-0.5 text-[5px] text-slate-400">Super Admin</div>
          </div>
          <div className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[6px] font-bold text-primary">
            SA
          </div>
        </div>
      </div>

      {/* Breadcrumb Bar */}
      <div className="border-b border-slate-200/60 bg-white px-2.5 py-0.5 text-[6px] font-semibold text-primary">
        Trang chủ
      </div>
    </>
  );
}
