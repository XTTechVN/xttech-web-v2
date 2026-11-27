'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { createProject, getBrandColors, getBrands, getCustomers, getDoorSeriesList, updateProject } from '@/actions';
import { Input, Textarea } from '@/components';
import { DateTimeField, Select } from '@/components-remake';
import { useCan } from '@/hooks';
import type { Project, ProjectStatus } from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import CustomerFormDrawer from '../../../customers/_components/list/form-drawer';
import { STATUSES } from './format';

export const PROJECT_FORM_ID = 'project-form';

const STALE = 60_000;
const byName = <T extends { name?: string | null }>(a: T, b: T) => (a.name || '').localeCompare(b.name || '', 'vi');

interface Props {
  /** Có = sửa; không có = thêm mới */
  initial?: Project;
  onDone: () => void;
  onPendingChange: (pending: boolean) => void;
}

const day = (v?: string | null) => (v ? v.slice(0, 10) : '');

// Thêm hoặc sửa dự án. Khách hàng, mã và trạng thái chỉ chọn khi tạo (sửa giữ nguyên).
export function ProjectForm({ initial, onDone, onPendingChange }: Props) {
  const { can } = useCan();
  const [name, setName] = useState(initial?.name ?? '');
  const [code, setCode] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [status, setStatus] = useState<string>('surveying');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [brandId, setBrandId] = useState(initial?.defaultBrandId ? String(initial.defaultBrandId) : '');
  const [seriesId, setSeriesId] = useState(initial?.defaultSeriesId ? String(initial.defaultSeriesId) : '');
  const [colorId, setColorId] = useState(initial?.defaultColorId ? String(initial.defaultColorId) : '');
  const [startDate, setStartDate] = useState(day(initial?.startDate));
  const [targetDate, setTargetDate] = useState(day(initial?.targetDate));
  const [note, setNote] = useState(initial?.note ?? '');
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const touch = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: '' } : e));

  const customers = useQuery({
    queryKey: ['customers', 'select-options'],
    queryFn: async () => (await getCustomers({ limit: 1000 })).items,
    enabled: !initial && can('customer:read'),
    staleTime: STALE,
  });
  const brands = useQuery({
    queryKey: ['brands', 'aluminum'],
    queryFn: async () => (await getBrands({ limit: 100, brandType: 'aluminum' })).items,
    staleTime: STALE,
  });
  const brand = brandId ? Number(brandId) : undefined;
  const series = useQuery({
    queryKey: ['door-series', brand],
    queryFn: async () => (await getDoorSeriesList({ limit: 100, brandId: brand })).items,
    staleTime: STALE,
  });
  const colors = useQuery({
    queryKey: ['brand-colors', brand],
    queryFn: async () => (await getBrandColors({ limit: 100, brandId: brand })).items,
    staleTime: STALE,
  });

  const opts = <T extends { id: number; name?: string | null }>(items?: T[]) =>
    (items ?? [])
      .slice()
      .sort(byName)
      .map((i) => ({ value: String(i.id), label: i.name || '' }));

  const save = useMutation({
    mutationFn: async () => {
      const common = {
        name: name.trim(),
        address: address.trim() || undefined,
        note: note.trim() || undefined,
        defaultBrandId: brandId ? Number(brandId) : undefined,
        defaultSeriesId: seriesId ? Number(seriesId) : undefined,
        defaultColorId: colorId ? Number(colorId) : undefined,
        startDate: startDate || undefined,
        targetDate: targetDate || undefined,
      };
      if (initial) return updateProject(initial.id, { ...common, customerId: initial.customerId, status: initial.status });
      return createProject({ ...common, customerId: Number(customerId), status: status as ProjectStatus, code: code.trim() || undefined });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (initial) queryClient.invalidateQueries({ queryKey: ['project', initial.id] });
      toast.success(initial ? 'Cập nhật dự án thành công' : 'Thêm dự án thành công');
      onDone();
    },
    onError: (e) => showErrorToast(e, initial ? 'Không thể cập nhật dự án' : 'Không thể tạo dự án'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Vui lòng nhập tên dự án';
    if (!initial && !customerId) next.customerId = 'Vui lòng chọn khách hàng';
    setErrors(next);
    if (Object.keys(next).length) return;
    onPendingChange(true);
    save.mutate(undefined, { onSettled: () => onPendingChange(false) });
  };

  return (
    <>
      <form id={PROJECT_FORM_ID} onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Tên dự án *"
          placeholder="Tên dự án"
          fullWidth
          value={name}
          error={errors.name}
          onChange={(e) => {
            setName(e.target.value);
            touch('name');
          }}
        />
        {!initial && (
          <>
            <Input
              label="Mã dự án"
              placeholder="Để trống để tự sinh, ví dụ DA-2026-0001"
              fullWidth
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <Select
                  label="Khách hàng *"
                  value={customerId}
                  options={(customers.data ?? [])
                    .slice()
                    .sort(byName)
                    .map((c) => ({ value: String(c.id), label: c.name, hint: c.phone ?? undefined }))}
                  loading={customers.isLoading}
                  placeholder="Chọn khách hàng"
                  onChange={(v) => {
                    setCustomerId(v);
                    touch('customerId');
                  }}
                />
                {errors.customerId && <p className="mt-1 text-xs text-red-600">{errors.customerId}</p>}
              </div>
              {can('customer:create') && (
                <button
                  type="button"
                  aria-label="Thêm nhanh khách hàng"
                  title="Thêm nhanh khách hàng"
                  onClick={() => setAddingCustomer(true)}
                  className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-control border border-slate-200 text-slate-600 transition active:scale-95 active:bg-slate-100 md:size-10 md:hover:bg-slate-50"
                >
                  <Plus size={18} />
                </button>
              )}
            </div>
            <Select label="Trạng thái" value={status} options={STATUSES} onChange={setStatus} />
          </>
        )}
        <Input
          label="Địa chỉ công trình"
          placeholder="Số nhà, đường, quận, thành phố"
          fullWidth
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
          <span className="text-xs font-medium text-slate-500">Cấu hình nhôm mặc định</span>
          <Select
            label="Hãng nhôm"
            value={brandId}
            options={opts(brands.data)}
            loading={brands.isLoading}
            placeholder="Chọn hãng"
            clearLabel="Không chọn"
            onChange={(v) => {
              setBrandId(v);
              setSeriesId('');
              setColorId('');
            }}
          />
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))]">
            <Select
              label="Hệ nhôm"
              value={seriesId}
              options={opts(series.data)}
              loading={series.isLoading}
              placeholder="Chọn hệ"
              clearLabel="Không chọn"
              onChange={setSeriesId}
            />
            <Select
              label="Màu nhôm"
              value={colorId}
              options={opts(colors.data)}
              loading={colors.isLoading}
              placeholder="Chọn màu"
              clearLabel="Không chọn"
              onChange={setColorId}
            />
          </div>
        </div>

        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
          <DateTimeField label="Ngày bắt đầu" mode="date" value={startDate} max={targetDate || undefined} onChange={setStartDate} />
          <DateTimeField label="Dự kiến xong" mode="date" value={targetDate} min={startDate || undefined} onChange={setTargetDate} />
        </div>
        <Textarea
          label="Ghi chú"
          placeholder="Yêu cầu thiết kế, khảo sát..."
          rows={3}
          fullWidth
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </form>

      <CustomerFormDrawer
        isOpen={addingCustomer}
        onClose={() => setAddingCustomer(false)}
        onCreated={(c) => {
          setCustomerId(String(c.id));
          touch('customerId');
        }}
      />
    </>
  );
}
