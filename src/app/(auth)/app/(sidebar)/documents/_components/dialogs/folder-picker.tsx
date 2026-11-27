'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronRight, Folder, FolderPlus, HardDrive } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createDocumentCategory, getDocumentCategoryTree } from '@/actions';
import type { DocumentCategory } from '@/types';
import { DOC_QUERY_KEYS } from '@/utils';
import { cn } from '@/utils/cn';
import { INPUT, messageOf } from '../form';

interface Props {
  value: number | null;
  onChange: (id: number | null) => void;
  /** chỉ thư mục của tôi (bỏ thư mục được chia sẻ) */
  mineOnly?: boolean;
  /** thư mục không được chọn làm đích (chính nó và con cháu khi di chuyển) */
  disabledIds?: Set<number>;
}

const prune = (nodes: DocumentCategory[]): DocumentCategory[] =>
  nodes.filter((n) => n.isOwner !== false && !n.isShared).map((n) => ({ ...n, children: n.children ? prune(n.children) : [] }));

// Cây thư mục để chọn nơi đến: thu gọn/mở rộng, có dòng "Thư mục gốc" và tạo nhanh thư mục con tại vị trí đang chọn.
export function FolderPicker({ value, onChange, mineOnly, disabledIds }: Props) {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: DOC_QUERY_KEYS.categories.tree, queryFn: getDocumentCategoryTree });
  const tree = mineOnly ? prune(data) : data;
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [name, setName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = (id: number) =>
    setOpen((s) => {
      const n = new Set(s);
      if (!n.delete(id)) n.add(id);
      return n;
    });

  const create = async () => {
    if (!name?.trim()) return;
    setBusy(true);
    try {
      const c = await createDocumentCategory({ name: name.trim(), parentId: value });
      await qc.invalidateQueries({ queryKey: DOC_QUERY_KEYS.categories.tree });
      if (value) setOpen((s) => new Set(s).add(value));
      onChange(c.id);
      setName(null);
      toast.success(`Đã tạo thư mục "${c.name}"`);
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
    }
  };

  const row = (n: DocumentCategory, depth: number): React.ReactNode => {
    const kids = n.children ?? [];
    const off = disabledIds?.has(n.id);
    return (
      <li key={n.id}>
        <div className="flex items-center" style={{ paddingLeft: `${depth * 16}px` }}>
          <button
            type="button"
            aria-label={open.has(n.id) ? 'Thu gọn' : 'Mở rộng'}
            aria-expanded={open.has(n.id)}
            disabled={kids.length === 0}
            onClick={() => toggle(n.id)}
            className="flex size-11 flex-none items-center justify-center text-slate-500 disabled:opacity-30"
          >
            <ChevronRight
              size={16}
              className={cn('transition-transform duration-200', open.has(n.id) && 'rotate-90')}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={value === n.id}
            disabled={off}
            onClick={() => onChange(n.id)}
            className={cn(
              'flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-control px-2 text-left text-sm disabled:opacity-40',
              value === n.id ? 'bg-primary/10 font-medium text-primary' : 'active:bg-slate-50',
            )}
          >
            <Folder size={18} className="flex-none" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{n.name}</span>
            {value === n.id && <Check size={16} className="flex-none" aria-hidden="true" />}
          </button>
        </div>
        {open.has(n.id) && kids.length > 0 && <ul>{kids.map((k) => row(k, depth + 1))}</ul>}
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div role="radiogroup" aria-label="Chọn thư mục đích" className="max-h-[40dvh] overflow-y-auto rounded-control border border-slate-200 py-1">
        <button
          type="button"
          role="radio"
          aria-checked={value === null}
          onClick={() => onChange(null)}
          className={cn(
            'flex min-h-11 w-full items-center gap-2 px-3 text-left text-sm',
            value === null ? 'bg-primary/10 font-medium text-primary' : 'active:bg-slate-50',
          )}
        >
          <HardDrive size={18} className="flex-none" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">Thư mục gốc (Tài liệu của tôi)</span>
          {value === null && <Check size={16} className="flex-none" aria-hidden="true" />}
        </button>
        {isLoading && <p className="px-3 py-3 text-sm text-slate-500">Đang tải thư mục…</p>}
        <ul>{tree.map((n) => row(n, 0))}</ul>
      </div>
      {name === null ? (
        <button
          type="button"
          onClick={() => setName('')}
          className="flex h-11 items-center gap-2 self-start px-1 text-sm font-medium text-primary"
        >
          <FolderPlus size={18} aria-hidden="true" />
          Thư mục mới tại vị trí đang chọn
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            aria-label="Tên thư mục mới"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), create())}
            placeholder="Tên thư mục mới"
            className={INPUT}
          />
          <button
            type="button"
            disabled={busy || !name.trim()}
            onClick={create}
            className="h-11 flex-none rounded-control bg-primary px-4 text-sm font-medium text-white disabled:opacity-60"
          >
            {busy ? '…' : 'Tạo'}
          </button>
          <button type="button" aria-label="Huỷ tạo thư mục" onClick={() => setName(null)} className="size-11 flex-none text-sm text-slate-500">
            Huỷ
          </button>
        </div>
      )}
    </div>
  );
}
