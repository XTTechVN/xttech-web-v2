import { cn } from '@/utils/cn';

interface ChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  selected?: boolean;
  children: React.ReactNode;
}

// Lựa chọn dạng thẻ nhỏ (chọn một / bật tắt): cao tối thiểu 40px, chữ dài thì cắt bằng dấu …
export function Chip({ selected, className, children, type = 'button', ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        'min-h-10 max-w-full cursor-pointer truncate rounded-control border px-3 text-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
        selected ? 'border-primary bg-primary/10 font-medium text-primary' : 'border-slate-200 text-slate-700 md:hover:bg-slate-50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
