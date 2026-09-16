'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Modal, Button, Input } from '@/components';
import {
  getAccessoryCategories,
  createAccessoryCategory,
  updateAccessoryCategory,
  deleteAccessoryCategory,
} from '@/actions';
import type { AccessoryCategory, AccessoryCategoryCreate } from '@/types';
import queryClient from '@/utils/query';

interface AccessoryCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessCreated?: (newCategory: AccessoryCategory) => void;
}

export function AccessoryCategoryModal({ isOpen, onClose, onSuccessCreated }: AccessoryCategoryModalProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccessoryCategoryCreate>();

  // Lấy danh sách loại phụ kiện
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ['accessory-categories'],
    queryFn: async () => {
      const res = await getAccessoryCategories({ limit: 9999 });
      return res.items;
    },
    enabled: isOpen,
  });

  // Tạo mới loại phụ kiện
  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: (data: AccessoryCategoryCreate) => createAccessoryCategory(data),
    onSuccess: (newCat: AccessoryCategory) => {
      queryClient.invalidateQueries({ queryKey: ['accessory-categories'] });
      toast.success('Thêm loại phụ kiện thành công');
      reset();
      onSuccessCreated?.(newCat);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Lỗi khi thêm loại phụ kiện');
    },
  });

  // Cập nhật loại phụ kiện
  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { code?: string; name?: string } }) =>
      updateAccessoryCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessory-categories'] });
      toast.success('Cập nhật thành công');
      setEditingId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Lỗi khi cập nhật loại phụ kiện');
    },
  });

  // Xóa loại phụ kiện
  const { mutate: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteAccessoryCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessory-categories'] });
      toast.success('Xóa loại phụ kiện thành công');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Lỗi khi xóa loại phụ kiện');
    },
  });

  const onSubmitCreate = (data: AccessoryCategoryCreate) => {
    createMutation(data);
  };

  const handleStartEdit = (cat: AccessoryCategory) => {
    setEditingId(cat.id);
    setEditCode(cat.code);
    setEditName(cat.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditCode('');
    setEditName('');
  };

  const handleSaveEdit = (id: number) => {
    if (!editName.trim()) {
      toast.error('Tên loại không được để trống');
      return;
    }
    updateMutation({
      id,
      data: {
        code: editCode.trim() || undefined,
        name: editName.trim(),
      },
    });
  };

  const handleDelete = (cat: AccessoryCategory) => {
    if (confirm(`Bạn có chắc muốn xóa loại phụ kiện "${cat.name}"?`)) {
      deleteMutation(cat.id);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quản lý loại phụ kiện"
      className="m-2 max-w-lg w-full"
    >
      <div className="flex flex-col space-y-5">
        {/* Form thêm mới */}
        <form onSubmit={handleSubmit(onSubmitCreate)} className="flex flex-col space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4">
              <Input
                label="Mã loại *"
                placeholder="VD: BAN_LE"
                fullWidth
                {...register('code', { required: true })}
                error={errors.code ? 'Vui lòng nhập mã' : undefined}
              />
            </div>
            <div className="sm:col-span-5">
              <Input
                label="Tên loại *"
                placeholder="VD: Bản lề"
                fullWidth
                {...register('name', { required: true })}
                error={errors.name ? 'Vui lòng nhập tên' : undefined}
              />
            </div>
            <div className="sm:col-span-3">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isCreating}
                disabled={isCreating}
                className="h-10 text-sm"
              >
                Thêm loại
              </Button>
            </div>
          </div>
        </form>

        {/* Danh sách loại phụ kiện */}
        <div className="flex flex-col space-y-2">
          <span className="text-xs font-semibold text-gray-500">
            Danh sách ({categoryData?.length || 0})
          </span>

          <div className="max-h-[280px] overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-lg bg-white">
            {isLoading ? (
              <div className="py-8 text-center text-sm text-gray-400">Đang tải danh sách...</div>
            ) : !categoryData || categoryData.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">Chưa có loại phụ kiện nào</div>
            ) : (
              categoryData.map((cat) => {
                const isEditingThis = editingId === cat.id;

                if (isEditingThis) {
                  return (
                    <div key={cat.id} className="p-2.5 flex items-center gap-2 bg-gray-50">
                      <input
                        type="text"
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                        placeholder="Mã"
                        className="w-1/3 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-hidden focus:border-primary"
                      />
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Tên loại"
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-hidden focus:border-primary"
                      />
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleSaveEdit(cat.id)}
                        loading={isUpdating}
                        className="px-2.5 py-1 text-xs"
                      >
                        Lưu
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        className="px-2.5 py-1 text-xs"
                      >
                        Hủy
                      </Button>
                    </div>
                  );
                }

                return (
                  <div
                    key={cat.id}
                    className="px-3.5 py-2.5 flex items-center justify-between hover:bg-gray-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-semibold text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 shrink-0">
                        {cat.code}
                      </span>
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        className="px-2 py-1 text-xs text-primary font-medium hover:bg-primary/5 rounded transition-colors cursor-pointer"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        disabled={isDeleting}
                        className="px-2 py-1 text-xs text-red-600 font-medium hover:bg-red-50 rounded transition-colors cursor-pointer"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer đồng bộ */}
        <div className="flex justify-end pt-3 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={onClose} className="px-5">
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
