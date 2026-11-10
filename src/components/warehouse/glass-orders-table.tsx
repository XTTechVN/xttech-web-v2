'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  CheckCircle2, ChevronUp, Eye, FileCode2, FileSpreadsheet, Loader2, Printer, Send,
} from 'lucide-react';
import {
  getProjectGlassOrderDetail, receiveGlassOrderDelivery, sendGlassOrderToSupplier,
} from '@/actions';
import { GLASS_ORDER_STATUS_MAP } from '@/config/warehouse';
import { GlassOrder } from '@/types';
import {
  exportGlassOrderToDxf, exportGlassOrderToExcel, printGlassOrderHtml, showErrorToast,
} from '@/utils';
import { GlassPanesDetailTable } from './glass-panes-detail-table';

export interface GlassOrdersTableProps {
  projectId?: number;
  orders: GlassOrder[];
  loading: boolean;
  onRefresh: () => void;
}

export function GlassOrdersTable({ projectId, orders, loading, onRefresh }: GlassOrdersTableProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [activeOrderDetail, setActiveOrderDetail] = useState<GlassOrder | null>(null);
  const [exportingExcelId, setExportingExcelId] = useState<number | null>(null);

  const resolveProjId = (order: GlassOrder): number | undefined => projectId ?? order.projectId;

  const handleToggleExpand = async (order: GlassOrder) => {
    const targetProjId = resolveProjId(order);
    if (expandedOrderId === order.id) {
      setExpandedOrderId(null);
      setActiveOrderDetail(null);
      return;
    }
    setExpandedOrderId(order.id);
    if (!targetProjId) return;
    try {
      setActiveOrderDetail(await getProjectGlassOrderDetail(targetProjId, order.id));
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi tải chi tiết đơn đặt kính');
    }
  };

  const handleSendToSupplier = async (order: GlassOrder) => {
    const targetProjId = resolveProjId(order);
    if (!targetProjId) return;
    try {
      await sendGlassOrderToSupplier(targetProjId, order.id);
      toast.success('Đã chuyển đơn đặt kính sang trạng thái gửi nhà máy!');
      onRefresh();
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi gửi đơn cho nhà máy');
    }
  };

  const handleReceiveDelivery = async (order: GlassOrder) => {
    const targetProjId = resolveProjId(order);
    if (!targetProjId) return;
    try {
      await receiveGlassOrderDelivery(targetProjId, order.id, {
        actualDeliveryDate: new Date().toISOString().split('T')[0],
        note: 'Đã nhận kính nguyên vẹn tại xưởng',
      });
      toast.success('Xác nhận nhận kính về xưởng thành công!');
      onRefresh();
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi nhận bàn giao kính');
    }
  };

  const handleExportCad = async (order: GlassOrder) => {
    const targetProjId = resolveProjId(order);
    if (!targetProjId) return;
    try {
      exportGlassOrderToDxf(await getProjectGlassOrderDetail(targetProjId, order.id));
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi xuất bản vẽ AutoCAD (.dxf)');
    }
  };

  const handleExportExcel = async (order: GlassOrder) => {
    const targetProjId = resolveProjId(order);
    if (!targetProjId || exportingExcelId !== null) return;
    setExportingExcelId(order.id);
    try {
      const fullOrder = await getProjectGlassOrderDetail(targetProjId, order.id);
      await exportGlassOrderToExcel(fullOrder);
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi xuất file Excel đơn kính');
    } finally {
      setExportingExcelId(null);
    }
  };

  const handlePrintOrder = async (order: GlassOrder) => {
    const targetProjId = resolveProjId(order);
    if (!targetProjId) return;
    try {
      printGlassOrderHtml(await getProjectGlassOrderDetail(targetProjId, order.id));
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi tạo bản in đơn kính');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3 w-36">Mã Đơn Đặt Kính</th>
              <th className="p-3 text-right">Số Tấm</th>
              <th className="p-3 text-right">Tổng Diện Tích (m²)</th>
              <th className="p-3 text-center">Trạng Thái</th>
              <th className="p-3">Ngày Lập</th>
              <th className="p-3 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">Đang tải danh sách đơn đặt kính...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">Chưa có đơn đặt kính nào cho dự án này.</td>
              </tr>
            ) : (
              orders.map((order) => {
                const statusConf = GLASS_ORDER_STATUS_MAP[order.status] || {
                  label: order.status, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200', bg: 'bg-slate-100', text: 'text-slate-700',
                };
                const isExpanded = expandedOrderId === order.id;
                const isExportingThis = exportingExcelId === order.id;

                return (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">{order.code}</td>
                      <td className="p-3 text-right font-mono tabular-nums font-bold text-primary">{order.totalPanes} tấm</td>
                      <td className="p-3 text-right font-mono tabular-nums font-semibold text-slate-800">{order.totalAreaM2.toFixed(3)} m²</td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusConf.badgeClass}`}>
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button type="button" onClick={() => handleExportCad(order)} className="px-2 py-1 text-[11px] font-bold text-primary bg-primary/5 hover:bg-primary/15 border border-primary/20 rounded-md transition-colors inline-flex items-center gap-1" title="Xuất bản vẽ AutoCAD (.dxf) tỉ lệ 1:1">
                            <FileCode2 size={14} /><span>CAD</span>
                          </button>
                          <button type="button" onClick={() => handleExportExcel(order)} disabled={exportingExcelId !== null} className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors inline-flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed" title="Xuất file Excel 2 Sheet kèm bản vẽ CAD cửa & tấm kính">
                            {isExportingThis ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
                            <span>{isExportingThis ? 'Đang xuất...' : 'Excel'}</span>
                          </button>
                          <button type="button" onClick={() => handlePrintOrder(order)} className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors" title="In đơn đặt kính">
                            <Printer size={15} />
                          </button>
                          <button type="button" onClick={() => handleToggleExpand(order)} className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Xem danh sách tấm kính">
                            {isExpanded ? <ChevronUp size={15} /> : <Eye size={15} />}
                          </button>
                          {order.status === 'draft' && (
                            <button type="button" onClick={() => handleSendToSupplier(order)} className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1">
                              <Send size={12} />Gửi nhà máy
                            </button>
                          )}
                          {order.status === 'ordered' && (
                            <button type="button" onClick={() => handleReceiveDelivery(order)} className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors flex items-center gap-1">
                              <CheckCircle2 size={12} />Nhận hàng
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && activeOrderDetail && activeOrderDetail.id === order.id && (
                      <tr>
                        <td colSpan={6} className="p-4 bg-slate-50/90 border-t border-b border-slate-200">
                          <GlassPanesDetailTable items={activeOrderDetail.items || []} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
