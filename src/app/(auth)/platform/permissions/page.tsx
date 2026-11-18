'use client';

import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components';
import { getPlatformPermissions } from '@/actions';
import { ListState, PageHeader } from '../_components/page-parts';
import { SCOPE_LABEL, groupBy } from '../_components/group-by';

export default function PlatformPermissionsPage() {
  const q = useQuery({ queryKey: ['platform-permissions'], queryFn: getPlatformPermissions });
  const groups = q.data ? groupBy(q.data, (p) => p.module) : [];

  return (
    <div className="flex flex-col gap-4 p-4">
      <PageHeader
        title="Danh mục quyền"
        description={q.data ? `${q.data.length} quyền trên toàn nền tảng, nhóm theo phân hệ.` : 'Toàn bộ quyền hiện có trên nền tảng.'}
      />
      {q.isLoading && <ListState kind="loading" />}
      {q.isError && <ListState kind="error" onRetry={() => q.refetch()} />}
      {q.data && q.data.length === 0 && <ListState kind="empty" emptyText="Chưa có quyền nào." />}
      {groups.map(([module, items]) => (
        <details key={module} className="rounded-lg border border-gray-200 bg-white">
          <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-3 px-4 text-sm font-semibold text-gray-900">
            <span className="min-w-0 truncate">{module}</span>
            <span className="flex-none text-xs font-normal text-gray-500">{items.length} quyền</span>
          </summary>
          <ul className="divide-y divide-gray-100 border-t border-gray-100">
            {items.map((p) => (
              <li key={p.code} className="flex flex-col gap-1 px-4 py-3">
                <span className="flex items-center gap-2">
                  <span className="min-w-0 truncate text-sm text-gray-900">{p.nameVi}</span>
                  {p.platformOnly && (
                    <Badge size="sm" variant="danger" className="flex-none">
                      Chỉ nền tảng
                    </Badge>
                  )}
                </span>
                <span className="truncate text-xs text-gray-500">
                  {p.code} · {p.scopes.map((s) => SCOPE_LABEL[s] ?? s).join(', ')}
                </span>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
