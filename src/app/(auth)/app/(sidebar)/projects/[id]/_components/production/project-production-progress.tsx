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
import { CreateProductionOrderModal } from './create-production-order-modal';
import { CuttingPlanModal } from './cutting-plan-modal';
import { DailyProgressPanel } from './daily-progress-panel';
import { ProductionOrdersPanel } from './production-orders-panel';
import { ProductionSheetsModal } from './production-sheets-modal';
import { ProductionSummaryCards } from './production-summary-cards';

interface ProjectProductionProgressProps {
  projectId: number;
}

type ProductionTab = 'orders' | 'daily';

const PRODUCTION_TABS = [
  { value: 'orders', label: 'Lệnh sản xuất', icon: <Factory size={14} /> },
  { value: 'daily', label: 'Tiến độ hằng ngày', icon: <CalendarCheck2 size={14} /> },
];

export function ProjectProductionProgress({ projectId }: ProjectProductionProgressProps) {
  const [activeTab, setActiveTab] = useState<ProductionTab>('orders');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [cuttingOrder, setCuttingOrder] = useState<ProductionOrder | null>(null);
  const [sheetsOrder, setSheetsOrder] = useState<ProductionOrder | null>(null);

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
    queryFn: () => getProjectPositions(projectId, { limit: 100 }),
    enabled: !!projectId,
  });

  const { mutate: cancelOrder } = useMutation({
    mutationFn: (orderId: number) => cancelProductionOrder(projectId, orderId),
    onSuccess: () => {
      ['production_orders', 'progress_matrix', 'cutting_plan'].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key, projectId] }),
      );
      toast.success('Đã hủy lệnh sản xuất');
    },
    onError: (err) => showErrorToast(err, 'Lỗi hủy lệnh'),
  });

  const orders = ordersData?.items ?? [];
  const positions = positionsData?.items ?? [];

  const handleCancel = (order: ProductionOrder) => {
    if (confirm(`Hủy lệnh sản xuất ${order.code}?`)) cancelOrder(order.id);
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
    </div>
  );
}
