'use client';

import { Skeleton } from '@/components';
import { Button } from '@/components-remake';

interface Props {
  loading: boolean;
  error?: boolean;
  onRetry?: () => void;
  empty: boolean;
  /** Câu hiển thị khi danh sách trống, kèm nút hành động nếu có */
  emptyText: string;
  emptyAction?: React.ReactNode;
  children: React.ReactNode;
}

const BOX = 'flex flex-col items-center gap-3 rounded-block border border-slate-200/80 bg-white py-12 text-center';

// Bốn trạng thái của một vùng dữ liệu: đang tải, lỗi, trống, có dữ liệu
export function TabState({ loading, error, onRetry, empty, emptyText, emptyAction, children }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-block" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className={BOX}>
        <p className="text-sm text-slate-600">Không tải được dữ liệu.</p>
        <Button variant="outline" onClick={onRetry}>
          Thử lại
        </Button>
      </div>
    );
  }
  if (empty) {
    return (
      <div className={BOX}>
        <p className="text-sm text-slate-600">{emptyText}</p>
        {emptyAction}
      </div>
    );
  }
  return <>{children}</>;
}
