'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Button, Skeleton } from '@/components';
import { FilterDrawer, type FilterGroup } from '@/components-remake';
import { useCan, useQueryParam } from '@/hooks';
import { getEmployees } from '@/actions/employee';
import type { Employee } from '@/types';

import EmployeeActionBar from './action-bar';
import { EmployeeList } from './list';
import { EmployeeStats } from './stats';

// Ít nhân sự nên tải hết một lần, tìm kiếm lọc ngay trên máy, không phân trang
const ALL = 1000;

const searchText = (e: Employee) =>
  [e.fullName, e.username, e.email, e.phoneNumber, ...(e.positions ?? []).map((p) => p.name)].filter(Boolean).join(' ').toLowerCase();

const Table = () => {
  const [urlSearch, setUrlSearch] = useQueryParam('search');
  // Giữ chữ đang gõ trong state cục bộ: URL cập nhật trễ làm mất dấu tiếng Việt (bộ gõ) và nuốt dấu cách
  const [search, setSearch] = useState(urlSearch ?? '');
  const router = useRouter();
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => getEmployees({ limit: ALL }),
  });

  const all = useMemo(() => data?.items ?? [], [data]);

  // Phạm vi own: API chỉ trả hồ sơ của chính mình, nên không có gì để lọc/tìm, vào thẳng hồ sơ
  const { isWide } = useCan();
  const ownOnly = !isWide('user:read');
  useEffect(() => {
    if (ownOnly && all.length === 1) router.replace(`/app/employees/${all[0].id}`);
  }, [ownOnly, all, router]);
  const keyword = search.trim().toLowerCase();

  const groups = useMemo<FilterGroup[]>(() => {
    const roles = new Map<string, string>();
    const depts = new Set<string>();
    all.forEach((e) => {
      e.roles?.forEach((r) => roles.set(r.code, r.name));
      e.positions?.forEach((p) => p.department?.name && depts.add(p.department.name));
    });
    return [
      { key: 'role', label: 'Vai trò', options: [...roles].map(([value, label]) => ({ value, label })) },
      { key: 'dept', label: 'Phòng ban', options: [...depts].sort().map((d) => ({ value: d, label: d })) },
      {
        key: 'pos',
        label: 'Chức vụ',
        options: [
          { value: 'has', label: 'Đã có chức vụ' },
          { value: 'none', label: 'Chưa có chức vụ' },
        ],
      },
    ].filter((g) => g.options.length > 0);
  }, [all]);

  const rows = useMemo(
    () =>
      all.filter((e) => {
        if (keyword && !searchText(e).includes(keyword)) return false;
        if (filters.role && !e.roles?.some((r) => r.code === filters.role)) return false;
        if (filters.dept && !e.positions?.some((p) => p.department?.name === filters.dept)) return false;
        if (filters.pos === 'has' && !e.positions?.length) return false;
        if (filters.pos === 'none' && e.positions?.length) return false;
        return true;
      }),
    [all, keyword, filters],
  );
  const filtered = !!keyword || Object.values(filters).some(Boolean);

  let body;
  if (isLoading) {
    body = (
      <div className="flex flex-col gap-2" aria-busy="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-block" />
        ))}
      </div>
    );
  } else if (isError) {
    body = (
      <div className="flex flex-col items-center gap-3 rounded-block border border-slate-200/80 bg-white py-12 text-center">
        <p className="text-sm text-slate-600">Không tải được danh sách nhân sự.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Thử lại
        </Button>
      </div>
    );
  } else if (rows.length === 0) {
    body = (
      <p className="rounded-block border border-slate-200/80 bg-white py-12 text-center text-sm text-slate-500">
        {filtered ? 'Không có nhân sự khớp với tìm kiếm và bộ lọc.' : 'Chưa có nhân sự nào.'}
      </p>
    );
  } else {
    body = <EmployeeList rows={rows} onOpen={(e) => router.push(`/app/employees/${e.id}`)} />;
  }

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      {!isError && <EmployeeStats rows={all} />}

      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1 md:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setUrlSearch(e.target.value);
            }}
            placeholder="Tìm nhân sự..."
            aria-label="Tìm nhân sự"
            className="h-11 w-full rounded-control border border-slate-200 bg-white pl-9 pr-3 text-base text-slate-900 placeholder:text-slate-500 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 md:h-10 md:text-sm"
          />
        </div>
        <div className="ml-auto flex flex-none items-center gap-2">
          {groups.length > 0 && <FilterDrawer groups={groups} value={filters} onChange={setFilters} />}
          <EmployeeActionBar />
        </div>
      </div>

      {body}
    </div>
  );
};

export default Table;
