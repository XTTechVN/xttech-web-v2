'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Copy, Lock } from 'lucide-react';
import { cloneAccessRole, getAccessRole, getPermissionCatalog, saveAccessRoleGrants } from '@/actions';
import { useCan } from '@/hooks';
import type { Grant, PermissionCatalogItem } from '@/types';
import { ListState } from '../../_components/page-header';
import { PermissionRow, type RowState } from './_components/permission-row';

const messageOf = (e: unknown) => (e as { response?: { data?: { details?: { message?: string } } } })?.response?.data?.details?.message ?? 'Có lỗi xảy ra';
const widest = (item: PermissionCatalogItem) => item.scopes[item.scopes.length - 1];

export default function AccessRoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const { can, scopeOf } = useCan();
  const role = useQuery({ queryKey: ['access-role', id], queryFn: () => getAccessRole(id) });
  const catalog = useQuery({ queryKey: ['permission-catalog'], queryFn: getPermissionCatalog, staleTime: Infinity });
  // `draft` là bản đang sửa (chưa lưu); null = chưa sửa gì, hiển thị đúng dữ liệu từ server
  const [draft, setDraft] = useState<Record<string, RowState> | null>(null);

  const saved = useMemo(() => {
    const next: Record<string, RowState> = {};
    for (const item of catalog.data ?? []) next[item.code] = { effect: null, scope: widest(item) };
    for (const g of role.data?.grants ?? []) next[g.code] = { effect: g.effect, scope: g.scope };
    return next;
  }, [role.data, catalog.data]);
  const rows = draft ?? saved;
  const dirty = draft !== null;

  const groups = useMemo(() => {
    const map = new Map<string, PermissionCatalogItem[]>();
    for (const item of catalog.data ?? []) map.set(item.module, [...(map.get(item.module) ?? []), item]);
    return [...map.entries()];
  }, [catalog.data]);

  const save = useMutation({
    mutationFn: () => {
      const grants: Grant[] = Object.entries(rows)
        .filter(([, r]) => r.effect)
        .map(([code, r]) => ({ code, scope: r.scope, effect: r.effect! }));
      return saveAccessRoleGrants(id, grants);
    },
    onSuccess: (res) => {
      toast.success('Đã lưu quyền, có hiệu lực ngay');
      res.warnings.forEach((w) => toast(w, { icon: '⚠️' }));
      qc.setQueryData(['access-role', id], res.role);
      setDraft(null);
      qc.invalidateQueries({ queryKey: ['access-roles'] });
    },
    onError: (e) => toast.error(messageOf(e)),
  });
  const clone = useMutation({
    mutationFn: () => cloneAccessRole(id, `${role.data?.name ?? 'Vai trò'} (bản sao)`),
    onSuccess: (r) => router.push(`/app/access/roles/${r.id}`),
    onError: (e) => toast.error(messageOf(e)),
  });

  if (role.isLoading || catalog.isLoading) return <div className="p-4"><ListState kind="loading" /></div>;
  if (role.isError || catalog.isError || !role.data) return <div className="p-4"><ListState kind="error" onRetry={() => { role.refetch(); catalog.refetch(); }} /></div>;

  const locked = role.data.isSystem || !can('role:assign_permission');
  const denyCount = Object.values(rows).filter((r) => r.effect === 'deny').length;
  const allowCount = Object.values(rows).filter((r) => r.effect === 'allow').length;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 pb-28">
      <Link href="/app/access/roles" className="inline-flex h-11 w-fit items-center gap-1.5 text-sm text-gray-600">
        <ArrowLeft size={16} /> Vai trò
      </Link>
      <header>
        <h1 className="font-lexend text-xl font-semibold tracking-tight text-gray-900 [overflow-wrap:anywhere]">{role.data.name}</h1>
        <p className="text-sm text-gray-500">
          {role.data.memberCount} thành viên · {allowCount} quyền cho phép{denyCount > 0 && ` · ${denyCount} bị chặn`}
        </p>
      </header>

      {role.data.isSystem && (
        <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-start gap-2"><Lock size={16} className="mt-0.5 flex-none" aria-hidden="true" /> Role mẫu đã khoá: không sửa quyền trực tiếp. Hãy nhân bản để tuỳ biến.</span>
          {can('role:create') && (
            <button type="button" onClick={() => clone.mutate()} disabled={clone.isPending} className="inline-flex h-11 flex-none items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 font-medium text-gray-700 active:scale-95">
              <Copy size={16} /> Nhân bản
            </button>
          )}
        </div>
      )}

      {denyCount > 0 && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Có {denyCount} quyền đang bị chặn. Quyền bị chặn luôn thắng quyền cho phép ở mọi vai trò khác của cùng người dùng.
        </p>
      )}

      {groups.map(([module, items]) => {
        const on = items.filter((i) => rows[i.code]?.effect === 'allow').length;
        return (
          <section key={module} className="flex flex-col gap-2">
            <h2 className="flex items-baseline justify-between px-1 text-sm font-semibold text-gray-700">
              {module}
              <span className="text-xs font-normal text-gray-500">{on}/{items.length}</span>
            </h2>
            <ul className="flex flex-col divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
              {items.map((item) => {
                const mine = scopeOf(item.code);
                const reason = locked ? (role.data.isSystem ? 'Role mẫu đã khoá' : 'Bạn không được sửa quyền') : !mine ? 'Bạn không có quyền này nên không gắn được' : undefined;
                return (
                  <PermissionRow
                    key={item.code}
                    item={item}
                    state={rows[item.code] ?? { effect: null, scope: widest(item) }}
                    lockedReason={reason}
                    maxScope={mine ?? undefined}
                    onChange={(next) => setDraft((d) => ({ ...(d ?? saved), [item.code]: next }))}
                  />
                );
              })}
            </ul>
          </section>
        );
      })}

      {dirty && !locked && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-3xl gap-2">
            <button type="button" onClick={() => setDraft(null)} className="h-11 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 active:scale-95">Hoàn tác</button>
            <button type="button" onClick={() => save.mutate()} disabled={save.isPending} className="h-11 flex-1 rounded-md bg-primary text-sm font-medium text-white active:scale-95 disabled:opacity-60">
              {save.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
