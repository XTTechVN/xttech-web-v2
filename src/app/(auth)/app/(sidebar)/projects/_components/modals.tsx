'use client';

import { useEffect, useMemo } from 'react';
import { Input, Button, Modal, Select } from '@/components';
import { CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createProject, updateProject, getBrands, getDoorSeriesList, getBrandColors } from '@/actions';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import type { Project, ProjectCreate, ProjectUpdate, Customer, ProjectStatus } from '@/types';
import { PROJECT_STATUS_OPTIONS } from '@/config';

// Form modal để Thêm / Sửa thông tin dự án
interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: (Partial<Project> & { id?: number; customerId?: number; customer?: Partial<Customer> | null; expectedDate?: string }) | null;
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

export function ProjectFormModal({
  isOpen,
  onClose,
  title,
  submitText = 'Xác nhận tạo',
  initialData,
  customers = [],
}: ProjectFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProjectFormInputs>();

  const isEdit = !!initialData?.id;
  const selectedBrandId = watch('defaultBrandId');

  // Lấy danh sách hãng nhôm (chỉ lấy loại nhôm 'aluminum')
  const { data: brandsData } = useQuery({
    queryKey: ['brands', 'aluminum'],
    queryFn: async () => {
      const res = await getBrands({ limit: 100, brandType: 'aluminum' } as any);
      const items = Array.isArray(res?.items) ? res.items : [];
      return items.filter((b) => !b.brandType || b.brandType === 'aluminum');
    },
    enabled: isOpen,
  });


  // Lấy danh sách hệ nhôm theo brand (hoặc tất cả)
  const { data: seriesData } = useQuery({
    queryKey: ['door-series', selectedBrandId],
    queryFn: async () => {
      const res = await getDoorSeriesList({
        limit: 100,
        brandId: selectedBrandId ? Number(selectedBrandId) : undefined,
      });
      return res.items;
    },
    enabled: isOpen,
  });

  // Lấy danh sách màu nhôm
  const { data: colorsData } = useQuery({
    queryKey: ['brand-colors', selectedBrandId],
    queryFn: async () => {
      const res = await getBrandColors({
        limit: 100,
        brandId: selectedBrandId ? Number(selectedBrandId) : undefined,
      });
      return res.items;
    },
    enabled: isOpen,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Thêm dự án thành công');
      onClose();
      reset();
    },
    onError: (error) => {
      showErrorToast(error, 'Không thể tạo dự án');
    },
  });

  const { mutate: updateMutation, isPending: updateIsPending } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateProject>[1] }) =>
      updateProject(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
      toast.success('Cập nhật dự án thành công');
      onClose();
      reset();
    },
    onError: (error) => {
      showErrorToast(error, 'Không thể cập nhật dự án');
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        code: initialData?.code || '',
        name: initialData?.name || '',
        customerId: initialData?.customerId ? String(initialData.customerId) : undefined,
        status: initialData?.status || 'surveying',
        address: initialData?.address || '',
        note: initialData?.note || '',
        defaultBrandId: initialData?.defaultBrandId ? String(initialData.defaultBrandId) : undefined,
        defaultSeriesId: initialData?.defaultSeriesId ? String(initialData.defaultSeriesId) : undefined,
        defaultColorId: initialData?.defaultColorId ? String(initialData.defaultColorId) : undefined,
        startDate: initialData?.startDate || '',
        targetDate: initialData?.targetDate || (initialData as any)?.expectedDate || '',
      });
    } else {
      reset({
        code: '',
        name: '',
        customerId: undefined,
        status: 'surveying',
        address: '',
        note: '',
        defaultBrandId: undefined,
        defaultSeriesId: undefined,
        defaultColorId: undefined,
        startDate: '',
        targetDate: '',
      });
    }
  }, [isOpen, initialData, reset]);

  const handleConfirm = (data: ProjectFormInputs) => {
    const finalCustomerId = isEdit ? (initialData?.customerId ?? Number(data.customerId)) : Number(data.customerId);
    const finalStatus = isEdit ? (initialData?.status ?? data.status) : data.status;

    const payload: ProjectCreate = {
      name: data.name,
      customerId: Number(finalCustomerId),
      status: finalStatus,
      address: data.address || undefined,
      note: data.note || undefined,
      code: isEdit ? undefined : (data.code?.trim() || undefined),
      defaultBrandId: data.defaultBrandId ? Number(data.defaultBrandId) : undefined,
      defaultSeriesId: data.defaultSeriesId ? Number(data.defaultSeriesId) : undefined,
      defaultColorId: data.defaultColorId ? Number(data.defaultColorId) : undefined,
      startDate: data.startDate || undefined,
      targetDate: data.targetDate || undefined,
    };

    if (initialData?.id) {
      updateMutation({ id: initialData.id, data: payload as ProjectUpdate });
    } else {
      mutate(payload);
    }
  };

  // Nạp khách hàng từ initialData nếu có để đảm bảo luôn hiển thị đúng
  const customerOptions = useMemo(() => {
    const list = [...(customers || [])];
    const initialCustomer = (initialData as any)?.customer;
    if (initialCustomer && initialCustomer.id && !list.some((c) => c.id === initialCustomer.id)) {
      list.push({ id: initialCustomer.id, name: initialCustomer.name });
    }
    return list
      .slice()
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi'))
      .map((c) => ({ value: String(c.id), label: c.name }));
  }, [customers, initialData]);

  const brandOptions = (Array.isArray(brandsData) ? brandsData : [])
    .slice()
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi'))
    .map((b) => ({ value: b.id, label: b.name }));

  const seriesOptions = (Array.isArray(seriesData) ? seriesData : [])
    .slice()
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi'))
    .map((s) => ({ value: s.id, label: s.name }));

  const colorOptions = (Array.isArray(colorsData) ? colorsData : [])
    .slice()
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi'))
    .map((c) => ({ value: c.id, label: c.name }));

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
            <Input
              label="Mã dự án"
              placeholder={isEdit ? '' : 'VD: DA-2026-0001'}
              fullWidth
              disabled={isEdit}
              {...register('code')}
            />
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


          <Input
            label="Địa chỉ công trình"
            placeholder="Nhập địa chỉ công trình"
            fullWidth
            {...register('address')}
            error={errors.address ? 'Địa chỉ không hợp lệ' : undefined}
          />

          <div className="border-t border-slate-100 pt-3">
            <span className="text-xs font-bold text-slate-500 block mb-2">Cấu hình nhôm mặc định</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select
                label="Hãng nhôm"
                placeholder="Chọn hãng"
                fullWidth
                value={watch('defaultBrandId') || ''}
                {...register('defaultBrandId')}
                options={brandOptions}
              />
              <Select
                label="Hệ nhôm"
                placeholder="Chọn hệ"
                fullWidth
                value={watch('defaultSeriesId') || ''}
                {...register('defaultSeriesId')}
                options={seriesOptions}
              />
              <Select
                label="Màu nhôm"
                placeholder="Chọn màu"
                fullWidth
                value={watch('defaultColorId') || ''}
                {...register('defaultColorId')}
                options={colorOptions}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Ngày bắt đầu"
              fullWidth
              {...register('startDate')}
            />
            <Input
              type="date"
              label="Dự kiến hoàn thành"
              fullWidth
              {...register('targetDate')}
            />
          </div>

          <Input
            label="Ghi chú"
            placeholder="Nhập ghi chú yêu cầu thiết kế / khảo sát..."
            fullWidth
            {...register('note')}
            error={errors.note ? 'Ghi chú không hợp lệ' : undefined}
          />
        </div>

        <div className="flex gap-2 justify-end w-full mt-5 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle2 size={16} />}
            type="submit"
            disabled={isPending || updateIsPending}
            loading={isPending || updateIsPending}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


// Modal xác nhận xoá dự án
interface ProjectDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function ProjectDeleteModal({
  isOpen,
  onClose,
  projectName,
  onConfirm,
  isPending = false,
}: ProjectDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận xóa dự án"
      className="m-2 max-w-md w-full"
    >
      <div className="flex gap-4 items-center py-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa dự án <strong className="text-gray-900 font-semibold">{projectName}</strong>?
          </p>
        </div>
      </div>
      <div className="flex gap-3 justify-end w-full mt-6">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
          Hủy
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm} loading={isPending}>
          Xác nhận xóa
        </Button>
      </div>
    </Modal>
  );
}
