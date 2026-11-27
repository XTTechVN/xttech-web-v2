'use client';

import { ChevronRight } from 'lucide-react';
import { Chip } from '@/components-remake';
import { cn } from '@/utils/cn';
import {
  PERMISSION_LABELS,
  PERMISSION_MODULES,
  PERMISSION_SCOPES,
  PLATFORM_ONLY_CODES,
  type PermissionCode,
  type PermissionScope,
} from '@/generated/permissions';

export type PermissionMap = Partial<Record<PermissionCode, PermissionScope>>;

const CODES = (Object.keys(PERMISSION_LABELS) as PermissionCode[]).filter((c) => !PLATFORM_ONLY_CODES.includes(c));
const MODULES = Array.from(new Set(CODES.map((c) => PERMISSION_MODULES[c])));

interface Props {
  value: PermissionMap;
  baseline: PermissionMap;
  keyword: string;
  onToggle: (code: PermissionCode) => void;
  onScope: (code: PermissionCode, scope: PermissionScope) => void;
}

// Danh sách quyền gom theo chức năng: hộp chọn bật/tắt, ô chọn phạm vi; dòng đã chỉnh so với tài khoản gốc được tô màu
export function PermissionRows({ value, baseline, keyword, onToggle, onScope }: Props) {
  const q = keyword.trim().toLowerCase();
  return (
    <div className="flex flex-col">
      {MODULES.map((module) => {
        const codes = CODES.filter(
          (c) => PERMISSION_MODULES[c] === module && (!q || c.includes(q) || PERMISSION_LABELS[c].toLowerCase().includes(q)),
        );
        if (codes.length === 0) return null;
        const on = codes.filter((c) => value[c]).length;
        return (
          <details key={module} open={!!q || undefined} className="group border-b border-slate-200">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 font-heading text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
              <ChevronRight size={14} className="flex-none text-slate-500 transition-transform group-open:rotate-90" />
              <span className="min-w-0 flex-1 truncate">{module}</span>
              <span className="flex-none font-body text-xs font-normal tabular-nums text-slate-600">
                {on}/{codes.length}
              </span>
            </summary>
            <ul className="pb-1">
              {codes.map((code) => {
                const scope = value[code];
                const changed = scope !== baseline[code];
                const scopes = PERMISSION_SCOPES[code];
                return (
                  <li key={code} className={cn('flex min-h-11 items-center gap-2 pl-4 pr-3', changed && 'bg-amber-50')}>
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-1.5">
                      <input type="checkbox" checked={!!scope} onChange={() => onToggle(code)} className="size-4 flex-none accent-primary" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-slate-900">{PERMISSION_LABELS[code]}</span>
                        <span className="block truncate text-xs text-slate-600">{code}</span>
                      </span>
                    </label>
                    {scope && scopes.length > 1 && (
                      <Chip
                        selected
                        className="min-h-8 flex-none px-2 text-xs"
                        aria-label={`Phạm vi ${code}: ${scope}, bấm để đổi`}
                        onClick={() => onScope(code, scopes[(scopes.indexOf(scope) + 1) % scopes.length])}
                      >
                        {scope}
                      </Chip>
                    )}
                  </li>
                );
              })}
            </ul>
          </details>
        );
      })}
    </div>
  );
}
