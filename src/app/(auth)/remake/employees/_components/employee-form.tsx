'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { deleteEmployee, getDepartments, getPositions, setUserPositions, updateEmployee } from '@/actions';
import { useCan } from '@/hooks';
import type { Department, Employee, Position } from '@/types';
import { BTN_DANGER, BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { Select } from '../../_components/select';

const GENDERS = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];
export const POLICIES = [
  { value: 'administrative', label: 'Hành chính' },
  { value: 'seasonal', label: 'Thời vụ' },
  { value: 'part_time', label: 'Part-time' },
];
const day = (v?: string | null) => v?.split('T')[0] ?? '';

// Sửa hồ sơ (cần user:update) và gán chức vụ (cần user:assign_position).
export function EmployeeForm({ employee: e, onDone }: { employee: Employee; onDone: () => void }) {
  const { can } = useCan();
  const qc = useQueryClient();
  const current = e?.positions[0] as (Position & { department?: { id: number } }) | undefined;
  const [f, setF] = useState({
    fullName: e?.fullName ?? '',
    phoneNumber: e?.phoneNumber ?? '',
    address: e?.address ?? '',
    gender: e?.gender ?? 'male',
    birthday: day(e?.birthday),
    joinedAt: day(e?.joinedAt),
    attendancePolicy: e?.attendancePolicy ?? 'administrative',
  });
  const [deptId, setDeptId] = useState(String(current?.departmentId ?? current?.department?.id ?? ''));
  const [posId, setPosId] = useState(String(current?.id ?? ''));
  const set = (k: keyof typeof f) => (ev: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: ev.target.value }));
  const canEdit = can('user:update');
  const canAssign = can('user:assign_position');

  const depts = useQuery({ queryKey: ['departments'], queryFn: () => getDepartments({ limit: 100 }), enabled: canAssign });
  const positions = useQuery({ queryKey: ['positions-all'], queryFn: () => getPositions({ limit: 200 }), enabled: canAssign });
  const deptList: Department[] = depts.data?.items ?? [];
  const posList: Position[] = (positions.data?.items ?? []).filter((p: Position) => String(p.departmentId) === deptId);

  const save = useMutation({
    mutationFn: async () => {
      if (canEdit) await updateEmployee(e.id, Object.fromEntries(Object.entries(f).filter(([, v]) => v)));
      if (canAssign) await setUserPositions(e.id, posId ? [Number(posId)] : []);
    },
    onSuccess: () => {
      toast.success('Đã lưu');
      qc.invalidateQueries({ queryKey: ['employees'] });
      qc.invalidateQueries({ queryKey: ['employee'] });
      onDone();
    },
    onError: (err) => toast.error(messageOf(err)),
  });

  const remove = useMutation({
    mutationFn: () => deleteEmployee(e.id),
    onSuccess: () => {
      toast.success('Đã xoá nhân sự');
      qc.invalidateQueries({ queryKey: ['employees'] });
      onDone();
    },
    onError: (err) => toast.error(messageOf(err)),
  });

  return (
    <form
      className="flex flex-col gap-4 p-rm-gutter"
      onSubmit={(ev) => {
        ev.preventDefault();
        save.mutate();
      }}
    >
      <div className="flex flex-col gap-4">
        <Field label="Họ và tên" id="emp-name">
          <input id="emp-name" value={f.fullName} onChange={set('fullName')} required maxLength={100} disabled={!canEdit} className={INPUT} />
        </Field>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <Field label="Số điện thoại" id="emp-phone">
            <input
              id="emp-phone"
              type="tel"
              inputMode="tel"
              minLength={10}
              maxLength={15}
              value={f.phoneNumber}
              onChange={set('phoneNumber')}
              disabled={!canEdit}
              className={INPUT}
            />
          </Field>
          <Field label="Giới tính" id="emp-gender">
            <Select
              id="emp-gender"
              label="Giới tính"
              value={f.gender}
              onChange={(v) => setF((s) => ({ ...s, gender: v }))}
              options={GENDERS}
              disabled={!canEdit}
            />
          </Field>
          <Field label="Ngày sinh" id="emp-birthday">
            <input id="emp-birthday" type="date" value={f.birthday} onChange={set('birthday')} disabled={!canEdit} className={INPUT} />
          </Field>
          <Field label="Ngày gia nhập" id="emp-joined">
            <input id="emp-joined" type="date" value={f.joinedAt} onChange={set('joinedAt')} disabled={!canEdit} className={INPUT} />
          </Field>
        </div>
        <Field label="Địa chỉ" id="emp-address">
          <input id="emp-address" value={f.address} onChange={set('address')} disabled={!canEdit} className={INPUT} />
        </Field>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <Field label="Phòng ban" id="emp-dept">
            <Select
              id="emp-dept"
              label="Phòng ban"
              value={deptId}
              onChange={(v) => {
                setDeptId(v);
                setPosId('');
              }}
              options={[{ value: '', label: 'Chưa chọn' }, ...deptList.map((d) => ({ value: String(d.id), label: d.name }))]}
              disabled={!canAssign}
            />
          </Field>
          <Field label="Chức vụ" id="emp-pos">
            <Select
              id="emp-pos"
              label="Chức vụ"
              value={posId}
              onChange={setPosId}
              options={[{ value: '', label: 'Chưa chọn' }, ...posList.map((p) => ({ value: String(p.id), label: p.name }))]}
              disabled={!canAssign || !deptId}
            />
          </Field>
        </div>
        <Field label="Chính sách chấm công" id="emp-policy">
          <Select
            id="emp-policy"
            label="Chính sách chấm công"
            value={f.attendancePolicy}
            onChange={(v) => setF((s) => ({ ...s, attendancePolicy: v }))}
            options={POLICIES}
            disabled={!canEdit}
          />
        </Field>
      </div>

      {(canEdit || canAssign) && (
        <button type="submit" disabled={save.isPending || !f.fullName.trim()} className={`${BTN_PRIMARY}`}>
          {save.isPending ? 'Đang lưu…' : 'Lưu'}
        </button>
      )}
      {can('user:delete') && (
        <button
          type="button"
          disabled={remove.isPending}
          onClick={() => window.confirm(`Xoá nhân sự ${e.fullName || e.username}?`) && remove.mutate()}
          className={`${BTN_DANGER}`}
        >
          Xoá nhân sự
        </button>
      )}
    </form>
  );
}
