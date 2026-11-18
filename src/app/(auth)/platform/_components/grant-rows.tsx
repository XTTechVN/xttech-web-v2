'use client';

import { Badge } from '@/components';
import type { PlatformGrant, PlatformPermission } from '@/types';
import { SCOPE_LABEL, groupBy } from './group-by';

export const GrantRows = ({ grants, catalog }: { grants: PlatformGrant[]; catalog: Map<string, PlatformPermission> }) => {
  if (grants.length === 0) return <p className="px-4 py-3 text-sm text-gray-500">Vai trò này chưa được gắn quyền nào.</p>;
  return (
    <div className="flex flex-col divide-y divide-gray-100 border-t border-gray-100">
      {groupBy(grants, (g) => catalog.get(g.code)?.module ?? 'Khác').map(([module, items]) => (
        <section key={module} className="flex flex-col">
          <h3 className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">
            {module} · {items.length}
          </h3>
          <ul className="divide-y divide-gray-100">
            {items.map((g) => (
              <li key={g.code} className="flex items-start justify-between gap-3 px-4 py-2">
                <span className="min-w-0">
                  <span className="block text-sm text-gray-900 [overflow-wrap:anywhere]">{catalog.get(g.code)?.nameVi ?? g.code}</span>
                  <span className="block truncate text-xs text-gray-500">{g.code}</span>
                </span>
                <Badge size="sm" variant={g.effect === 'deny' ? 'danger' : 'default'} className="flex-none">
                  {g.effect === 'deny' ? 'Từ chối' : (SCOPE_LABEL[g.scope] ?? g.scope)}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};
