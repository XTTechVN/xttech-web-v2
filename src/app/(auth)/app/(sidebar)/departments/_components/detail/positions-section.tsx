'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { createPosition, deletePosition, updatePosition } from '@/actions';
import { getDepartmentPositions } from '@/actions/department/position';
import { Input } from '@/components';
import { DrawerSection, IconAction, SectionAdd } from '@/components-remake';
import { useCan } from '@/hooks';
import type { Position } from '@/types';
import { showErrorToast, showSuccessToast } from '@/utils';
import queryClient from '@/utils/query';
import { ConfirmModal } from './confirm-modal';
import { SectionEmpty, SectionError, SectionSkeleton } from './section-states';

const refresh = () => ['positions', 'employees', 'department_members'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));

export const positionsKey = (departmentId: number) => ['positions', departmentId] as const;

// Tên chức vụ chỉ một ô nhập: làm ngay trong danh sách, không mở drawer con
function PositionInline({ departmentId, position, onClose }: { departmentId: number; position: Position | 'new'; onClose: () => void }) {
  const editing = position !== 'new' ? position : null;
  const [name, setName] = useState(editing?.name ?? '');
  const [error, setError] = useState('');

  const save = useMutation({
    mutationFn: () =>
      editing ? updatePosition(editing.id, { name: name.trim(), departmentId }) : createPosition({ name: name.trim(), departmentId }),
    onSuccess: () => {
      refresh();
      showSuccessToast(editing ? 'Đã cập nhật chức vụ' : 'Đã thêm chức vụ');
      onClose();
    },
    onError: (e) => showErrorToast(e, 'Không lưu được chức vụ'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Tên chức vụ không được để trống');
    setError('');
    save.mutate();
  };

  return (
    <form onSubmit={submit} onKeyDown={(e) => e.key === 'Escape' && (e.stopPropagation(), onClose())} className="flex items-start gap-1 py-1">
      <div className="min-w-0 flex-1">
        <Input
          aria-label="Tên chức vụ"
          placeholder="Tên chức vụ, ví dụ: Trưởng phòng"
          fullWidth
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error || undefined}
        />
      </div>
      <IconAction label="Lưu chức vụ" type="submit" disabled={save.isPending}>
        <Check size={16} />
      </IconAction>
      <IconAction label="Hủy" disabled={save.isPending} onClick={onClose}>
        <X size={16} />
      </IconAction>
    </form>
  );
}

export function PositionsSection({ departmentId }: { departmentId: number }) {
  const { can } = useCan();
  const [edit, setEdit] = useState<Position | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Position | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: positionsKey(departmentId),
    queryFn: () => getDepartmentPositions(departmentId, { limit: 100 }),
  });
  const items: Position[] = data?.items ?? data?.data ?? [];

  const remove = useMutation({
    mutationFn: (id: number) => deletePosition(id),
    onSuccess: () => {
      refresh();
      showSuccessToast('Đã xóa chức vụ');
      setDeleting(null);
    },
    onError: (e) => showErrorToast(e, 'Không xóa được chức vụ'),
  });

  return (
    <DrawerSection
      title={isLoading ? 'Chức vụ' : `${items.length} chức vụ`}
      action={can('position:create') && <SectionAdd label="Thêm chức vụ" onClick={() => setEdit('new')} />}
    >
      {isLoading ? (
        <SectionSkeleton />
      ) : isError ? (
        <SectionError onRetry={refetch} />
      ) : items.length === 0 && edit !== 'new' ? (
        <SectionEmpty>Phòng ban chưa có chức vụ nào.</SectionEmpty>
      ) : (
        <ul className="-my-1 flex flex-col">
          {edit === 'new' && (
            <li>
              <PositionInline departmentId={departmentId} position="new" onClose={() => setEdit(null)} />
            </li>
          )}
          {items.map((p) =>
            edit !== 'new' && edit?.id === p.id ? (
              <li key={p.id}>
                <PositionInline departmentId={departmentId} position={p} onClose={() => setEdit(null)} />
              </li>
            ) : (
              <li key={p.id} className="flex min-h-11 items-center gap-1 md:min-h-9">
                <span className="min-w-0 flex-1 truncate text-sm text-slate-900" title={p.name}>
                  {p.name}
                </span>
                {can('position:update') && (
                  <IconAction label={`Sửa ${p.name}`} onClick={() => setEdit(p)}>
                    <Pencil size={15} />
                  </IconAction>
                )}
                {can('position:delete') && (
                  <IconAction label={`Xóa ${p.name}`} danger onClick={() => setDeleting(p)}>
                    <Trash2 size={15} />
                  </IconAction>
                )}
              </li>
            ),
          )}
        </ul>
      )}

      <ConfirmModal
        isOpen={!!deleting}
        title="Xác nhận xóa chức vụ"
        message={
          <>
            Xóa chức vụ <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{deleting?.name}</strong>?
          </>
        }
        confirmText="Xác nhận xóa"
        isPending={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </DrawerSection>
  );
}
