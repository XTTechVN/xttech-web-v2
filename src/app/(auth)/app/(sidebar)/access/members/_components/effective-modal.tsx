'use client';

import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/components';
import { getMemberEffectivePermissions } from '@/actions';
import type { AccessMember } from '@/types';

// "Quyền hiện có": gộp các vai trò, đã trừ quyền bị chặn (README 10.10)
export const EffectiveModal = ({ member, onClose }: { member: AccessMember | null; onClose: () => void }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['member-effective', member?.id],
    queryFn: () => getMemberEffectivePermissions(member!.id),
    enabled: !!member,
  });
  const groups = new Map<string, typeof data>();
  for (const p of data ?? []) groups.set(p.module, [...(groups.get(p.module) ?? []), p]);

  return (
    <Modal isOpen={!!member} onClose={onClose} title={`Quyền hiện có · ${member?.fullName || member?.username || ''}`} size="md">
      {isLoading && <p className="text-sm text-gray-500">Đang tải…</p>}
      {isError && <p className="text-sm text-red-600">Không tải được quyền.</p>}
      {data && data.length === 0 && <p className="text-sm text-gray-500">Người này chưa có quyền nào.</p>}
      <div className="flex max-h-[60dvh] flex-col gap-4 overflow-y-auto">
        {[...groups.entries()].map(([module, items]) => (
          <section key={module}>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{module}</h3>
            <ul className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200">
              {items!.map((p) => (
                <li key={p.code} className="flex min-h-11 items-center justify-between gap-3 px-3 py-1.5">
                  <span className="min-w-0">
                    <span className="block text-sm text-gray-900">{p.nameVi}</span>
                    <span className="block truncate font-mono text-xs text-gray-500">{p.code}</span>
                  </span>
                  <span className="flex-none text-xs text-gray-500">{p.scope === 'org' ? 'Cả doanh nghiệp' : p.scope === 'dept' ? 'Phòng ban' : 'Của mình'}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Modal>
  );
};
