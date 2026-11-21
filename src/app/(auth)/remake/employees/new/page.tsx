'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { checkUserExists, createEmployee, getDepartments, getPositions, setUserPositions } from '@/actions';
import type { Department, Employee, Position } from '@/types';
import { BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { BackLink, PageHeader } from '../../_components/page-header';
import { Select } from '../../_components/select';

// Thêm nhân sự: kiểm tra trùng email / CCCD khi rời ô, gán chức vụ ngay sau khi tạo.
export default function RemakeNewEmployeePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [f, setF] = useState({ username: '', email: '', fullName: '', password: '', phoneNumber: '', identifyCode: '' });
  const [dept, setDept] = useState('');
  const [pos, setPos] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dup, setDup] = useState<{ email?: string; identifyCode?: string }>({});
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const depts = useQuery({ queryKey: ['departments'], queryFn: () => getDepartments({ limit: 100 }) });
  const positions = useQuery({ queryKey: ['positions-all'], queryFn: () => getPositions({ limit: 200 }) });
  const posList = (positions.data?.items ?? []).filter((p: Position) => String(p.departmentId) === dept);

  const check = async (k: 'email' | 'identifyCode') => {
    const v = f[k].trim();
    if (!v) return setDup((d) => ({ ...d, [k]: undefined }));
    const found = await checkUserExists({ [k]: v });
    setDup((d) => ({ ...d, [k]: found ? `Đã có: ${found.fullName || found.username} (${found.email})` : undefined }));
  };

  const save = useMutation({
    mutationFn: async () => {
      const res = await createEmployee(
        { ...f, identifyCode: f.identifyCode.trim() || undefined } as unknown as Omit<
          Employee,
          'id' | 'createdAt' | 'updatedAt' | 'roles' | 'positions'
        >,
        file ?? undefined,
      );
      const id = res?.id ?? res?.user?.id;
      if (id && pos) await setUserPositions(String(id), [Number(pos)]);
    },
    onSuccess: () => {
      toast.success('Đã thêm nhân sự');
      qc.invalidateQueries({ queryKey: ['employees'] });
      router.push('/remake/employees');
    },
    onError: (e) => toast.error(messageOf(e)),
  });
  const ok = f.username.trim() && /\S+@\S+\.\S+/.test(f.email) && f.fullName.trim() && f.password.length >= 6 && !dup.email && !dup.identifyCode;

  return (
    <>
      <BackLink href="/remake/employees" label="Nhân viên" />
      <PageHeader title="Thêm nhân viên" description="Tạo tài khoản và gán chức vụ." />
      <form
        className="flex max-w-2xl flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))]">
          <Field label="Họ và tên" id="ne-name">
            <input id="ne-name" value={f.fullName} onChange={set('fullName')} autoComplete="name" className={INPUT} />
          </Field>
          <Field label="Tên đăng nhập" id="ne-user">
            <input id="ne-user" value={f.username} onChange={set('username')} autoComplete="off" className={INPUT} />
          </Field>
          <Field label="Email" id="ne-email">
            <input
              id="ne-email"
              type="email"
              value={f.email}
              onChange={set('email')}
              onBlur={() => check('email')}
              aria-invalid={!!dup.email}
              className={INPUT}
            />
            {dup.email && (
              <span role="alert" className="mt-1 block text-xs text-rm-danger">
                {dup.email}
              </span>
            )}
          </Field>
          <Field label="Mật khẩu (tối thiểu 6 ký tự)" id="ne-pw">
            <input id="ne-pw" type="password" value={f.password} onChange={set('password')} autoComplete="new-password" className={INPUT} />
          </Field>
          <Field label="Số điện thoại" id="ne-phone">
            <input id="ne-phone" type="tel" inputMode="tel" value={f.phoneNumber} onChange={set('phoneNumber')} className={INPUT} />
          </Field>
          <Field label="CCCD" id="ne-cccd">
            <input
              id="ne-cccd"
              inputMode="numeric"
              value={f.identifyCode}
              onChange={set('identifyCode')}
              onBlur={() => check('identifyCode')}
              aria-invalid={!!dup.identifyCode}
              className={INPUT}
            />
            {dup.identifyCode && (
              <span role="alert" className="mt-1 block text-xs text-rm-danger">
                {dup.identifyCode}
              </span>
            )}
          </Field>
          <Field label="Phòng ban" id="ne-dept">
            <Select
              id="ne-dept"
              label="Phòng ban"
              value={dept}
              onChange={(v) => {
                setDept(v);
                setPos('');
              }}
              options={[
                { value: '', label: 'Chưa chọn' },
                ...(depts.data?.items ?? []).map((d: Department) => ({ value: String(d.id), label: d.name })),
              ]}
            />
          </Field>
          <Field label="Chức vụ" id="ne-pos">
            <Select
              id="ne-pos"
              label="Chức vụ"
              value={pos}
              onChange={setPos}
              disabled={!dept}
              options={[{ value: '', label: 'Chưa chọn' }, ...posList.map((p: Position) => ({ value: String(p.id), label: p.name }))]}
            />
          </Field>
        </div>
        <Field label="Ảnh đại diện" id="ne-avatar">
          <input id="ne-avatar" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
        </Field>
        <button type="submit" disabled={save.isPending || !ok} className={`${BTN_PRIMARY} md:self-start md:px-8`}>
          {save.isPending ? 'Đang tạo…' : 'Tạo tài khoản'}
        </button>
      </form>
    </>
  );
}
