'use client';

import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createProfileSection, deleteProfileSection, getProfileBars, getProfileSections } from '@/actions';
import type { ProfileSection, ProfileSectionCreate } from '@/types';
import { useCan } from '@/hooks';
import { cn } from '@/utils/cn';
import { Badge } from '../../_components/badge';
import { BTN_LINE, INPUT, messageOf } from '../../_components/form';
import { Sheet } from '../../_components/sheet';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';

const CATS = [
  { value: '', label: 'Tất cả' },
  { value: 'frame', label: 'Khung bao' },
  { value: 'sash', label: 'Cánh cửa' },
  { value: 'mullion', label: 'Đố chia' },
  { value: 'bead', label: 'Nẹp kính' },
  { value: 'track', label: 'Ray trượt' },
  { value: 'other', label: 'Khác' },
];
const labelOf = (c: string) => CATS.find((x) => x.value === c)?.label ?? c;

function parseSvg(text: string, fileName: string, category: string): ProfileSectionCreate {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) throw new Error('Không tìm thấy thẻ <svg> hợp lệ trong file');
  const paths = [...doc.querySelectorAll('path')].map((p) => p.getAttribute('d')?.trim()).filter(Boolean) as string[];
  if (paths.length === 0) throw new Error('File SVG không có đường vẽ <path d="…">');
  const base = fileName.replace(/\.[^/.]+$/, '');
  return {
    code: `SEC_${base
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '_')
      .slice(0, 30)}`,
    name: base,
    category: category || 'frame',
    svgPathData: paths.join(' '),
    viewBox: svg.getAttribute('viewBox') || '0 0 100 100',
  };
}

// Thư viện mặt cắt SVG dùng cho thanh profile: tìm, lọc theo loại, tải file SVG lên (cần catalog:create), xoá (cần catalog:delete).
export function SectionLibrary({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { can } = useCan();
  const qc = useQueryClient();
  const file = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const sections = useQuery({
    queryKey: ['profile-sections', q, cat],
    queryFn: () => getProfileSections({ search: q.trim() || undefined, category: cat || undefined, limit: 500 }),
    enabled: open,
  });
  const bars = useQuery({
    queryKey: ['profile-bars', 'for-sections'],
    queryFn: async () => (await getProfileBars({ limit: 1000 })).items,
    enabled: open,
  });
  const usage = new Map<number, number>();
  (bars.data ?? []).forEach((b) => b.sectionLibraryId && usage.set(b.sectionLibraryId, (usage.get(b.sectionLibraryId) ?? 0) + 1));
  const refresh = () => qc.invalidateQueries({ queryKey: ['profile-sections'] });
  const upload = useMutation({
    mutationFn: createProfileSection,
    onSuccess: (s) => {
      toast.success(`Đã tải lên "${s.name}"`);
      refresh();
    },
    onError: (e) => toast.error(messageOf(e)),
  });
  const remove = useMutation({
    mutationFn: (s: ProfileSection) => deleteProfileSection(s.id),
    onSuccess: () => {
      toast.success('Đã xoá mặt cắt');
      refresh();
    },
    onError: (e) => toast.error(messageOf(e)),
  });
  const pick = (f?: File) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.svg')) return void toast.error('Chọn file định dạng .svg');
    f.text()
      .then((t) => upload.mutate(parseSvg(t, f.name, cat)))
      .catch((e: unknown) => toast.error(e instanceof Error ? e.message : 'Không đọc được file SVG'));
  };
  const list = sections.data ?? [];

  return (
    <Sheet open={open} onClose={onClose} title="Thư viện mặt cắt">
      <div className="flex flex-col gap-3 p-rm-gutter">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm mặt cắt" placeholder="Tìm theo tên" className={`${INPUT} pl-9`} />
          </div>
          {can('catalog:create') && (
            <>
              <input
                ref={file}
                type="file"
                accept=".svg"
                aria-label="Chọn file SVG"
                className="sr-only"
                onChange={(e) => {
                  pick(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                disabled={upload.isPending}
                onClick={() => file.current?.click()}
                aria-label="Tải file SVG"
                className={`${BTN_LINE} w-rm-tap flex-none px-0 md:w-auto md:px-4`}
              >
                <Upload size={18} aria-hidden="true" />
                <span className="hidden md:inline">{upload.isPending ? 'Đang tải…' : 'Tải SVG'}</span>
              </button>
            </>
          )}
        </div>
        <div role="group" aria-label="Loại mặt cắt" className="no-scrollbar -mx-rm-gutter flex gap-1.5 overflow-x-auto px-rm-gutter">
          {CATS.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-pressed={cat === c.value}
              onClick={() => setCat(c.value)}
              className={cn(
                'h-9 flex-none rounded-rm border px-3 text-sm',
                cat === c.value ? 'border-rm-primary bg-rm-primary-soft text-rm-primary' : 'border-rm-line',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        {sections.isLoading && <ListSkeleton />}
        {sections.isError && (
          <ErrorState title="Không tải được thư viện" description="Thử lại sau." actionLabel="Thử lại" onAction={() => sections.refetch()} />
        )}
        {sections.isSuccess && list.length === 0 && (
          <EmptyState
            title={q || cat ? 'Không có kết quả' : 'Chưa có mặt cắt'}
            description={can('catalog:create') ? 'Tải file SVG đầu tiên lên thư viện.' : 'Thư viện đang trống.'}
          />
        )}
        <ul className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
          {list.map((s) => (
            <li key={s.id} className="min-w-0 overflow-hidden rounded-rm-xl border border-rm-edge bg-rm-surface">
              <div className="flex h-28 items-center justify-center bg-rm-bg p-2">
                <svg
                  viewBox={s.viewBox || '0 0 100 100'}
                  role="img"
                  aria-label={s.name}
                  className="size-full fill-none stroke-current text-rm-text"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={s.svgPathData} />
                </svg>
              </div>
              <div className="px-2 pt-2">
                <p className="line-clamp-2 text-sm font-medium [overflow-wrap:anywhere]">{s.name}</p>
                <p className="truncate text-xs text-rm-muted">{s.code}</p>
              </div>
              <div className="flex items-center gap-1 px-2 pb-1 pt-1">
                <Badge tone="primary">{labelOf(s.category)}</Badge>
                <Badge tone="success">{usage.get(s.id) ?? 0} profile</Badge>
                {can('catalog:delete') && (
                  <button
                    type="button"
                    aria-label={`Xoá mặt cắt ${s.name}`}
                    disabled={remove.isPending}
                    onClick={() => window.confirm(`Xoá mặt cắt "${s.name}"? Không thể hoàn tác.`) && remove.mutate(s)}
                    className="ml-auto flex size-10 flex-none items-center justify-center text-rm-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Sheet>
  );
}
