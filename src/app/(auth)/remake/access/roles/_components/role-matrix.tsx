'use client';

import { Fragment, useState, type ReactNode } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { PermissionCatalogItem, Scope } from '@/types';
import { INPUT } from '../../../_components/form';
import { Box, Cell, next, type RowState } from './permission-matrix';

const widest = (i: PermissionCatalogItem) => i.scopes[i.scopes.length - 1];

export interface MatrixRole {
  id: string;
  name: string;
  isSystem: boolean;
}

interface Props {
  roles: MatrixRole[];
  groups: (readonly [string, PermissionCatalogItem[]])[];
  saved: Record<string, RowState>; // khoá `${roleId}|${code}`
  draft: Record<string, RowState>;
  setDraft: (fn: (d: Record<string, RowState>) => Record<string, RowState>) => void;
  canEdit: boolean;
  scopeOf: (code: string) => Scope | null;
  /** Nút đặt cạnh ô tìm */
  toolbar?: ReactNode;
}

// Ma trận quyền dùng chung: hàng là quyền (chia nhóm, thu gọn được, có ô tổng nhóm), cột là vai trò.
export function RoleMatrix({ roles: list, groups, saved, draft, setDraft, canEdit, scopeOf, toolbar }: Props) {
  const [query, setQuery] = useState('');
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const q = query.trim().toLowerCase();
  const shown = groups
    .map(([module, items]) => [module, q ? items.filter((i) => i.nameVi.toLowerCase().includes(q) || i.code.includes(q)) : items] as const)
    .filter(([, items]) => items.length > 0);
  const stateOf = (roleId: string, i: PermissionCatalogItem): RowState =>
    draft[`${roleId}|${i.code}`] ?? saved[`${roleId}|${i.code}`] ?? { effect: null, scope: widest(i) };
  const lockOf = (r: { isSystem: boolean }, i: PermissionCatalogItem) =>
    r.isSystem ? 'Vai trò hệ thống: không sửa được' : !canEdit ? 'Bạn không được sửa quyền' : scopeOf(i.code) ? undefined : 'Bạn chưa có quyền này';
  const toggle = (module: string) =>
    setClosed((c) => {
      const n = new Set(c);
      if (!n.delete(module)) n.add(module);
      return n;
    });
  // Chọn/bỏ cả nhóm cho một vai trò: nếu mọi quyền sửa được đều đang bật thì tắt hết, ngược lại bật hết.
  const setGroup = (roleId: string, items: PermissionCatalogItem[], r: { isSystem: boolean }) => {
    const editable = items.filter((i) => !lockOf(r, i));
    const all = editable.every((i) => stateOf(roleId, i).effect === 'allow');
    setDraft((d) => {
      const n = { ...d };
      for (const i of editable) {
        const cur = stateOf(roleId, i);
        n[`${roleId}|${i.code}`] = all
          ? { ...cur, effect: null }
          : cur.effect === 'allow'
            ? cur
            : next(i, { effect: null, scope: cur.scope }, scopeOf(i.code) ?? undefined);
      }
      return n;
    });
  };

  return (
    <>
      <div className="mt-4 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="perm-search" className="sr-only">
            Tìm quyền
          </label>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
          <input
            id="perm-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm tên quyền…"
            className={`${INPUT} pl-9`}
          />
        </div>
        {toolbar}
      </div>

      {shown.length === 0 && <p className="mt-6 text-center text-sm text-rm-muted">Không có quyền phù hợp.</p>}
      {shown.length > 0 && (
        <div className="mt-3 max-h-[70dvh] overflow-auto rounded-rm-xl border border-rm-edge bg-rm-surface">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <caption className="sr-only">Ma trận quyền theo vai trò</caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 top-0 z-30 w-44 min-w-44 border-b border-rm-line bg-rm-surface px-3 py-2 text-left text-xs font-medium text-rm-muted md:w-72"
                >
                  Quyền
                </th>
                {list.map((r) => (
                  <th
                    key={r.id}
                    scope="col"
                    className="sticky top-0 z-20 w-36 min-w-36 border-b border-l border-rm-line bg-rm-surface px-3 py-2 text-left"
                  >
                    <span title={r.name} className="block truncate text-sm font-medium">
                      {r.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map(([module, items]) => {
                const open = q !== '' || !closed.has(module);
                return (
                  <Fragment key={module}>
                    <tr className="bg-rm-bg">
                      <th scope="colgroup" className="sticky left-0 z-10 border-b border-rm-line bg-rm-bg px-1 text-left">
                        <button
                          type="button"
                          onClick={() => toggle(module)}
                          aria-expanded={open}
                          className="flex h-9 w-full items-center gap-1.5 px-2 text-left text-sm font-semibold"
                        >
                          <ChevronDown
                            size={16}
                            className={cn('flex-none text-rm-muted transition-transform', !open && '-rotate-90')}
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1 truncate">{module}</span>
                          <span className="flex-none rounded-rm-sm border border-rm-line bg-rm-surface px-1.5 text-xs font-normal text-rm-muted">
                            {items.length}
                          </span>
                        </button>
                      </th>
                      {list.map((r) => {
                        const editable = items.filter((i) => !lockOf(r, i));
                        const on = items.filter((i) => stateOf(r.id, i).effect === 'allow').length;
                        return (
                          <td key={r.id} className="border-b border-l border-rm-line px-3 text-left">
                            <button
                              type="button"
                              disabled={editable.length === 0}
                              aria-label={`${module}: ${r.name}, ${on}/${items.length} quyền`}
                              title={editable.length === 0 ? lockOf(r, items[0]) : `${on}/${items.length}`}
                              onClick={() => setGroup(r.id, items, r)}
                              className="-ml-1.5 flex size-9 items-center justify-center transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 md:size-8"
                            >
                              <Box kind={on === 0 ? 'off' : on === items.length ? 'on' : 'part'} />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                    {open &&
                      items.map((i) => (
                        <tr key={i.code} className="hover:bg-rm-bg">
                          <th
                            scope="row"
                            className="sticky left-0 z-10 w-44 min-w-44 border-b border-rm-line bg-rm-surface px-3 py-1 text-left text-sm font-normal md:w-72"
                          >
                            <span className="line-clamp-2 [overflow-wrap:anywhere]">{i.nameVi}</span>
                          </th>
                          {list.map((r) => (
                            <td key={r.id} className="border-b border-l border-rm-line px-1.5 text-left">
                              <Cell
                                item={i}
                                state={stateOf(r.id, i)}
                                locked={lockOf(r, i)}
                                maxScope={scopeOf(i.code) ?? undefined}
                                onChange={(code, st) => setDraft((d) => ({ ...d, [`${r.id}|${code}`]: st }))}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
