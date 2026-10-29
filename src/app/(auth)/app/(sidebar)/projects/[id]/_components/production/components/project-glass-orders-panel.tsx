'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FileSpreadsheet,
  Send,
  CheckCircle2,
  RefreshCw,
  Plus,
  Eye,
  ChevronUp,
  Printer,
  Boxes,
} from 'lucide-react';
import { Button } from '@/components';
import { GlassOrder, WarehouseSupplier } from '@/types';
import {
  getProjectGlassOrders,
  getProjectGlassOrderDetail,
  sendGlassOrderToSupplier,
  receiveGlassOrderDelivery,
  getWarehouseSuppliers,
} from '@/actions';
import { showErrorToast } from '@/utils';
import { GLASS_ORDER_STATUS_MAP, GRIND_LABEL_MAP } from '@/app/(auth)/app/(sidebar)/warehouse/_utils/glass-mapping';
import { GlassOrderGenerateModal } from '@/app/(auth)/app/(sidebar)/warehouse/_components/modals/glass-order-generate-modal';
import { GlassPanesDetailTable } from '@/app/(auth)/app/(sidebar)/warehouse/_components/glass-panes-detail-table';

interface ProjectGlassOrdersPanelProps {
  projectId: number;
}

export function ProjectGlassOrdersPanel({ projectId }: ProjectGlassOrdersPanelProps) {
  const [glassOrders, setGlassOrders] = useState<GlassOrder[]>([]);
  const [suppliers, setSuppliers] = useState<WarehouseSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [activeOrderDetail, setActiveOrderDetail] = useState<GlassOrder | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const fetchSuppliers = async () => {
    try {
      const res = await getWarehouseSuppliers({ limit: 100 });
      setSuppliers(res?.items || []);
    } catch {
      // Ignore supplier loading errors
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getProjectGlassOrders(projectId);
      setGlassOrders(res?.items || []);
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi tải danh sách đơn đặt kính');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchOrders();
      fetchSuppliers();
    }
  }, [projectId]);

  const handleToggleExpand = async (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      setActiveOrderDetail(null);
      return;
    }
    setExpandedOrderId(orderId);
    try {
      const detail = await getProjectGlassOrderDetail(projectId, orderId);
      setActiveOrderDetail(detail);
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi tải chi tiết đơn đặt kính');
    }
  };

  const handleSendToSupplier = async (orderId: number) => {
    try {
      await sendGlassOrderToSupplier(projectId, orderId);
      toast.success('Đã chuyển đơn đặt kính sang trạng thái gửi nhà máy!');
      fetchOrders();
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi gửi đơn cho nhà máy');
    }
  };

  const handleReceiveDelivery = async (orderId: number) => {
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      await receiveGlassOrderDelivery(projectId, orderId, {
        actualDeliveryDate: todayDate,
        note: 'Đã nhận kính nguyên vẹn tại xưởng',
      });
      toast.success('Xác nhận nhận kính về xưởng thành công!');
      fetchOrders();
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi nhận bàn giao kính');
    }
  };

  const handleExportExcel = async (order: GlassOrder) => {
    try {
      const fullOrder = await getProjectGlassOrderDetail(projectId, order.id);
      const items = fullOrder.items || [];
      if (items.length === 0) {
        toast.error('Đơn hàng không có ô kính nào để xuất!');
        return;
      }

      const XLSX = await import('xlsx');
      const rows = [
        ['ĐƠN ĐẶT KÍNH TÔI GIA CÔNG NHÀ MÁY'],
        [`Mã đơn: ${fullOrder.code}`, `Dự án: ${fullOrder.projectName || ''}`],
        [
          `Ngày lập: ${new Date(fullOrder.createdAt).toLocaleDateString('vi-VN')}`,
          `Số lượng tấm: ${fullOrder.totalPanes}`,
          `Tổng diện tích: ${fullOrder.totalAreaM2} m²`,
        ],
        [],
        [
          'STT',
          'Vị trí cửa',
          'Ký hiệu ô kính',
          'Chủng loại kính',
          'Rộng (mm)',
          'Cao (mm)',
          'Diện tích (m²)',
          'Mài cạnh',
          'Ghi chú',
        ],
        ...items.map((it, idx) => [
          idx + 1,
          it.doorName ||
            it.positionCode ||
            (it.paneSource === 'manual' ? 'Kính lẻ' : `Vị trí #${it.positionId}`),
          it.paneLabel || '-',
          it.glassType,
          it.widthMm,
          it.heightMm,
          Number(it.areaM2.toFixed(3)),
          GRIND_LABEL_MAP[it.grindType || ''] || it.grindType || 'Mài xiết cạnh',
          it.manualReason || '',
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [
        { wch: 6 },
        { wch: 20 },
        { wch: 18 },
        { wch: 32 },
        { wch: 12 },
        { wch: 12 },
        { wch: 14 },
        { wch: 16 },
        { wch: 20 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'DonDatKinh');
      XLSX.writeFile(wb, `Don_Dat_Kinh_${fullOrder.code}.xlsx`);
      toast.success('Đã xuất file Excel đơn kính thành công!');
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi xuất file Excel');
    }
  };

  const handlePrintOrder = async (order: GlassOrder) => {
    try {
      const fullOrder = await getProjectGlassOrderDetail(projectId, order.id);
      const items = fullOrder.items || [];
      if (items.length === 0) {
        toast.error('Đơn hàng không có ô kính nào để in!');
        return;
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Trình duyệt đã chặn mở tab in');
        return;
      }

      const tableRows = items
        .map(
          (it, idx) => `
          <tr>
            <td style="text-align: center; border: 1px solid #ccc; padding: 6px;">${idx + 1}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              it.doorName ||
              it.positionCode ||
              (it.paneSource === 'manual' ? 'Kính lẻ' : `Vị trí #${it.positionId}`)
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px; font-weight: bold;">${it.paneLabel || '-'}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${it.glassType}</td>
            <td style="text-align: right; border: 1px solid #ccc; padding: 6px; font-family: monospace;">${it.widthMm}</td>
            <td style="text-align: right; border: 1px solid #ccc; padding: 6px; font-family: monospace;">${it.heightMm}</td>
            <td style="text-align: right; border: 1px solid #ccc; padding: 6px;">${it.areaM2.toFixed(3)}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${GRIND_LABEL_MAP[it.grindType || ''] || it.grindType || 'Mài xiết cạnh'}</td>
          </tr>`,
        )
        .join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Đơn Đặt Kính - ${fullOrder.code}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
            h2 { text-transform: uppercase; margin-bottom: 4px; font-size: 18px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 16px; font-size: 13px; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 6px; text-align: left; }
            @media print {
              @page { size: A4 landscape; margin: 12mm; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h2>ĐƠN ĐẶT KÍNH GIA CÔNG TÔI NHÀ MÁY</h2>
          <div class="info-grid">
            <div>
              <p><b>Mã đơn đặt kính:</b> ${fullOrder.code}</p>
              <p><b>Dự án:</b> ${fullOrder.projectName || ''}</p>
              <p><b>Ngày lập:</b> ${new Date(fullOrder.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <p><b>Tổng số tấm:</b> ${fullOrder.totalPanes} tấm</p>
              <p><b>Tổng diện tích:</b> ${fullOrder.totalAreaM2.toFixed(3)} m²</p>
              <p><b>Ghi chú:</b> ${fullOrder.note || 'Không có'}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 35px; text-align: center;">STT</th>
                <th>Vị Trí Cửa</th>
                <th>Ký Hiệu Ô Kính</th>
                <th>Chủng Loại Kính</th>
                <th style="text-align: right; width: 80px;">Rộng (mm)</th>
                <th style="text-align: right; width: 80px;">Cao (mm)</th>
                <th style="text-align: right; width: 80px;">Diện Tích (m²)</th>
                <th style="width: 100px;">Mài Cạnh</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div style="margin-top: 36px; display: flex; justify-content: space-between; font-size: 13px;">
            <div style="text-align: center; width: 200px;">
              <p><b>Người lập đơn</b></p>
              <p style="margin-top: 48px;">(Ký & ghi rõ họ tên)</p>
            </div>
            <div style="text-align: center; width: 200px;">
              <p><b>Xác nhận Nhà máy kính</b></p>
              <p style="margin-top: 48px;">(Ký & ghi rõ họ tên)</p>
            </div>
          </div>
          <script>
            window.onafterprint = function() {
              window.close();
            };
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi tạo bản in đơn kính');
    }
  };

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Boxes className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800">
            Quản Lý Đơn Đặt Kính Dự Án ({glassOrders.length} đơn)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            leftIcon={<RefreshCw size={13} className={loading ? 'animate-spin' : ''} />}
            className="text-xs"
          >
            Làm mới
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowGenerateModal(true)}
            leftIcon={<Plus size={14} />}
            className="text-xs"
          >
            Tạo Đơn Đặt Kính
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3 w-32">Mã Đơn Đặt Kính</th>
                <th className="p-3 text-center">Số Tấm</th>
                <th className="p-3 text-right">Tổng Diện Tích (m²)</th>
                <th className="p-3 text-center">Trạng Thái</th>
                <th className="p-3">Ngày Lập</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Đang tải danh sách đơn đặt kính...
                  </td>
                </tr>
              ) : glassOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
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
                        <td className="p-3 font-mono font-bold text-slate-900">{order.code}</td>
                        <td className="p-3 text-center font-bold text-indigo-700">
                          {order.totalPanes} tấm
                        </td>
                        <td className="p-3 text-right font-medium text-slate-800">
                          {order.totalAreaM2.toFixed(3)} m²
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
                              onClick={() => handleExportExcel(order)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                              title="Xuất file Excel cho nhà máy"
                            >
                              <FileSpreadsheet size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handlePrintOrder(order)}
                              className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                              title="In đơn đặt kính"
                            >
                              <Printer size={15} />
                            </button>

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
                          <td
                            colSpan={6}
                            className="p-4 bg-slate-50/90 border-t border-b border-slate-200"
                          >
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
        projectId={projectId}
        glassSuppliers={suppliers.filter((s) => s.supplierType === 'glass')}
        onSuccess={fetchOrders}
      />
    </div>
  );
}
