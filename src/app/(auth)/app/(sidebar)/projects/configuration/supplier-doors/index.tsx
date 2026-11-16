'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Store, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteSupplierDoor, getSupplierDoors } from '@/actions';
import { ConfirmActionModal, Heading, StatsCard } from '@/components';
import type { SupplierDoor } from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { SupplierDoorFormModal, SupplierDoorTable } from './_components';

export default function SupplierDoorsTab() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoor, setEditingDoor] = useState<SupplierDoor | null>(null);
  const [deletingDoor, setDeletingDoor] = useState<SupplierDoor | null>(null);

  const { data: statsData } = useQuery({
    queryKey: ['supplier-doors-stats'],
    queryFn: () => getSupplierDoors({ limit: 500 }),
  });

  const { mutate: handleDelete, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteSupplierDoor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-doors'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-doors-stats'] });
      toast.success('Đã xóa mẫu cửa nhà cung cấp');
      setDeletingDoor(null);
    },
    onError: (err) => showErrorToast(err, 'Không thể xóa mẫu cửa NCC'),
  });

  const allItems = statsData?.items ?? [];
  const activeCount = allItems.filter((item) => item.isActive).length;
  const supplierCount = new Set(allItems.map((item) => item.supplierId)).size;

  const stats = [
    { title: 'Tổng mẫu cửa NCC', value: statsData?.meta.total ?? allItems.length, icon: <Store />, trend: 0, trendDirection: 'up' as const },
    { title: 'Đang sử dụng', value: activeCount, icon: <CheckCircle2 />, trend: 0, trendDirection: 'up' as const },
    { title: 'Nhà cung cấp', value: supplierCount, icon: <Tag />, trend: 0, trendDirection: 'up' as const },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col gap-1">
        <Heading size="h3">Danh mục cửa nhập nguyên bộ (NCC)</Heading>
        <p className="text-xs text-slate-500">
          Quản lý catalog mẫu cửa đặt mua hoàn thiện từ nhà cung cấp kèm đơn giá tham khảo VNĐ/m².
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendDirection={stat.trendDirection}
          />
        ))}
      </div>

      <SupplierDoorTable
        onCreateClick={() => {
          setEditingDoor(null);
          setIsFormOpen(true);
        }}
        onEditClick={(door) => {
          setEditingDoor(door);
          setIsFormOpen(true);
        }}
        onDeleteClick={(door) => setDeletingDoor(door)}
      />

      <SupplierDoorFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDoor(null);
        }}
        initialData={editingDoor}
      />

      <ConfirmActionModal
        isOpen={Boolean(deletingDoor)}
        onClose={() => setDeletingDoor(null)}
        title="Xác nhận xóa mẫu cửa NCC"
        description={
          <span>
            Bạn có chắc muốn xóa mẫu cửa <strong className="text-slate-900">{deletingDoor?.code} — {deletingDoor?.name}</strong>?
          </span>
        }
        warningNote="Nếu mẫu cửa đã gắn vào vị trí dự án, thao tác xóa sẽ bị từ chối hoặc chuyển trạng thái."
        loading={isDeleting}
        onConfirm={() => {
          if (deletingDoor) handleDelete(deletingDoor.id);
        }}
      />
    </div>
  );
}
