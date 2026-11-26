'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { cloneAccessRole, deleteAccessRole, getAccessRole, getPermissionCatalog, renameAccessRole } from '@/actions';
import { useCan } from '@/hooks';
import type { AccessRole } from '@/types';
import { BTN_DANGER, BTN_LINE, BTN_PRIMARY, INPUT, messageOf } from './form';
import { Sheet } from './sheet';
import { ErrorState } from './state-views';
import { Badge } from './badge';

const SCOPE: Record<string, string> = { own: 'của mình', dept: 'phòng ban', org: 'toàn công ty' };

interface Props {
  role: AccessRole | null;
  open: boolean;
  onClose: () => void;
}

// Xem quyền của một vai trò (chỉ đọc); sửa quyền ở trang "Cấu hình quyền".
export function RoleDrawer({ role, open, onClose }: Props) {
  const qc = useQueryClient();
  const { can } = useCan();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState('');
  const id = role?.id ?? '';
  const detail = useQuery({ queryKey: ['access-role', id], queryFn: () => getAccessRole(id), enabled: open && !!id });
  const catalog = useQuery({ queryKey: ['permission-catalog'], queryFn: getPermissionCatalog, staleTime: Infinity, enabled: open });

  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['access-roles'] });
    qc.invalidateQueries({ queryKey: ['access-role', id] });
  };
  const fail = (e: unknown) => toast.error(messageOf(e));
  const rename = useMutation({
    mutationFn: () => renameAccessRole(id, { name: name.trim(), description: detail.data?.description ?? undefined }),
    onSuccess: () => {
      done('Đã đổi tên');
      setRenaming(false);
      onClose();
    },
    onError: fail,
  });
  const clone = useMutation({
    mutationFn: () => cloneAccessRole(id, `${role?.name} (bản sao)`),
    onSuccess: () => {
      done('Đã nhân bản');
      onClose();
    },
    onError: fail,
  });
  const remove = useMutation({
    mutationFn: () => deleteAccessRole(id),
    onSuccess: () => {
      done('Đã xoá vai trò');
      onClose();
    },
    onError: fail,
  });

  const grants = new Map((detail.data?.grants ?? []).map((g) => [g.code, g]));
  const groups = new Map<string, { name: string; effect: string; scope: string }[]>();
  for (const item of catalog.data ?? []) {
    const g = grants.get(item.code);
    if (!g) continue;
    const label = item.scopes.length > 1 ? SCOPE[g.scope] : '';
    groups.set(item.module, [...(groups.get(item.module) ?? []), { name: item.nameVi, effect: g.effect, scope: label }]);
  }
  const busy = rename.isPending || clone.isPending || remove.isPending;

  return (
    <Sheet
      open={open}
      onClose={() => {
        setRenaming(false);
        onClose();
      }}
      title={role?.name ?? 'Vai trò'}
    >
      {role && (
        <div className="flex flex-col gap-4 p-rm-gutter">
          <p className="flex flex-wrap items-center gap-2 text-sm text-rm-muted">
            {role.isSystem && <Badge>Hệ thống</Badge>}
            {role.memberCount} thành viên · {role.permissionCount} quyền
          </p>

          {renaming ? (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                rename.mutate();
              }}
            >
              <label htmlFor="role-rename" className="sr-only">
                Tên vai trò
              </label>
              <input id="role-rename" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required autoFocus className={INPUT} />
              <button type="submit" disabled={busy || !name.trim()} className={BTN_PRIMARY}>
                Lưu
              </button>
            </form>
          ) : (
            <div className="flex flex-wrap gap-2">
              {can('role:create') && (
                <button type="button" disabled={busy} onClick={() => clone.mutate()} className={BTN_LINE}>
                  Nhân bản
                </button>
              )}
              {!role.isSystem && can('role:update') && (
                <button
                  type="button"
                  onClick={() => {
                    setName(role.name);
                    setRenaming(true);
                  }}
                  className={BTN_LINE}
                >
                  Đổi tên
                </button>
              )}
              {!role.isSystem && can('role:delete') && (
                <button
                  type="button"
                  disabled={busy || role.memberCount > 0}
                  title={role.memberCount > 0 ? 'Còn thành viên, hãy chuyển họ sang vai trò khác trước' : undefined}
                  onClick={() => window.confirm(`Xoá vai trò "${role.name}"?`) && remove.mutate()}
                  className={BTN_DANGER}
                >
                  Xoá
                </button>
              )}
            </div>
          )}

          {(detail.isLoading || catalog.isLoading) && <p className="text-sm text-rm-muted">Đang tải quyền…</p>}
          {(detail.isError || catalog.isError) && (
            <ErrorState
              title="Không tải được quyền"
              description="Kiểm tra kết nối rồi thử lại."
              actionLabel="Thử lại"
              onAction={() => {
                detail.refetch();
                catalog.refetch();
              }}
            />
          )}
          {detail.data && catalog.data && groups.size === 0 && <p className="text-sm text-rm-muted">Vai trò này chưa có quyền nào.</p>}
          {[...groups].map(([module, items]) => (
            <section key={module} aria-label={module}>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-rm-muted">{module}</h3>
              <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge">
                {items.map((i) => (
                  <li key={i.name} className="flex items-center gap-2 px-3 py-2 text-sm">
                    <span
                      className={i.effect === 'deny' ? 'text-rm-danger' : 'text-rm-success'}
                      aria-label={i.effect === 'deny' ? 'Chặn' : 'Cho phép'}
                    >
                      {i.effect === 'deny' ? '✗' : '✓'}
                    </span>
                    <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{i.name}</span>
                    {i.scope && <span className="flex-none text-xs text-rm-muted">{i.scope}</span>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Sheet>
  );
}
