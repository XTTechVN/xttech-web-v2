'use client';

import React from 'react';
import { Package, AlertTriangle, Layers, Sparkles } from 'lucide-react';
import { StatsCard } from '@/components';

interface WarehouseKpiCardsProps {
  totalItems: number;
  lowStockItems: number;
  pendingReceipts: number;
  availableOffcuts: number;
}

export function WarehouseKpiCards({
  totalItems,
  lowStockItems,
  pendingReceipts,
  availableOffcuts,
}: WarehouseKpiCardsProps) {
  const cards = [
    {
      title: 'Mặt hàng trong kho',
      value: totalItems.toLocaleString('vi-VN'),
      icon: <Package />,
    },
    {
      title: 'Cảnh báo thiếu hụt',
      value: lowStockItems.toLocaleString('vi-VN'),
      icon: <AlertTriangle />,
      trend: lowStockItems > 0 ? lowStockItems : undefined,
      trendDirection: 'down' as const,
    },
    {
      title: 'Phiếu chờ duyệt (Giữ chỗ)',
      value: pendingReceipts.toLocaleString('vi-VN'),
      icon: <Layers />,
    },
    {
      title: 'Nhôm thừa tái sử dụng (≥ 1.0m)',
      value: availableOffcuts.toLocaleString('vi-VN'),
      icon: <Sparkles />,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <StatsCard
          key={idx}
          title={card.title}
          value={card.value}
          icon={card.icon}
          trend={card.trend}
          trendDirection={card.trendDirection}
        />
      ))}
    </div>
  );
}
