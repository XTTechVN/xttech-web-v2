'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cancelDesignOption, createDesignOption, getDesignOptions, getProjectPositions } from '@/actions';
import { useCan } from '@/hooks';
import type { DesignOption } from '@/types';
import { cn } from '@/utils/cn';
import { BTN_PRIMARY, Field, INPUT } from '../../../_components/form';
import { Select } from '../../../_components/select';
import { Sheet } from '../../../_components/sheet';
import { useAct } from './use-act';

interface Props {
  projectId: number;
  /** null = báo giá theo cửa chính thức */
  value: number | null;
  onChange: (id: number | null) => void;
}

// Phương án thiết kế chào khách song song (vd hệ Xingfa / Việt Pháp): mỗi phương án một bộ cửa và một báo giá.
export function QuoteOptions({ projectId, value, onChange }: Props) {
  const { can } = useCan();
  const edit = can('quotation:create');
  const [adding, setAdding] = useState(false);
  const options = useQuery({ queryKey: ['design_options', projectId], queryFn: () => getDesignOptions(projectId) });
  const open = (options.data ?? []).filter((o) => o.status === 'open');
  const cancel = useAct(
    projectId,
    (id: number) => cancelDesignOption(projectId, id),
    'Đã bỏ phương án',
    () => onChange(null),
  );
  if (!open.length && !edit) return null;

  const chip = (id: number | null, label: string) => (
    <button
      key={id ?? 'official'}
      type="button"
      aria-pressed={value === id}
      onClick={() => onChange(id)}
      className={cn(
        'h-9 flex-none rounded-rm border px-3 text-sm',
        value === id ? 'border-rm-primary bg-rm-primary-soft text-rm-primary' : 'border-rm-line',
      )}
    >
      {label}
    </button>
  );
  return (
    <div className="mb-3 flex items-center gap-2">
      <div role="group" aria-label="Phương án thiết kế" className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-1">
        {chip(null, 'Cửa chính thức')}
        {open.map((o) => chip(o.id, `${o.code} · ${o.name} (${o.positionCount})`))}
      </div>
      {edit && (
        <button type="button" onClick={() => setAdding(true)} className="h-9 flex-none px-2 text-sm font-medium text-rm-primary">
          + Phương án
        </button>
      )}
      {edit && value !== null && (
        <button
          type="button"
          disabled={cancel.isPending}
          onClick={() => window.confirm('Bỏ phương án này?') && cancel.mutate(value)}
          className="h-9 flex-none px-2 text-sm text-rm-danger"
        >
          Bỏ
        </button>
      )}
      <OptionSheet
        key={adding ? 'o-new' : 'o-idle'}
        projectId={projectId}
        open={adding}
        open_={open}
        onClose={() => setAdding(false)}
        onCreated={(o) => onChange(o.id)}
      />
    </div>
  );
}

function OptionSheet({
  projectId,
  open,
  open_,
  onClose,
  onCreated,
}: {
  projectId: number;
  open: boolean;
  open_: DesignOption[];
  onClose: () => void;
  onCreated: (o: DesignOption) => void;
}) {
  const [name, setName] = useState('');
  const [copy, setCopy] = useState(open_[0] ? String(open_[0].id) : '');
  const [moved, setMoved] = useState<number[]>([]);
  const movable = useQuery({
    queryKey: ['project', projectId, 'positions', 'movable'],
    queryFn: () => getProjectPositions(projectId, { status: 'draft', limit: 500 }),
    select: (r) => r.items.filter((p) => !p.designOptionId && !p.isContracted),
    enabled: open && open_.length === 0,
  });
  const create = useAct(
    projectId,
    async () => {
      const o = await createDesignOption(projectId, {
        name: name.trim(),
        movePositionIds: open_.length ? undefined : moved,
        copyFromOptionId: open_.length && copy ? Number(copy) : undefined,
      });
      onCreated(o);
      return o;
    },
    'Đã tạo phương án',
    onClose,
  );
  return (
    <Sheet open={open} onClose={onClose} title="Thêm phương án thiết kế">
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <Field label="Tên phương án" id="qo-name">
          <input id="qo-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Hệ Xingfa" className={INPUT} />
        </Field>
        {open_.length > 0 ? (
          <Field label="Nhân bản cửa từ phương án" id="qo-copy">
            <Select
              id="qo-copy"
              label="Nhân bản từ"
              value={copy}
              onChange={setCopy}
              options={[{ value: '', label: 'Không nhân bản' }, ...open_.map((o) => ({ value: String(o.id), label: `${o.code} · ${o.name}` }))]}
            />
          </Field>
        ) : (
          <fieldset>
            <legend className="mb-1 text-sm font-medium">
              Chuyển cửa đang thiết kế vào phương án ({moved.length}/{movable.data?.length ?? 0})
            </legend>
            <ul className="max-h-60 divide-y divide-rm-line overflow-y-auto rounded-rm border border-rm-line">
              {(movable.data ?? []).map((p) => (
                <li key={p.id}>
                  <label className="flex min-h-rm-tap cursor-pointer items-center gap-3 px-3 text-sm">
                    <input
                      type="checkbox"
                      checked={moved.includes(p.id)}
                      onChange={() => setMoved(moved.includes(p.id) ? moved.filter((x) => x !== p.id) : [...moved, p.id])}
                    />
                    <span className="min-w-0 flex-1 truncate">{p.code}</span>
                    <span className="text-xs text-rm-muted">
                      {p.width} × {p.height}
                    </span>
                  </label>
                </li>
              ))}
              {!movable.isLoading && !movable.data?.length && (
                <li className="px-3 py-3 text-sm text-rm-muted">Không còn cửa đang thiết kế để chuyển.</li>
              )}
            </ul>
          </fieldset>
        )}
        <button type="submit" disabled={create.isPending || !name.trim()} className={BTN_PRIMARY}>
          {create.isPending ? 'Đang tạo…' : 'Tạo phương án'}
        </button>
      </form>
    </Sheet>
  );
}
