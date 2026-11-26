'use client';

import React, { useRef } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Download, UploadCloud } from 'lucide-react';
import { Button } from '@/components';
import { ReceiptType, WarehouseItem, WarehouseItemType } from '@/types';
import { ReceiptItemCombobox } from './receipt-item-combobox';
import {
  downloadReceiptTemplateExcel,
  parseReceiptExcelFile,
  toDisplayUnit,
} from '../../_utils';

export interface FormRowItem {
  id: string;
  itemId?: number;
  itemCode: string;
  itemName: string;
  unit: string;
  itemType?: WarehouseItemType;
  profileBarId?: number;
  colorId?: number | null;
  colorName?: string | null;
  quantity: number;
  unitPrice: number;
  note?: string;
}

interface ReceiptItemsTableProps {
  rows: FormRowItem[];
  itemsList: WarehouseItem[];
  receiptType?: ReceiptType;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  onSelectPredefinedItem: (rowId: string, item: WarehouseItem) => void;
  onRowChange: (id: string, field: keyof FormRowItem, value: string | number) => void;
  onImportRows?: (imported: FormRowItem[]) => void;
  totalAmount: number;
}

export function ReceiptItemsTable({
  rows,
  itemsList,
  receiptType = 'import',
  onAddRow,
  onRemoveRow,
  onSelectPredefinedItem,
  onRowChange,
  onImportRows,
  totalAmount,
}: ReceiptItemsTableProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const { items: parsed, unmatchedCodes, overStockItems } = await parseReceiptExcelFile(
        file,
        itemsList
      );

      if (parsed.length === 0) {
        toast.error('File không chứa dữ liệu hợp lệ. Vui lòng tải file mẫu Excel để kiểm tra.');
        return;
      }

      if (receiptType === 'export') {
        if (unmatchedCodes.length > 0) {
          toast.error(
            `Cảnh báo: Có ${unmatchedCodes.length} mã vật tư chưa có trong kho (${unmatchedCodes.slice(0, 5).join(', ')}).`
          );
        }
        if (overStockItems.length > 0) {
          const summary = overStockItems
            .slice(0, 3)
            .map((it) => `${it.itemCode} (yêu cầu ${it.requested} / khả dụng ${it.available} ${it.unit})`)
            .join('; ');
          toast.error(`Cảnh báo vượt tồn khả dụng: ${summary}`);
        }
      }

      const newRows: FormRowItem[] = parsed.map((p, idx) => ({
        id: `row-imp-${Date.now()}-${idx}`,
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
      }));

      if (onImportRows) {
        onImportRows(newRows);
        toast.success(`Đã nạp thành công ${newRows.length} mặt hàng từ file!`);
      }
    } catch {
      toast.error('Không thể đọc file đã chọn. Vui lòng sử dụng đúng biểu mẫu Excel (.xlsx).');
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0">
        <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Danh Sách Vật Tư ({rows.length})
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => downloadReceiptTemplateExcel(receiptType, itemsList)}
            className="gap-1 text-xs text-slate-600 hover:text-slate-800"
          >
            <Download size={13} />
            Tải Mẫu Excel (.xlsx)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
          >
            <UploadCloud size={13} />
            Nhập File Excel (.xlsx)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddRow}
            className="gap-1 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            <Plus size={13} />
            Thêm Dòng
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-[300px] border border-slate-200 rounded-lg overflow-x-auto overflow-y-auto">
        <table className="w-full text-left text-xs text-slate-600 border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200 sticky top-0 z-10 shadow-xs">
            <tr>
              <th className="p-2.5 min-w-[200px]">Tìm & Chọn Vật Tư Kho</th>
              <th className="p-2.5 w-28">Mã VT *</th>
              <th className="p-2.5 min-w-[140px]">Tên Vật Tư *</th>
              <th className="p-2.5 w-24">Màu sắc</th>
              <th className="p-2.5 w-20">ĐVT *</th>
              <th className="p-2.5 w-24">Số lượng *</th>
              <th className="p-2.5 w-28">Đơn giá (đ)</th>
              <th className="p-2.5 w-28 text-right">Thành tiền</th>
              <th className="p-2.5 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row) => {
              const rowTotal = (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0);
              return (
                <tr key={row.id} className="hover:bg-slate-50/50">
                  <td className="p-2">
                    <ReceiptItemCombobox
                      selectedItemId={row.itemId}
                      selectedItemCode={row.itemCode}
                      selectedItemName={row.itemName}
                      itemsList={itemsList}
                      onSelect={(item) => onSelectPredefinedItem(row.id, item)}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.itemCode}
                      onChange={(e) => onRowChange(row.id, 'itemCode', e.target.value)}
                      placeholder="Mã VT"
                      required
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded font-mono uppercase focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.itemName}
                      onChange={(e) => onRowChange(row.id, 'itemName', e.target.value)}
                      placeholder="Tên quy cách vật tư"
                      required
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      list="aluminum-colors-suggestions"
                      value={row.colorName || ''}
                      onChange={(e) => onRowChange(row.id, 'colorName', e.target.value)}
                      placeholder="Màu nhôm"
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 bg-white placeholder:text-slate-300"
                    />
                    <datalist id="aluminum-colors-suggestions">
                      <option value="Trắng sữa" />
                      <option value="Trắng sứ" />
                      <option value="Xám" />
                      <option value="Xám ghi" />
                      <option value="Xám đá ánh kim" />
                      <option value="Nâu" />
                      <option value="Nâu cafe" />
                      <option value="Nâu mocha" />
                      <option value="Đen" />
                      <option value="Champagne" />
                      <option value="Vân gỗ" />
                      <option value="Anodized Vàng" />
                    </datalist>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.unit}
                      onChange={(e) => onRowChange(row.id, 'unit', e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={row.quantity}
                      onChange={(e) => onRowChange(row.id, 'quantity', e.target.value)}
                      min={0}
                      step="any"
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded font-semibold text-right focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={row.unitPrice}
                      onChange={(e) => onRowChange(row.id, 'unitPrice', e.target.value)}
                      min={0}
                      step="any"
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded text-right focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="p-2 text-right font-medium text-slate-800">
                    {rowTotal.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveRow(row.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end items-center gap-3 pt-2 shrink-0">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Tổng Tiền Phiếu:
        </span>
        <span className="text-lg font-bold text-indigo-700">
          {totalAmount.toLocaleString('vi-VN')} đ
        </span>
      </div>
    </div>
  );
}
