'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createProject, deleteProject, getBrandColors, getBrands, getCustomers, getDoorSeriesList, updateProject } from '@/actions';
import { PROJECT_STATUS_OPTIONS } from '@/config';
import { useCan } from '@/hooks';
import type { Project, ProjectStatus } from '@/types';
import { BTN_DANGER, BTN_LINE, BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { Select } from '../../_components/select';
import { Sheet } from '../../_components/sheet';
import { CustomerSheet } from '../../customers/_components/customer-sheet';

interface Props {
  target: Project | 'new' | null;
  onClose: () => void;
}

// Thêm / sửa / xoá dự án (mã dự án do hệ thống tự cấp).
export function ProjectSheet({ target, onClose }: Props) {
  const { can } = useCan();
  const qc = useQueryClient();
  const p = target && target !== 'new' ? target : null;
  const [name, setName] = useState(p?.name ?? '');
  const [customerId, setCustomerId] = useState(p ? String(p.customerId) : '');
  const [status, setStatus] = useState<string>(p?.status ?? 'surveying');
  const [address, setAddress] = useState(p?.address ?? '');
  const [startDate, setStartDate] = useState(p?.startDate ?? '');
  const [targetDate, setTargetDate] = useState(p?.targetDate ?? '');
  const [note, setNote] = useState(p?.note ?? '');
  const [code, setCode] = useState('');
  const [brandId, setBrandId] = useState(p?.defaultBrandId ? String(p.defaultBrandId) : '');
  const [seriesId, setSeriesId] = useState(p?.defaultSeriesId ? String(p.defaultSeriesId) : '');
  const [colorId, setColorId] = useState(p?.defaultColorId ? String(p.defaultColorId) : '');
  const [addCustomer, setAddCustomer] = useState(false);
  const editable = p ? can('project:update') : can('project:create');

  const { data: customers } = useQuery({
    queryKey: ['customers', 'select-options'],
    queryFn: () => getCustomers({ limit: 1000 }),
    enabled: !!target,
  });
  const brandNum = brandId ? Number(brandId) : undefined;
  const brands = useQuery({ queryKey: ['brands', 'aluminum'], queryFn: () => getBrands({ limit: 100, brandType: 'aluminum' }), enabled: !!target });
  const series = useQuery({
    queryKey: ['door-series', brandNum],
    queryFn: () => getDoorSeriesList({ limit: 100, brandId: brandNum }),
    enabled: !!target && !!brandNum,
  });
  const colors = useQuery({
    queryKey: ['brand-colors', brandNum],
    queryFn: () => getBrandColors({ limit: 100, brandId: brandNum }),
    enabled: !!target && !!brandNum,
  });
  const opts = (items?: { id: number; name?: string | null }[]) => [
    { value: '', label: 'Không chọn' },
    ...(items ?? []).map((x) => ({ value: String(x.id), label: x.name ?? '' })),
  ];

  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['projects'] });
    onClose();
  };
  const fail = (e: unknown) => toast.error(messageOf(e));
  const save = useMutation({
    mutationFn: () => {
      const body = {
        name: name.trim(),
        customerId: Number(customerId),
        status: status as ProjectStatus,
        code: !p && code.trim() ? code.trim() : undefined,
        defaultBrandId: brandNum ?? null,
        defaultSeriesId: brandNum && seriesId ? Number(seriesId) : null,
        defaultColorId: brandNum && colorId ? Number(colorId) : null,
        address: address.trim() || undefined,
        startDate: startDate || undefined,
        targetDate: targetDate || undefined,
        note: note.trim() || undefined,
      };
      return p ? updateProject(p.id, body) : createProject(body);
    },
    onSuccess: () => done(p ? 'Đã lưu dự án' : 'Đã thêm dự án'),
    onError: fail,
  });
  const remove = useMutation({ mutationFn: () => deleteProject(p!.id), onSuccess: () => done('Đã xoá dự án'), onError: fail });

  return (
    <Sheet open={!!target} onClose={onClose} title={p ? p.code : 'Thêm dự án'}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Tên dự án" id="pj-name">
          <input
            id="pj-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={255}
            required
            disabled={!editable}
            className={INPUT}
          />
        </Field>
        {!p && (
          <Field label="Mã dự án (để trống để hệ thống tự cấp)" id="pj-code">
            <input
              id="pj-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={50}
              placeholder="VD: DA-2026-0001"
              className={INPUT}
            />
          </Field>
        )}
        <Field label="Khách hàng" id="pj-customer">
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <Select
                id="pj-customer"
                label="Khách hàng"
                value={customerId}
                onChange={setCustomerId}
                options={(customers?.items ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
                disabled={!editable || !!p}
              />
            </div>
            {!p && can('customer:create') && (
              <button type="button" onClick={() => setAddCustomer(true)} className={`${BTN_LINE} flex-none px-4`}>
                Khách mới
              </button>
            )}
          </div>
        </Field>
        <Field label="Trạng thái" id="pj-status">
          <Select
            id="pj-status"
            label="Trạng thái"
            value={status}
            onChange={setStatus}
            options={PROJECT_STATUS_OPTIONS}
            disabled={!editable || !!p}
          />
        </Field>
        <Field label="Địa chỉ công trình" id="pj-address">
          <input id="pj-address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={!editable} className={INPUT} />
        </Field>
        <fieldset className="flex flex-col gap-3 rounded-rm-xl border border-rm-line p-3">
          <legend className="px-1 text-xs font-medium text-rm-muted">Cấu hình nhôm mặc định</legend>
          <Select
            id="pj-brand"
            label="Hãng nhôm"
            value={brandId}
            onChange={(v) => {
              setBrandId(v);
              setSeriesId('');
              setColorId('');
            }}
            options={opts(brands.data?.items)}
            disabled={!editable}
          />
          {brandNum && (
            <>
              <Select
                id="pj-series"
                label="Hệ nhôm"
                value={seriesId}
                onChange={setSeriesId}
                options={opts(series.data?.items)}
                disabled={!editable}
              />
              <Select id="pj-color" label="Màu nhôm" value={colorId} onChange={setColorId} options={opts(colors.data?.items)} disabled={!editable} />
            </>
          )}
        </fieldset>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <Field label="Ngày bắt đầu" id="pj-start">
            <input
              id="pj-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={!editable}
              className={INPUT}
            />
          </Field>
          <Field label="Ngày dự kiến xong" id="pj-target">
            <input
              id="pj-target"
              type="date"
              value={targetDate}
              min={startDate}
              onChange={(e) => setTargetDate(e.target.value)}
              disabled={!editable}
              className={INPUT}
            />
          </Field>
        </div>
        <Field label="Ghi chú" id="pj-note">
          <input id="pj-note" value={note} onChange={(e) => setNote(e.target.value)} disabled={!editable} className={INPUT} />
        </Field>
        {editable && (
          <button type="submit" disabled={save.isPending || !name.trim() || !customerId} className={BTN_PRIMARY}>
            {save.isPending ? 'Đang lưu…' : 'Lưu'}
          </button>
        )}
      </form>

      {p && can('project:delete') && (
        <div className="border-t border-rm-line p-rm-gutter">
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => window.confirm(`Xoá dự án "${p.name}"? Không thể hoàn tác.`) && remove.mutate()}
            className={`${BTN_DANGER} w-full`}
          >
            Xoá dự án
          </button>
        </div>
      )}
      <CustomerSheet key={addCustomer ? 'c-new' : 'c-idle'} target={addCustomer ? 'new' : null} onClose={() => setAddCustomer(false)} />
    </Sheet>
  );
}
