import { cn } from '@/utils/cn';

export const messageOf = (e: unknown) =>
  (e as { response?: { data?: { details?: { message?: string } } } })?.response?.data?.details?.message ?? (e as Error)?.message ?? 'Có lỗi xảy ra';

const BTN =
  'inline-flex h-rm-tap flex-none items-center justify-center gap-2 rounded-rm px-4 text-sm font-medium transition-[background-color,transform] duration-(--rm-dur-fast) active:scale-95 disabled:opacity-60 md:h-rm-control';
export const BTN_PRIMARY = cn(BTN, 'bg-rm-primary text-rm-on-primary md:hover:bg-rm-primary-hover');
export const BTN_LINE = cn(BTN, 'border border-rm-line bg-rm-surface text-rm-text active:bg-rm-bg md:hover:bg-rm-bg');
export const BTN_DANGER = cn(BTN, 'border border-rm-line bg-rm-surface text-rm-danger active:bg-rm-danger-soft md:hover:bg-rm-danger-soft');

export const INPUT =
  'h-rm-tap w-full rounded-rm border border-rm-line bg-rm-surface px-3 text-base text-rm-text outline-none focus-visible:border-rm-primary md:h-rm-control md:text-sm';

export function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-rm-text">
        {label}
      </label>
      {children}
    </div>
  );
}
