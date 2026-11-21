'use client';

import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Download, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge, type Tone } from '../../_components/badge';
import { BTN_LINE, BTN_PRIMARY, INPUT, messageOf } from '../../_components/form';
import { Select } from '../../_components/select';
import { cn } from '@/utils/cn';

export type Rec = Record<string, unknown>;
export type Action = 'CREATE' | 'UPDATE' | 'ERROR';
export interface XRow {
  rowIndex: number;
  action: Action;
  existingId: number | null;
  data: Rec;
  errors: string[];
  warnings: string[];
}
export interface Col {
  key: string;
  label: string;
  kind: 'text' | 'number' | 'bool' | 'select';
  options?: (d: Rec) => { value: string; label: string }[];
  /** đổi cột này thì cập nhật thêm các cột phụ thuộc (ví dụ đổi hãng thì chọn lại hệ nhôm) */
  onChange?: (patch: Rec, d: Rec) => Rec;
}
export interface Dataset {
  id: string;
  label: string;
  columns: Col[];
  blank: () => Rec;
  check: (d: Rec) => { errors: string[]; existingId: number | null };
}
export type Rows = Record<string, XRow[]>;

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  datasets: Dataset[];
  preview: (file: File) => Promise<Rows>;
  template: () => Promise<void>;
  save: (rows: Rows) => Promise<{ createdCount: number; updatedCount: number }>;
  invalidate: string[];
}

const TONE: Record<Action, Tone> = { CREATE: 'success', UPDATE: 'primary', ERROR: 'danger' };
const LABEL: Record<Action, string> = { CREATE: 'Thêm mới', UPDATE: 'Cập nhật', ERROR: 'Lỗi' };
const FILTERS: [Action | 'ALL', string][] = [
  ['ALL', 'Tất cả'],
  ['CREATE', 'Thêm mới'],
  ['UPDATE', 'Cập nhật'],
  ['ERROR', 'Lỗi'],
];

// Nhập Excel hàng loạt: tải file, hệ thống phân loại thêm mới / cập nhật / lỗi, sửa trực tiếp trong bảng rồi lưu các dòng hợp lệ.
export function ExcelImport({ open, onClose, title, datasets, preview, template, save, invalidate }: Props) {
  const qc = useQueryClient();
  const file = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Rows>({});
  const [name, setName] = useState('');
  const [set, setSet] = useState(datasets[0].id);
  const [filter, setFilter] = useState<Action | 'ALL'>('ALL');
  const ds = datasets.find((d) => d.id === set) ?? datasets[0];

  const read = useMutation({
    mutationFn: preview,
    onSuccess: (raw) => {
      // kiểm lại từng dòng bằng danh mục hiện có (hãng, nhóm… do backend không map được sẽ báo lỗi ngay)
      const r: Rows = {};
      datasets.forEach((d) => {
        r[d.id] = (raw[d.id] ?? []).map((x) => recheck(d, x.data, x));
      });
      setRows(r);
      setFilter('ALL');
      const first = datasets.find((d) => (r[d.id]?.length ?? 0) > 0);
      if (first) setSet(first.id);
      toast.success(`Đã đọc ${Object.values(r).reduce((s, x) => s + x.length, 0)} dòng từ file Excel`);
    },
    onError: (e) => toast.error(messageOf(e)),
  });
  const commit = useMutation({
    mutationFn: () => save(rows),
    onSuccess: (r) => {
      toast.success(`Thêm mới ${r.createdCount}, cập nhật ${r.updatedCount}`);
      invalidate.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      reset();
      onClose();
    },
    onError: (e) => toast.error(messageOf(e)),
  });
  const tpl = useMutation({ mutationFn: template, onError: (e) => toast.error(messageOf(e)) });

  const reset = () => {
    setRows({});
    setName('');
    setFilter('ALL');
  };
  const all = useMemo(() => Object.values(rows).flat(), [rows]);
  const count = (a: Action) => all.filter((r) => r.action === a).length;
  const valid = count('CREATE') + count('UPDATE');
  const shown = (rows[ds.id] ?? []).filter((r) => filter === 'ALL' || r.action === filter);

  const recheck = (d: Dataset, data: Rec, prev: XRow): XRow => {
    const { errors, existingId } = d.check(data);
    return { ...prev, data, errors, existingId, action: errors.length ? 'ERROR' : existingId ? 'UPDATE' : 'CREATE' };
  };
  const edit = (idx: number, patch: Rec, col: Col) =>
    setRows((p) => ({
      ...p,
      [ds.id]: p[ds.id].map((r) =>
        r.rowIndex === idx ? recheck(ds, { ...r.data, ...patch, ...(col.onChange?.(patch, { ...r.data, ...patch }) ?? {}) }, r) : r,
      ),
    }));
  const add = () => {
    const list = rows[ds.id] ?? [];
    const idx = list.length ? Math.max(...list.map((r) => r.rowIndex)) + 1 : 2;
    const blank: XRow = { rowIndex: idx, action: 'ERROR', existingId: null, data: ds.blank(), errors: [], warnings: [] };
    setRows((p) => ({ ...p, [ds.id]: [...list, recheck(ds, blank.data, blank)] }));
  };
  const remove = (idx: number) => setRows((p) => ({ ...p, [ds.id]: p[ds.id].filter((r) => r.rowIndex !== idx) }));
  const close = () => {
    reset();
    onClose();
  };

  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex flex-col bg-rm-bg font-body text-rm-text">
      <header className="flex h-14 flex-none items-center gap-1 border-b border-rm-line bg-rm-surface px-1">
        <button
          type="button"
          onClick={close}
          aria-label="Đóng"
          className="flex size-11 flex-none items-center justify-center rounded-full text-rm-muted active:bg-rm-line"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="min-w-0 flex-1 truncate px-1 text-sm font-medium">{title}</h1>
      </header>

      <div className="flex flex-none flex-wrap items-center gap-2 border-b border-rm-line bg-rm-surface p-2">
        <input
          ref={file}
          type="file"
          accept=".xlsx"
          className="sr-only"
          aria-label="Chọn file Excel"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setName(f.name);
              read.mutate(f);
            }
            e.target.value = '';
          }}
        />
        <button type="button" disabled={read.isPending} onClick={() => file.current?.click()} className={`${BTN_PRIMARY} px-4`}>
          <Upload size={16} aria-hidden="true" />
          {read.isPending ? 'Đang đọc…' : name ? 'Chọn file khác' : 'Tải file .xlsx'}
        </button>
        <button type="button" disabled={tpl.isPending} onClick={() => tpl.mutate()} className={`${BTN_LINE} px-4`}>
          <Download size={16} aria-hidden="true" />
          File mẫu
        </button>
        <button type="button" onClick={add} className={`${BTN_LINE} px-4`}>
          <Plus size={16} aria-hidden="true" />
          Thêm dòng
        </button>
        {name && <span className="min-w-0 max-w-full truncate text-xs text-rm-muted">{name}</span>}
      </div>

      {datasets.length > 1 && (
        <div role="tablist" className="flex flex-none gap-1 border-b border-rm-line bg-rm-surface px-2">
          {datasets.map((d) => (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={set === d.id}
              onClick={() => setSet(d.id)}
              className={cn(
                'h-rm-tap flex-none border-b-2 px-3 text-sm font-medium',
                set === d.id ? 'border-rm-primary text-rm-primary' : 'border-transparent text-rm-muted',
              )}
            >
              {d.label} ({rows[d.id]?.length ?? 0})
            </button>
          ))}
        </div>
      )}

      {all.length > 0 && (
        <div role="group" aria-label="Lọc dòng" className="flex flex-none gap-1.5 overflow-x-auto px-2 py-2">
          {FILTERS.map(([v, l]) => (
            <button
              key={v}
              type="button"
              aria-pressed={filter === v}
              onClick={() => setFilter(v)}
              className={cn(
                'h-9 flex-none rounded-rm border px-3 text-sm',
                filter === v ? 'border-rm-primary bg-rm-primary-soft text-rm-primary' : 'border-rm-line bg-rm-surface',
              )}
            >
              {l} ({v === 'ALL' ? all.length : count(v)})
            </button>
          ))}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto">
        {all.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="text-sm font-medium">Chưa có dữ liệu</p>
            <p className="max-w-md text-sm text-rm-muted">
              Tải file mẫu, điền dữ liệu rồi tải lên. Hệ thống tự phân loại thêm mới, cập nhật hoặc lỗi và cho sửa trực tiếp trong bảng.
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse bg-rm-surface text-sm">
            <thead>
              <tr>
                {['#', 'Trạng thái', ...ds.columns.map((c) => c.label), ''].map((h, i) => (
                  <th
                    key={`${h}-${i}`}
                    scope="col"
                    className="sticky top-0 z-10 whitespace-nowrap border-b border-r border-rm-edge bg-rm-bg px-2 py-1.5 text-left text-xs font-semibold text-rm-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr>
                  <td colSpan={ds.columns.length + 3} className="py-10 text-center text-rm-muted">
                    Không có dòng nào.
                  </td>
                </tr>
              )}
              {shown.map((r) => (
                <tr key={r.rowIndex} className="border-b border-rm-line align-top">
                  <td className="px-2 py-1.5 text-xs text-rm-muted">{r.rowIndex}</td>
                  <td className="min-w-32 px-2 py-1.5">
                    <Badge tone={TONE[r.action]}>{LABEL[r.action]}</Badge>
                    {r.errors.map((e) => (
                      <p key={e} className="mt-1 text-xs text-rm-danger">
                        {e}
                      </p>
                    ))}
                    {r.warnings.map((w) => (
                      <p key={w} className="mt-1 text-xs text-rm-warning">
                        {w}
                      </p>
                    ))}
                  </td>
                  {ds.columns.map((c) => (
                    <td key={c.key} className="min-w-36 px-1.5 py-1">
                      <Cell col={c} row={r} onChange={(p) => edit(r.rowIndex, p, c)} />
                    </td>
                  ))}
                  <td className="px-1 py-1">
                    <button
                      type="button"
                      aria-label={`Xoá dòng ${r.rowIndex}`}
                      onClick={() => remove(r.rowIndex)}
                      className="flex size-10 items-center justify-center text-rm-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <footer className="flex flex-none flex-wrap items-center gap-2 border-t border-rm-line bg-rm-surface p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <p className="min-w-0 flex-1 text-xs text-rm-muted">
          {count('CREATE')} thêm mới · {count('UPDATE')} cập nhật
          {count('ERROR') > 0 && <span className="text-rm-danger"> · {count('ERROR')} lỗi sẽ bị bỏ qua</span>}
        </p>
        <button type="button" disabled={commit.isPending || valid === 0} onClick={() => commit.mutate()} className={`${BTN_PRIMARY} px-5`}>
          {commit.isPending ? 'Đang lưu…' : `Lưu ${valid} dòng`}
        </button>
      </footer>
    </div>,
    document.body,
  );
}

function Cell({ col, row, onChange }: { col: Col; row: XRow; onChange: (p: Rec) => void }) {
  const v = row.data[col.key];
  const id = `x-${row.rowIndex}-${col.key}`;
  if (col.kind === 'bool')
    return (
      <Select
        id={id}
        label={col.label}
        value={v === false ? '0' : '1'}
        onChange={(x) => onChange({ [col.key]: x === '1' })}
        options={[
          { value: '1', label: 'Hoạt động' },
          { value: '0', label: 'Ngừng' },
        ]}
      />
    );
  if (col.kind === 'select')
    return (
      <Select
        id={id}
        label={col.label}
        value={v == null ? '' : String(v)}
        onChange={(x) =>
          onChange({ [col.key]: x === '' ? null : /^\d+$/.test(x) && col.options?.(row.data).every((o) => /^\d+$/.test(o.value)) ? Number(x) : x })
        }
        options={col.options?.(row.data) ?? []}
      />
    );
  return (
    <input
      id={id}
      aria-label={col.label}
      type={col.kind === 'number' ? 'number' : 'text'}
      inputMode={col.kind === 'number' ? 'decimal' : undefined}
      value={v == null ? '' : String(v)}
      onChange={(e) => onChange({ [col.key]: col.kind === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value })}
      className={INPUT}
    />
  );
}
