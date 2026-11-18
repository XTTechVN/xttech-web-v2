'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Mail, MoreVertical, Phone, Plus, Search, Users, Building2, ShieldCheck, Lock } from 'lucide-react';
import { getEmployees } from '@/actions/employee';
import { getDepartments } from '@/actions/department';
import { getRoles } from '@/actions/role';
import { useDebounce } from '@/hooks';
import { useAuthStore } from '@/stores';
import { getFileUrl } from '@/utils';
import type { Employee } from '@/types';

// Mockup UI: gọi API thật (dùng token đã đăng nhập ở /signin trong cùng trình duyệt).

const PAGE_SIZE = 8;

const TABS = [
  { key: 'employees', label: 'Nhân viên' },
  { key: 'departments', label: 'Phòng ban' },
  { key: 'roles', label: 'Vai trò' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

interface PositionWithDepartment {
  id: number;
  name: string;
  department?: { name: string } | null;
}

const AVATAR_TONES = [
  'bg-[#e3f0f1] text-[#045863]',
  'bg-[#efe9df] text-[#7a5b2e]',
  'bg-[#e8ecf5] text-[#3d4d7a]',
  'bg-[#f3e6e6] text-[#8a4545]',
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts.length > 1 ? parts[parts.length - 2][0] : '') + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString('vi-VN') : '---';
}

function EmployeeAvatar({ employee, index }: { employee: Employee; index: number }) {
  const name = employee.fullName || employee.username;
  const src = getFileUrl(employee.avatar);
  if (src) {
    return <img src={src} alt={name} className="size-10 shrink-0 rounded-full object-cover" />;
  }
  return (
    <span className={`grid size-10 shrink-0 place-items-center rounded-full text-xs font-semibold ${AVATAR_TONES[index % AVATAR_TONES.length]}`}>
      {initials(name)}
    </span>
  );
}

function RoleChip({ employee }: { employee: Employee }) {
  const role = employee.roles?.[0];
  return (
    <span className="inline-flex rounded-full bg-[#045863]/8 px-2.5 py-1 text-xs text-[#045863]">{role?.name ?? 'Nhân viên'}</span>
  );
}

function PositionChips({ employee }: { employee: Employee }) {
  const positions = (employee.positions ?? []) as PositionWithDepartment[];
  if (positions.length === 0) return <span className="text-xs italic text-stone-400">Chưa gán</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {positions.map((p) => (
        <span key={p.id} className="rounded-full border border-stone-200 px-2.5 py-1 text-xs text-stone-600">
          {p.department?.name ? `${p.name} · ${p.department.name}` : p.name}
        </span>
      ))}
    </div>
  );
}

function ActionButton() {
  return (
    <button
      type="button"
      aria-label="Thao tác"
      className="grid size-8 place-items-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
    >
      <MoreVertical className="size-4" />
    </button>
  );
}

export default function NhanSuMockupPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const enabled = Boolean(accessToken);

  const [tab, setTab] = useState<TabKey>('employees');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const search = useDebounce(query.trim(), 400);

  const employeesQuery = useQuery({
    queryKey: ['ui-test-employees', search, page],
    queryFn: () => getEmployees({ offset: page * PAGE_SIZE, limit: PAGE_SIZE, search: search || undefined }),
    enabled,
  });
  const departmentsQuery = useQuery({
    queryKey: ['ui-test-departments'],
    queryFn: () => getDepartments({ offset: 0, limit: 1 }),
    enabled,
  });
  const rolesQuery = useQuery({
    queryKey: ['ui-test-roles'],
    queryFn: () => getRoles({ offset: 0, limit: 1 }),
    enabled,
  });

  const rows = employeesQuery.data?.items ?? [];
  const total = employeesQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const departmentTotal: number | undefined = departmentsQuery.data?.meta?.total ?? departmentsQuery.data?.pagination?.total;
  const roleTotal = rolesQuery.data?.meta.total;

  const counts: Record<TabKey, number | undefined> = {
    employees: employeesQuery.data && !search ? total : undefined,
    departments: departmentTotal,
    roles: roleTotal,
  };

  const stats = [
    { label: 'Tổng nhân sự', value: counts.employees, icon: Users },
    { label: 'Phòng ban', value: departmentTotal, icon: Building2 },
    { label: 'Vai trò', value: roleTotal, icon: ShieldCheck },
  ];

  const isLoading = enabled && employeesQuery.isLoading;

  return (
    <div className="text-[#1c1c1a]">
      <main className="mx-auto max-w-[1280px] px-4 py-5 md:px-6 md:py-6">
        <div className="mb-5 md:mb-6">
          <h1 className="text-xl font-medium tracking-tight md:text-2xl">Quản trị nhân sự</h1>
          <p className="mt-1 text-sm text-stone-500">Quản lý nhân viên, phòng ban và phân quyền trong một nơi.</p>
        </div>

        {/* Stats */}
        <section className="mb-5 grid grid-cols-3 gap-2.5 md:mb-6 md:gap-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col gap-3 rounded-2xl bg-white p-3.5 shadow-[0_1px_2px_rgba(4,88,99,.06)] md:flex-row md:items-center md:gap-4 md:p-4"
            >
              <span className="grid size-9 place-items-center rounded-full bg-[#045863]/8 text-[#045863] md:size-10">
                <Icon className="size-[18px]" />
              </span>
              <div>
                <p className="text-xl font-medium leading-none tracking-tight md:text-2xl">{value ?? '–'}</p>
                <p className="mt-1.5 text-xs text-stone-500">{label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Tabs */}
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {TABS.map((t) => {
            const active = t.key === tab;
            const count = counts[t.key];
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                  active ? 'border-[#045863] bg-[#045863] text-white' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                {t.label}
                {count !== undefined && (
                  <span className={`rounded-full px-1.5 text-[11px] ${active ? 'bg-white/20' : 'bg-stone-100 text-stone-500'}`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {tab !== 'employees' ? (
          <div className="rounded-3xl border border-stone-200/70 bg-white py-20 text-center text-sm text-stone-400">
            Tab này chưa có mockup. Tập trung vào tab Nhân viên.
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="mb-4 flex items-center gap-3">
              <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-stone-400 focus-within:border-[#045863]/40 focus-within:ring-1 focus-within:ring-[#045863]/30 md:max-w-md">
                <Search className="size-4 shrink-0" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Tìm theo tên, email..."
                  className="w-full min-w-0 bg-transparent text-sm text-[#1c1c1a] outline-none placeholder:text-stone-400"
                />
              </label>
              <button
                type="button"
                aria-label="Thêm nhân viên"
                className="ml-auto flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#045863] px-4 text-sm font-medium text-white transition-colors hover:bg-[#03464f] md:px-5"
              >
                <Plus className="size-4" /> <span className="hidden sm:inline">Thêm nhân viên</span>
              </button>
            </div>

            {!enabled ? (
              <div className="flex flex-col items-center gap-3 rounded-3xl border border-stone-200/70 bg-white px-6 py-16 text-center">
                <span className="grid size-11 place-items-center rounded-full bg-[#045863]/8 text-[#045863]">
                  <Lock className="size-5" />
                </span>
                <p className="text-sm text-stone-600">Chưa có phiên đăng nhập nên chưa gọi được API thật.</p>
                <Link href="/signin" className="rounded-full bg-[#045863] px-5 py-2 text-sm text-white hover:bg-[#03464f]">
                  Đăng nhập
                </Link>
                <p className="text-xs text-stone-400">Sau khi đăng nhập, quay lại /ui-test/nhan-su.</p>
              </div>
            ) : employeesQuery.isError ? (
              <div className="rounded-3xl border border-red-100 bg-red-50/60 py-16 text-center text-sm text-red-600">
                Không tải được danh sách nhân viên.{' '}
                <button type="button" onClick={() => employeesQuery.refetch()} className="underline">
                  Thử lại
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-stone-200/70 bg-white shadow-[0_1px_2px_rgba(4,88,99,.05)]">
                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[820px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-stone-100 bg-stone-50/60 text-[11px] uppercase tracking-wider text-stone-400">
                        <th className="py-3.5 pl-6 pr-3 font-medium">Nhân viên</th>
                        <th className="px-3 py-3.5 font-medium">Email</th>
                        <th className="px-3 py-3.5 font-medium">Vai trò</th>
                        <th className="px-3 py-3.5 font-medium">Chức vụ &amp; Phòng ban</th>
                        <th className="px-3 py-3.5 font-medium">Ngày vào</th>
                        <th className="w-12 py-3.5 pr-5" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {isLoading &&
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            <td colSpan={6} className="px-6 py-4">
                              <div className="h-10 animate-pulse rounded-xl bg-stone-100" />
                            </td>
                          </tr>
                        ))}
                      {rows.map((e, i) => (
                        <tr key={e.id} className="transition-colors hover:bg-[#045863]/[0.03]">
                          <td className="py-4 pl-6 pr-3">
                            <div className="flex items-center gap-3">
                              <EmployeeAvatar employee={e} index={i} />
                              <div className="min-w-0">
                                <p className="truncate text-[13px] font-medium">{e.fullName || e.username}</p>
                                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-400">
                                  <Phone className="size-3" /> {e.phoneNumber || '---'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-[13px] text-stone-600">{e.email || '---'}</td>
                          <td className="px-3 py-4">
                            <RoleChip employee={e} />
                          </td>
                          <td className="px-3 py-4">
                            <PositionChips employee={e} />
                          </td>
                          <td className="px-3 py-4 text-[13px] text-stone-500">{formatDate(e.joinedAt ?? e.createdAt)}</td>
                          <td className="py-4 pr-5 text-right">
                            <ActionButton />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <ul className="divide-y divide-stone-100 md:hidden">
                  {isLoading &&
                    Array.from({ length: 4 }).map((_, i) => (
                      <li key={i} className="p-4">
                        <div className="h-16 animate-pulse rounded-xl bg-stone-100" />
                      </li>
                    ))}
                  {rows.map((e, i) => (
                    <li key={e.id} className="flex gap-3 p-4">
                      <EmployeeAvatar employee={e} index={i} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{e.fullName || e.username}</p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-400">
                              <Phone className="size-3" /> {e.phoneNumber || '---'}
                            </p>
                          </div>
                          <ActionButton />
                        </div>
                        <p className="mt-1.5 flex items-center gap-1.5 truncate text-xs text-stone-500">
                          <Mail className="size-3 shrink-0" /> <span className="truncate">{e.email || '---'}</span>
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          <RoleChip employee={e} />
                          <PositionChips employee={e} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {!isLoading && rows.length === 0 && (
                  <p className="py-16 text-center text-sm text-stone-400">Không tìm thấy nhân viên phù hợp</p>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-stone-100 px-4 py-3.5 text-xs text-stone-500 md:px-6">
                  <span>
                    {total === 0 ? '0 nhân viên' : `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, total)} / ${total}`}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Trang trước"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                      className="grid size-8 place-items-center rounded-full border border-stone-200 text-stone-600 disabled:text-stone-300"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="min-w-14 text-center">
                      {page + 1} / {totalPages}
                    </span>
                    <button
                      type="button"
                      aria-label="Trang sau"
                      disabled={page + 1 >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="grid size-8 place-items-center rounded-full border border-stone-200 text-stone-600 disabled:text-stone-300"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
