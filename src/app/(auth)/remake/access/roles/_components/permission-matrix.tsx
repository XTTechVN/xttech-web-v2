import { Building2, Check, Minus, User, Users, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Effect, PermissionCatalogItem, Scope } from '@/types';

export interface RowState {
  effect: Effect | null;
  scope: Scope;
}

const ORDER: Record<Scope, number> = { own: 1, dept: 2, org: 3 };
const SCOPE_LABEL: Record<Scope, string> = { own: 'chỉ của mình', dept: 'trong phòng ban', org: 'cả doanh nghiệp' };
const SCOPE_ICON: Record<Scope, typeof User> = { own: User, dept: Users, org: Building2 };

// Vòng trạng thái của một quyền: tắt → cho phép (rộng nhất → hẹp dần) → chặn → tắt.
export function next(item: PermissionCatalogItem, state: RowState, maxScope?: Scope): RowState {
  const scopes = item.scopes.filter((s) => !maxScope || ORDER[s] <= ORDER[maxScope]).sort((a, b) => ORDER[b] - ORDER[a]);
  if (state.effect === 'deny') return { ...state, effect: null };
  if (state.effect === 'allow') {
    const i = scopes.indexOf(state.scope);
    return i >= 0 && i < scopes.length - 1 ? { effect: 'allow', scope: scopes[i + 1] } : { ...state, effect: 'deny' };
  }
  return { effect: 'allow', scope: scopes[0] ?? state.scope };
}

interface CellProps {
  item: PermissionCatalogItem;
  state: RowState;
  locked?: string;
  maxScope?: Scope;
  onChange: (code: string, s: RowState) => void;
}

// Ô vuông kiểu checkbox: bật = nền đậm + dấu trắng, chặn = nền đỏ, một phần = dấu trừ, tắt = trắng viền mảnh.
export function Box({ kind, icon: Icon }: { kind: 'on' | 'part' | 'deny' | 'off'; icon?: typeof Check }) {
  const Glyph = kind === 'deny' ? X : kind === 'part' ? Minus : (Icon ?? Check);
  return (
    <span
      className={cn(
        'flex size-5 items-center justify-center rounded-rm-sm border',
        kind === 'on' || kind === 'part'
          ? 'border-rm-primary bg-rm-primary text-white'
          : kind === 'deny'
            ? 'border-rm-danger bg-rm-danger text-white'
            : 'border-rm-line bg-rm-surface text-transparent',
      )}
    >
      <Glyph size={14} strokeWidth={3} aria-hidden="true" />
    </span>
  );
}

export function Cell({ item, state, locked, maxScope, onChange }: CellProps) {
  const allow = state.effect === 'allow';
  const deny = state.effect === 'deny';
  const multi = item.scopes.length > 1;
  const text = deny ? 'bị chặn' : allow ? `cho phép${multi ? `, ${SCOPE_LABEL[state.scope]}` : ''}` : 'tắt';
  const kind = deny ? 'deny' : allow ? 'on' : 'off';
  return (
    <button
      type="button"
      disabled={!!locked}
      title={locked ?? `${item.nameVi}: ${text}`}
      aria-label={`${item.nameVi}: ${text}`}
      onClick={() => onChange(item.code, next(item, state, maxScope))}
      className={cn(
        'flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
        'size-9 md:size-8',
      )}
    >
      <Box kind={kind} icon={allow && multi ? SCOPE_ICON[state.scope] : Check} />
    </button>
  );
}

const LEGEND: { kind: 'on' | 'part' | 'deny' | 'off'; icon?: typeof Check; label: string; hint: string }[] = [
  { kind: 'off', label: 'Trống', hint: 'Chưa cấp quyền' },
  { kind: 'on', label: 'Cho phép', hint: 'Quyền không chia phạm vi' },
  { kind: 'on', icon: Building2, label: 'Cả doanh nghiệp', hint: 'Phạm vi rộng nhất' },
  { kind: 'on', icon: Users, label: 'Trong phòng ban', hint: 'Chỉ phòng ban của người dùng' },
  { kind: 'on', icon: User, label: 'Chỉ của mình', hint: 'Chỉ dữ liệu của chính họ' },
  { kind: 'deny', label: 'Chặn', hint: 'Luôn thắng quyền cho phép' },
  { kind: 'part', label: 'Một phần', hint: 'Ở dòng nhóm: mới bật một số quyền' },
];

// Diễn giải ký hiệu trong ô (hiện trong ngăn kéo)
export function MatrixLegend() {
  return (
    <section aria-label="Diễn giải" className="p-rm-gutter">
      <ul className="flex flex-col gap-3">
        {LEGEND.map((l) => (
          <li key={l.label} className="flex items-center gap-2.5">
            <Box kind={l.kind} icon={l.icon} />
            <span className="min-w-0 text-sm">
              <span className="font-medium">{l.label}</span>
              <span className="text-rm-muted"> · {l.hint}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-rm-line pt-3 text-xs text-rm-muted">
        Bấm một ô để đổi: trống → rộng nhất → hẹp dần → chặn → trống. Cột mờ là vai trò hệ thống, không sửa được.
      </p>
    </section>
  );
}
