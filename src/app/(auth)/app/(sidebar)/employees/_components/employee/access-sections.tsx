'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getDepartments, getPositions, setUserPositions } from '@/actions';
import { getRoles } from '@/actions/role';
import { assignRole, revokeRole } from '@/actions/user';
import { DrawerSection, InfoRow, Select } from '@/components-remake';
import { useCan } from '@/hooks';
import { showErrorToast, showSuccessToast } from '@/utils';
import queryClient from '@/utils/query';
import type { Department, Employee } from '@/types';
import { DepartmentTags, PositionTags, RoleTags } from './list';

const refresh = () => {
  ['employees', 'users', 'department_members'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
};

// Phòng ban, chức vụ: ô chọn; vai trò (nhiều giá trị): ô tích ở cuối. Lưu ngay khi chọn. Thiếu quyền thì chỉ hiện chữ.
export function AccessSection({ employee }: { employee: Employee }) {
  const { can } = useCan();
  const roleEditable = can('user:assign_role');
  const posEditable = can('user:assign_position') && can('department:read');
  const name = employee.fullName || employee.username;

  const roleIds = (employee.roles ?? []).map((r) => String(r.id));
  const currentPos = employee.positions?.[0];
  const [deptId, setDeptId] = useState(currentPos ? String(currentPos.departmentId) : '');

  const { data: roleData, isLoading: loadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => getRoles({ limit: 100 }),
    enabled: roleEditable,
  });
  const { data: depts, isLoading: loadingDepts } = useQuery({
    queryKey: ['departments', 'modal-select'],
    queryFn: () => getDepartments({ limit: 100 }),
    enabled: posEditable,
  });
  const { data: poss, isLoading: loadingPoss } = useQuery({
    queryKey: ['positions', 'modal-select'],
    queryFn: () => getPositions({ limit: 200 }),
    enabled: posEditable,
  });
  const inDept = useMemo(() => (poss?.items ?? []).filter((p) => String(p.departmentId) === deptId), [poss, deptId]);

  const role = useMutation({
    mutationFn: ({ roleId, on }: { roleId: string; on: boolean }) => (on ? assignRole(employee.id, [roleId]) : revokeRole(employee.id, [roleId])),
    onSuccess: () => {
      refresh();
      showSuccessToast(`Đã cập nhật vai trò cho ${name}`);
    },
    onError: (e: Error) => showErrorToast(e?.message || 'Không cập nhật được vai trò'),
  });

  const position = useMutation({
    mutationFn: (positionIds: number[]) => setUserPositions(String(employee.id), positionIds),
    onSuccess: () => {
      refresh();
      showSuccessToast(`Đã cập nhật chức vụ cho ${name}`);
    },
    onError: (e: Error) => showErrorToast(e?.message || 'Không cập nhật được chức vụ'),
  });

  return (
    <>
      <DrawerSection>
        {posEditable ? (
          <>
            <Select
              label="Phòng ban"
              placeholder="Chọn phòng ban"
              loading={loadingDepts}
              value={deptId}
              options={((depts?.items ?? []) as Department[]).map((d) => ({ value: String(d.id), label: d.name }))}
              onChange={setDeptId}
            />
            <Select
              label="Chức vụ"
              placeholder={deptId ? 'Chọn chức vụ' : 'Chọn phòng ban trước'}
              clearLabel="Không giữ chức vụ"
              loading={loadingPoss}
              disabled={!deptId || position.isPending}
              value={currentPos && String(currentPos.departmentId) === deptId ? String(currentPos.id) : ''}
              options={inDept.map((p) => ({ value: String(p.id), label: p.name }))}
              onChange={(v) => position.mutate(v ? [Number(v)] : [])}
            />
          </>
        ) : (
          <>
            <InfoRow label="Phòng ban">
              <DepartmentTags row={employee} />
            </InfoRow>
            <InfoRow label="Chức vụ">
              <PositionTags row={employee} />
            </InfoRow>
          </>
        )}
      </DrawerSection>

      <DrawerSection>
        {roleEditable ? (
          <fieldset className="flex flex-col gap-1.5" disabled={role.isPending}>
            <legend className="mb-1.5 text-xs font-medium text-slate-500">Vai trò</legend>
            {loadingRoles && <p className="text-sm text-slate-400">Đang tải...</p>}
            <div className="flex flex-col">
              {(roleData?.items ?? []).map((r) => (
                <label
                  key={r.id}
                  className="flex min-h-11 min-w-0 cursor-pointer items-center gap-3 text-sm text-slate-800 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 md:min-h-9"
                >
                  <input
                    type="checkbox"
                    className="size-4 flex-none cursor-pointer accent-primary"
                    checked={roleIds.includes(String(r.id))}
                    onChange={(e) => role.mutate({ roleId: String(r.id), on: e.target.checked })}
                  />
                  <span className="min-w-0 flex-1 truncate" title={r.name}>
                    {r.name}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <InfoRow label="Vai trò">
            <RoleTags row={employee} />
          </InfoRow>
        )}
      </DrawerSection>
    </>
  );
}
