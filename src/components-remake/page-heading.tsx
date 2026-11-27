import { cn } from '@/utils/cn';

/** Tiêu đề trang nằm trong nội dung: tên trang + mô tả ngắn bên dưới */
export function PageHeading({ title, description, className }: { title: string; description?: string; className?: string }) {
  return (
    <div className={cn('mb-4 min-w-0', className)}>
      <h1 className="truncate font-heading text-xl font-semibold text-slate-900 md:text-2xl">{title}</h1>
      {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
    </div>
  );
}
