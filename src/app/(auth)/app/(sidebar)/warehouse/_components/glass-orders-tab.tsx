'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, RefreshCw } from 'lucide-react';
import { getProjectGlassOrders, getProjects } from '@/actions';
import { GlassOrderGenerateModal, GlassOrdersTable } from '@/components/warehouse';
import { Button, Select } from '@/components-remake';
import { useCan } from '@/hooks';
import type { WarehouseSupplier } from '@/types';

interface Props {
  suppliers: WarehouseSupplier[];
}

// Đơn đặt kính theo dự án. Bảng đơn và hộp thoại bóc tách dùng chung với trang sản xuất của dự án nên giữ nguyên.
export function GlassOrdersTab({ suppliers }: Props) {
  const { can } = useCan();
  const [selected, setSelected] = useState('');
  const [generating, setGenerating] = useState(false);

  const projects = useQuery({
    queryKey: ['warehouse', 'glass-projects'],
    queryFn: () => getProjects({ limit: 100 }),
    enabled: can('project:read'),
    staleTime: 5 * 60 * 1000,
  });
  const list = projects.data?.items ?? [];
  const projectId = Number(selected || list[0]?.id) || undefined;

  const orders = useQuery({
    queryKey: ['warehouse', 'glass-orders', projectId],
    queryFn: () => getProjectGlassOrders(projectId!),
    enabled: !!projectId,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1 md:max-w-md">
          <Select
            label="Dự án"
            value={String(projectId ?? '')}
            options={list.map((p) => ({ value: String(p.id), label: p.name, hint: p.code }))}
            onChange={setSelected}
            loading={projects.isLoading}
            placeholder={can('project:read') ? 'Chưa có dự án' : 'Cần quyền xem dự án'}
          />
        </div>
        <div className="ml-auto flex flex-none items-center gap-2">
          <Button
            variant="outline"
            icon={<RefreshCw size={16} className={orders.isFetching ? 'animate-spin' : ''} />}
            iconOnly="mobile"
            disabled={!projectId}
            onClick={() => orders.refetch()}
          >
            Làm mới
          </Button>
          {can('glass_order:create') && (
            <Button icon={<Plus size={18} />} iconOnly="mobile" disabled={!projectId} onClick={() => setGenerating(true)}>
              Lập đơn đặt kính
            </Button>
          )}
        </div>
      </div>

      <GlassOrdersTable
        key={projectId ?? 'none'}
        projectId={projectId}
        orders={orders.data?.items ?? []}
        loading={orders.isLoading}
        onRefresh={() => orders.refetch()}
      />

      <GlassOrderGenerateModal
        isOpen={generating}
        onClose={() => setGenerating(false)}
        projectId={projectId}
        glassSuppliers={suppliers.filter((s) => s.supplierType === 'glass')}
        onSuccess={() => orders.refetch()}
      />
    </div>
  );
}
