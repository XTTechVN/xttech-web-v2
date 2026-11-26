import { AlertCircle, Inbox } from 'lucide-react';

// Khối loading đúng hình dạng danh sách (cao bằng dòng thật)
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul aria-busy="true" aria-label="Đang tải" className="divide-y divide-rm-line">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex h-rm-row items-center gap-3 px-rm-gutter">
          <span className="size-10 flex-none animate-rm-pulse rounded-rm bg-rm-line" />
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="h-3.5 w-2/3 animate-rm-pulse rounded-rm-sm bg-rm-line" />
            <span className="h-3 w-1/3 animate-rm-pulse rounded-rm-sm bg-rm-line" />
          </span>
        </li>
      ))}
    </ul>
  );
}

interface MessageProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

function Message({ icon, title, description, actionLabel, onAction }: MessageProps & { icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-rm-gutter py-12 text-center">
      <span className="text-rm-muted">{icon}</span>
      <p className="font-medium text-rm-text">{title}</p>
      <p className="max-w-sm text-sm text-rm-muted">{description}</p>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 h-rm-tap rounded-rm border border-rm-line px-4 text-sm font-medium text-rm-primary transition-[background-color,transform] duration-(--rm-dur-fast) active:scale-95 active:bg-rm-primary-soft md:h-rm-control"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export const EmptyState = (p: MessageProps) => <Message icon={<Inbox size={32} />} {...p} />;
export const ErrorState = (p: MessageProps) => <Message icon={<AlertCircle size={32} />} {...p} />;
