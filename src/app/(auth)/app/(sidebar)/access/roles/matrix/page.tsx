'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Info } from 'lucide-react';
import { getAccessRole, getAccessRoles, getPermissionCatalog, saveAccessRoleGrants } from '@/actions';
import { useCan } from '@/hooks';
import type { Grant, PermissionCatalogItem } from '@/types';
import { BTN_LINE, BTN_PRIMARY, messageOf } from '../_components/form';
import { EmptyState, ErrorState, ListSkeleton } from '../_components/state-views';
import { MatrixLegend, type RowState } from '../_components/permission-matrix';
import { RoleMatrix } from '../_components/role-matrix';
import { Sheet } from '../_components/sheet';

// Ma trận quyền toàn doanh nghiệp: hàng là quyền (chia nhóm), cột là vai trò; bấm ô để đổi trống → ✓ → ✗.
export default function RemakeRoleMatrixPage() {
  const qc = useQueryClient();
  const [help, setHelp] = useState(false);
  const { can, scopeOf, isReady } = useCan();
  const readable = isReady && can('role:read');
  const roles = useQuery({ queryKey: ['access-roles'], queryFn: getAccessRoles, enabled: readable });
  const catalog = useQuery({ queryKey: ['permission-catalog'], queryFn: getPermissionCatalog, staleTime: Infinity, enabled: readable });
  const details = useQueries({ queries: (roles.data ?? []).map((r) => ({ queryKey: ['access-role', r.id], queryFn: () => getAccessRole(r.id) })) });
  const [draft, setDraft] = useState<Record<string, RowState>>({}); // khoá `${roleId}|${code}`

  const saved = useMemo(() => {
    const map: Record<string, RowState> = {};
    for (const d of details) for (const g of d.data?.grants ?? []) map[`${d.data!.id}|${g.code}`] = { effect: g.effect, scope: g.scope };
    return map;
  }, [details]);
  const groups = useMemo(() => {
    const map = new Map<string, PermissionCatalogItem[]>();
    for (const i of catalog.data ?? []) map.set(i.module, [...(map.get(i.module) ?? []), i]);
    return [...map.entries()];
  }, [catalog.data]);

  const save = useMutation({
    mutationFn: async () => {
      const ids = [...new Set(Object.keys(draft).map((k) => k.split('|')[0]))];
      await Promise.all(
        ids.map((id) => {
          const grants: Grant[] = [];
          for (const i of catalog.data ?? []) {
            const st = draft[`${id}|${i.code}`] ?? saved[`${id}|${i.code}`];
            if (st?.effect) grants.push({ code: i.code, scope: st.scope, effect: st.effect });
          }
          return saveAccessRoleGrants(id, grants);
        }),
      );
    },
    onSuccess: () => {
      toast.success('Đã lưu quyền, có hiệu lực ngay');
      setDraft({});
      qc.invalidateQueries({ queryKey: ['access-roles'] });
      qc.invalidateQueries({ queryKey: ['access-role'] });
    },
    onError: (e) => toast.error(messageOf(e)),
  });

  if (!isReady) return <ListSkeleton />;
  if (!can('role:read')) return <EmptyState title="Bạn chưa có quyền xem vai trò" description="Liên hệ quản trị viên để được cấp quyền." />;
  if (roles.isLoading || catalog.isLoading || details.some((d) => d.isLoading)) return <ListSkeleton />;
  if (roles.isError || catalog.isError || !roles.data)
    return (
      <ErrorState
        title="Không tải được ma trận"
        description="Kiểm tra kết nối rồi thử lại."
        actionLabel="Thử lại"
        onAction={() => {
          roles.refetch();
          catalog.refetch();
        }}
      />
    );

  const list = roles.data;
  const canEdit = can('role:assign_permission');
  const dirty = Object.keys(draft).length > 0;

  return (
    <>
      <Link href="/app/access/roles" className="mb-2 inline-flex h-rm-tap items-center gap-1.5 text-sm text-rm-muted md:h-rm-control">
        <ArrowLeft size={16} aria-hidden="true" /> Vai trò
      </Link>
      <h1 className="font-heading text-xl font-semibold md:text-2xl">Ma trận quyền</h1>
      <p className="mt-0.5 text-sm text-rm-muted">Hàng là quyền, cột là vai trò. Vai trò hệ thống bị khoá.</p>

      <div className="mt-4">
        <RoleMatrix
          roles={list}
          groups={groups}
          saved={saved}
          draft={draft}
          setDraft={setDraft}
          canEdit={canEdit}
          scopeOf={scopeOf}
          toolbar={
            <button type="button" onClick={() => setHelp(true)} aria-label="Diễn giải" className={`${BTN_LINE} flex-none gap-1.5 px-3`}>
              <Info size={18} aria-hidden="true" />
              <span className="hidden md:inline">Diễn giải</span>
            </button>
          }
        />
      </div>

      <Sheet open={help} onClose={() => setHelp(false)} title="Diễn giải">
        <MatrixLegend />
      </Sheet>

      {dirty && canEdit && (
        <div className="sticky bottom-[calc(var(--spacing-rm-nav)+env(safe-area-inset-bottom))] z-20 mt-4 flex gap-2 border-t border-rm-line bg-rm-surface p-3 md:bottom-0">
          <button type="button" onClick={() => setDraft({})} className={BTN_LINE}>
            Hoàn tác
          </button>
          <button type="button" onClick={() => save.mutate()} disabled={save.isPending} className={`${BTN_PRIMARY} flex-1`}>
            {save.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </div>
      )}
    </>
  );
}
