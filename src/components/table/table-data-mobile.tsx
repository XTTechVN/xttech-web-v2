'use client';

import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useInfiniteScroll } from '@/hooks';
import { TableDataMobileProps, BaseResponseWithPagination } from './types';

export function TableDataMobile<T>({
  fetcher,
  queryKey,
  renderCard,
  syncToUrl = true,
  initialData,
}: TableDataMobileProps<T>) {
  const searchParams = useSearchParams();

  // Xác định giới hạn (limit) bản ghi mỗi trang, ưu tiên từ URL
  const limit = syncToUrl 
    ? (searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 10)
    : 10;

  // Sử dụng useInfiniteQuery để tự động tích lũy dữ liệu khi cuộn trang
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<BaseResponseWithPagination<T>>({
    queryKey: [...queryKey, limit],
    queryFn: ({ pageParam = 0 }) => fetcher({ offset: pageParam as number, limit }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.meta;
      if (!meta || !meta.next) return undefined;
      // Trả về offset của trang tiếp theo
      return meta.offset + meta.limit;
    },
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [0],
        }
      : undefined,
  });

  // Tích hợp hook cuộn vô hạn lắng nghe sự kiện scroll của Window
  useInfiniteScroll({
    enabled: !isLoading && !isError,
    isFetchingNextPage,
    hasNextPage: !!hasNextPage,
    fetchNextPage,
    threshold: 300, // Kích hoạt fetch trước khi chạm đáy 300px
  });

  // Gom toàn bộ items từ các trang đã tải thành 1 mảng phẳng và loại bỏ bản ghi trùng id
  // (tránh lặp card khi bản ghi bị trượt ranh giới trang giữa các lần fetch offset)
  const items = useMemo(() => {
    const flatItems = data?.pages?.flatMap((page) => page?.items || []) || [];
    const seenIds = new Set<unknown>();
    return flatItems.filter((item) => {
      const itemId = (item as { id?: unknown } | null)?.id;
      if (itemId === undefined || itemId === null) return true;
      if (seenIds.has(itemId)) return false;
      seenIds.add(itemId);
      return true;
    });
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8 text-primary/60 text-sm">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center py-8 text-red-500 text-sm">
        Có lỗi xảy ra khi tải dữ liệu.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {items.length === 0 ? (
        <div className="flex justify-center items-center py-12 bg-white border border-secondary/20 rounded-lg text-primary/50 text-sm">
          Không tìm thấy dữ liệu.
        </div>
      ) : (
        <>
          {/* Danh sách các Cards */}
          <div className="flex flex-col gap-3">
            {items.map((item, index) => (
              <div key={(item as any)?.id ?? index} className="w-full">
                {renderCard(item, index)}
              </div>
            ))}
          </div>

          {/* Indicator khi đang tải thêm trang tiếp theo */}
          {isFetchingNextPage && (
            <div className="flex justify-center items-center py-4 text-primary/60 text-sm">
              Đang tải thêm...
            </div>
          )}
        </>
      )}
    </div>
  );
}
