/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useRef } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import { TableHeader } from './table-header';
import { TableBody } from './table-body';
import { TablePagination } from './table-pagination';

import { TableDataDesktopProps, BaseResponseWithPagination } from './types';

export function TableDataDesktop<T>({
  fetcher,
  columns,
  queryKey,
  select = false,
  syncToUrl = true,
  initialData,
  hideRowPerPage = false,
  hidePagination = false,
}: TableDataDesktopProps<T>) {
  // Lấy các hooks hỗ trợ điều hướng và lấy thông tin URL từ Next.js Navigation
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // State cục bộ dự phòng khi tuỳ chọn syncToUrl bằng false
  const [localOffset, setLocalOffset] = useState(0);
  const [localLimit, setLocalLimit] = useState(10);

  // Xác định số phần tử mỗi trang: Ưu tiên lấy từ URL nếu syncToUrl = true, ngược lại lấy từ state cục bộ
  const limit = syncToUrl ? (searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 10) : localLimit;

  // Xác định offset: Ưu tiên lấy từ URL nếu syncToUrl = true, ngược lại lấy từ state cục bộ
  const offset = syncToUrl ? (searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0) : localOffset;
  const page = Math.floor(offset / limit) + 1;

  // Xử lý khi người dùng đổi trang (chuyển sang trang mới)
  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * limit;
    if (syncToUrl) {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set('offset', String(newOffset));
      router.replace(`${pathname}?${current.toString()}`, { scroll: false });
    } else {
      setLocalOffset(newOffset);
    }
  };

  // Xử lý khi người dùng thay đổi số lượng bản ghi hiển thị trên mỗi trang (limit)
  const handleLimitChange = (newLimit: number) => {
    if (syncToUrl) {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set('limit', String(newLimit));
      current.set('offset', '0'); // Tự động đưa về offset 0 khi thay đổi limit
      router.replace(`${pathname}?${current.toString()}`, { scroll: false });
    } else {
      setLocalLimit(newLimit);
      setLocalOffset(0);
    }
  };

  // Reset về offset 0 khi các bộ lọc bên ngoài (queryKey) thay đổi
  const queryKeySerialized = JSON.stringify(queryKey);
  const prevQueryKeyRef = useRef(queryKeySerialized);

  useEffect(() => {
    if (prevQueryKeyRef.current !== queryKeySerialized) {
      prevQueryKeyRef.current = queryKeySerialized;
      if (!syncToUrl) {
        setLocalOffset(0);
      } else {
        const currentOffset = searchParams.get('offset');
        if (currentOffset && currentOffset !== '0') {
          const current = new URLSearchParams(Array.from(searchParams.entries()));
          current.set('offset', '0');
          router.replace(`${pathname}?${current.toString()}`, { scroll: false });
        }
      }
    }
  }, [queryKeySerialized, syncToUrl, searchParams, pathname, router]);

  // Sử dụng fetcher để lấy dữ liệu với offset và limit động
  const { data: res, isPlaceholderData } = useQuery<BaseResponseWithPagination<T>>({
    queryKey: [...queryKey, offset, limit],
    queryFn: () => fetcher({ offset, limit }),
    placeholderData: keepPreviousData,
    initialData,
  });

  const meta = res?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;

  return (                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
    <div className="flex flex-col gap-4 w-full">
      <div className="overflow-x-auto w-full">
        <table
          className={`table w-full border-collapse transition-opacity duration-200 ${isPlaceholderData ? 'opacity-60' : 'opacity-100'}`}
        >
          {/* Render table header */}
          <TableHeader columns={columns} select={select} />

          {/* Render table rows */}
          <TableBody data={res?.items || []} columns={columns} select={select} />
        </table>
      </div>

      {/* Render Pagination controls if metadata is available */}
      {meta && (
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={limit}
          onPageChange={handlePageChange}
          onPageSizeChange={handleLimitChange}
          hideRowPerPage={hideRowPerPage}
          hidePagination={hidePagination}
        />
      )}
    </div>
  );
}
