'use client';

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal, Button } from '@/components';
import { WarehouseItem } from '@/types';
import { toDisplayUnit } from '../../_utils/unit-mapping';

interface DeleteItemModalProps {
  isOpen: boolean;
  item: WarehouseItem | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export const DeleteItemModal: React.FC<DeleteItemModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận xóa mặt hàng kho"
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Hủy bỏ
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            leftIcon={<Trash2 size={14} />}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </div>
      }
    >
      <div className="space-y-3.5 text-xs text-slate-600">
        <div className="flex items-start gap-3 p-3 bg-red-50/70 border border-red-200/80 rounded-xl">
          <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0 mt-0.5">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">
              Bạn có chắc chắn muốn xóa mặt hàng này?
            </p>
            <p className="text-slate-500 mt-1">
              Thao tác này sẽ gỡ bỏ mặt hàng khỏi danh mục tồn kho xưởng.
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Mã vật tư:</span>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {item.itemCode}
            </span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-slate-500 shrink-0">Tên quy cách:</span>
            <span className="font-medium text-slate-800 text-right">{item.itemName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Tồn kho thực tế:</span>
            <span className="font-semibold text-slate-900">
              {item.currentStock.toLocaleString('vi-VN')} {toDisplayUnit(item.unit)}
            </span>
          </div>
          {item.reservedQty > 0 && (
            <div className="flex items-center justify-between text-amber-700">
              <span>Đang giữ chỗ SX:</span>
              <span className="font-semibold">
                {item.reservedQty.toLocaleString('vi-VN')} {toDisplayUnit(item.unit)}
              </span>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-400 italic">
          * Lưu ý: Hệ thống sẽ chặn xóa nếu mặt hàng còn tồn kho thực tế hoặc đang được giữ chỗ trong các dự án.
        </p>
      </div>
    </Modal>
  );
};
