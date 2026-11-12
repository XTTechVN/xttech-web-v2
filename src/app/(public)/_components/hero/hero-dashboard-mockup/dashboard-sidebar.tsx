import { AlertCircle, Building2, ChevronRight, ClipboardCheck, Clock, FileSpreadsheet, FileText, FolderKanban, Headphones, LayoutDashboard, Lightbulb, MapPin, Package, PanelLeftClose, Settings, Users } from 'lucide-react';

export function DashboardSidebar() {
  return (
    <div className="hidden sm:flex sm:col-span-2 flex-col justify-between border-r border-slate-200/80 bg-white text-[5.5px] whitespace-nowrap">
      <div>
        {/* Logo Row */}
        <div className="flex items-center justify-between border-b border-slate-100 px-2 py-1.5">
          <div className="flex items-center gap-1">
            <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-primary text-[6px] font-black text-white">
              XT
            </div>
            <div className="leading-none">
              <div className="text-[7px] font-black tracking-tight text-primary">XTTECH</div>
              <div className="text-[5px] text-slate-400">v2.1.2</div>
            </div>
          </div>
          <PanelLeftClose className="h-2.5 w-2.5 text-slate-400" />
        </div>

        {/* Menu Groups */}
        <div className="space-y-1.5 p-1.5">
          {/* ĐIỀU HÀNH */}
          <div className="space-y-0.5">
            <div className="px-1 text-[4.8px] font-bold uppercase tracking-wider text-slate-400">
              ĐIỀU HÀNH
            </div>
            <div className="flex items-center gap-1 rounded bg-[#e8f2f3] px-1.5 py-0.5 font-bold text-primary">
              <LayoutDashboard className="h-2 w-2 shrink-0" />
              <span>Tổng quan</span>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-600">
              <MapPin className="h-2 w-2 shrink-0 text-slate-400" />
              <span>Bản đồ trực tiếp</span>
            </div>
          </div>

          {/* NHÂN SỰ & CHẤM CÔNG */}
          <div className="space-y-0.5">
            <div className="px-1 text-[4.8px] font-bold uppercase tracking-wider text-slate-400">
              NHÂN SỰ & CHẤM CÔNG
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-600">
              <ClipboardCheck className="h-2 w-2 shrink-0 text-slate-400" />
              <span>Công việc & Giao việc</span>
            </div>
            <div className="flex items-center justify-between px-1.5 py-0.5 text-slate-600">
              <span className="flex items-center gap-1">
                <Users className="h-2 w-2 shrink-0 text-slate-400" />
                <span>Nhân sự</span>
              </span>
              <ChevronRight className="h-2 w-2 text-slate-300" />
            </div>
            <div className="flex items-center justify-between px-1.5 py-0.5 text-slate-600">
              <span className="flex items-center gap-1">
                <Clock className="h-2 w-2 shrink-0 text-slate-400" />
                <span>Chấm công</span>
              </span>
              <ChevronRight className="h-2 w-2 text-slate-300" />
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-600">
              <FileText className="h-2 w-2 shrink-0 text-slate-400" />
              <span>Nghỉ phép & Đơn từ</span>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-600">
              <AlertCircle className="h-2 w-2 shrink-0 text-slate-400" />
              <span>Khiếu nại công</span>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-600">
              <Lightbulb className="h-2 w-2 shrink-0 text-slate-400" />
              <span>Sáng kiến & Đề xuất</span>
            </div>
          </div>

          {/* DỰ ÁN & ĐỐI TÁC */}
          <div className="space-y-0.5">
            <div className="px-1 text-[4.8px] font-bold uppercase tracking-wider text-slate-400">
              DỰ ÁN & ĐỐI TÁC
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-600">
              <FolderKanban className="h-2 w-2 shrink-0 text-slate-400" />
              <span>Dự án</span>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-600">
              <FileSpreadsheet className="h-2 w-2 shrink-0 text-slate-400" />
              <span>Duyệt báo giá</span>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-600">
              <Package className="h-2 w-2 shrink-0 text-slate-400" />
              <span>Quản lý kho</span>
            </div>
            <div className="flex items-center justify-between px-1.5 py-0.5 text-slate-600">
              <span className="flex items-center gap-1">
                <Settings className="h-2 w-2 shrink-0 text-slate-400" />
                <span>Cấu hình dự án</span>
              </span>
              <ChevronRight className="h-2 w-2 text-slate-300" />
            </div>
            <div className="flex items-center justify-between px-1.5 py-0.5 text-slate-600">
              <span className="flex items-center gap-1">
                <Building2 className="h-2 w-2 shrink-0 text-slate-400" />
                <span>Khách hàng & Đối tác</span>
              </span>
              <ChevronRight className="h-2 w-2 text-slate-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Support Footer Box */}
      <div className="m-1.5 rounded-md border border-slate-200/80 bg-slate-50/70 p-1.5 whitespace-normal">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[5.5px] font-bold text-slate-800">
            <Headphones className="h-2 w-2 text-primary" /> Hỗ trợ kỹ thuật
          </span>
          <span className="rounded bg-sky-100 px-1 text-[4.5px] font-bold text-sky-600">
            Zalo
          </span>
        </div>
        <p className="mt-0.5 text-[4.5px] leading-tight text-slate-400">
          Liên hệ để đóng góp ý kiến hoặc phản hồi sự cố hệ thống
        </p>
        <div className="mt-1 rounded bg-primary py-0.5 text-center text-[5px] font-bold text-white">
          Mở nhóm hỗ trợ ↗
        </div>
      </div>
    </div>
  );
}
