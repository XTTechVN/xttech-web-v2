'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FileSpreadsheet,
  Send,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button, Select } from '@/components';
import { GlassOrder, WarehouseSupplier } from '@/types';
import {
  getProjects,
  getProjectGlassOrders,
  getProjectGlassOrderDetail,
  sendGlassOrderToSupplier,
  receiveGlassOrderDelivery,
} from '@/actions';
import { showErrorToast } from '@/utils';
import { GLASS_ORDER_STATUS_MAP } from '../_utils/glass-mapping';
import { GlassOrderGenerateModal } from './modals/glass-order-generate-modal';
import { GlassPanesDetailTable } from './glass-panes-detail-table';

interface GlassOrdersTabProps {
  suppliers: WarehouseSupplier[];
}

export function GlassOrdersTab({ suppliers }: GlassOrdersTabProps) {
  const [projects, setProjects] = useState<Array<{ id: number; name: string; code?: string }>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>();
  const [glassOrders, setGlassOrders] = useState<GlassOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [activeOrderDetail, setActiveOrderDetail] = useState<GlassOrder | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const glassSuppliers = suppliers.filter((s) => s.supplierType === 'glass');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjects({ limit: 50 });
        const list = res?.items || [];
        setProjects(list.map((p) => ({ id: p.id, name: p.name, code: p.code })));
        if (list.length > 0 && !selectedProjectId) {
          setSelectedProjectId(list[0].id);
        }
      } catch (err: unknown) {
        showErrorToast(err, 'Lỗi tải danh sách dự án');
      }
    };
    fetchProjects();
  }, []);

  const fetchOrders = async (projId: number) => {
    setLoading(true);
    try {
      const res = await getProjectGlassOrders(projId);
      setGlassOrders(res?.items || []);
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi tải danh sách đơn đặt kính');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchOrders(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleToggleExpand = async (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      setActiveOrderDetail(null);
      return;
    }
    setExpandedOrderId(orderId);
    if (!selectedProjectId) return;
    try {
      const detail = await getProjectGlassOrderDetail(selectedProjectId, orderId);
      setActiveOrderDetail(detail);
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi tải chi tiết đơn đặt kính');
    }
  };

  const handleSendToSupplier = async (orderId: number) => {
    if (!selectedProjectId) return;
    try {
      await sendGlassOrderToSupplier(selectedProjectId, orderId);
      toast.success('Đã chuyển đơn đặt kính sang trạng thái gửi nhà máy!');
      fetchOrders(selectedProjectId);
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi gửi đơn cho nhà máy');
    }
  };

  const handleReceiveDelivery = async (orderId: number) => {
    if (!selectedProjectId) return;
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      await receiveGlassOrderDelivery(selectedProjectId, orderId, {
        actualDeliveryDate: todayDate,
        note: 'Đã nhận kính nguyên vẹn tại xưởng',
      });
      toast.success('Xác nhận nhận kính về xưởng thành công!');
      fetchOrders(selectedProjectId);
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi nhận bàn giao kính');
    }
  };

  return (
    <div className="space-y-4">
      {/* Project selector & Actions bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-1 items-center gap-3">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider shrink-0">
            Dự Án:
          </label>
          <div className="w-full sm:w-80">
            <Select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              options={projects.map((p) => ({
                value: p.id,
                label: `${p.code ? `[${p.code}] ` : ''}${p.name}`,
              }))}
              className="text-xs"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedProjectId && fetchOrders(selectedProjectId)}
            leftIcon={<RefreshCw size={13} className={loading ? 'animate-spin' : ''} />}
            className="text-xs"
          >
            Làm mới
          </Button>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowGenerateModal(true)}
          disabled={!selectedProjectId}
          leftIcon={<Plus size={14} />}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 shrink-0"
        >
          Bóc Tách & Lập Đơn Đặt Kính
        </Button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3 w-32">Mã Đơn Đặt Kính</th>
                <th className="p-3">Nhà Máy Tôi Kính</th>
                <th className="p-3 text-center">Số Tấm</th>
                <th className="p-3 text-right">Tổng Diện Tích (m²)</th>
                <th className="p-3 text-right">Tổng Tiền (đ)</th>
                <th className="p-3 text-center">Trạng Thái</th>
                <th className="p-3">Ngày Lập</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Đang tải đơn đặt kính...
                  </td>
                </tr>
              ) : glassOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Chưa có đơn đặt kính nào cho dự án này.
                  </td>
                </tr>
              ) : (
                glassOrders.map((order) => {
                  const statusConf = GLASS_ORDER_STATUS_MAP[order.status] || {
                    label: order.status,
                    bg: 'bg-slate-100',
                    text: 'text-slate-700',
                  };
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {order.code}
                        </td>
                        <td className="p-3 font-medium text-slate-800">
                          {order.supplierName || `Nhà máy #${order.supplierId}`}
                        </td>
                        <td className="p-3 text-center font-bold text-indigo-700">
                          {order.totalPanes} tấm
                        </td>
                        <td className="p-3 text-right font-medium text-slate-800">
                          {order.totalAreaM2.toFixed(3)} m²
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          {order.totalAmount.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusConf.bg} ${statusConf.text}`}
                          >
                            {statusConf.label}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleExpand(order.id)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                              title="Xem danh sách tấm kính"
                            >
                              {isExpanded ? <ChevronUp size={15} /> : <Eye size={15} />}
                            </button>

                            {order.status === 'draft' && (
                              <button
                                type="button"
                                onClick={() => handleSendToSupplier(order.id)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1"
                              >
                                <Send size={12} />
                                Gửi nhà máy
                              </button>
                            )}

                            {order.status === 'ordered' && (
                              <button
                                type="button"
                                onClick={() => handleReceiveDelivery(order.id)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors flex items-center gap-1"
                              >
                                <CheckCircle2 size={12} />
                                Nhận hàng
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Pane items detail */}
                      {isExpanded && activeOrderDetail && (
                        <tr>
                          <td colSpan={8} className="p-4 bg-slate-50/90 border-t border-b border-slate-200">
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

      {/* Generate Order Modal */}
      <GlassOrderGenerateModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        projectId={selectedProjectId}
        glassSuppliers={glassSuppliers}
        onSuccess={() => selectedProjectId && fetchOrders(selectedProjectId)}
      />
    </div>
  );
}
