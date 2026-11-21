'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDepartments } from '@/actions';
import { useCan } from '@/hooks';
import type { Department } from '@/types';
import { DataList } from '../_components/data-list';
import { PageHeader } from '../_components/page-header';
import { EmptyState, ErrorState, ListSkeleton } from '../_components/state-views';
import { DepartmentCard, departmentColumns } from './_components/department-columns';
import { DepartmentSheet } from './_components/department-sheet';

// Phòng ban (API /departments). Bấm một dòng để sửa tên, mã và chức vụ.
export default function RemakeDepartmentsPage() {
  const { can, isReady } = useCan();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments({ limit: 100 }),
    enabled: isReady && can('department:read'),
  });
  const [open, setOpen] = useState<Department | 'new' | null>(null);
  const items: Department[] = data?.items ?? [];

  if (!isReady) return <ListSkeleton />;
  if (!can('department:read')) return <EmptyState title="Bạn chưa có quyền xem phòng ban" description="Liên hệ quản trị viên để được cấp quyền." />;

  return (
    <>
      <PageHeader
        title="Phòng ban"
        description="Phòng ban và chức vụ trong doanh nghiệp."
        actionLabel={can('department:create') ? 'Thêm phòng ban' : undefined}
        onAction={() => setOpen('new')}
      />

      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState title="Không tải được phòng ban" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
      )}
      {data && items.length === 0 && <EmptyState title="Chưa có phòng ban" description="Tạo phòng ban đầu tiên để sắp xếp nhân sự." />}
      {items.length > 0 && (
        <DataList
          label="Danh sách phòng ban"
          rows={items}
          rowKey={(d) => d.id}
          columns={departmentColumns}
          card={(d) => <DepartmentCard d={d} />}
          href={(d) => `/remake/departments/${d.id}`}
        />
      )}

      <DepartmentSheet key={open === 'new' ? 'new' : (open?.id ?? 'none')} target={open} onClose={() => setOpen(null)} />
    </>
  );
}
