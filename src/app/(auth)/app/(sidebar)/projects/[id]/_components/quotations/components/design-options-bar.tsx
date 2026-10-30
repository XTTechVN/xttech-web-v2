'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { cancelDesignOption, createDesignOption, getDesignOptions, getProjectPositions } from '@/actions';
import { Button, Input, Modal, Select } from '@/components';
import { usePermission } from '@/hooks/user-permission';
import { showErrorToast } from '@/utils';
import type { DesignOption, DesignOptionCreatePayload } from '@/types';
import { invalidateQuotationQueries } from '../../hooks/use-active-quotation';

interface DesignOptionsBarProps {
  projectId: number;
  /** null = báo giá theo cửa chính thức */
  selectedId: number | null;
  onSelect: (optionId: number | null) => void;
}

/**
 * Phương án thiết kế chào khách song song (vd: hệ Xingfa / hệ Việt Pháp), mỗi phương án một bộ cửa
 * và một báo giá. Khách đồng ý báo giá của phương án nào thì cửa của phương án đó thành cửa chính thức.
 */
export function DesignOptionsBar({ projectId, selectedId, onSelect }: DesignOptionsBarProps) {
  const { isAdmin, hasRole } = usePermission();
  const canSell = isAdmin || hasRole('sale');
  const [isCreating, setIsCreating] = useState(false);

  const { data: options = [] } = useQuery<DesignOption[]>({
    queryKey: ['design_options', projectId],
    queryFn: () => getDesignOptions(projectId),
    enabled: !!projectId,
  });
  const openOptions = options.filter((option) => option.status === 'open');

  const cancel = useMutation({
    mutationFn: (optionId: number) => cancelDesignOption(projectId, optionId),
    onSuccess: () => {
      invalidateQuotationQueries(projectId);
      onSelect(null);
      toast.success('Đã bỏ phương án');
    },
    onError: (err) => showErrorToast(err, 'Không bỏ được phương án'),
  });

  if (!openOptions.length && !canSell) return null;

  const chip = (id: number | null, label: string, hint?: string) => (
    <button
      key={id ?? 'official'}
      type="button"
      onClick={() => onSelect(id)}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
        selectedId === id
          ? 'border-primary bg-primary text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40'
      }`}
    >
      {label}
      {hint && <span className="ml-1 font-normal opacity-80">{hint}</span>}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Layers size={15} className="text-slate-400" />
      {chip(null, 'Cửa chính thức')}
      {openOptions.map((option) => chip(option.id, `${option.code} · ${option.name}`, `(${option.positionCount} cửa)`))}
      {canSell && (
        <Button size="xs" variant="ghost" leftIcon={<Plus size={13} />} onClick={() => setIsCreating(true)}>
          Thêm phương án
        </Button>
      )}
      {canSell && selectedId !== null && (
        <Button
          size="xs"
          variant="ghost"
          leftIcon={<Trash2 size={13} />}
          loading={cancel.isPending}
          onClick={() => cancel.mutate(selectedId)}
        >
          Bỏ phương án này
        </Button>
      )}

      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Thêm phương án thiết kế" className="max-w-lg w-full">
        {isCreating && (
          <CreateOptionForm
            projectId={projectId}
            openOptions={openOptions}
            onClose={() => setIsCreating(false)}
            onCreated={(option) => {
              setIsCreating(false);
              onSelect(option.id);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function CreateOptionForm({
  projectId,
  openOptions,
  onClose,
  onCreated,
}: {
  projectId: number;
  openOptions: DesignOption[];
  onClose: () => void;
  onCreated: (option: DesignOption) => void;
}) {
  const [name, setName] = useState('');
  const [copyFromId, setCopyFromId] = useState<number | null>(openOptions[0]?.id ?? null);
  const [movedIds, setMovedIds] = useState<number[]>([]);

  // Cửa chính thức còn đang thiết kế và chưa nằm trong hợp đồng mới chuyển được vào phương án
  const { data: movable = [] } = useQuery({
    queryKey: ['project_positions', projectId, 'movable'],
    queryFn: () => getProjectPositions(projectId, { status: 'draft', limit: 500 }),
    select: (res) => res.items.filter((p) => !p.designOptionId && !p.isContracted),
  });

  const create = useMutation({
    mutationFn: (payload: DesignOptionCreatePayload) => createDesignOption(projectId, payload),
    onSuccess: (option) => {
      invalidateQuotationQueries(projectId);
      toast.success(`Đã tạo ${option.code} với ${option.positionCount} cửa`);
      onCreated(option);
    },
    onError: (err) => showErrorToast(err, 'Không tạo được phương án'),
  });

  const toggle = (id: number) =>
    setMovedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  return (
    <div className="space-y-4">
      <Input
        label="Tên phương án"
        placeholder="VD: Hệ Xingfa, Hệ Việt Pháp"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
      />
      {openOptions.length > 0 ? (
        <Select
          label="Nhân bản cửa từ phương án"
          value={copyFromId ?? ''}
          onChange={(e) => setCopyFromId(e.target.value ? Number(e.target.value) : null)}
          options={[
            { label: 'Không nhân bản (thêm cửa sau ở tab Vị trí cửa)', value: '' },
            ...openOptions.map((o) => ({ label: `${o.code} · ${o.name}`, value: o.id })),
          ]}
          fullWidth
        />
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">
            Chuyển cửa đang thiết kế vào phương án ({movedIds.length}/{movable.length})
          </p>
          <div className="max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 text-xs">
            {movable.map((p) => (
              <label key={p.id} className="flex cursor-pointer items-center gap-2 px-3 py-1.5">
                <input type="checkbox" checked={movedIds.includes(p.id)} onChange={() => toggle(p.id)} />
                <span className="font-semibold text-slate-800">{p.code}</span>
                <span className="text-slate-500">
                  {p.width} × {p.height} mm
                </span>
              </label>
            ))}
            {!movable.length && <p className="px-3 py-3 text-slate-400">Không còn cửa đang thiết kế để chuyển.</p>}
          </div>
          <p className="text-[11px] text-slate-500">
            Sau khi tạo, dùng &quot;Thêm phương án&quot; lần nữa để nhân bản sang phương án khác và đổi hệ nhôm.
          </p>
        </div>
      )}
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
        <Button
          size="sm"
          disabled={!name.trim() || create.isPending}
          loading={create.isPending}
          onClick={() =>
            create.mutate({
              name: name.trim(),
              movePositionIds: openOptions.length ? undefined : movedIds,
              copyFromOptionId: openOptions.length ? (copyFromId ?? undefined) : undefined,
            })
          }
        >
          Tạo phương án
        </Button>
      </div>
    </div>
  );
}
