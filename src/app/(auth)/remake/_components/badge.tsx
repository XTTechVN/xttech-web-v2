import { cn } from '@/utils/cn';

export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

const TONE: Record<Tone, string> = {
  neutral: 'bg-rm-bg text-rm-muted',
  primary: 'bg-rm-primary-soft text-rm-primary',
  success: 'bg-rm-success-soft text-rm-success',
  warning: 'bg-rm-warning-soft text-rm-warning',
  danger: 'bg-rm-danger-soft text-rm-danger',
};

// Nhãn nhỏ để nhận ra trạng thái / phân loại ngay trên dòng danh sách.
export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={cn('inline-block max-w-full flex-none truncate rounded-rm-sm px-2 py-0.5 text-xs font-medium', TONE[tone])}>{children}</span>
  );
}

// Biến thể màu cũ (`BadgeProps['variant']`) → tông của Badge mới.
export const toneOf = (variant?: string): Tone => (variant === 'info' ? 'primary' : variant && variant in TONE ? (variant as Tone) : 'neutral');
