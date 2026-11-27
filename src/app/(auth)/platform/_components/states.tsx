import { Skeleton } from '@/components';
import { Button } from '@/components-remake';

type Kind = 'loading' | 'error' | 'empty';

// Ba trạng thái dùng chung cho vùng dữ liệu: đang tải (khung xương), lỗi (có Thử lại), trống
export function ListState({ kind, onRetry, emptyText }: { kind: Kind; onRetry?: () => void; emptyText?: string }) {
  if (kind === 'loading') return <Skeleton className="h-64 w-full rounded-block" />;
  return (
    <div className="flex flex-col items-center gap-3 rounded-block border border-slate-200/80 bg-white px-4 py-12 text-center">
      <p className="text-sm text-slate-600">{kind === 'error' ? 'Không tải được dữ liệu.' : emptyText}</p>
      {kind === 'error' && onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}

export function LoadMore({ visible, total, loading, onClick }: { visible: number; total: number; loading: boolean; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-slate-500">
        Đang hiện {visible}/{total}
      </p>
      {visible < total && (
        <Button variant="outline" loading={loading} onClick={onClick}>
          Xem thêm
        </Button>
      )}
    </div>
  );
}
