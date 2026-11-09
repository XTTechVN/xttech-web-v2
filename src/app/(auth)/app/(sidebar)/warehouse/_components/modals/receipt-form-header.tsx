'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Select, Input } from '@/components';
import { ReceiptType, ReceiptReason, WarehouseSupplier } from '@/types';
import { getReceiptReasonOptions } from '@/config';

interface ReceiptFormHeaderProps {
  receiptType: ReceiptType;
  setReceiptType: (type: ReceiptType) => void;
  receiptReason: ReceiptReason;
  setReceiptReason: (reason: ReceiptReason) => void;
  supplierId?: number;
  setSupplierId: (id?: number) => void;
  suppliersList: WarehouseSupplier[];
  note: string;
  setNote: (note: string) => void;
  onOpenCreateSupplier?: () => void;
}

export const ReceiptFormHeader: React.FC<ReceiptFormHeaderProps> = ({
  receiptType,
  setReceiptType,
  receiptReason,
  setReceiptReason,
  supplierId,
  setSupplierId,
  suppliersList,
  note,
  setNote,
  onOpenCreateSupplier,
}) => {
  const reasonOptions = getReceiptReasonOptions(receiptType);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-200 shrink-0">
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Loại Phiếu Kho <span className="text-red-500">*</span>
        </label>
        <Select
          value={receiptType}
          onChange={(e) => setReceiptType(e.target.value as ReceiptType)}
          options={[
            { value: 'import', label: 'Nhập Kho (Vào kho)' },
            { value: 'export', label: 'Xuất Kho (Ra khỏi kho)' },
          ]}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {receiptType === 'import' ? 'Lý Do Nhập Kho' : 'Lý Do Xuất Kho'} <span className="text-red-500">*</span>
        </label>
        <Select
          value={receiptReason}
          onChange={(e) => setReceiptReason(e.target.value as ReceiptReason)}
          options={reasonOptions}
        />
      </div>

      {receiptType === 'import' ? (
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Nhà Cung Cấp <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 min-w-0">
              <Select
                value={supplierId || ''}
                onChange={(e) => setSupplierId(e.target.value ? Number(e.target.value) : undefined)}
                options={[
                  { value: '', label: '-- Chọn nhà cung cấp * --' },
                  ...suppliersList.map((s) => ({ value: s.id, label: `${s.name} (${s.phone})` })),
                ]}
              />
            </div>
            {onOpenCreateSupplier && (
              <button
                type="button"
                onClick={onOpenCreateSupplier}
                className="h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors shadow-2xs cursor-pointer"
                title="Tạo mới nhà cung cấp"
                aria-label="Tạo mới nhà cung cấp"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Mã Lệnh SX / Dự Án (Nếu có)
          </label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi rõ Lệnh SX hoặc lý do"
          />
        </div>
      )}
    </div>
  );
};
