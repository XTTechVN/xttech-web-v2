'use client';

import React from 'react';
import { SupplierGlassOrderSummary } from '@/types';
import { GLASS_ORDER_STATUS_MAP } from '@/config';

interface SupplierGlassOrdersTableProps {
  orders: SupplierGlassOrderSummary[];
}

export function SupplierGlassOrdersTable({ orders }: SupplierGlassOrdersTableProps) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <table className="w-full text-left text-xs text-slate-600">
        <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
          <tr>
            <th className="p-2.5 w-28">Mã Đơn Kính</th>
            <th className="p-2.5">Công Trình / Dự Án</th>
            <th className="p-2.5 text-center">Số Tấm</th>
            <th className="p-2.5 text-right">Tổng Tiền</th>
            <th className="p-2.5 text-center">Hạn Giao Kính</th>
            <th className="p-2.5 text-center">Trạng Thái</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-6 text-center text-slate-400">
                Chưa phát sinh đơn đặt kính nào gửi tới nhà máy này.
              </td>
            </tr>
          ) : (
            orders.map((order) => {
              const statusConf = GLASS_ORDER_STATUS_MAP[order.status] || {
                label: order.status,
                bg: 'bg-slate-100',
                text: 'text-slate-600',
              };
              return (
                <tr key={order.id} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-mono font-bold text-slate-900">{order.code}</td>
                  <td className="p-2.5 font-medium text-slate-800">{order.projectName || '-'}</td>
                  <td className="p-2.5 text-center font-bold text-indigo-600">{order.totalPanes} tấm</td>
                  <td className="p-2.5 text-right font-semibold text-slate-900">
                    {order.totalAmount.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-2.5 text-center text-slate-500">
                    {order.expectedDate
                      ? new Date(order.expectedDate).toLocaleDateString('vi-VN')
                      : '-'}
                  </td>
                  <td className="p-2.5 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusConf.bg} ${statusConf.text}`}
                    >
                      {statusConf.label}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
