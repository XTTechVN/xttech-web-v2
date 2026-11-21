'use client';

import { Suspense, useDeferredValue, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { getEmployees } from '@/actions';
import { useCan } from '@/hooks';
import { DataList } from '../_components/data-list';
import { INPUT } from '../_components/form';
import { PageHeader } from '../_components/page-header';
import { EmployeeCard, employeeColumns } from './_components/employee-columns';
import { EmployeeDrawer } from './_components/employee-drawer';
import { EmptyState, ErrorState, ListSkeleton } from '../_components/state-views';

const PAGE = 20;
// Hồ sơ nhân sự (API /users): tìm kiếm, sửa thông tin, gán chức vụ. Thêm nhân sự đầu tiên.
export default function RemakeEmployeesPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <EmployeesView />
    </Suspense>
  );
}

function EmployeesView() {
  const { can, isReady } = useCan();
  const router = useRouter();
  const deepLink = useSearchParams().get('open');
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(deepLink ? { id: deepLink, name: '' } : null);
  const [drawer, setDrawer] = useState(picked !== null);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const q = useDeferredValue(search.trim());
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['employees', q, limit],
    queryFn: () => getEmployees({ limit, offset: 0, search: q || undefined }),
    placeholderData: (prev) => prev,
    enabled: isReady && can('user:read'),
  });
  const items = data?.items ?? [];

  if (!isReady) return <ListSkeleton />;
  if (!can('user:read')) return <EmptyState title="Bạn chưa có quyền xem nhân viên" description="Liên hệ quản trị viên để được cấp quyền." />;

  return (
    <>
      <PageHeader
        title="Nhân viên"
        description="Hồ sơ, chức vụ và phòng ban của nhân viên."
        actionLabel={can('user:create') ? 'Thêm nhân viên' : undefined}
        onAction={() => router.push('/remake/employees/new')}
      />

      <div className="sticky top-0 z-10 -mx-rm-gutter mb-3 bg-rm-bg px-rm-gutter pb-2">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
          <input
            type="search"
            aria-label="Tìm nhân sự"
            placeholder="Tìm theo tên, email, số điện thoại"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setLimit(PAGE);
            }}
            className={`${INPUT} pl-10`}
          />
        </div>
      </div>

      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState title="Không tải được nhân sự" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
      )}
      {data && items.length === 0 && (
        <EmptyState title={q ? 'Không tìm thấy' : 'Chưa có nhân sự'} description={q ? 'Thử từ khoá khác.' : 'Thêm nhân sự đầu tiên.'} />
      )}
      {items.length > 0 && (
        <DataList
          label="Danh sách nhân sự"
          rows={items}
          rowKey={(u) => u.id}
          columns={employeeColumns}
          card={(u) => <EmployeeCard u={u} />}
          onOpen={(u) => {
            setPicked({ id: u.id, name: u.fullName || u.username });
            setDrawer(true);
          }}
        />
      )}
      <EmployeeDrawer id={picked?.id ?? null} name={picked?.name} open={drawer} onClose={() => setDrawer(false)} />

      {data?.meta.next && (
        <button
          type="button"
          disabled={isFetching}
          onClick={() => setLimit((l) => l + PAGE)}
          className="mt-3 h-rm-tap w-full rounded-rm border border-rm-line bg-rm-surface text-sm font-medium active:bg-rm-bg md:h-rm-control"
        >
          {isFetching ? 'Đang tải…' : `Xem thêm (${items.length}/${data.meta.total})`}
        </button>
      )}
    </>
  );
}
