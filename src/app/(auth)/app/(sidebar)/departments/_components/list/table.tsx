'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Skeleton } from '@/components';
import { Button } from '@/components-remake';
import { useQueryParam } from '@/hooks';
import { deleteDepartment, getDepartments } from '@/actions/department';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import type { Department } from '@/types';

import DepartmentActionBar from './action-bar';
import { DepartmentDrawer } from './detail-drawer';
import { DeleteDepartmentModal } from './delete-modal';
import { DepartmentList } from './list';
import { DepartmentStats } from './stats';

// Ít phòng ban nên tải hết một lần, tìm kiếm ngay trên máy, không phân trang
const ALL = 1000;

const Table = () => {
  const [urlSearch, setUrlSearch] = useQueryParam('search');
  // Giữ chữ đang gõ trong state cục bộ: URL cập nhật trễ làm mất dấu tiếng Việt (bộ gõ) và nuốt dấu cách
  const [search, setSearch] = useState(urlSearch ?? '');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<Department | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['departments', 'all'],
    queryFn: () => getDepartments({ limit: ALL }),
  });

  const { mutate: remove, isPending } = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Xóa phòng ban thành công');
      setDeleting(null);
    },
    onError: (e) => showErrorToast(e, 'Xóa phòng ban thất bại'),
  });

  const all = useMemo<Department[]>(() => data?.items ?? [], [data]);
  // Lấy lại bản ghi mới nhất theo id để drawer cập nhật ngay sau khi sửa
  const selected = useMemo(() => all.find((d) => d.id === selectedId) ?? null, [all, selectedId]);
  const keyword = search.trim().toLowerCase();

  const rows = useMemo(() => all.filter((d) => !keyword || `${d.name} ${d.code}`.toLowerCase().includes(keyword)), [all, keyword]);

  let body: React.ReactNode;
  if (isLoading) {
    body = <Skeleton className="h-64 w-full rounded-block" />;
  } else if (isError) {
    body = (
      <div className="flex flex-col items-center gap-3 rounded-block border border-slate-200/80 bg-white py-12 text-center">
        <p className="text-sm text-slate-600">Không tải được danh sách phòng ban.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Thử lại
        </Button>
      </div>
    );
  } else if (rows.length === 0) {
    body = (
      <p className="rounded-block border border-slate-200/80 bg-white py-12 text-center text-sm text-slate-500">
        {keyword ? 'Không có phòng ban khớp với tìm kiếm.' : 'Chưa có phòng ban nào.'}
      </p>
    );
  } else {
    body = <DepartmentList rows={rows} onOpen={(d) => setSelectedId(d.id)} />;
  }

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      {!isError && <DepartmentStats rows={all} />}

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
            placeholder="Tìm phòng ban..."
            aria-label="Tìm phòng ban"
            className="h-11 w-full rounded-control border border-slate-200 bg-white pl-9 pr-3 text-base text-slate-900 placeholder:text-slate-500 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 md:h-10 md:text-sm"
          />
        </div>
        <div className="ml-auto flex flex-none items-center gap-2">
          <DepartmentActionBar />
        </div>
      </div>

      {body}

      <DepartmentDrawer
        department={selected}
        onClose={() => setSelectedId(null)}
        onDelete={(d) => {
          setSelectedId(null);
          setDeleting(d);
        }}
      />
      <DeleteDepartmentModal department={deleting} isPending={isPending} onClose={() => setDeleting(null)} onConfirm={remove} />
    </div>
  );
};

export default Table;
