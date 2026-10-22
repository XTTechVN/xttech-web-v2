'use client';

import React from 'react';
import { Factory, FileText, Plus, Printer, Scissors, XCircle } from 'lucide-react';
import { Badge, Button } from '@/components';
import type { ProductionOrder } from '@/types';
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from './production-labels';

interface ProductionOrdersPanelProps {
  projectId: number;
  orders: ProductionOrder[];
  isLoading: boolean;
  onCreate: () => void;
  onOpenCutting: (order: ProductionOrder) => void;
  onOpenKcs?: (order: ProductionOrder) => void;
  onOpenSheets: (order: ProductionOrder) => void;
  onCancel: (order: ProductionOrder) => void;
}

const formatDate = (value?: string | null): string =>
  value ? new Date(value).toLocaleDateString('vi-VN') : '—';

export function ProductionOrdersPanel({
  orders,
  isLoading,
  onCreate,
  onOpenCutting,
  onOpenSheets,
  onCancel,
}: ProductionOrdersPanelProps) {
  return (
    <div className="space-y-4 rounded-lg border border-slate-200/60 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Factory size={15} className="text-primary" /> Lệnh sản xuất ({orders.length})
          </h3>
          <span className="mt-0.5 block text-[11px] text-slate-400">
            Gom cửa đã đo thực tế theo đợt, tối ưu thanh cắt, lập phiếu xuất kho và in thẻ cắt A4
          </span>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={onCreate}
          className="h-8 text-xs font-semibold"
        >
          Lập Lệnh sản xuất mới
        </Button>
      </div>

      {isLoading ? (
        <p className="py-6 text-center text-xs text-slate-400">Đang tải lệnh sản xuất...</p>
      ) : orders.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">Chưa có lệnh sản xuất nào được kích hoạt.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
                <th className="px-3 py-2.5">Mã Lệnh</th>
                <th className="px-3 py-2.5">Tên đợt</th>
                <th className="px-3 py-2.5">Số cửa</th>
                <th className="px-3 py-2.5">Tiến độ xưởng</th>
                <th className="px-3 py-2.5">Thời hạn</th>
                <th className="px-3 py-2.5">Trạng thái</th>
                <th className="px-3 py-2.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {orders.map((order) => {
                const isOpen = order.status !== 'completed' && order.status !== 'cancelled';
                return (
                  <tr key={order.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-3 py-3 font-mono font-bold text-primary">{order.code}</td>
                    <td className="px-3 py-3 font-medium text-slate-800">{order.name}</td>
                    <td className="px-3 py-3 font-semibold text-slate-600">
                      {order.completedItems} / {order.totalItems} bộ
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-700">
                          {(order.progressPercent ?? 0).toFixed(0)}%
                        </span>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${order.progressPercent ?? 0}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[11px] text-slate-500">
                      {formatDate(order.startDate)} ➔ {formatDate(order.dueDate)}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={ORDER_STATUS_VARIANT[order.status]} size="sm">
                        {ORDER_STATUS_LABEL[order.status]}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {order.status !== 'cancelled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Scissors size={12} />}
                            className="h-7 px-2 text-[11px]"
                            onClick={() => onOpenCutting(order)}
                          >
                            Thanh cắt
                          </Button>
                        )}
                        {order.status !== 'cancelled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<FileText size={12} />}
                            className="h-7 px-2 text-[11px]"
                            onClick={() => onOpenSheets(order)}
                          >
                            Chi tiết
                          </Button>
                        )}
                        <button
                          type="button"
                          title="In Thẻ cắt & Lắp ráp A4"
                          onClick={() => onOpenSheets(order)}
                          className="cursor-pointer rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary"
                        >
                          <Printer size={14} />
                        </button>
                        {isOpen && (
                          <button
                            type="button"
                            title="Hủy lệnh"
                            onClick={() => onCancel(order)}
                            className="cursor-pointer rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
