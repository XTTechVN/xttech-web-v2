'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { PageHeading, Tag } from '@/components-remake';
import { getPlatformPermissions } from '@/actions';
import { SCOPE_LABEL, groupBy } from '../_components/group-by';
import { ListState } from '../_components/states';

export default function PlatformPermissionsPage() {
  const q = useQuery({ queryKey: ['platform-permissions'], queryFn: getPlatformPermissions });
  const groups = q.data ? groupBy(q.data, (p) => p.module) : [];

  return (
    <div className="flex flex-col gap-3 p-4 md:gap-4 md:p-6">
      <PageHeading
        className="mb-0"
        title="Danh mục quyền"
        description={q.data ? `${q.data.length} quyền trên toàn nền tảng, nhóm theo phân hệ.` : 'Toàn bộ quyền hiện có trên nền tảng.'}
      />
      {q.isLoading && <ListState kind="loading" />}
      {q.isError && <ListState kind="error" onRetry={() => q.refetch()} />}
      {q.data && q.data.length === 0 && <ListState kind="empty" emptyText="Chưa có quyền nào." />}
      {groups.length > 0 && (
        <div className="overflow-hidden rounded-block border border-slate-200/80 bg-white">
          {groups.map(([module, items]) => (
            <details key={module} className="group border-b border-slate-100 last:border-0">
              <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                <ChevronRight size={16} className="flex-none text-slate-400 transition-transform group-open:rotate-90" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{module}</span>
                <span className="flex-none text-xs font-normal text-slate-500">{items.length} quyền</span>
              </summary>
              <ul className="divide-y divide-slate-100 border-t border-slate-100">
                {items.map((p) => (
                  <li key={p.code} className="flex min-h-12 flex-col justify-center gap-0.5 px-4 py-2 md:pl-10">
                    <span className="flex items-center gap-2">
                      <span className="min-w-0 truncate text-sm text-slate-900">{p.nameVi}</span>
                      {p.platformOnly && <Tag tone="red">Chỉ nền tảng</Tag>}
                    </span>
                    <span className="truncate text-xs text-slate-500">
                      {p.code} · {p.scopes.map((s) => SCOPE_LABEL[s] ?? s).join(', ')}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
