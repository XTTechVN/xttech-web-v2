'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { createWarehouseReceipt } from '@/actions';
import { Input } from '@/components';
import { Chip, IconAction, Select } from '@/components-remake';
import { getReceiptReasonOptions } from '@/config';
import type { ReceiptReason, ReceiptType, WarehouseItem, WarehouseReceiptItemCreatePayload, WarehouseSupplier } from '@/types';
import { showErrorToast } from '@/utils';
import { toBackendUnit, toDisplayUnit } from '../../_utils';
import { refreshWarehouse } from '../format';
import SupplierFormDrawer from '../suppliers/supplier-form-drawer';
import { ReceiptLines, newRow, type FormRow } from './receipt-lines';

export const RECEIPT_FORM_ID = 'receipt-form';

interface Props {
  items: WarehouseItem[];
  suppliers: WarehouseSupplier[];
  /** Dòng có sẵn (ví dụ mua bù từ kiểm tra thiếu hụt) */
  initialItems?: WarehouseReceiptItemCreatePayload[];
  /** Nút "Tạo & duyệt ngay" đặt cờ này trước khi gửi form */
  approveRef: React.RefObject<boolean>;
  /** Gọi sau khi lập phiếu thành công, trước khi đóng (ví dụ làm mới dữ liệu ở trang gọi) */
  onSaved?: () => void;
  onDone: () => void;
  onPendingChange: (pending: boolean) => void;
}

const REASONS: Record<ReceiptType, ReceiptReason[]> = {
  import: ['purchase', 'offcut_return', 'adjustment'],
  export: ['production_issue', 'rework_issue', 'adjustment', 'scrap'],
};

// Lập phiếu nhập hoặc xuất kho; nhập bắt buộc chọn nhà cung cấp
export function ReceiptForm({ items, suppliers, initialItems, approveRef, onSaved, onDone, onPendingChange }: Props) {
  const [type, setType] = useState<ReceiptType>('import');
  const [reason, setReason] = useState<ReceiptReason>('purchase');
  const [supplierId, setSupplierId] = useState(() =>
    initialItems?.some((i) => i.itemType === 'profile' || /^(XF|ALU)/.test(i.itemCode))
      ? String(suppliers.find((s) => s.supplierType === 'aluminum')?.id ?? '')
      : '',
  );
  const [note, setNote] = useState('');
  const [addingSupplier, setAddingSupplier] = useState(false);
  const [rows, setRows] = useState<FormRow[]>(() =>
    initialItems?.length
      ? initialItems.map((it) => {
          const m = items.find((i) => i.itemCode === it.itemCode);
          return newRow({
            itemId: it.itemId || m?.id,
            itemCode: it.itemCode,
            itemName: it.itemName,
            itemType: it.itemType || m?.itemType || 'profile',
            profileBarId: it.profileBarId || m?.profileBarId || undefined,
            unit: toDisplayUnit(it.unit || m?.unit || 'bar'),
            colorId: it.colorId || m?.colorId,
            colorName: it.colorName || '',
            quantity: it.quantity,
            unitPrice: it.unitPrice || m?.costPrice || 0,
            note: it.note,
            manual: !(it.itemId || m),
          });
        })
      : [newRow()],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const touch = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: '' } : e));

  const changeType = (t: ReceiptType) => {
    setType(t);
    if (!REASONS[t].includes(reason)) setReason(REASONS[t][0]);
  };

  const valid = rows.filter((r) => r.itemCode.trim() && r.itemName.trim());

  const save = useMutation({
    mutationFn: (approve: boolean) =>
      createWarehouseReceipt({
        receiptType: type,
        receiptReason: reason,
        supplierId: type === 'import' ? Number(supplierId) : undefined,
        note: note.trim() || undefined,
        approveImmediately: approve,
        items: valid.map((r) => ({
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
      }),
    onSuccess: (_, approve) => {
      refreshWarehouse();
      const what = type === 'import' ? 'nhập' : 'xuất';
      toast.success(approve ? `Đã lập và duyệt phiếu ${what} kho, tồn kho đã cập nhật` : `Đã lập phiếu ${what} kho, đang chờ duyệt`);
      onSaved?.();
      onDone();
    },
    onError: (e) => showErrorToast(e, 'Không thể lập phiếu kho'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next: Record<string, string> = {};
    if (type === 'import' && !supplierId) next.supplier = 'Vui lòng chọn nhà cung cấp';
    if (valid.length === 0) next.rows = 'Cần ít nhất một dòng có mã và tên vật tư';
    else if (valid.some((r) => !(Number(r.quantity) > 0))) next.rows = 'Số lượng mỗi dòng phải lớn hơn 0';
    setErrors(next);
    if (Object.keys(next).length) return;
    onPendingChange(true);
    save.mutate(approveRef.current, { onSettled: () => onPendingChange(false) });
  };

  return (
    <form id={RECEIPT_FORM_ID} onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
        <Chip selected={type === 'import'} onClick={() => changeType('import')}>
          Nhập kho
        </Chip>
        <Chip selected={type === 'export'} onClick={() => changeType('export')}>
          Xuất kho
        </Chip>
      </div>
      <Select
        side
        label={type === 'import' ? 'Lý do nhập kho' : 'Lý do xuất kho'}
        value={reason}
        options={getReceiptReasonOptions(type)}
        onChange={(v) => setReason(v as ReceiptReason)}
      />
      {type === 'import' && (
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <Select
                side
                label="Nhà cung cấp *"
                value={supplierId}
                options={suppliers
                  .filter((s) => s.supplierType !== 'door_set' && s.isActive)
                  .map((s) => ({ value: String(s.id), label: s.name, hint: s.phone }))}
                onChange={(v) => {
                  setSupplierId(v);
                  touch('supplier');
                }}
                placeholder="Chọn nhà cung cấp"
              />
            </div>
            <IconAction label="Thêm nhà cung cấp mới" className="border border-slate-200" onClick={() => setAddingSupplier(true)}>
              <Plus size={18} />
            </IconAction>
          </div>
          {errors.supplier && <p className="text-xs text-red-600">{errors.supplier}</p>}
        </div>
      )}
      <Input
        label="Ghi chú"
        placeholder={type === 'export' ? 'Ghi rõ lệnh sản xuất hoặc lý do xuất' : 'Ví dụ: Số hóa đơn, ngày giao'}
        fullWidth
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <ReceiptLines
        rows={rows}
        items={items}
        receiptType={type}
        errors={errors.rows}
        onChange={(r) => {
          setRows(r);
          touch('rows');
        }}
      />

      <SupplierFormDrawer
        side
        isOpen={addingSupplier}
        onClose={() => setAddingSupplier(false)}
        onCreated={(s) => {
          setSupplierId(String(s.id));
          touch('supplier');
        }}
      />
    </form>
  );
}
