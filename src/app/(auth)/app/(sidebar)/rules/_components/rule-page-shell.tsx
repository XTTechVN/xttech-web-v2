import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeading } from '@/components-remake';

// Khung trang soạn / sửa văn bản: dòng quay lại + tiêu đề
export function RulePageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl p-4 font-body md:p-6">
      <Link href="/app/rules" className="mb-3 inline-flex min-h-11 items-center gap-1.5 text-sm text-slate-600 md:hover:text-slate-900">
        <ArrowLeft size={16} aria-hidden="true" /> Văn bản ban hành
      </Link>
      <PageHeading title={title} />
      {subtitle && <p className="-mt-2 mb-4 text-sm text-slate-600 [overflow-wrap:anywhere]">{subtitle}</p>}
      {children}
    </div>
  );
}
