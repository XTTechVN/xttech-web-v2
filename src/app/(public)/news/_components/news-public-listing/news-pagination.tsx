import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components';

interface NewsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  isFetching: boolean;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export function NewsPagination({ page, totalPages, total, isFetching, setPage }: NewsPaginationProps) {
  return (
    <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-xs sm:text-sm text-slate-500">
        Trang{' '}
        <span className="font-mono tabular-nums font-bold text-slate-800">
          {page}
        </span>{' '}
        /{' '}
        <span className="font-mono tabular-nums font-bold text-slate-800">
          {totalPages}
        </span>{' '}
        (Tổng{' '}
        <span className="font-mono tabular-nums font-bold text-primary">{total}</span>{' '}
        bài viết)
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || isFetching}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Trước
        </Button>

        {Array.from({ length: totalPages })
          .map((_, i) => i + 1)
          .filter(
            (p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1),
          )
          .map((p, idx, arr) => {
            const prev = arr[idx - 1];
            const showEllipsis = prev && p - prev > 1;
            return (
              <React.Fragment key={p}>
                {showEllipsis && (
                  <span className="px-1.5 text-xs text-slate-400">...</span>
                )}
                <button
                  type="button"
                  onClick={() => setPage(p)}
                  disabled={isFetching}
                  className={`w-8 h-8 rounded-lg text-xs font-mono tabular-nums font-bold transition-colors cursor-pointer ${
                    p === page
                      ? 'bg-primary text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            );
          })}

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || isFetching}
          rightIcon={<ChevronRight className="w-4 h-4" />}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Tiếp
        </Button>
      </div>
    </div>
  );
}
