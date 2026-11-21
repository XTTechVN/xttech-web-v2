import { Check, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ACTION_GROUPS } from '../_mock/role-actions';

interface RoleActionListProps {
  can: (code: string) => boolean;
  scopeOf: (code: string) => 'own' | 'dept' | 'org' | null;
}

const SCOPE_LABEL = { own: 'chỉ của mình', dept: 'trong phòng ban', org: 'toàn doanh nghiệp' } as const;

// Mỗi dòng gọi can(mã quyền): có thì hiện nút kèm phạm vi, không thì ẩn
export function RoleActionList({ can, scopeOf }: RoleActionListProps) {
  return (
    <div className="flex flex-col gap-3">
      {ACTION_GROUPS.map((group) => (
        <section key={group.title} aria-label={group.title}>
          <h3 className="mb-1 text-xs font-medium text-rm-muted">{group.title}</h3>
          <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface">
            {group.actions.map((a) => {
              const ok = can(a.code);
              const scope = scopeOf(a.code);
              return (
                <li key={a.code} className="flex min-h-rm-row items-center gap-3 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-sm', ok ? 'text-rm-text' : 'text-rm-muted')}>{a.label}</p>
                    <p className="truncate text-xs text-rm-muted">{a.code}</p>
                  </div>
                  <span
                    className={cn(
                      'inline-flex flex-none items-center gap-1 rounded-rm-sm px-2 py-0.5 text-xs font-medium',
                      ok ? 'bg-rm-success-soft text-rm-success' : 'bg-rm-bg text-rm-muted',
                    )}
                  >
                    {ok ? <Check size={14} /> : <EyeOff size={14} />}
                    {ok && scope ? `Hiện, ${SCOPE_LABEL[scope]}` : 'Ẩn'}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
