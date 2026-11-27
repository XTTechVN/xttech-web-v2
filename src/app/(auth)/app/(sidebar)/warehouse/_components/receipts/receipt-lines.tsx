'use client';

import { useRef } from 'react';
import { Download, Plus, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components';
import { Button, IconAction, Select } from '@/components-remake';
import type { ReceiptType, WarehouseItem, WarehouseItemType } from '@/types';
import { downloadReceiptTemplateExcel, parseReceiptExcelFile, toDisplayUnit } from '../../_utils';
import { STANDARD_UNIT_OPTIONS } from '../../_utils/unit-mapping';
import { money } from '../format';
import { ItemPicker } from './item-picker';

export interface FormRow {
  id: string;
  itemId?: number;
  itemCode: string;
  itemName: string;
  unit: string;
  itemType?: WarehouseItemType;
  profileBarId?: number;
  colorId?: number | null;
  colorName?: string | null;
  quantity: number | string;
  unitPrice: number | string;
  note?: string;
  /** Vật tư chưa có trong kho: nhập mã, tên, đơn vị bằng tay */
  manual?: boolean;
}

let seq = 0;
export const newRow = (patch?: Partial<FormRow>): FormRow => ({
  id: `row-${Date.now()}-${seq++}`,
  itemCode: '',
  itemName: '',
  unit: 'Cây',
  colorName: '',
  quantity: 1,
  unitPrice: 0,
  ...patch,
});

export const rowTotal = (r: FormRow) => (Number(r.quantity) || 0) * (Number(r.unitPrice) || 0);

interface Props {
  rows: FormRow[];
  items: WarehouseItem[];
  receiptType: ReceiptType;
  onChange: (rows: FormRow[]) => void;
  errors?: string;
}

const numberInput = { type: 'number', inputMode: 'decimal', min: 0, step: 'any', fullWidth: true } as const;

// Các dòng vật tư của phiếu: mỗi dòng một thẻ, chọn từ kho hoặc nhập tay; có nhập/xuất file Excel
export function ReceiptLines({ rows, items, receiptType, onChange, errors }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const patch = (id: string, p: Partial<FormRow>) => onChange(rows.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const pickItem = (id: string, i: WarehouseItem) => {
    const cur = rows.find((r) => r.id === id);
    patch(id, {
      itemId: i.id,
      itemCode: i.itemCode,
      itemName: i.itemName,
      itemType: i.itemType,
      profileBarId: i.profileBarId || undefined,
      unit: toDisplayUnit(i.unit),
      colorId: i.colorId || undefined,
      colorName: i.colorName || cur?.colorName || '',
      unitPrice: i.costPrice > 0 ? i.costPrice : cur?.unitPrice,
      manual: false,
    });
  };

  const importFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const { items: parsed, unmatchedCodes, overStockItems } = await parseReceiptExcelFile(file, items);
      if (parsed.length === 0) {
        toast.error('File không có dữ liệu hợp lệ. Hãy tải file mẫu để kiểm tra.');
        return;
      }
      if (receiptType === 'export') {
        if (unmatchedCodes.length > 0)
          toast.error(`Có ${unmatchedCodes.length} mã vật tư chưa có trong kho (${unmatchedCodes.slice(0, 5).join(', ')})`);
        if (overStockItems.length > 0) {
          const text = overStockItems
            .slice(0, 3)
            .map((it) => `${it.itemCode} (cần ${it.requested}, khả dụng ${it.available} ${it.unit})`)
            .join('; ');
          toast.error(`Vượt tồn khả dụng: ${text}`);
        }
      }
      onChange(
        parsed.map((p) =>
          newRow({
            itemId: p.itemId,
            itemCode: p.itemCode,
            itemName: p.itemName,
            itemType: p.itemType,
            profileBarId: p.profileBarId,
            colorId: p.colorId,
            colorName: p.colorName || '',
            unit: toDisplayUnit(p.unit),
            quantity: p.quantity,
            unitPrice: p.unitPrice ?? 0,
            note: p.note,
            manual: !p.itemId,
          }),
        ),
      );
      toast.success(`Đã nạp ${parsed.length} mặt hàng từ file`);
    } catch {
      toast.error('Không đọc được file. Hãy dùng đúng biểu mẫu Excel (.xlsx).');
    }
  };

  const total = rows.reduce((s, r) => s + rowTotal(r), 0);

  return (
    <section className="flex flex-col gap-3" aria-label="Danh sách vật tư">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900">Vật tư ({rows.length})</h4>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={importFile} className="hidden" />
          <Button variant="outline" icon={<Download size={16} />} iconOnly="mobile" onClick={() => downloadReceiptTemplateExcel(receiptType, items)}>
            Tải mẫu Excel
          </Button>
          <Button variant="outline" icon={<Upload size={16} />} iconOnly="mobile" onClick={() => fileRef.current?.click()}>
            Nhập từ Excel
          </Button>
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {rows.map((r, idx) => (
          <li key={r.id} className="flex flex-col gap-3 rounded-block border border-slate-200/80 p-3">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                {r.manual ? (
                  <p className="truncate text-sm font-medium text-slate-700">Dòng {idx + 1}: vật tư mới, nhập tay</p>
                ) : (
                  <ItemPicker
                    label={`Chọn vật tư dòng ${idx + 1}`}
                    items={items}
                    selectedId={r.itemId}
                    fallback={r.itemCode ? `${r.itemCode} · ${r.itemName}` : undefined}
                    onPick={(i) => pickItem(r.id, i)}
                  />
                )}
              </div>
              <IconAction
                label={`Xóa dòng ${idx + 1}`}
                danger
                disabled={rows.length <= 1}
                onClick={() => onChange(rows.filter((x) => x.id !== r.id))}
              >
                <Trash2 size={16} />
              </IconAction>
            </div>

            {r.manual && (
              <>
                <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
                  <Input label="Mã vật tư *" fullWidth value={r.itemCode} onChange={(e) => patch(r.id, { itemCode: e.target.value })} />
                  <Select side label="Đơn vị" value={r.unit} options={STANDARD_UNIT_OPTIONS} onChange={(unit) => patch(r.id, { unit })} />
                </div>
                <Input label="Tên vật tư *" fullWidth value={r.itemName} onChange={(e) => patch(r.id, { itemName: e.target.value })} />
                <Input label="Màu sắc" fullWidth value={r.colorName ?? ''} onChange={(e) => patch(r.id, { colorName: e.target.value })} />
              </>
            )}
            <button
              type="button"
              onClick={() => patch(r.id, r.manual ? { manual: false } : { manual: true, itemId: undefined })}
              className="min-h-11 w-fit cursor-pointer text-left text-xs font-medium text-primary md:min-h-9"
            >
              {r.manual ? 'Chọn vật tư trong kho' : 'Vật tư chưa có trong kho? Nhập tay'}
            </button>

            <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
              <Input label={`Số lượng (${r.unit})`} {...numberInput} value={r.quantity} onChange={(e) => patch(r.id, { quantity: e.target.value })} />
              <Input label="Đơn giá (đ)" {...numberInput} value={r.unitPrice} onChange={(e) => patch(r.id, { unitPrice: e.target.value })} />
            </div>
            <p className="text-right text-sm text-slate-500">
              Thành tiền <strong className="font-semibold text-slate-900">{money(rowTotal(r))}</strong>
            </p>
          </li>
        ))}
      </ul>
      {errors && <p className="text-xs text-red-600">{errors}</p>}

      <Button variant="outline" icon={<Plus size={16} />} className="w-full" onClick={() => onChange([...rows, newRow()])}>
        Thêm dòng
      </Button>
      <p className="flex items-baseline justify-between gap-3 border-t border-slate-100 pt-3 text-sm text-slate-500">
        Tổng tiền phiếu
        <strong className="font-heading text-lg font-semibold tabular-nums text-slate-900">{money(total)}</strong>
      </p>
    </section>
  );
}
