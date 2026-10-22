'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, ShoppingCart } from 'lucide-react';
import { getWarehouseItems, getWarehouseSuppliers } from '@/actions';
import { Button } from '@/components';
import queryClient from '@/utils/query';
import type { ShortageItemDetail } from '@/types';
import { ReceiptFormModal } from '../../../../../warehouse/_components/modals';
import {
  buildShortagePurchaseItems,
  getPurchasableShortages,
} from '../../../../../warehouse/_utils/shortage-purchase';
import { toDisplayUnit } from '../../../../../warehouse/_utils/unit-mapping';

interface CuttingShortagePanelProps {
  projectId: number;
  orderId: number;
  shortages: ShortageItemDetail[];
  isLoading: boolean;
  onOpenReceipt?: () => void;
}

// Giống Kho: liệt kê vật tư thiếu / chưa khai báo và cho lập phiếu mua bù ngay tại đây
export function CuttingShortagePanel({
  projectId,
  orderId,
  shortages,
  isLoading,
  onOpenReceipt,
}: CuttingShortagePanelProps) {
  const [internalReceiptOpen, setInternalReceiptOpen] = useState(false);
  const isReceiptOpen = onOpenReceipt ? false : internalReceiptOpen;

  const { data: itemsData } = useQuery({
    queryKey: ['warehouse_items_for_receipt'],
    queryFn: () => getWarehouseItems({ limit: 200 }),
    enabled: isReceiptOpen,
  });
  const { data: suppliersData } = useQuery({
    queryKey: ['warehouse_suppliers_for_receipt'],
    queryFn: () => getWarehouseSuppliers({ limit: 100 }),
    enabled: isReceiptOpen,
  });

  if (isLoading) return <p className="text-[11px] text-slate-400">Đang kiểm tra tồn kho...</p>;

  if (shortages.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
        <CheckCircle2 size={14} /> Kho đủ vật tư cho lệnh này, có thể tạo phiếu xuất kho.
      </div>
    );
  }

  const purchasableCount = getPurchasableShortages(shortages).length;
  const hasUnconfigured = purchasableCount < shortages.length;

  return (
    <div className="space-y-2 rounded-lg border border-red-200 bg-red-50/60 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold text-red-800">
          <AlertTriangle size={14} /> Thiếu hụt / chưa khai báo {shortages.length} mặt hàng vật tư
        </span>
        <Button
          variant="primary"
          size="sm"
          disabled={purchasableCount === 0}
          leftIcon={<ShoppingCart size={14} />}
          className="bg-red-600 text-white hover:bg-red-700"
          onClick={() => (onOpenReceipt ? onOpenReceipt() : setInternalReceiptOpen(true))}
        >
          Lập Phiếu Mua Bù
        </Button>
      </div>

      <ul className="max-h-32 space-y-1 overflow-y-auto text-[11px] text-slate-700">
        {shortages.map((item) => (
          <li
            key={`${item.itemCode}-${item.colorId ?? ''}`}
            className="flex items-center justify-between gap-2"
          >
            <span className="min-w-0 truncate">
              <span className="font-mono font-semibold">{item.itemCode}</span> - {item.itemName}
              {item.colorName ? ` (${item.colorName})` : ''}
              {!item.itemId && item.isConfigured !== false && (
                <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                  Chưa khai báo trong kho
                </span>
              )}
              {item.isConfigured === false && (
                <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                  Chưa gán profile
                </span>
              )}
            </span>
            <span className="shrink-0 font-mono font-bold text-red-600">
              +{item.shortageQty.toLocaleString('vi-VN')} {toDisplayUnit(item.unit)}
            </span>
          </li>
        ))}
      </ul>

      {hasUnconfigured && (
        <p className="text-[11px] text-amber-700">
          Thanh nhôm chưa gán profile không thể lập phiếu mua. Hãy hoàn tất cấu hình profile trong
          Door Studio.
        </p>
      )}

      <ReceiptFormModal
        isOpen={isReceiptOpen}
        onClose={() => setInternalReceiptOpen(false)}
        onSuccess={() => {
          setInternalReceiptOpen(false);
          queryClient.invalidateQueries({ queryKey: ['order_shortage', projectId, orderId] });
        }}
        itemsList={itemsData?.items ?? []}
        suppliersList={suppliersData?.items ?? []}
        initialItems={buildShortagePurchaseItems(shortages, `#${projectId}`)}
      />
    </div>
  );
}

