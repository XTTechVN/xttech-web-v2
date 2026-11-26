'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Avatar } from '@/components';
import { Button, DrawerSection, InfoRow, Tabs } from '@/components-remake';
import { useCan } from '@/hooks';
import { deleteEmployee } from '@/actions/employee';
import { getFileUrl } from '@/utils';
import queryClient from '@/utils/query';
import type { Employee } from '@/types';
import { AccessSection } from './access-sections';
import { AccountSection } from './account-section';
import { DeleteEmployeeModal } from './delete-modal';
import { EMPLOYEE_FORM_ID, EmployeeForm } from './employee-form';
import { formatDate } from './list';
import { PermissionsSection } from './permissions-section';

type Tab = 'info' | 'access' | 'permissions' | 'account';

const GENDER: Record<string, string> = { male: 'Nam', female: 'Nữ', other: 'Khác' };
const INFO_COLS = 'grid-cols-[minmax(0,9rem)_minmax(0,1fr)]';
const BLOCK = 'rounded-block border border-slate-200/80 bg-white p-4 md:p-5';

// Trang chi tiết nhân sự: tab Thông tin (xem/sửa), Vai trò & chức vụ, Quyền hiện có, Tài khoản. Mỗi tab xét quyền riêng.
export function EmployeeDetailPage({ employee: e }: { employee: Employee }) {
  const router = useRouter();
  const { can } = useCan();
  const [tab, setTab] = useState<Tab>('info');
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const name = e.fullName || e.username;
  const canEdit = can('user:update');
  const canDelete = can('user:delete');

  const tabs = useMemo(() => {
    const list: { value: Tab; label: string }[] = [{ value: 'info', label: 'Thông tin' }];
    if (can('user:read')) list.push({ value: 'access', label: 'Vai trò & chức vụ' });
    if (can('user:assign_role')) list.push({ value: 'permissions', label: 'Quyền hiện có' });
    if (canEdit) list.push({ value: 'account', label: 'Tài khoản' });
    return list;
  }, [can, canEdit]);

  const { mutate: remove, isPending: removing } = useMutation({
    mutationFn: () => deleteEmployee(e.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Xóa nhân sự thành công');
      router.replace('/app/employees');
    },
    onError: (error: Error) => toast.error(error?.message || 'Lỗi hệ thống khi xóa nhân sự'),
  });

  return (
    <div className="mx-auto max-w-3xl p-4 font-body md:p-6 [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading">
      <Link href="/app/employees" className="mb-3 inline-flex min-h-11 items-center gap-1.5 text-sm text-slate-600 md:hover:text-slate-900">
        <ArrowLeft size={16} aria-hidden="true" /> Nhân sự
      </Link>

      <header className={editing ? 'sr-only' : 'mb-4 flex items-center gap-3 md:gap-4'}>
        <Avatar src={getFileUrl(e.avatar) || undefined} name={name} size="xl" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold text-slate-900 md:text-2xl">{name}</h1>
          <p className="truncate text-sm text-slate-600">{e.email}</p>
        </div>
        {!editing && (
          <div className="flex flex-none items-center gap-2">
            {canEdit && (
              <Button
                variant="outline"
                icon={<Pencil size={16} />}
                iconOnly="mobile"
                onClick={() => {
                  setTab('info');
                  setEditing(true);
                }}
              >
                Sửa
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outline"
                className="border-red-200 text-red-600 active:bg-red-50 md:hover:bg-red-50"
                icon={<Trash2 size={16} />}
                iconOnly="mobile"
                onClick={() => setDeleting(true)}
              >
                Xóa
              </Button>
            )}
          </div>
        )}
      </header>

      {!editing && <Tabs tabs={tabs} value={tab} onChange={setTab} label="Mục chi tiết nhân sự" className="mb-4 px-0" />}

      {editing ? (
        <div className={BLOCK}>
          <h2 className="mb-4 text-base font-semibold text-slate-900">Chỉnh sửa nhân sự</h2>
          <EmployeeForm key={e.id} initialData={e} onDone={() => setEditing(false)} onPendingChange={setPending} />
          <div className="sticky bottom-0 -mx-4 mt-6 flex justify-end gap-2 border-t border-slate-100 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:-mx-5 md:px-5">
            <Button variant="outline" className="flex-1 md:flex-none" onClick={() => setEditing(false)} disabled={pending}>
              Hủy
            </Button>
            <Button type="submit" form={EMPLOYEE_FORM_ID} className="flex-1 md:flex-none" loading={pending}>
              Lưu
            </Button>
          </div>
        </div>
      ) : (
        <div className={BLOCK}>
          {tab === 'info' && (
            <DrawerSection>
              <InfoRow label="Tên đăng nhập" className={INFO_COLS}>{e.username}</InfoRow>
              <InfoRow label="Điện thoại" className={INFO_COLS}>{e.phoneNumber || '–'}</InfoRow>
              <InfoRow label="Địa chỉ" className={INFO_COLS}>{e.address || '–'}</InfoRow>
              <InfoRow label="Giới tính" className={INFO_COLS}>{(e.gender && GENDER[e.gender]) || e.gender || '–'}</InfoRow>
              <InfoRow label="Ngày sinh" className={INFO_COLS}>{formatDate(e.birthday)}</InfoRow>
              <InfoRow label="Ngày vào làm" className={INFO_COLS}>{formatDate(e.joinedAt)}</InfoRow>
              <InfoRow label="Ngày tạo tài khoản" className={INFO_COLS}>{formatDate(e.createdAt)}</InfoRow>
            </DrawerSection>
          )}
          {tab === 'access' && <AccessSection key={e.id} employee={e} />}
          {tab === 'permissions' && <PermissionsSection key={e.id} employee={e} />}
          {tab === 'account' && <AccountSection key={e.id} employee={e} />}
        </div>
      )}

      <DeleteEmployeeModal employee={deleting ? e : null} isPending={removing} onClose={() => setDeleting(false)} onConfirm={() => remove()} />
    </div>
  );
}
