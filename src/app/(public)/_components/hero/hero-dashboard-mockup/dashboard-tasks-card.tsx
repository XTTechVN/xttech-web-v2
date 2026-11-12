import { CheckCircle2, ClipboardCheck } from 'lucide-react';

export function DashboardTasksCard() {
  return (
    <div className="rounded-lg border border-slate-200/60 bg-white p-2 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-md bg-primary/8 text-primary">
            <ClipboardCheck className="h-2.5 w-2.5" />
          </span>
          <div>
            <div className="text-[6.5px] font-extrabold uppercase text-slate-800">
              CÔNG VIỆC & NHẮC VIỆC CỦA TÔI
            </div>
            <div className="text-[5.5px] text-slate-400">
              Theo dõi hạn hoàn thành công việc & lịch bảo hành được giao
            </div>
          </div>
        </div>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[5.5px] font-semibold text-primary whitespace-nowrap">
          Mở bảng công việc →
        </span>
      </div>

      <div className="mt-1.5 grid grid-cols-4 gap-1 text-[5.8px] whitespace-nowrap">
        <div className="rounded-md border border-slate-200/70 bg-slate-50/50 px-1.5 py-1">
          <div className="text-slate-500">Cần thực hiện</div>
          <div className="mt-0.5 text-[9px] font-black text-primary">0</div>
        </div>
        <div className="rounded-md border border-amber-200/70 bg-amber-50/40 px-1.5 py-1">
          <div className="text-amber-700">Sắp hết hạn (24h)</div>
          <div className="mt-0.5 text-[9px] font-black text-amber-600">0</div>
        </div>
        <div className="rounded-md border border-rose-200/70 bg-rose-50/40 px-1.5 py-1">
          <div className="text-rose-700">Quá hạn</div>
          <div className="mt-0.5 text-[9px] font-black text-rose-600">0</div>
        </div>
        <div className="rounded-md border border-emerald-200/70 bg-emerald-50/40 px-1.5 py-1">
          <div className="text-emerald-700">Xong hôm nay</div>
          <div className="mt-0.5 text-[9px] font-black text-emerald-600">0</div>
        </div>
      </div>

      <div className="mt-1 flex items-center gap-1 text-[5.5px] font-medium text-emerald-600">
        <CheckCircle2 className="h-2 w-2" />
        <span>Tuyệt vời! Bạn đã hoàn thành toàn bộ công việc được giao.</span>
      </div>
    </div>
  );
}
