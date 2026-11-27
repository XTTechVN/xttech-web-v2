// Trạng thái dùng chung cho các section trong drawer phòng ban: đang tải, lỗi, trống
export function SectionSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-busy>
      <div className="h-11 animate-pulse rounded-control bg-slate-100" />
      <div className="h-11 animate-pulse rounded-control bg-slate-100" />
    </div>
  );
}

export function SectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <p className="text-sm text-slate-500">
      Không tải được dữ liệu.{' '}
      <button type="button" onClick={onRetry} className="cursor-pointer font-medium text-primary">
        Thử lại
      </button>
    </p>
  );
}

export function SectionEmpty({ children }: { children: string }) {
  return <p className="text-sm text-slate-400">{children}</p>;
}
