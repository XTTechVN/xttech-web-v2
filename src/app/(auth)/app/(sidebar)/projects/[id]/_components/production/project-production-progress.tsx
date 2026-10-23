'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CalendarCheck2, Factory } from 'lucide-react';
import {
  cancelProductionOrder,
  getProductionOrders,
  getProjectPositions,
  getProjectProgressMatrix,
} from '@/actions';
import { Tabs } from '@/components';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import type { ProductionOrder, ProjectProgressMatrix } from '@/types';
import {
  DailyProgressPanel,
  ProductionOrdersPanel,
  ProductionSummaryCards,
} from './components';
import {
  CancelProductionOrderModal,
  CreateProductionOrderModal,
  CuttingPlanModal,
  ProductionSheetsModal,
} from './modals';
import type { ProductionTab } from './types';

interface ProjectProductionProgressProps {
  projectId: number;
}

const PRODUCTION_TABS = [
  { value: 'orders', label: 'Lệnh sản xuất', icon: <Factory size={14} /> },
  { value: 'daily', label: 'Tiến độ hằng ngày', icon: <CalendarCheck2 size={14} /> },
];

export function ProjectProductionProgress({ projectId }: ProjectProductionProgressProps) {
  const [activeTab, setActiveTab] = useState<ProductionTab>('orders');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [cuttingOrder, setCuttingOrder] = useState<ProductionOrder | null>(null);
  const [sheetsOrder, setSheetsOrder] = useState<ProductionOrder | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<ProductionOrder | null>(null);

  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['production_orders', projectId],
    queryFn: () => getProductionOrders(projectId),
    enabled: !!projectId,
  });

  const { data: progressMatrix, isLoading: isLoadingMatrix } = useQuery<ProjectProgressMatrix>({
    queryKey: ['progress_matrix', projectId],
    queryFn: () => getProjectProgressMatrix(projectId),
    enabled: !!projectId,
  });

  const { data: positionsData } = useQuery({
    queryKey: ['project_positions', projectId, 'all'],
    queryFn: () => getProjectPositions(projectId, { limit: 9999 }),
    enabled: !!projectId,
  });

  const { mutate: cancelOrder, isPending: isCancelling } = useMutation({
    mutationFn: ({ orderId, note }: { orderId: number; note?: string }) =>
      cancelProductionOrder(projectId, orderId, note),
    onSuccess: () => {
      [
        'production_orders',
        'progress_matrix',
        'cutting_plan',
        'project_positions',
        'project',
      ].forEach((key) => queryClient.invalidateQueries({ queryKey: [key, projectId] }));
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Đã hủy lệnh sản xuất');
      setCancellingOrder(null);
    },
    onError: (err) => showErrorToast(err, 'Lỗi hủy lệnh'),
  });

  const orders = ordersData?.items ?? [];
  const positions = positionsData?.items ?? [];

  const handleCancel = (order: ProductionOrder) => {
    setCancellingOrder(order);
  };

  return (
    <div className="space-y-5">
      <ProductionSummaryCards matrix={progressMatrix} fallbackTotal={positions.length} />

      <Tabs
        tabs={PRODUCTION_TABS}
        activeTab={activeTab}
        onChange={(value) => setActiveTab(value as ProductionTab)}
        size="sm"
      />

      {activeTab === 'orders' ? (
        <ProductionOrdersPanel
          projectId={projectId}
          orders={orders}
          isLoading={isLoadingOrders}
          onCreate={() => setIsCreateOpen(true)}
          onOpenCutting={setCuttingOrder}
          onOpenSheets={setSheetsOrder}
          onCancel={handleCancel}
        />
      ) : (
        <DailyProgressPanel
          projectId={projectId}
          matrix={progressMatrix}
          positions={positions}
          isLoading={isLoadingMatrix}
        />
      )}

      <CreateProductionOrderModal
        projectId={projectId}
        isOpen={isCreateOpen}
        positions={positions}
        onClose={() => setIsCreateOpen(false)}
      />
      <CuttingPlanModal
        key={cuttingOrder?.id ? `cutting-${cuttingOrder.id}` : 'cutting-modal'}
        projectId={projectId}
        order={cuttingOrder}
        onClose={() => setCuttingOrder(null)}
      />
      <ProductionSheetsModal
        key={sheetsOrder?.id ? `sheets-${sheetsOrder.id}` : 'sheets-modal'}
        projectId={projectId}
        order={sheetsOrder}
        isOpen={!!sheetsOrder}
        onClose={() => setSheetsOrder(null)}
      />
      <CancelProductionOrderModal
        order={cancellingOrder}
        isPending={isCancelling}
        onClose={() => setCancellingOrder(null)}
        onConfirm={(orderId, note) => cancelOrder({ orderId, note })}
      />
    </div>
  );
}
