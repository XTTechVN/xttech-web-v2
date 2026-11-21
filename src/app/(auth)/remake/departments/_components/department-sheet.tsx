'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { createDepartment, createPosition, deleteDepartment, deletePosition, getDepartmentPositions, updateDepartment } from '@/actions';
import { useCan } from '@/hooks';
import type { Department, Position } from '@/types';
import { BTN_DANGER, BTN_LINE, BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { Sheet } from '../../_components/sheet';

interface Props {
  target: Department | 'new' | null;
  onClose: () => void;
}

// Thêm / sửa / xoá phòng ban; khi sửa có thêm danh sách chức vụ của phòng ban đó.
export function DepartmentSheet({ target, onClose }: Props) {
  const { can } = useCan();
  const qc = useQueryClient();
  const dept = target && target !== 'new' ? target : null;
  const [name, setName] = useState(dept?.name ?? '');
  const [code, setCode] = useState(dept?.code ?? '');
  const [position, setPosition] = useState('');
  const editable = dept ? can('department:update') : can('department:create');

  const positions = useQuery({
    queryKey: ['department-positions', dept?.id],
    queryFn: () => getDepartmentPositions(dept!.id, { limit: 100 }),
    enabled: !!dept,
  });
  const done = (msg: string, close = false) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['departments'] });
    if (close) onClose();
  };
  const fail = (e: unknown) => toast.error(messageOf(e));

  const save = useMutation({
    mutationFn: () =>
      dept ? updateDepartment(dept.id, { name: name.trim(), code: code.trim() }) : createDepartment({ name: name.trim(), code: code.trim() }),
    onSuccess: () => done(dept ? 'Đã lưu phòng ban' : 'Đã thêm phòng ban', true),
    onError: fail,
  });
  const remove = useMutation({ mutationFn: () => deleteDepartment(dept!.id), onSuccess: () => done('Đã xoá phòng ban', true), onError: fail });
  const addPosition = useMutation({
    mutationFn: () => createPosition({ name: position.trim(), departmentId: dept!.id }),
    onSuccess: () => {
      setPosition('');
      qc.invalidateQueries({ queryKey: ['department-positions', dept!.id] });
    },
    onError: fail,
  });
  const removePosition = useMutation({
    mutationFn: (id: number) => deletePosition(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['department-positions', dept!.id] }),
    onError: fail,
  });

  const list: Position[] = positions.data?.items ?? [];

  return (
    <Sheet open={!!target} onClose={onClose} title={dept ? 'Phòng ban' : 'Thêm phòng ban'}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Tên phòng ban" id="dept-name">
          <input
            id="dept-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
            disabled={!editable}
            className={INPUT}
          />
        </Field>
        <Field label="Mã phòng ban (không bắt buộc)" id="dept-code">
          <input id="dept-code" value={code} onChange={(e) => setCode(e.target.value)} maxLength={100} disabled={!editable} className={INPUT} />
        </Field>
        {editable && (
          <button type="submit" disabled={save.isPending || !name.trim()} className={BTN_PRIMARY}>
            {save.isPending ? 'Đang lưu…' : 'Lưu'}
          </button>
        )}
      </form>

      {dept && (
        <section className="flex flex-col gap-3 border-t border-rm-line p-rm-gutter">
          <h3 className="text-sm font-medium">Chức vụ ({list.length})</h3>
          {positions.isLoading && <p className="text-sm text-rm-muted">Đang tải…</p>}
          {positions.isError && <p className="text-sm text-rm-danger">Không tải được chức vụ</p>}
          {positions.data && list.length === 0 && <p className="text-sm text-rm-muted">Chưa có chức vụ.</p>}
          <ul className="flex flex-col">
            {list.map((p) => (
              <li key={p.id} className="flex min-h-rm-tap items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                {can('position:delete') && (
                  <button
                    type="button"
                    aria-label={`Xoá chức vụ ${p.name}`}
                    disabled={removePosition.isPending}
                    onClick={() => window.confirm(`Xoá chức vụ "${p.name}"?`) && removePosition.mutate(p.id)}
                    className="flex size-rm-tap flex-none items-center justify-center rounded-rm text-rm-muted active:bg-rm-bg"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </li>
            ))}
          </ul>
          {can('position:create') && (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                addPosition.mutate();
              }}
            >
              <input
                aria-label="Tên chức vụ mới"
                placeholder="Tên chức vụ mới"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                maxLength={100}
                className={INPUT}
              />
              <button type="submit" disabled={addPosition.isPending || !position.trim()} className={BTN_LINE}>
                Thêm
              </button>
            </form>
          )}
        </section>
      )}

      {dept && can('department:delete') && (
        <div className="border-t border-rm-line p-rm-gutter">
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => window.confirm(`Xoá phòng ban "${dept.name}"? Không thể hoàn tác.`) && remove.mutate()}
            className={`${BTN_DANGER} w-full`}
          >
            Xoá phòng ban
          </button>
        </div>
      )}
    </Sheet>
  );
}
