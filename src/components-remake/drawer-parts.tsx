import { Plus, X } from 'lucide-react';
import { cn } from '@/utils/cn';

// Chuẩn nội dung drawer: một khối liền, nhóm cách nhau bằng đường kẻ mảnh và nhãn nhỏ; không dùng thẻ viền lồng nhau.

/** Khung tròn cho avatar/icon chồng lên mép banner */
export function DrawerMedia({ children }: { children: React.ReactNode }) {
  return <div className="inline-flex overflow-hidden rounded-full bg-white shadow-sm ring-4 ring-white">{children}</div>;
}

export function DrawerSection({
  title,
  hint,
  action,
  children,
}: {
  title?: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 border-t border-slate-100 pt-4 first:mt-0 first:border-0 first:pt-0">
      {title && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-xs font-medium text-slate-500">
            {title}
            {hint && <span className="ml-1.5 text-slate-400">{hint}</span>}
          </h3>
          {action && <div className="-my-3 flex-none md:-my-1">{action}</div>}
        </div>
      )}
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

/** Một dòng thông tin: nhãn bên trái, giá trị bên phải; giá trị dài tự xuống dòng */
export function InfoRow({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-3 text-sm', className)}>
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 text-slate-900 [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

const ROUND_BTN =
  'flex size-11 flex-none cursor-pointer items-center justify-center rounded-full transition active:scale-95 md:size-9 md:hover:bg-slate-900/10 active:bg-slate-900/10';

/** Nút icon tròn trên banner: dùng cho Sửa, Xóa */
export function IconAction({
  label,
  danger,
  className,
  ...props
}: { label: string; danger?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={cn(ROUND_BTN, 'text-slate-600', danger && 'active:text-red-600 md:hover:bg-red-50 md:hover:text-red-600', className)}
    />
  );
}

interface DrawerHeaderProps {
  title: string;
  description?: string;
  /** Avatar hoặc icon chồng lên mép banner (bọc bằng DrawerMedia) */
  media?: React.ReactNode;
  /** Nút icon nhỏ trên banner, bên trái nút đóng (IconAction) */
  actions?: React.ReactNode;
  onClose: () => void;
  /** Đầu gọn (chỉ tiêu đề + nút đóng), không banner */
  compact?: boolean;
}

/** Đầu drawer: banner gradient + nút đóng, hoặc dạng gọn */
export function DrawerHeader({ title, description, media, actions, onClose, compact }: DrawerHeaderProps) {
  const close = (
    <button type="button" onClick={onClose} aria-label="Đóng" className={cn(ROUND_BTN, 'text-slate-600')}>
      <X size={18} />
    </button>
  );

  if (compact) {
    return (
      <header className="flex flex-none items-center gap-1 border-b border-slate-200 px-4 py-2">
        <h2 className="min-w-0 flex-1 truncate font-heading text-base font-semibold text-slate-900">{title}</h2>
        {actions}
        {close}
      </header>
    );
  }
  return (
    <header className="flex-none">
      <div className="relative mx-2 mt-2 h-20 rounded-control bg-linear-to-br from-primary/35 via-primary/15 to-primary/5 md:h-24">
        <div className="absolute right-2 top-2 flex items-center gap-1">
          {actions}
          {close}
        </div>
      </div>
      <div className={cn('px-4 pb-4', media ? '-mt-9' : 'pt-4')}>
        {media && <div className="mb-2">{media}</div>}
        <h2 className="truncate font-heading text-xl font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-slate-500 [overflow-wrap:anywhere]">{description}</p>}
      </div>
    </header>
  );
}

/** Thân drawer: phần duy nhất tự cuộn; Drawer dùng nó để đo chiều cao nội dung */
export function DrawerBody({ children }: { children: React.ReactNode }) {
  return (
    <div data-drawer-body className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
      <div>{children}</div>
    </div>
  );
}

export function DrawerFooter({ children }: { children: React.ReactNode }) {
  return <footer className="flex-none border-t border-slate-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{children}</footer>;
}

/** Nút "Thêm" ở đầu section: chữ xanh từ 768px, điện thoại chỉ icon */
export function SectionAdd({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-11 cursor-pointer items-center justify-center gap-1 rounded-control text-sm font-medium text-primary transition active:scale-95 active:bg-primary/10 md:size-auto md:px-2 md:py-1 md:hover:bg-primary/10"
    >
      <Plus size={18} />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
