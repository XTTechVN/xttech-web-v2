import { PenLine } from 'lucide-react';
import { formatVnd } from '@/utils/public-signing';

interface SignTotalBarProps {
  totalAmount: number;
  /** id của khối ký để cuộn tới; bỏ qua khi không còn khối ký. */
  targetId?: string;
}

export function SignTotalBar({ totalAmount, targetId }: SignTotalBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-primary bg-white/95 shadow-[0_-4px_16px_rgba(4,88,99,0.15)] px-4 py-2.5 backdrop-blur pb-[max(0.625rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-stone-600">Tổng cộng (đã gồm VAT)</div>
          <div className="font-mono text-lg font-extrabold tabular-nums text-primary">{formatVnd(totalAmount)}</div>
        </div>
        {targetId && (
          <a
            href={`#${targetId}`}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-bold text-white shadow-md ring-2 ring-primary/30 hover:bg-primary/90"
          >
            <PenLine size={16} aria-hidden /> Ký xác nhận
          </a>
        )}
      </div>
    </div>
  );
}
