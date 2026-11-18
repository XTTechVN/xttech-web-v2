import { Lock } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Effect, PermissionCatalogItem, Scope } from '@/types';

const SCOPE_LABEL: Record<Scope, string> = { own: 'Của mình', dept: 'Phòng ban', org: 'Cả doanh nghiệp' };

export interface RowState {
  effect: Effect | null;
  scope: Scope;
}

// Một quyền = một thẻ: cả dòng là <label> bật/tắt; "Chặn" là deny (thắng mọi quyền cho phép); ô khoá luôn kèm lý do
export const PermissionRow = ({
  item,
  state,
  lockedReason,
  maxScope,
  onChange,
}: {
  item: PermissionCatalogItem;
  state: RowState;
  lockedReason?: string;
  maxScope?: Scope;
  onChange: (next: RowState) => void;
}) => {
  const allowed = state.effect === 'allow';
  const denied = state.effect === 'deny';
  const disabled = !!lockedReason;
  const scopes = item.scopes.filter((s) => !maxScope || order(s) <= order(maxScope));

  return (
    <li className={cn('flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2', denied && 'bg-red-50')}>
      <label className={cn('flex min-w-0 flex-1 basis-56 items-center gap-3', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
        <input
          type="checkbox"
          role="switch"
          checked={allowed}
          disabled={disabled}
          onChange={(e) => onChange({ ...state, effect: e.target.checked ? 'allow' : null })}
          className="peer sr-only"
        />
        <span aria-hidden="true" className="relative h-6 w-10 flex-none rounded-full bg-gray-200 transition-colors peer-checked:bg-primary peer-disabled:opacity-50 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
        <span className="min-w-0">
          <span className="block text-sm text-gray-900">{item.nameVi}</span>
          <span className="block truncate font-mono text-xs text-gray-500">{item.code}</span>
        </span>
      </label>

      {disabled && (
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Lock size={12} aria-hidden="true" />
          {lockedReason}
        </span>
      )}

      {!disabled && allowed && scopes.length > 1 && (
        <select
          aria-label={`Phạm vi của ${item.nameVi}`}
          value={state.scope}
          onChange={(e) => onChange({ ...state, scope: e.target.value as Scope })}
          className="h-10 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700"
        >
          {scopes.map((s) => (
            <option key={s} value={s}>
              {SCOPE_LABEL[s]}
            </option>
          ))}
        </select>
      )}

      {!disabled && (
        <button
          type="button"
          aria-pressed={denied}
          onClick={() => onChange({ ...state, effect: denied ? null : 'deny' })}
          className={cn('h-10 rounded-md border px-3 text-xs font-medium active:scale-95', denied ? 'border-red-300 bg-red-100 text-red-700' : 'border-gray-300 text-gray-600')}
        >
          {denied ? 'Đang chặn' : 'Chặn'}
        </button>
      )}
    </li>
  );
};

const order = (s: Scope) => ({ own: 1, dept: 2, org: 3 })[s];
