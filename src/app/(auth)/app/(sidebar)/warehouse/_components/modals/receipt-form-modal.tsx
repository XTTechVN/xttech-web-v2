'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Button, Modal } from '@/components';
import { showErrorToast } from '@/utils';
import {
  ReceiptType,
  ReceiptReason,
  WarehouseItem,
  WarehouseSupplier,
  WarehouseReceiptItemCreatePayload,
} from '@/types';
import { createWarehouseReceipt } from '@/actions';
import { ReceiptItemsTable, FormRowItem } from './receipt-items-table';
import { ReceiptFormHeader } from './receipt-form-header';
import { toDisplayUnit, toBackendUnit } from '../../_utils/unit-mapping';

interface ReceiptFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  itemsList: WarehouseItem[];
  suppliersList: WarehouseSupplier[];
  initialItems?: WarehouseReceiptItemCreatePayload[];
  initialType?: ReceiptType;
  initialReason?: ReceiptReason;
  initialSupplierId?: number;
}

export function ReceiptFormModal({
  isOpen,
  onClose,
  onSuccess,
  itemsList,
  suppliersList,
  initialItems,
  initialType = 'import',
  initialReason = 'purchase',
  initialSupplierId,
}: ReceiptFormModalProps) {
  const [receiptType, setReceiptType] = useState<ReceiptType>(initialType);
  const [receiptReason, setReceiptReason] = useState<ReceiptReason>(initialReason);
  const [supplierId, setSupplierId] = useState<number | undefined>(initialSupplierId);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReceiptTypeChange = (newType: ReceiptType) => {
    setReceiptType(newType);
    if (newType === 'import') {
      const validImportReasons: ReceiptReason[] = ['purchase', 'offcut_return', 'adjustment'];
      if (!validImportReasons.includes(receiptReason)) {
        setReceiptReason('purchase');
      }
    } else {
      const validExportReasons: ReceiptReason[] = ['production_issue', 'rework_issue', 'adjustment', 'scrap'];
      if (!validExportReasons.includes(receiptReason)) {
        setReceiptReason('production_issue');
      }
    }
  };

  const [rows, setRows] = useState<FormRowItem[]>([
    {
      id: 'row-1',
      itemCode: '',
      itemName: '',
      unit: 'Cây',
      colorName: '',
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  // Đồng bộ vật tư khi mở modal hoặc nhận danh sách từ JIT check
  useEffect(() => {
    if (!isOpen) return;
    if (initialItems && initialItems.length > 0) {
      setRows(
        initialItems.map((item, idx) => {
          const matched = itemsList.find((i) => i.itemCode === item.itemCode);
          return {
            id: `row-jit-${idx}`,
            itemId: item.itemId || matched?.id,
            itemCode: item.itemCode,
            itemName: item.itemName,
            itemType: item.itemType || matched?.itemType || 'profile',
            profileBarId: item.profileBarId || matched?.profileBarId || undefined,
            unit: toDisplayUnit(item.unit || matched?.unit || 'bar'),
            colorId: item.colorId || matched?.colorId,
            colorName: item.colorName || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice || matched?.costPrice || 0,
            note: item.note,
          };
        })
      );
      setReceiptType('import');
      setReceiptReason('purchase');

      // Tự động gợi ý nhà cung cấp tương ứng
      const hasAlu = initialItems.some(
        (i) => i.itemCode.startsWith('XF') || i.itemCode.startsWith('ALU')
      );
      if (hasAlu) {
        const aluSupplier = suppliersList.find((s) => s.supplierType === 'aluminum');
        if (aluSupplier) setSupplierId(aluSupplier.id);
      }
    }
  }, [isOpen, initialItems, itemsList, suppliersList]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        itemCode: '',
        itemName: '',
        unit: 'Cây',
        colorName: '',
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) {
      toast.error('Phiếu kho cần ít nhất 1 dòng vật tư');
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSelectPredefinedItem = (rowId: string, selected: WarehouseItem) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              itemId: selected.id,
              itemCode: selected.itemCode,
              itemName: selected.itemName,
              unit: toDisplayUnit(selected.unit),
              colorId: selected.colorId || undefined,
              colorName: r.colorName || '',
              unitPrice: selected.costPrice > 0 ? selected.costPrice : r.unitPrice,
            }
          : r
      )
    );
  };

  const handleRowChange = (id: string, field: keyof FormRowItem, value: any) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const totalAmount = rows.reduce(
    (sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.unitPrice) || 0),
    0
  );

  const handleSaveReceipt = async (approveImmediately: boolean = false) => {
    const validRows = rows.filter((r) => r.itemCode.trim() && r.itemName.trim());
    if (validRows.length === 0) {
      toast.error('Vui lòng nhập đầy đủ mã và tên vật tư ít nhất 1 dòng');
      return;
    }

    if (receiptType === 'import' && !supplierId) {
      toast.error('Vui lòng chọn nhà cung cấp cho phiếu nhập kho!');
      return;
    }

    setIsSubmitting(true);
    try {
      await createWarehouseReceipt({
        receiptType,
        receiptReason,
        supplierId: receiptType === 'import' ? supplierId : undefined,
        note: note.trim() || undefined,
        approveImmediately,
        items: validRows.map((r) => ({
          itemId: r.itemId,
          itemCode: r.itemCode.trim(),
          itemName: r.itemName.trim(),
          itemType: r.itemType,
          profileBarId: r.profileBarId,
          unit: toBackendUnit(r.unit),
          colorId: r.colorId || undefined,
          colorName: r.colorName?.trim() || undefined,
          quantity: Number(r.quantity) || 1,
          unitPrice: Number(r.unitPrice) || 0,
          note: r.note?.trim() || undefined,
        })),
      });

      toast.success(
        approveImmediately
          ? `Lập & Duyệt phiếu ${receiptType === 'import' ? 'nhập' : 'xuất'} kho thành công! Tồn kho đã cập nhật.`
          : `Lập phiếu ${receiptType === 'import' ? 'nhập' : 'xuất'} kho (Chưa duyệt) thành công!`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      showErrorToast(err, 'Lỗi lập phiếu kho');
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleNode = (
    <div className="flex items-center gap-2">
      {receiptType === 'import' ? (
        <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
      ) : (
        <ArrowUpRight className="w-5 h-5 text-amber-600" />
      )}
      <span>Lập Phiếu {receiptType === 'import' ? 'Nhập Kho' : 'Xuất Kho'} Mới</span>
    </div>
  );

  const footerNode = (
    <div className="flex items-center justify-end gap-2.5 w-full">
      <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
        Đóng
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isSubmitting}
        onClick={() => handleSaveReceipt(true)}
        className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
      >
        {isSubmitting ? 'Đang Xử Lý...' : 'Tạo & Duyệt Ngay'}
      </Button>
      <Button
        type="button"
        size="sm"
        disabled={isSubmitting}
        onClick={() => handleSaveReceipt(false)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold"
      >
        {isSubmitting ? 'Đang Lưu...' : 'Lưu Phiếu (Chưa duyệt)'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titleNode}
      size="xl"
      className="md:h-[88vh] md:max-h-[88vh]"
      bodyClassName="flex flex-col p-4 overflow-hidden"
      footer={footerNode}
    >
      <form
        id="receipt-form"
        onSubmit={(e) => { e.preventDefault(); handleSaveReceipt(false); }}
        noValidate
        className="flex flex-col h-full min-h-0 space-y-4"
      >
        <ReceiptFormHeader
          receiptType={receiptType}
          setReceiptType={handleReceiptTypeChange}
          receiptReason={receiptReason}
          setReceiptReason={setReceiptReason}
          supplierId={supplierId}
          setSupplierId={setSupplierId}
          suppliersList={suppliersList}
          note={note}
          setNote={setNote}
        />

        {/* Dynamic Table */}
        <div className="flex-1 min-h-0 flex flex-col">
          <ReceiptItemsTable
            rows={rows}
            itemsList={itemsList}
            onAddRow={handleAddRow}
            onRemoveRow={handleRemoveRow}
            onSelectPredefinedItem={handleSelectPredefinedItem}
            onRowChange={handleRowChange}
            onImportRows={setRows}
            totalAmount={totalAmount}
          />
        </div>
      </form>
    </Modal>
  );
}
