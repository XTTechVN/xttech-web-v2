'use client';

import { useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCan } from '@/hooks';
import { DataList, type Column } from '../../_components/data-list';
import { BTN_DANGER, BTN_LINE, BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { Select } from '../../_components/select';
import { Sheet } from '../../_components/sheet';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';

export interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  required?: boolean;
  half?: boolean;
}

export type Form = Record<string, string>;

export interface EntityConfig<T extends { id: number }> {
  queryKey: string;
  noun: string;
  load: () => Promise<T[]>;
  title: (x: T) => string;
  sub: (x: T) => string;
  /** Cột riêng cho bảng từ 768px; không có thì gộp vào một cột "Chi tiết" */
  cols?: Column<T>[];
  badge?: (x: T) => ReactNode;
  inactive?: (x: T) => boolean;
  fields: FieldDef[];
  toForm: (x: T | null) => Form;
  save: (form: Form, x: T | null) => Promise<unknown>;
  remove?: (x: T) => Promise<unknown>;
  extra?: (x: T, form: Form, close: () => void) => ReactNode;
}

// Danh sách + sheet thêm/sửa/xoá dùng chung cho các tab danh mục (cùng cấu trúc, chỉ khác trường).
export function EntityTab<T extends { id: number }>({
  cfg,
  filter,
  onImport,
  compact,
}: {
  cfg: EntityConfig<T>;
  filter?: ReactNode;
  onImport?: () => void;
  /** Đặt trong sheet hẹp: luôn hiện thẻ thay vì bảng */
  compact?: boolean;
}) {
  const { can } = useCan();
  const [target, onTarget] = useState<T | 'new' | null>(null);
  const [q, setQ] = useState('');
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: [cfg.queryKey, 'list'], queryFn: cfg.load });
  const needle = q.trim().toLowerCase();
  const items = (data ?? []).filter((x) => !needle || `${cfg.title(x)} ${cfg.sub(x)}`.toLowerCase().includes(needle));

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label={`Tìm ${cfg.noun}`}
            placeholder={`Tìm ${cfg.noun}`}
            className={`${INPUT} pl-9`}
          />
        </div>
        {filter}
        {onImport && can('catalog:create') && (
          <button type="button" onClick={onImport} aria-label="Nhập Excel" className={`${BTN_LINE} w-rm-tap px-0 md:w-auto md:px-4`}>
            <Upload size={18} aria-hidden="true" />
            <span className="hidden md:inline">Nhập Excel</span>
          </button>
        )}
        {can('catalog:create') && (
          <button
            type="button"
            onClick={() => onTarget('new')}
            aria-label={`Thêm ${cfg.noun}`}
            className={`${BTN_PRIMARY} w-rm-tap px-0 md:w-auto md:px-4`}
          >
            <Plus size={18} aria-hidden="true" />
            <span className="hidden md:inline">Thêm {cfg.noun}</span>
          </button>
        )}
      </div>
      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState
          title={`Không tải được ${cfg.noun}`}
          description="Kiểm tra kết nối rồi thử lại."
          actionLabel="Thử lại"
          onAction={() => refetch()}
        />
      )}
      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          title={needle ? 'Không có kết quả' : `Chưa có ${cfg.noun}`}
          description={needle ? 'Thử từ khoá khác.' : `Thêm ${cfg.noun} đầu tiên.`}
        />
      )}
      {items.length > 0 && (
        <p className="mb-2 text-sm text-rm-muted">
          {needle ? `${items.length}/${data?.length ?? 0}` : items.length} {cfg.noun}
        </p>
      )}
      {items.length > 0 && (
        <DataList
          label={`Danh sách ${cfg.noun}`}
          compact={compact}
          rows={items.slice(0, 100)}
          rowKey={(x) => x.id}
          onOpen={onTarget}
          columns={[
            {
              key: 'title',
              header: 'Tên',
              cell: (x) => (
                <span className="block min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="min-w-0 truncate font-medium">{cfg.title(x)}</span>
                    {cfg.inactive?.(x) && <span className="flex-none text-xs text-rm-muted">Ngừng</span>}
                  </span>
                  {cfg.badge && <span className="mt-1 flex xl:hidden">{cfg.badge(x)}</span>}
                </span>
              ),
            },
            ...(cfg.badge ? [{ key: 'badge', header: 'Phân loại', wideOnly: true, fit: true, cell: (x: T) => cfg.badge?.(x) }] : []),
            ...(cfg.cols ?? [{ key: 'sub', header: 'Chi tiết', cell: (x: T) => cfg.sub(x) }]),
          ]}
          card={(x) => (
            <>
              <span className="flex items-center gap-2">
                <span className="min-w-0 truncate text-sm font-medium">{cfg.title(x)}</span>
                {cfg.badge?.(x)}
                {cfg.inactive?.(x) && <span className="flex-none text-xs text-rm-muted">Ngừng</span>}
              </span>
              <span className="block truncate text-xs text-rm-muted">{cfg.sub(x)}</span>
            </>
          )}
        />
      )}
      {items.length > 100 && <p className="mt-2 text-center text-xs text-rm-muted">Hiện 100/{items.length} — dùng ô tìm để thu hẹp.</p>}
      <EntitySheet
        key={`${cfg.queryKey}-${target === 'new' ? 'new' : (target?.id ?? 'none')}`}
        cfg={cfg}
        target={target}
        onClose={() => onTarget(null)}
      />
    </>
  );
}

function EntitySheet<T extends { id: number }>({ cfg, target, onClose }: { cfg: EntityConfig<T>; target: T | 'new' | null; onClose: () => void }) {
  const { can } = useCan();
  const qc = useQueryClient();
  const x = target && target !== 'new' ? target : null;
  const [form, setForm] = useState<Form>(() => cfg.toForm(x));
  const editable = x ? can('catalog:update') : can('catalog:create');
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: [cfg.queryKey] });
    onClose();
  };
  const save = useMutation({
    mutationFn: () => cfg.save(form, x),
    onSuccess: () => done(x ? 'Đã lưu' : 'Đã thêm'),
    onError: (e) => toast.error(messageOf(e)),
  });
  const remove = useMutation({ mutationFn: () => cfg.remove!(x!), onSuccess: () => done('Đã xoá'), onError: (e) => toast.error(messageOf(e)) });
  const missing = cfg.fields.some((f) => f.required && !form[f.key]?.trim());

  const render = (f: FieldDef) => (
    <Field key={f.key} label={f.label} id={`en-${f.key}`}>
      {f.type === 'select' ? (
        <Select
          id={`en-${f.key}`}
          label={f.label}
          value={form[f.key] ?? ''}
          onChange={(v) => set(f.key, v)}
          options={f.options ?? []}
          disabled={!editable}
        />
      ) : (
        <input
          id={`en-${f.key}`}
          value={form[f.key] ?? ''}
          onChange={(e) => set(f.key, e.target.value)}
          disabled={!editable}
          inputMode={f.type === 'number' ? 'decimal' : undefined}
          className={INPUT}
        />
      )}
    </Field>
  );

  // Ô "half" đứng cạnh nhau thành hàng 2 cột
  const rows: FieldDef[][] = [];
  cfg.fields.forEach((f) => {
    const last = rows[rows.length - 1];
    if (f.half && last && last.length === 1 && last[0].half) last.push(f);
    else rows.push([f]);
  });

  return (
    <Sheet open={!!target} onClose={onClose} title={x ? cfg.title(x) : `Thêm ${cfg.noun}`}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        {rows.map((r) =>
          r.length === 2 ? (
            <div key={r[0].key} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
              {r.map(render)}
            </div>
          ) : (
            render(r[0])
          ),
        )}
        {x && cfg.extra?.(x, form, onClose)}
        {editable && (
          <button type="submit" disabled={save.isPending || missing} className={BTN_PRIMARY}>
            {save.isPending ? 'Đang lưu…' : 'Lưu'}
          </button>
        )}
      </form>
      {x && cfg.remove && can('catalog:delete') && (
        <div className="border-t border-rm-line p-rm-gutter">
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => window.confirm(`Xoá ${cfg.noun} "${cfg.title(x)}"? Không thể hoàn tác.`) && remove.mutate()}
            className={`${BTN_DANGER} w-full`}
          >
            Xoá {cfg.noun}
          </button>
        </div>
      )}
    </Sheet>
  );
}
