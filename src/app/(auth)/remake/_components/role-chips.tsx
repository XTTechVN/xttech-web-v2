'use client';

import { cn } from '@/utils/cn';
import type { DemoRole } from '../_mock/demo-roles';

interface RoleChipsProps {
  roles: DemoRole[];
  value: string;
  onChange: (code: string) => void;
}

// Chip cuộn ngang trên điện thoại (chip chọn tự cuộn vào giữa), từ 768px xuống dòng
export function RoleChips({ roles, value, onChange }: RoleChipsProps) {
  return (
    <div
      role="group"
      aria-label="Chọn vai trò"
      className="-mx-rm-gutter flex gap-2 overflow-x-auto px-rm-gutter pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
    >
      {roles.map((r) => (
        <button
          key={r.code}
          type="button"
          aria-pressed={r.code === value}
          onClick={(e) => {
            onChange(r.code);
            e.currentTarget.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
          }}
          className={cn(
            'h-rm-tap flex-none rounded-rm border px-3 text-sm font-medium transition-[background-color,color,transform] duration-(--rm-dur-fast) active:scale-95 md:h-rm-control',
            r.code === value ? 'border-rm-primary bg-rm-primary text-rm-on-primary' : 'border-rm-line bg-rm-surface text-rm-text',
          )}
        >
          {r.name}
        </button>
      ))}
    </div>
  );
}
