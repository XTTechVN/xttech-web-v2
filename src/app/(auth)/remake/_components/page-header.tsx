import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const ACTION =
  'flex h-rm-tap min-w-rm-tap flex-none items-center justify-center gap-2 rounded-rm bg-rm-primary px-3 text-sm font-medium text-rm-on-primary transition-[background-color,transform] duration-(--rm-dur-fast) active:scale-95 md:h-rm-control md:px-4 md:hover:bg-rm-primary-hover';

// Tiêu đề (font heading) + mô tả ngắn + một nút chính . Điện thoại: nút chỉ còn dấu +.
export function PageHeader({ title, description, actionLabel, onAction }: PageHeaderProps) {
  const inner = (
    <>
      <Plus size={18} />
      <span className="hidden md:inline">{actionLabel}</span>
    </>
  );
  return (
    <div className={`mb-4 items-start gap-3 ${actionLabel ? 'flex justify-end md:justify-start' : 'hidden md:flex'}`}>
      <div className="hidden min-w-0 flex-1 md:block">
        <h1 className="truncate font-heading text-xl font-semibold text-rm-text md:text-2xl">{title}</h1>
        {description && <p className="mt-0.5 line-clamp-2 text-sm text-rm-muted">{description}</p>}
      </div>
      {actionLabel && (
        <button type="button" onClick={onAction} aria-label={actionLabel} className={ACTION}>
          {inner}
        </button>
      )}
    </div>
  );
}

// Dòng quay lại ở đầu trang chi tiết.
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-2 -ml-2 inline-flex h-rm-tap items-center gap-1.5 rounded-rm px-2 text-sm text-rm-muted active:bg-rm-bg md:hover:bg-rm-bg"
    >
      <ArrowLeft size={18} aria-hidden="true" />
      {label}
    </Link>
  );
}
