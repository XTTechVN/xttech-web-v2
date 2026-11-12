import { Activity, Edit3, PlusCircle, RefreshCw } from 'lucide-react';

export function DashboardActivityCard() {
  return (
    <div className="rounded-lg border border-slate-200/60 bg-white p-2 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded bg-primary/8 text-primary">
            <Activity className="h-2 w-2" />
          </span>
          <div className="leading-none">
            <div className="text-[6.2px] font-extrabold text-slate-800">
              Hoạt động gần đây
            </div>
            <div className="mt-0.5 text-[4.8px] text-slate-400">
              Nhật ký và biến động thao tác trên hệ thống
            </div>
          </div>
        </div>
        <RefreshCw className="h-2 w-2 text-slate-400" />
      </div>

      <div className="mt-1.5 space-y-1 text-[5px] leading-snug">
        <div className="flex items-start gap-1 rounded border border-slate-100 bg-slate-50/50 p-1">
          <PlusCircle className="mt-0.5 h-2.5 w-2.5 shrink-0 text-emerald-500" />
          <div className="min-w-0">
            <p className="line-clamp-2 text-slate-700">
              <b>System Administrator</b> đã thêm mới news articles{' '}
              <span className="font-semibold text-primary">
                &ldquo;Làm sao để chủ xưởng nhôm kính nắm được tiến độ...&rdquo;
              </span>
            </p>
            <span className="text-[4.5px] text-slate-400">49 phút trước</span>
          </div>
        </div>

        <div className="flex items-start gap-1 rounded border border-slate-100 bg-slate-50/50 p-1">
          <Edit3 className="mt-0.5 h-2.5 w-2.5 shrink-0 text-amber-500" />
          <div className="min-w-0">
            <p className="line-clamp-2 text-slate-700">
              <b>System Administrator</b> đã cập nhật news articles{' '}
              <span className="font-semibold text-amber-700">
                &ldquo;ÁP LỰC DÒNG TIỀN CỦA CHỦ XƯỞNG NHÔM KÍNH...&rdquo;
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
