import { cn } from '@/utils/cn';

export type TagTone = 'slate' | 'red' | 'amber' | 'orange' | 'green' | 'teal' | 'blue' | 'violet' | 'pink';

const TONE: Record<TagTone, string> = {
  slate: 'bg-slate-100 text-slate-700',
  red: 'bg-red-50 text-red-700',
  amber: 'bg-amber-50 text-amber-800',
  orange: 'bg-orange-50 text-orange-800',
  green: 'bg-green-50 text-green-800',
  teal: 'bg-teal-50 text-teal-800',
  blue: 'bg-blue-50 text-blue-700',
  violet: 'bg-violet-50 text-violet-700',
  pink: 'bg-pink-50 text-pink-700',
};

const HASHED: TagTone[] = ['blue', 'teal', 'violet', 'orange', 'green', 'pink', 'amber'];

/** Chọn màu ổn định theo chuỗi: cùng tên luôn ra cùng màu. */
export function toneFor(text: string): TagTone {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return HASHED[h % HASHED.length];
}

interface TagProps {
  tone?: TagTone;
  children: string;
  className?: string;
}

// Nhãn nhỏ bo góc vuông nhẹ (không tròn), cắt chữ dài bằng dấu …
export function Tag({ tone = 'slate', children, className }: TagProps) {
  return (
    <span
      title={children}
      className={cn('inline-block max-w-full truncate rounded-md px-2 py-0.5 text-xs font-medium leading-5', TONE[tone], className)}
    >
      {children}
    </span>
  );
}
