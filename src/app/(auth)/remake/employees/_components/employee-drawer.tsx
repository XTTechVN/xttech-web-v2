'use client';

import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/actions';
import type { Employee } from '@/types';
import { getFileUrl } from '@/utils';
import { Sheet } from '../../_components/sheet';
import { ErrorState, ListSkeleton } from '../../_components/state-views';
import { EmployeeForm } from './employee-form';

interface Props {
  id: string | null;
  name?: string;
  open: boolean;
  onClose: () => void;
}

// Hồ sơ nhân viên trong ngăn kéo: xem, sửa, gán chức vụ, xoá (theo quyền) mà không rời danh sách.
export function EmployeeDrawer({ id, name, open, onClose }: Props) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => getUser(id!) as unknown as Promise<Employee>,
    enabled: open && !!id,
  });

  return (
    <Sheet open={open} onClose={onClose} title={data?.fullName || data?.username || name || 'Nhân viên'}>
      {data && (
        <div className="flex items-center gap-3 px-rm-gutter pt-3">
          <span className="flex size-12 flex-none items-center justify-center overflow-hidden rounded-full bg-rm-primary-soft text-base font-semibold text-rm-primary">
            {data.avatar ? (
              <img src={getFileUrl(data.avatar)} alt="" className="size-full object-cover" />
            ) : (
              (data.fullName || data.username).trim().charAt(0).toUpperCase()
            )}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-rm-muted">{data.email}</span>
        </div>
      )}
      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState title="Không tải được nhân viên" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
      )}
      {data && <EmployeeForm key={data.id} employee={data} onDone={onClose} />}
    </Sheet>
  );
}
