'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Modal, Input, Button } from '@/components';
import { Save, RotateCcw } from 'lucide-react';
import {
  getAccessoryCategories,
  createAccessoryCategory,
  updateAccessoryCategory,
  deleteAccessoryCategory,
} from '@/actions';
import type { AccessoryCategory, AccessoryCategoryCreate, AccessoryCategoryUpdate } from '@/types';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { AccessoryCategoryTable, type CategorySortField, type CategorySortOrder } from './accessory-category-table';

interface AccessoryCategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessoryCategoryManagerModal({ isOpen, onClose }: AccessoryCategoryManagerModalProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AccessoryCategory | null>(null);
  const [sortField, setSortField] = useState<CategorySortField>('sortOrder');
  const [sortOrder, setSortOrder] = useState<CategorySortOrder>('asc');

  const isEdit = Boolean(selectedCategory);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AccessoryCategoryCreate>({
    defaultValues: { code: '', name: '', sortOrder: 0, description: '', isActive: true },
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['accessory-categories'],
    queryFn: async () => (await getAccessoryCategories({ limit: 9999, offset: 0, allowDeleted: false })).items,
    enabled: isOpen,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (selectedCategory) {
      reset({
        code: selectedCategory.code || '',
        name: selectedCategory.name || '',
        sortOrder: selectedCategory.sortOrder ?? 0,
        description: selectedCategory.description || '',
        isActive: selectedCategory.isActive !== false,
      });
    } else {
      reset({ code: '', name: '', sortOrder: 1, description: '', isActive: true });
    }
  }, [isOpen, selectedCategory, reset]);

  const filteredCategories = useMemo(() => {
    let result = [...categories];
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.code.toLowerCase().includes(query) ||
          Boolean(c.description && c.description.toLowerCase().includes(query)),
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'sortOrder':
          comparison = (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0);
          break;
        case 'code':
          comparison = (a.code || '').localeCompare(b.code || '', 'vi', { sensitivity: 'base' });
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '', 'vi', { sensitivity: 'base' });
          break;
        case 'status':
          comparison = (a.isActive !== false ? 1 : 0) - (b.isActive !== false ? 1 : 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [categories, search, sortField, sortOrder]);

  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: (data: AccessoryCategoryCreate) => createAccessoryCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessory-categories'] });
      toast.success('Thêm danh mục phụ kiện thành công');
      setSelectedCategory(null);
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi thêm danh mục phụ kiện'),
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: (data: AccessoryCategoryUpdate) => updateAccessoryCategory(selectedCategory!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessory-categories'] });
      toast.success('Cập nhật danh mục thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi cập nhật danh mục'),
  });

  const { mutate: deleteMutate } = useMutation({
    mutationFn: (id: number) => deleteAccessoryCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessory-categories'] });
      toast.success('Xóa danh mục thành công');
      if (selectedCategory?.id) setSelectedCategory(null);
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa danh mục'),
  });

  const onSubmit = (data: AccessoryCategoryCreate) => {
    const payload = { ...data, sortOrder: Number(data.sortOrder) || 0 };
    if (isEdit && selectedCategory) updateMutate(payload);
    else createMutate(payload);
  };

  const handleSort = (field: CategorySortField) => {
    if (sortField === field) setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title={
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-slate-900">Quản lý danh mục phụ kiện</span>
          <span className="text-xs font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            {categories.length} danh mục
          </span>
        </div>
      }
      bodyClassName="p-4 sm:p-6 bg-white min-h-[calc(100vh-65px)] flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-w-0">
          <div className="pb-2.5 mb-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              {isEdit ? 'Chỉnh sửa thông tin danh mục' : 'Thêm danh mục mới'}
            </h3>
            {isEdit && (
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={13} />
                Tạo mới
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
            <Input
              label="Mã danh mục"
              placeholder="VD: BAN_LE, TAY_NAM, KHOA..."
              required
              {...register('code', { required: 'Mã danh mục là bắt buộc' })}
              error={errors.code?.message}
            />
            <Input
              label="Tên danh mục"
              placeholder="VD: Bản lề, Tay nắm cửa..."
              required
              {...register('name', { required: 'Tên danh mục là bắt buộc' })}
              error={errors.name?.message}
            />
            <Input type="number" label="Thứ tự hiển thị" placeholder="0" {...register('sortOrder')} />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Mô tả / Ghi chú</label>
              <textarea
                rows={3}
                placeholder="Thông tin ghi chú về danh mục phụ kiện này..."
                {...register('description')}
                className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition resize-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 pt-1">
              <input type="checkbox" {...register('isActive')} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary" />
              <span className="font-semibold text-sm">Kích hoạt hoạt động danh mục này</span>
            </label>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-2">
              {isEdit && (
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedCategory(null)} disabled={isPending}>
                  Hủy sửa
                </Button>
              )}
              <Button type="submit" variant="primary" loading={isPending} leftIcon={<Save size={15} />} className="px-5 font-semibold text-xs sm:text-sm h-9">
                {isEdit ? 'Lưu thay đổi' : 'Thêm danh mục'}
              </Button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-w-0 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-6 pt-6 lg:pt-0">
          <div className="pb-2.5 mb-4 border-b border-slate-200">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Danh sách danh mục phụ kiện</h3>
          </div>

          <AccessoryCategoryTable
            categories={filteredCategories}
            selectedCategoryId={selectedCategory?.id}
            isLoading={isLoading}
            search={search}
            sortField={sortField}
            sortOrder={sortOrder}
            onSearchChange={setSearch}
            onSort={handleSort}
            onSelect={setSelectedCategory}
            onDelete={(cat) => {
              if (confirm(`Xác nhận xóa danh mục "${cat.name}" (${cat.code})?`)) {
                deleteMutate(cat.id);
              }
            }}
            onAddNew={() => setSelectedCategory(null)}
          />
        </div>
      </div>
    </Modal>
  );
}

