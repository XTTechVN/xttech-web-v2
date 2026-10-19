'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Package, Layers, Loader2 } from 'lucide-react';
import { Button, Modal } from '@/components';
import {
  WarehouseSupplier,
  WarehouseItem,
  WarehouseReceipt,
  SupplierDetailAnalyticsResponse,
} from '@/types';
import { SUPPLIER_TYPE_MAP, RECEIPT_STATUS_MAP } from '@/config';
import { getWarehouseSupplierAnalytics } from '@/actions';
import { showErrorToast } from '@/utils';
import { SupplierGlassOrdersTable } from './supplier-glass-orders-table';

interface SupplierDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: WarehouseSupplier | null;
  itemsList?: WarehouseItem[];
  receiptsList?: WarehouseReceipt[];
}

export function SupplierDetailModal({
  isOpen,
  onClose,
  supplier,
}: SupplierDetailModalProps) {
  const isGlass = supplier?.supplierType === 'glass';
  const [activeSubTab, setActiveSubTab] = useState<'main' | 'receipts'>('main');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SupplierDetailAnalyticsResponse | null>(null);

  useEffect(() => {
    if (!isOpen || !supplier) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(null);
      return;
    }
    setActiveSubTab('main');
    let isMounted = true;
    setLoading(true);
    getWarehouseSupplierAnalytics(supplier.id)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) showErrorToast(err, 'Lỗi tải dữ liệu chi tiết nhà cung cấp');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, supplier]);

  if (!isOpen || !supplier) return null;

  const suppliedItems = data?.suppliedItems || [];
  const glassOrders = data?.glassOrders || [];
  const receipts = data?.receipts || [];

  const titleNode = (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
        <Building2 size={20} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-500 uppercase">
            [{supplier.code}]
          </span>
          <h3 className="font-bold text-slate-900 text-base">{supplier.name}</h3>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {SUPPLIER_TYPE_MAP[supplier.supplierType] || supplier.supplierType} • {supplier.phone}
        </p>
      </div>
    </div>
  );

  const footerNode = (
    <div className="flex items-center justify-end w-full">
      <Button variant="outline" size="sm" onClick={onClose}>
        Đóng
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titleNode} size="xl" footer={footerNode}>
      <div className="space-y-5">
        {/* Supplier Info Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Người liên hệ:</span>
            <span className="font-medium text-slate-800">{supplier.contactName || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Mã số thuế:</span>
            <span className="font-mono font-medium text-slate-800">{supplier.taxCode || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Địa chỉ:</span>
            <span className="font-medium text-slate-800 truncate block">{supplier.address || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Tài khoản NH:</span>
            <span className="font-medium text-slate-800 truncate block">{supplier.bankAccount || '-'}</span>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('main')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'main' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Package size={14} />
            {isGlass
              ? `Đơn Đặt Kính Gửi Nhà Máy (${glassOrders.length})`
              : `Mặt Hàng Đã Từng Nhập Mua (${suppliedItems.length})`}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('receipts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'receipts' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Layers size={14} />
            Lịch Sử Phiếu Nhập Mua ({receipts.length})
          </button>
        </div>

        {/* Sub Panels */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-600 mb-2" />
            <span className="text-xs">Đang tải dữ liệu cung ứng của nhà cung cấp...</span>
          </div>
        ) : activeSubTab === 'main' ? (
          isGlass ? (
            <SupplierGlassOrdersTable orders={glassOrders} />
          ) : (
            /* Bảng mặt hàng đã từng nhập mua từ NCC */
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 w-28">Mã Vật Tư</th>
                    <th className="p-2.5">Tên Quy Cách Mặt Hàng</th>
                    <th className="p-2.5 text-center">ĐVT</th>
                    <th className="p-2.5 text-right">Tổng Đã Nhập</th>
                    <th className="p-2.5 text-right">Đơn Giá Gần Nhất</th>
                    <th className="p-2.5 text-center">Lần Nhập Gần Nhất</th>
                    <th className="p-2.5 text-right">Tồn Kho Hiện Tại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suppliedItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">
                        Chưa phát sinh mặt hàng nào được nhập mua từ nhà cung cấp này.
                      </td>
                    </tr>
                  ) : (
                    suppliedItems.map((item, idx) => (
                      <tr key={item.itemCode || idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-mono font-medium text-slate-900">{item.itemCode}</td>
                        <td className="p-2.5 font-medium text-slate-800">{item.itemName}</td>
                        <td className="p-2.5 text-center">{item.unit}</td>
                        <td className="p-2.5 text-right font-bold text-indigo-600">
                          {item.totalImportedQty.toLocaleString('vi-VN')}
                        </td>
                        <td className="p-2.5 text-right font-medium text-slate-800">
                          {item.lastUnitPrice.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-2.5 text-center text-slate-500">
                          {new Date(item.lastImportDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="p-2.5 text-right font-semibold text-slate-800">
                          {item.currentStock.toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Bảng lịch sử phiếu nhập mua */
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-2.5 w-28">Mã Phiếu</th>
                  <th className="p-2.5">Ngày Lập</th>
                  <th className="p-2.5 text-center">Số Mặt Hàng</th>
                  <th className="p-2.5 text-right">Tổng Tiền</th>
                  <th className="p-2.5 text-center">Trạng Thái</th>
                  <th className="p-2.5">Ghi Chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receipts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      Chưa phát sinh phiếu nhập mua nào từ nhà cung cấp này.
                    </td>
                  </tr>
                ) : (
                  receipts.map((receipt) => {
                    const statusConf = RECEIPT_STATUS_MAP[receipt.status] || {
                      label: receipt.status,
                      bg: 'bg-slate-100',
                      text: 'text-slate-600',
                    };
                    return (
                      <tr key={receipt.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-mono font-bold text-slate-900">{receipt.code}</td>
                        <td className="p-2.5 text-slate-500">
                          {new Date(receipt.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="p-2.5 text-center font-medium">
                          {receipt.totalItemsCount || receipt.items?.length || 0}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          {receipt.totalAmount.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusConf.bg} ${statusConf.text}`}
                          >
                            {statusConf.label}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-400 italic max-w-xs truncate">{receipt.note || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}

