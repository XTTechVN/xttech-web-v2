'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Input } from '@/components';
import { createDepartment, updateDepartment } from '@/actions/department';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import type { Department } from '@/types';

const schema = z.object({
  name: z.string().trim().min(1, { message: 'Tên phòng ban không được để trống' }),
  code: z.string().trim().min(1, { message: 'Mã phòng ban không được để trống' }),
});
type Values = z.infer<typeof schema>;

export const DEPARTMENT_FORM_ID = 'department-form';

interface Props {
  initialData?: Department | null;
  /** Gọi sau khi lưu thành công */
  onDone: () => void;
  onPendingChange?: (pending: boolean) => void;
}

// Form thêm/sửa phòng ban: chỉ có phần thân, drawer cha lo khung và nút Lưu (submit bằng form={DEPARTMENT_FORM_ID})
export function DepartmentForm({ initialData, onDone, onPendingChange }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: initialData?.name ?? '', code: initialData?.code ?? '' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (v: Values) => (initialData ? updateDepartment(Number(initialData.id), v) : createDepartment(v)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success(initialData ? 'Cập nhật phòng ban thành công' : 'Thêm phòng ban thành công');
      onDone();
    },
    onError: (e) => showErrorToast(e, initialData ? 'Cập nhật phòng ban thất bại' : 'Thêm phòng ban thất bại'),
  });

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  return (
    <form id={DEPARTMENT_FORM_ID} onSubmit={handleSubmit((v) => mutate(v))} className="flex flex-col gap-4">
      <Input label="Tên phòng ban *" placeholder="Nhập tên phòng ban" fullWidth {...register('name')} error={errors.name?.message} />
      <Input label="Mã phòng ban *" placeholder="Nhập mã phòng ban" fullWidth {...register('code')} error={errors.code?.message} />
    </form>
  );
}
