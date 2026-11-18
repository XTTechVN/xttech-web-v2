import type { ReactNode } from 'react';

export const PageHeader = ({ title, description, back }: { title: string; description?: string; back?: ReactNode }) => (
  <header className="flex flex-col gap-1">
    {back}
    <h1 className="font-lexend text-xl font-semibold tracking-tight text-gray-900 [overflow-wrap:anywhere]">{title}</h1>
    {description && <p className="text-sm text-gray-500">{description}</p>}
  </header>
);

export const ListState = ({ kind, onRetry, emptyText }: { kind: 'loading' | 'error' | 'empty'; onRetry?: () => void; emptyText?: string }) => {
  if (kind === 'loading')
    return (
      <div className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex h-16 items-center gap-3 px-4">
            <div className="h-9 w-9 animate-pulse rounded-md bg-gray-100" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-10 text-center">
      <p className="text-sm text-gray-500">{kind === 'error' ? 'Không tải được dữ liệu.' : emptyText}</p>
      {kind === 'error' && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="h-11 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 active:scale-95"
        >
          Thử lại
        </button>
      )}
    </div>
  );
};
