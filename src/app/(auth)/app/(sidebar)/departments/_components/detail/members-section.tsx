'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserMinus } from 'lucide-react';
import { assignPositions, getEmployees, revokePositions } from '@/actions';
import { getDepartmentPositions } from '@/actions/department/position';
import { Avatar, Input } from '@/components';
import { Button, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection, IconAction, SectionAdd, Select, SideDrawer, Tag } from '@/components-remake';
import { useCan, useDebounce } from '@/hooks';
import type { Employee, Position } from '@/types';
import { getFileUrl, showErrorToast, showSuccessToast } from '@/utils';
import { cn } from '@/utils/cn';
import queryClient from '@/utils/query';
import { ConfirmModal } from './confirm-modal';
import { positionsKey } from './positions-section';
import { SectionEmpty, SectionError, SectionSkeleton } from './section-states';

const refresh = () => ['employees', 'users', 'department_members'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));

const membersKey = (departmentId: number) => ['department_members', departmentId] as const;
const inDept = (e: Employee, departmentId: number) => (e.positions ?? []).filter((p) => Number(p.departmentId) === departmentId);

// Chọn một người rồi chọn chức vụ: việc ngắn nên mở drawer con
function AddMemberSide({ departmentId, onClose }: { departmentId: number; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState('');
  const [positionId, setPositionId] = useState('');
  const keyword = useDebounce(search.trim(), 300);

  const users = useQuery({ queryKey: ['employees', 'add-to-department', keyword], queryFn: () => getEmployees({ limit: 100, search: keyword || undefined }) });
  const positions = useQuery({ queryKey: positionsKey(departmentId), queryFn: () => getDepartmentPositions(departmentId, { limit: 100 }) });

  // Mỗi nhân sự chỉ có 1 chức vụ (API ràng buộc): chỉ liệt kê người chưa có chức vụ nào
  const candidates: Employee[] = useMemo(() => (users.data?.items ?? []).filter((u: Employee) => !(u.positions ?? []).length), [users.data]);
  const options = useMemo(
    () => ((positions.data?.items ?? positions.data?.data ?? []) as Position[]).map((p) => ({ value: String(p.id), label: p.name })),
    [positions.data],
  );

  const add = useMutation({
    mutationFn: () => assignPositions(userId, [Number(positionId)]),
    onSuccess: () => {
      refresh();
      showSuccessToast('Đã thêm thành viên');
      onClose();
    },
    onError: (e) => showErrorToast(e, 'Không thêm được thành viên'),
  });

  return (
    <>
      <DrawerHeader compact title="Thêm thành viên" onClose={onClose} />
      <DrawerBody>
        <div className="flex flex-col gap-4 pt-4 md:w-80">
          <Input label="Tìm nhân sự" placeholder="Tên, email, CCCD..." fullWidth value={search} onChange={(e) => setSearch(e.target.value)} />
          <ul className="-mx-1 max-h-64 overflow-y-auto">
            {users.isLoading ? (
              <li className="px-1 py-3 text-sm text-slate-400">Đang tìm...</li>
            ) : candidates.length === 0 ? (
              <li className="px-1 py-3 text-sm text-slate-400">{keyword ? 'Không có nhân sự phù hợp.' : 'Mọi nhân sự đều đã có chức vụ.'}</li>
            ) : (
              candidates.map((u) => {
                const on = String(u.id) === userId;
                return (
                  <li key={u.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setUserId(String(u.id))}
                      className={cn(
                        'flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-control px-1 text-left transition active:bg-slate-100 md:hover:bg-slate-50',
                        on && 'bg-primary/5 md:hover:bg-primary/5',
                      )}
                    >
                      <Avatar src={getFileUrl(u.avatar) || undefined} name={u.fullName || u.username} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-900">{u.fullName || u.username}</span>
                        <span className="block truncate text-xs text-slate-500">{u.email}</span>
                      </span>
                      <span className={cn('size-2 flex-none rounded-full', on ? 'bg-primary' : 'bg-transparent')} aria-hidden />
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          <Select label="Chức vụ" value={positionId} options={options} onChange={setPositionId} placeholder={options.length ? 'Chọn chức vụ' : 'Phòng ban chưa có chức vụ'} loading={positions.isLoading} disabled={!options.length} />
        </div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={add.isPending} onClick={onClose}>
            Hủy
          </Button>
          <Button className="flex-1 md:flex-none" disabled={!userId || !positionId} loading={add.isPending} onClick={() => add.mutate()}>
            Thêm
          </Button>
        </div>
      </DrawerFooter>
    </>
  );
}

export function MembersSection({ departmentId }: { departmentId: number }) {
  const { can } = useCan();
  // Thêm thành viên cần chọn chức vụ nên phải đọc được danh sách chức vụ
  const canAssign = can('user:assign_position') && can('position:read');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<Employee | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: membersKey(departmentId),
    queryFn: () => getEmployees({ departmentId, limit: 200 }),
  });
  const items: Employee[] = data?.items ?? [];

  const remove = useMutation({
    mutationFn: (e: Employee) => revokePositions(String(e.id), inDept(e, departmentId).map((p) => Number(p.id))),
    onSuccess: () => {
      refresh();
      showSuccessToast('Đã gỡ thành viên khỏi phòng ban');
      setRemoving(null);
    },
    onError: (e) => showErrorToast(e, 'Không gỡ được thành viên'),
  });

  return (
    <DrawerSection title={isLoading ? 'Thành viên' : `${items.length} thành viên`} action={canAssign && <SectionAdd label="Thêm thành viên" onClick={() => setAdding(true)} />}>
      {isLoading ? (
        <SectionSkeleton />
      ) : isError ? (
        <SectionError onRetry={refetch} />
      ) : items.length === 0 ? (
        <SectionEmpty>Phòng ban chưa có thành viên nào.</SectionEmpty>
      ) : (
        <ul className="-my-1 flex flex-col">
          {items.map((e) => {
            const name = e.fullName || e.username;
            return (
              <li key={e.id} className="flex min-h-14 items-center gap-3 py-1">
                <Avatar src={getFileUrl(e.avatar) || undefined} name={name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900" title={name}>
                    {name}
                  </p>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {inDept(e, departmentId).map((p) => (
                      <Tag key={p.id} tone="slate">
                        {p.name}
                      </Tag>
                    ))}
                  </div>
                </div>
                {canAssign && (
                  <IconAction label={`Gỡ ${name} khỏi phòng ban`} danger onClick={() => setRemoving(e)}>
                    <UserMinus size={16} />
                  </IconAction>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <SideDrawer isOpen={adding} onClose={() => setAdding(false)} label="Thêm thành viên">
        {adding && <AddMemberSide departmentId={departmentId} onClose={() => setAdding(false)} />}
      </SideDrawer>
      <ConfirmModal
        isOpen={!!removing}
        title="Xác nhận gỡ thành viên"
        message={
          <>
            Gỡ <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{removing?.fullName || removing?.username}</strong> khỏi phòng ban? Các chức vụ của họ trong phòng ban sẽ bị hủy.
          </>
        }
        confirmText="Xác nhận gỡ"
        isPending={remove.isPending}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && remove.mutate(removing)}
      />
    </DrawerSection>
  );
}
