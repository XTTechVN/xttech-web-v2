'use client';

import Label from '@/components/ui/Label';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import Loading from '@/components/ui/icons/Loading';
import SubHeading from '@/components/ui/SubHeading';
import Select from '@/components/ui/Select';
import { SaveIcon, X } from 'lucide-react';

import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import api from '@/utils/api';

import { Space } from '@/types/shared/space';

export interface SpaceEditFormData {
  name: string;
  spaceId: string;
  parentId?: string | null;
  description?: string;
}

export default function SpaceEditModal({
  isLoading,
  onClose,
  onEdit,
  defaultValues,
}: {
  isLoading: boolean;
  onClose: () => void;
  onEdit: (value: SpaceEditFormData) => void;
  defaultValues?: Space;
}) {
  // Fetch spaces list from API to populate Parent options
  const { data: rawSpaces } = useQuery<any>({
    queryKey: ['spaces-flat'],
    queryFn: () => api.get('/api/v1/spaces/flat').then((res: any) => res.data),
  });

  const spacesList = useMemo(() => {
    if (!rawSpaces) return [];
    return Array.isArray(rawSpaces) ? rawSpaces : (rawSpaces.items || []);
  }, [rawSpaces]);

  // Filter out self and any of self's descendant spaces to avoid circular reference loops
  // Wait, the backend already handles prevention of circular loops by throwing error,
  // but filtering them in UI is even nicer. Let's build the descendants list.
  const descendants = useMemo(() => {
    const set = new Set<string>();
    if (!defaultValues || spacesList.length === 0) return set;
    const findChildren = (parentId: string) => {
      spacesList.forEach((s: any) => {
        if (s.parentId === parentId) {
          set.add(s.id);
          findChildren(s.id);
        }
      });
    };
    findChildren(defaultValues.id);
    return set;
  }, [defaultValues, spacesList]);

  const parentOptions = useMemo(() => {
    return [
      { value: '', label: 'Không có (Là khu vực gốc)' },
      ...spacesList
        .filter((s: any) => s.id !== defaultValues?.id && !descendants.has(s.id))
        .map((s: any) => ({
          value: s.id,
          label: `${s.name} (${s.spaceId})`,
        })),
    ];
  }, [spacesList, defaultValues, descendants]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SpaceEditFormData>({
    defaultValues: {
      name: '',
      spaceId: '',
      parentId: '',
      description: '',
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name || '',
        spaceId: defaultValues.spaceId || '',
        parentId: defaultValues.parentId || '',
        description: defaultValues.meta?.description || '',
      });
    }
  }, [defaultValues, reset]);

  const onSubmit = (data: SpaceEditFormData) => {
    onEdit({
      ...data,
      parentId: data.parentId || null,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full min-w-lg max-w-lg h-fit max-h-[90vh] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex flex-col gap-1">
          <Heading>Cập nhật khu vực</Heading>
          <SubHeading>Chỉnh sửa chi tiết thông tin và cấu trúc khu vực</SubHeading>
        </div>

        <Button type="button" variant="ghost" onClick={onClose} className="rounded-full hover:bg-transparent">
          <X size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="flex flex-col gap-2">
            <Label>Tên khu vực <span className="text-red-500">*</span></Label>
            <Input
              placeholder="Ví dụ: Tòa nhà A, Tầng 1, Phòng 102"
              {...register('name', { required: 'Tên khu vực là bắt buộc' })}
              error={errors.name?.message}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Mã định danh khu vực (Space ID)</Label>
            <Input
              placeholder="Ví dụ: toanha-a, tang-1"
              {...register('spaceId')}
              disabled
              error={errors.spaceId?.message}
            />
            <span className="text-xs text-gray-400">Mã định danh không thể chỉnh sửa sau khi tạo.</span>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Khu vực cha</Label>
            <Controller
              name="parentId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ''}
                  onChange={field.onChange}
                  ref={field.ref}
                  options={parentOptions}
                  placeholder="Chọn khu vực cha (nếu có)"
                  error={errors.parentId?.message}
                  className="w-full h-full"
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Mô tả chi tiết</Label>
            <textarea
              placeholder="Nhập mô tả chi tiết khu vực hoặc ghi chú..."
              {...register('description')}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          {/* Button Submit */}
          <div className="flex flex-col items-center justify-end gap-2 mt-6">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              icon={isLoading ? <Loading size={16} /> : <SaveIcon size={16} />}
              disabled={isLoading}
            >
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
