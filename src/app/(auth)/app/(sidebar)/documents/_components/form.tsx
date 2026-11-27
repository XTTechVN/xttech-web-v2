import { cn } from '@/utils/cn';

export const messageOf = (e: unknown) =>
  (e as { response?: { data?: { details?: { message?: string } } } })?.response?.data?.details?.message ?? (e as Error)?.message ?? 'Có lỗi xảy ra';

const BTN =
  'inline-flex h-11 flex-none items-center justify-center gap-2 rounded-control px-4 text-sm font-medium transition-[background-color,transform] duration-200 active:scale-95 disabled:opacity-60 md:h-10';
export const BTN_PRIMARY = cn(BTN, 'bg-primary text-white md:hover:bg-primary/90');
export const BTN_LINE = cn(BTN, 'border border-slate-200 bg-white text-slate-900 active:bg-slate-50 md:hover:bg-slate-50');
export const BTN_DANGER = cn(BTN, 'border border-slate-200 bg-white text-red-600 active:bg-red-50 md:hover:bg-red-50');

export const INPUT =
  'h-11 w-full rounded-control border border-slate-200 bg-white px-3 text-base text-slate-900 outline-none focus-visible:border-primary md:h-10 md:text-sm';

export function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-900">
        {label}
      </label>
      {children}
    </div>
  );
}
