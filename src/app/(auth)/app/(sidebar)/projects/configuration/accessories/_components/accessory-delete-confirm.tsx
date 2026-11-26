'use client';

import { useQuery } from '@tanstack/react-query';
import { getAccessoryCombos } from '@/actions';
import { ConfirmDelete } from '@/components-remake';
import type { Accessory } from '@/types';

interface Props {
  accessory: Accessory | null;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// Xóa phụ kiện kéo theo xóa các combo chứa nó: liệt kê combo bị ảnh hưởng trước khi xác nhận
export function AccessoryDeleteConfirm({ accessory, pending, onClose, onConfirm }: Props) {
  const combos = useQuery({
    queryKey: ['accessory-combos', 'delete-impact-check'],
    queryFn: async () => (await getAccessoryCombos({ limit: 9999, offset: 0 })).items || [],
    enabled: !!accessory,
  });
  const affected = (combos.data ?? []).filter((c) => (c.comboItems || []).some((i) => Number(i.accessoryId) === accessory?.id));

  return (
    <ConfirmDelete isOpen={!!accessory} title="Xác nhận xóa phụ kiện" pending={pending} onClose={onClose} onConfirm={onConfirm}>
      <>
        Xóa phụ kiện <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{accessory?.name}</strong>
        {accessory?.code ? ` (${accessory.code})` : ''}. Các combo chứa phụ kiện này cũng bị xóa theo.
        {combos.isLoading ? (
          <span className="mt-2 block text-xs italic">Đang kiểm tra combo bị ảnh hưởng...</span>
        ) : affected.length > 0 ? (
          <span className="mt-2 block rounded-control bg-red-50 p-2 text-xs text-red-700">
            {affected.length} combo bị xóa theo: {affected.map((c) => c.name).join(', ')}.
          </span>
        ) : null}
      </>
    </ConfirmDelete>
  );
}
