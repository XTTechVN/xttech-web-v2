'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react';
import { Button, Input, Select } from '@/components';
import { WarehouseReceipt } from '@/types';
import { RECEIPT_REASON_MAP, RECEIPT_STATUS_MAP } from '@/config';

interface ReceiptsTabProps {
  receipts: WarehouseReceipt[];
  loading: boolean;
  onOpenCreateReceipt: () => void;
  onSelectReceiptDetail: (receipt: WarehouseReceipt) => void;
  onApproveReceipt: (receiptId: number) => Promise<void>;
  onCancelReceipt: (receiptId: number) => Promise<void>;
}

export function ReceiptsTab({
  receipts,
  loading,
  onOpenCreateReceipt,
  onSelectReceiptDetail,
  onApproveReceipt,
  onCancelReceipt,
}: ReceiptsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchSearch =
        r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.supplierName && r.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.projectName && r.projectName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType = filterType === 'all' || r.receiptType === filterType;
      const matchStatus = filterStatus === 'all' || r.status === filterStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [receipts, searchTerm, filterType, filterStatus]);

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã phiếu, đối tác..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="w-full sm:w-44">
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'all', label: 'Tất cả loại phiếu' },
                { value: 'import', label: 'Phiếu Nhập kho' },
                { value: 'export', label: 'Phiếu Xuất kho' },
              ]}
              className="text-xs"
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'draft', label: 'Chờ duyệt (Đang giữ chỗ)' },
                { value: 'approved', label: 'Đã duyệt xuất/nhập' },
                { value: 'cancelled', label: 'Đã hủy' },
              ]}
              className="text-xs"
            />
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenCreateReceipt}
          leftIcon={<Plus size={14} />}
          className="text-xs shrink-0"
        >
          Lập Phiếu Kho Mới
        </Button>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3 w-32">Mã Phiếu</th>
                <th className="p-3 w-28">Loại Phiếu</th>
                <th className="p-3">Lý Do Nhập / Xuất</th>
                <th className="p-3">Đối Tác / Dự Án</th>
                <th className="p-3 text-center">Số Mặt Hàng</th>
                <th className="p-3 text-right">Tổng Giá Trị</th>
                <th className="p-3">Ngày Lập</th>
                <th className="p-3 text-center">Trạng Thái</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Đang tải danh sách phiếu kho...
                  </td>
                </tr>
              ) : filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Không tìm thấy phiếu kho nào.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((receipt) => {
                  const statusConf = RECEIPT_STATUS_MAP[receipt.status] || {
                    label: receipt.status,
                    bg: 'bg-slate-100',
                    text: 'text-slate-600',
                  };

                  return (
                    <tr key={receipt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {receipt.code}
                      </td>
                      <td className="p-3">
                        {receipt.receiptType === 'import' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ArrowDownLeft size={12} />
                            Nhập kho
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <ArrowUpRight size={12} />
                            Xuất kho
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-medium text-slate-800">
                        {RECEIPT_REASON_MAP[receipt.receiptReason] || receipt.receiptReason}
                      </td>
                      <td className="p-3 text-slate-600">
                        {receipt.supplierName ? (
                          <div className="font-medium text-slate-800">
                            NCC: {receipt.supplierName}
                          </div>
                        ) : receipt.projectName ? (
                          <div className="font-medium text-slate-800">
                            Dự án: {receipt.projectName}
                          </div>
                        ) : (
                          '-'
                        )}
                        {receipt.productionOrderCode && (
                          <div className="text-[11px] text-slate-400">
                            Lệnh SX: {receipt.productionOrderCode}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center font-medium">
                        {receipt.totalItemsCount || receipt.items?.length || 0}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        {receipt.totalAmount.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="p-3 text-slate-500">
                        {new Date(receipt.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusConf.bg} ${statusConf.text}`}
                        >
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectReceiptDetail(receipt)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Xem chi tiết phiếu"
                          >
                            <Eye size={15} />
                          </button>

                          {receipt.status === 'draft' && (
                            <>
                              <button
                                type="button"
                                onClick={() => onApproveReceipt(receipt.id)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                title="Duyệt phiếu (Cập nhật tồn kho thực tế)"
                              >
                                <CheckCircle2 size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => onCancelReceipt(receipt.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Hủy phiếu (Giải phóng giữ chỗ)"
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
