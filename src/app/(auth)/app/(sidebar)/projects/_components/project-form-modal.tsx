'use client';

import { useEffect, useMemo } from 'react';
import { Input, Button, Modal, Select } from '@/components';
import { CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  createProject,
  updateProject,
  getBrands,
  getDoorSeriesList,
  getBrandColors,
  getCustomers,
} from '@/actions';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import type { Project, ProjectCreate, ProjectUpdate, Customer, ProjectStatus } from '@/types';
import { PROJECT_STATUS_OPTIONS } from '@/config';

export interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: (Partial<Project> & { id?: number; customer?: Partial<Customer> | null }) | null;
  customers?: Pick<Customer, 'id' | 'name'>[];
}

interface ProjectFormInputs {
  code?: string;
  name: string;
  customerId: string | number;
  status?: ProjectStatus;
  address?: string;
  note?: string;
  defaultBrandId?: string | number;
  defaultSeriesId?: string | number;
  defaultColorId?: string | number;
  startDate?: string;
  targetDate?: string;
}

const DEFAULT_FORM_VALUES: ProjectFormInputs = {
  code: '',
  name: '',
  customerId: '',
  status: 'surveying',
  address: '',
  note: '',
  defaultBrandId: '',
  defaultSeriesId: '',
  defaultColorId: '',
  startDate: '',
  targetDate: '',
};

function toSortedOptions<T extends { id: number; name?: string | null }>(items?: T[], stringValue = false) {
  return (items ?? [])
    .slice()
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi'))
    .map((item) => ({ value: stringValue ? String(item.id) : item.id, label: item.name || '' }));
}

export function ProjectFormModal({
  isOpen,
  onClose,
  title,
  submitText = 'Xác nhận tạo',
  initialData,
  customers,
}: ProjectFormModalProps) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ProjectFormInputs>({
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const isEdit = Boolean(initialData?.id);
  const selectedBrandId = watch('defaultBrandId');

  const { data: fetchedCustomers } = useQuery({
    queryKey: ['customers', 'select-options'],
    queryFn: async () => (await getCustomers({ limit: 1000 })).items,
    enabled: isOpen && !customers,
    staleTime: 60_000,
  });

  const { data: brandsData } = useQuery({
    queryKey: ['brands', 'aluminum'],
    queryFn: async () => {
      const res = await getBrands({ limit: 100, brandType: 'aluminum' });
      const items = Array.isArray(res?.items) ? res.items : [];
      return items.filter((b) => !b.brandType || b.brandType === 'aluminum' || b.brandType === 'both');
    },
    enabled: isOpen,
    staleTime: 60_000,
  });

  const { data: seriesData } = useQuery({
    queryKey: ['door-series', selectedBrandId],
    queryFn: async () =>
      (await getDoorSeriesList({ limit: 100, brandId: selectedBrandId ? Number(selectedBrandId) : undefined })).items,
    enabled: isOpen,
  });

  const { data: colorsData } = useQuery({
    queryKey: ['brand-colors', selectedBrandId],
    queryFn: async () =>
      (await getBrandColors({ limit: 100, brandId: selectedBrandId ? Number(selectedBrandId) : undefined })).items,
    enabled: isOpen,
  });

  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Thêm dự án thành công');
      onClose();
      reset(DEFAULT_FORM_VALUES);
    },
    onError: (error) => showErrorToast(error, 'Không thể tạo dự án'),
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProjectUpdate }) => updateProject(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
      toast.success('Cập nhật dự án thành công');
      onClose();
      reset(DEFAULT_FORM_VALUES);
    },
    onError: (error) => showErrorToast(error, 'Không thể cập nhật dự án'),
  });

  useEffect(() => {
    if (!isOpen) {
      reset(DEFAULT_FORM_VALUES);
      return;
    }
    reset({
      code: initialData?.code || '',
      name: initialData?.name || '',
      customerId: initialData?.customerId ? String(initialData.customerId) : '',
      status: initialData?.status || 'surveying',
      address: initialData?.address || '',
      note: initialData?.note || '',
      defaultBrandId: initialData?.defaultBrandId ? String(initialData.defaultBrandId) : '',
      defaultSeriesId: initialData?.defaultSeriesId ? String(initialData.defaultSeriesId) : '',
      defaultColorId: initialData?.defaultColorId ? String(initialData.defaultColorId) : '',
      startDate: initialData?.startDate || '',
      targetDate: initialData?.targetDate || '',
    });
  }, [isOpen, initialData, reset]);

  const handleConfirm = (data: ProjectFormInputs) => {
    const finalCustomerId = isEdit ? (initialData?.customerId ?? Number(data.customerId)) : Number(data.customerId);
    const finalStatus = isEdit ? (initialData?.status ?? data.status) : data.status;

    const payload: ProjectCreate = {
      name: data.name.trim(),
      customerId: Number(finalCustomerId),
      status: finalStatus,
      address: data.address?.trim() || undefined,
      note: data.note?.trim() || undefined,
      code: isEdit ? undefined : (data.code?.trim() || undefined),
      defaultBrandId: data.defaultBrandId ? Number(data.defaultBrandId) : undefined,
      defaultSeriesId: data.defaultSeriesId ? Number(data.defaultSeriesId) : undefined,
      defaultColorId: data.defaultColorId ? Number(data.defaultColorId) : undefined,
      startDate: data.startDate || undefined,
      targetDate: data.targetDate || undefined,
    };

    if (initialData?.id) updateMutate({ id: initialData.id, data: payload });
    else createMutate(payload);
  };

  const customerOptions = useMemo(() => {
    const list = [...(customers ?? fetchedCustomers ?? [])];
    const initialCustomer = initialData?.customer;
    if (initialCustomer?.id && initialCustomer.name && !list.some((c) => c.id === initialCustomer.id)) {
      list.push({ id: initialCustomer.id, name: initialCustomer.name });
    }
    return toSortedOptions(list, true);
  }, [customers, fetchedCustomers, initialData]);

  const brandOptions = useMemo(() => toSortedOptions(brandsData), [brandsData]);
  const seriesOptions = useMemo(() => toSortedOptions(seriesData), [seriesData]);
  const colorOptions = useMemo(() => toSortedOptions(colorsData), [colorsData]);

  const isSubmitting = isCreating || isUpdating;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-2xl w-full">
      <form onSubmit={handleSubmit(handleConfirm)}>
        <div className="flex flex-col space-y-4 max-h-[75vh] overflow-y-auto px-1 py-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tên dự án *"
              placeholder="Nhập tên dự án"
              fullWidth
              {...register('name', { required: true })}
              error={errors.name ? 'Tên dự án không được để trống' : undefined}
            />
            <Input label="Mã dự án" placeholder={isEdit ? '' : 'VD: DA-2026-0001'} fullWidth disabled={isEdit} {...register('code')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Khách hàng *"
              placeholder="Chọn khách hàng"
              fullWidth
              disabled={isEdit}
              value={watch('customerId') || (initialData?.customerId ? String(initialData.customerId) : '')}
              {...register('customerId', { required: !isEdit })}
              options={customerOptions}
              error={errors.customerId ? 'Vui lòng chọn khách hàng' : undefined}
            />
            <Select
              label="Trạng thái dự án"
              placeholder="Chọn trạng thái"
              fullWidth
              disabled={isEdit}
              value={watch('status') || initialData?.status || 'surveying'}
              {...register('status')}
              options={PROJECT_STATUS_OPTIONS}
            />
          </div>

          <Input label="Địa chỉ công trình" placeholder="Nhập địa chỉ công trình" fullWidth {...register('address')} />

          <div className="border-t border-slate-100 pt-3">
            <span className="text-xs font-bold text-slate-500 block mb-2">Cấu hình nhôm mặc định</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select label="Hãng nhôm" placeholder="Chọn hãng" fullWidth value={watch('defaultBrandId') || ''} {...register('defaultBrandId')} options={brandOptions} />
              <Select label="Hệ nhôm" placeholder="Chọn hệ" fullWidth value={watch('defaultSeriesId') || ''} {...register('defaultSeriesId')} options={seriesOptions} />
              <Select label="Màu nhôm" placeholder="Chọn màu" fullWidth value={watch('defaultColorId') || ''} {...register('defaultColorId')} options={colorOptions} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input type="date" label="Ngày bắt đầu" fullWidth {...register('startDate')} />
            <Input type="date" label="Dự kiến hoàn thành" fullWidth {...register('targetDate')} />
          </div>

          <Input label="Ghi chú" placeholder="Nhập ghi chú yêu cầu thiết kế / khảo sát..." fullWidth {...register('note')} />
        </div>

        <div className="flex gap-2 justify-end w-full mt-5 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} type="button">Hủy</Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle2 size={16} />}
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

