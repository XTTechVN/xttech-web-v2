'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Modal, Input, Button } from '@/components';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Save,
  RotateCcw,
  FolderTree,
} from 'lucide-react';
import {
  getAccessoryCategories,
  createAccessoryCategory,
  updateAccessoryCategory,
  deleteAccessoryCategory,
} from '@/actions';
import type {
  AccessoryCategory,
  AccessoryCategoryCreate,
  AccessoryCategoryUpdate,
} from '@/types';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';

interface AccessoryCategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SortField = 'sortOrder' | 'code' | 'name' | 'status';
type SortOrder = 'asc' | 'desc';

function SortIcon({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active) {
    return (
      <ArrowUpDown
        size={12}
        className="text-slate-300 group-hover/th:text-slate-500 transition-colors shrink-0"
      />
    );
  }
  return order === 'asc' ? (
    <ArrowUp size={12} className="text-primary font-bold shrink-0" />
  ) : (
    <ArrowDown size={12} className="text-primary font-bold shrink-0" />
  );
}

export function AccessoryCategoryManagerModal({
  isOpen,
  onClose,
}: AccessoryCategoryManagerModalProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AccessoryCategory | null>(null);
  const [sortField, setSortField] = useState<SortField>('sortOrder');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const isEdit = Boolean(selectedCategory);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccessoryCategoryCreate>({
    defaultValues: {
      code: '',
      name: '',
      sortOrder: 0,
      description: '',
      isActive: true,
    },
  });

  // Queries danh sách danh mục
  const { data: response, isLoading } = useQuery({
    queryKey: ['accessory-categories'],
    queryFn: async () => {
      return await getAccessoryCategories({
        limit: 9999,
        offset: 0,
        allowDeleted: false,
      });
    },
    enabled: isOpen,
  });

  const categories = response?.items || [];

  // Reset form khi chọn category hoặc chuyển sang tạo mới
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
      reset({
        code: '',
        name: '',
        sortOrder: categories.length > 0 ? Math.max(...categories.map((c) => c.sortOrder ?? 0)) + 1 : 1,
        description: '',
        isActive: true,
      });
    }
  }, [isOpen, selectedCategory, reset, categories]);

  // Sắp xếp và tìm kiếm danh mục
  const filteredCategories = useMemo(() => {
    let result = [...categories];
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.code.toLowerCase().includes(query) ||
          (c.description && c.description.toLowerCase().includes(query)),
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
        case 'status': {
          const statusA = a.isActive !== false ? 1 : 0;
          const statusB = b.isActive !== false ? 1 : 0;
          comparison = statusA - statusB;
          break;
        }
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [categories, search, sortField, sortOrder]);

  // Mutations
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
    mutationFn: (data: AccessoryCategoryUpdate) =>
      updateAccessoryCategory(selectedCategory!.id, data),
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
      if (selectedCategory?.id) {
        setSelectedCategory(null);
      }
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi xóa danh mục'),
  });

  const onSubmit = (data: AccessoryCategoryCreate) => {
    const payload = {
      ...data,
      sortOrder: Number(data.sortOrder) || 0,
    };

    if (isEdit && selectedCategory) {
      updateMutate(payload);
    } else {
      createMutate(payload);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = (cat: AccessoryCategory) => {
    if (confirm(`Xác nhận xóa danh mục "${cat.name}" (${cat.code})?`)) {
      deleteMutate(cat.id);
    }
  };

  const handleResetToCreate = () => {
    setSelectedCategory(null);
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
      {/* 2 Cột: Bên trái Form nhập liệu, Bên phải Bảng danh mục */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Cột trái: Form Thông tin danh mục */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-w-0">
          <div className="pb-2.5 mb-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              {isEdit ? 'Chỉnh sửa thông tin danh mục' : 'Thêm danh mục mới'}
            </h3>
            {isEdit && (
              <button
                type="button"
                onClick={handleResetToCreate}
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

            <Input
              type="number"
              label="Thứ tự hiển thị"
              placeholder="0"
              {...register('sortOrder')}
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">
                Mô tả / Ghi chú
              </label>
              <textarea
                rows={3}
                placeholder="Thông tin ghi chú về danh mục phụ kiện này..."
                {...register('description')}
                className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition resize-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 pt-1">
              <input
                type="checkbox"
                {...register('isActive')}
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary"
              />
              <span className="font-semibold text-sm">Kích hoạt hoạt động danh mục này</span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-2">
              {isEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetToCreate}
                  disabled={isPending}
                >
                  Hủy sửa
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                loading={isPending}
                leftIcon={<Save size={15} />}
                className="px-5 font-semibold text-xs sm:text-sm h-9"
              >
                {isEdit ? 'Lưu thay đổi' : 'Thêm danh mục'}
              </Button>
            </div>
          </form>
        </div>

        {/* Cột phải: Bảng danh sách danh mục phụ kiện */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-w-0 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-6 pt-6 lg:pt-0">
          <div className="pb-2.5 mb-4 border-b border-slate-200">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Danh sách danh mục phụ kiện
            </h3>
          </div>

          <div className="w-full flex flex-col gap-4">
            {/* Toolbar Tìm kiếm & Thêm mới */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm mã hoặc tên danh mục..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleResetToCreate}
                leftIcon={<Plus size={16} />}
                className="font-semibold text-xs sm:text-sm h-9 px-4 shrink-0"
              >
                Thêm mới
              </Button>
            </div>

            {/* Bảng Danh mục */}
            <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse select-none">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {/* Cột 1: Thứ tự */}
                      <th
                        onClick={() => handleSort('sortOrder')}
                        className="py-3 px-4 w-20 text-center cursor-pointer group/th hover:text-slate-800 transition-colors"
                        title="Sắp xếp theo Thứ tự"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Thứ tự</span>
                          <SortIcon active={sortField === 'sortOrder'} order={sortOrder} />
                        </div>
                      </th>

                      {/* Cột 2: Mã danh mục */}
                      <th
                        onClick={() => handleSort('code')}
                        className="py-3 px-4 w-40 cursor-pointer group/th hover:text-slate-800 transition-colors"
                        title="Sắp xếp theo Mã danh mục"
                      >
                        <div className="flex items-center gap-1">
                          <span>Mã danh mục</span>
                          <SortIcon active={sortField === 'code'} order={sortOrder} />
                        </div>
                      </th>

                      {/* Cột 3: Tên danh mục */}
                      <th
                        onClick={() => handleSort('name')}
                        className="py-3 px-4 min-w-[200px] cursor-pointer group/th hover:text-slate-800 transition-colors"
                        title="Sắp xếp theo Tên danh mục"
                      >
                        <div className="flex items-center gap-1">
                          <span>Tên danh mục</span>
                          <SortIcon active={sortField === 'name'} order={sortOrder} />
                        </div>
                      </th>

                      {/* Cột 4: Mô tả */}
                      <th className="py-3 px-4 min-w-[160px]">Mô tả / Ghi chú</th>

                      {/* Cột 5: Trạng thái */}
                      <th
                        onClick={() => handleSort('status')}
                        className="py-3 px-4 text-center w-28 cursor-pointer group/th hover:text-slate-800 transition-colors"
                        title="Sắp xếp theo Trạng thái"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Trạng thái</span>
                          <SortIcon active={sortField === 'status'} order={sortOrder} />
                        </div>
                      </th>

                      {/* Cột 6: Thao tác */}
                      <th className="py-3 px-4 text-right w-24">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <tr
                          key={idx}
                          className="animate-pulse border-b border-slate-100 last:border-b-0"
                        >
                          <td className="py-4 px-4 text-center">
                            <div className="w-6 h-4 bg-slate-100 rounded mx-auto" />
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 bg-slate-100 rounded w-24" />
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 bg-slate-100 rounded w-36" />
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 bg-slate-100 rounded w-28" />
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="h-5 bg-slate-100 rounded w-16 mx-auto" />
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="h-5 bg-slate-100 rounded w-12 ml-auto" />
                          </td>
                        </tr>
                      ))
                    ) : filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                              <FolderTree size={22} />
                            </div>
                            <p className="text-sm font-semibold text-slate-700">
                              {search
                                ? 'Không tìm thấy danh mục phù hợp'
                                : 'Chưa có danh mục phụ kiện nào'}
                            </p>
                            <p className="text-xs text-slate-400">
                              Sử dụng form bên trái để tạo danh mục phụ kiện đầu tiên.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((cat) => {
                        const isSelected = selectedCategory?.id === cat.id;

                        return (
                          <tr
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat)}
                            className={`hover:bg-slate-50/80 transition-colors group border-b border-slate-100 last:border-b-0 cursor-pointer ${
                              isSelected ? 'bg-primary/5' : ''
                            }`}
                          >
                            {/* Cột 1: Thứ tự */}
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 font-bold text-xs text-slate-600">
                                {cat.sortOrder ?? 0}
                              </span>
                            </td>

                            {/* Cột 2: Mã danh mục */}
                            <td className="py-3 px-4 font-mono font-semibold text-xs text-slate-800">
                              {cat.code}
                            </td>

                            {/* Cột 3: Tên danh mục */}
                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                                {cat.name}
                              </span>
                            </td>

                            {/* Cột 4: Ghi chú */}
                            <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                              {cat.description || '—'}
                            </td>

                            {/* Cột 5: Trạng thái */}
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap ${
                                  cat.isActive !== false
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                {cat.isActive !== false ? 'Hoạt động' : 'Tạm ngưng'}
                              </span>
                            </td>

                            {/* Cột 6: Thao tác */}
                            <td className="py-3 px-4 text-right">
                              <div
                                className="flex items-center justify-end gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => setSelectedCategory(cat)}
                                  className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
                                  title="Chỉnh sửa danh mục"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(cat)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                  title="Xóa danh mục"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
