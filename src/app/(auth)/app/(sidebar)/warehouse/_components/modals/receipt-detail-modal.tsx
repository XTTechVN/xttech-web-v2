'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/components';
import { WarehouseReceipt } from '@/types';
import { RECEIPT_REASON_MAP, RECEIPT_STATUS_MAP } from '@/config';
import { Package, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { getWarehouseReceiptDetail } from '@/actions';
import { showErrorToast } from '@/utils';
import { toDisplayUnit } from '../../_utils/unit-mapping';

interface ReceiptDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: WarehouseReceipt | null;
  onApprove?: (receiptId: number) => void;
  onCancel?: (receiptId: number) => void;
  isApproving?: boolean;
  isCancelling?: boolean;
}

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({
  isOpen,
  onClose,
  receipt,
  onApprove,
  onCancel,
  isApproving,
  isCancelling,
}) => {
  const [detail, setDetail] = useState<WarehouseReceipt | null>(receipt);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !receipt?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDetail(null);
      return;
    }
    setDetail(receipt);
    if (receipt.items && receipt.items.length > 0) {
      return;
    }

    let isMounted = true;
    setLoading(true);
    getWarehouseReceiptDetail(receipt.id)
      .then((fullData) => {
        if (isMounted) setDetail(fullData);
      })
      .catch((err) => {
        showErrorToast(err, 'Lỗi tải chi tiết mặt hàng phiếu kho');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, receipt]);

  if (!receipt) return null;
  const activeReceipt = detail || receipt;

  const statusConfig = RECEIPT_STATUS_MAP[activeReceipt.status] || {
    label: activeReceipt.status,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
  };

  const isImport = activeReceipt.receiptType === 'import';
  const reasonLabel = RECEIPT_REASON_MAP[activeReceipt.receiptReason] || activeReceipt.receiptReason;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi tiết phiếu ${receipt.code}`}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {receipt.status === 'draft' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-rose-600 border-rose-300 hover:bg-rose-50"
                  onClick={() => onCancel?.(receipt.id)}
                  disabled={isCancelling}
                >
                  <XCircle size={14} className="mr-1.5" />
                  Hủy phiếu kho
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => onApprove?.(activeReceipt.id)}
                  disabled={isApproving}
                >
                  <CheckCircle2 size={14} className="mr-1.5" />
                  Duyệt phiếu ngay
                </Button>
              </>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      <div className="space-y-5 text-xs text-slate-700">
        {/* Header thông tin phiếu */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Loại giao dịch</span>
            <span
              className={`inline-block font-semibold px-2 py-0.5 rounded text-[11px] ${
                isImport ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {isImport ? '📥 Nhập kho' : '📤 Xuất kho'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Lý do nghiệp vụ</span>
            <span className="font-medium text-slate-800">{reasonLabel}</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Trạng thái phiếu</span>
            <span className={`inline-block font-medium px-2 py-0.5 rounded text-[11px] ${statusConfig.bg} ${statusConfig.text}`}>
              {statusConfig.label}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Tổng giá trị</span>
            <span className="font-bold text-slate-900 text-sm">
              {(activeReceipt.totalAmount || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        {/* Thông tin phụ trợ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-600">
          {activeReceipt.supplierName && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Nhà cung cấp:</span>
              <span className="font-medium text-slate-800">{activeReceipt.supplierName}</span>
            </div>
          )}
          {activeReceipt.projectName && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Công trình:</span>
              <span className="font-medium text-slate-800">{activeReceipt.projectName}</span>
            </div>
          )}
          {activeReceipt.productionOrderCode && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Lệnh sản xuất:</span>
              <span className="font-medium text-slate-800">{activeReceipt.productionOrderCode}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Thời gian tạo:</span>
            <span>{new Date(activeReceipt.createdAt).toLocaleString('vi-VN')}</span>
          </div>
          {activeReceipt.approvedAt && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Thời gian duyệt:</span>
              <span className="text-emerald-700 font-medium">
                {new Date(activeReceipt.approvedAt).toLocaleString('vi-VN')}
              </span>
            </div>
          )}
        </div>

        {activeReceipt.note && (
          <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg text-amber-900 text-[11px] leading-relaxed">
            <span className="font-semibold">Ghi chú:</span> {activeReceipt.note}
          </div>
        )}

        {/* Danh sách mặt hàng chi tiết */}
        <div>
          <div className="font-semibold text-slate-800 text-xs mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Package size={14} className="text-primary" />
              <span>Danh mục mặt hàng trong phiếu ({activeReceipt.items?.length || 0})</span>
            </div>
            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-normal">
                <RefreshCw size={12} className="animate-spin" />
                <span>Đang tải chi tiết...</span>
              </div>
            )}
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 w-10 text-center">STT</th>
                  <th className="py-2 px-3">Mã hàng</th>
                  <th className="py-2 px-3">Tên mặt hàng</th>
                  <th className="py-2 px-3 text-right">Số lượng</th>
                  <th className="py-2 px-3 text-center">ĐVT</th>
                  <th className="py-2 px-3 text-right">Đơn giá</th>
                  <th className="py-2 px-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw size={16} className="animate-spin text-indigo-600" />
                        <span>Đang tải danh sách mặt hàng...</span>
                      </div>
                    </td>
                  </tr>
                ) : activeReceipt.items && activeReceipt.items.length > 0 ? (
                  activeReceipt.items.map((it, idx) => (
                    <tr key={it.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{it.itemCode}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800">{it.itemName}</div>
                        {it.offcutLengthMm && (
                          <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-mono">
                            Nhôm thừa: {it.offcutLengthMm}mm
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {it.quantity.toLocaleString('vi-VN')}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500">{toDisplayUnit(it.unit)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">
                        {(it.unitPrice || 0).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {(it.totalPrice || 0).toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                      Không có chi tiết mặt hàng
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};
