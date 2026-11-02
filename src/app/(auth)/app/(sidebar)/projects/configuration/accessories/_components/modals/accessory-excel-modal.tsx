'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Modal, Button } from '@/components';
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  PlusCircle,
  RefreshCw,
  Download,
  Plus,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import {
  exportAccessoriesExcel,
  previewAccessoriesExcel,
  bulkUpsertAccessories,
  getAccessories,
} from '@/actions';
import type {
  Brand,
  Accessory,
  AccessoryCategory,
  AccessoryExcelItemData,
  AccessoryExcelPreviewRow,
  ExcelRowAction,
} from '@/types';
import { AccessoryExcelTable } from './accessory-excel-table';

interface AccessoryExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: Brand[];
  categories: AccessoryCategory[];
}

type FilterTab = 'ALL' | 'CREATE' | 'UPDATE' | 'ERROR';

function validateAccessoryRow(
  data: AccessoryExcelItemData,
  rowIndex: number,
  brands: Brand[],
  categories: AccessoryCategory[],
  existingAccessories: Accessory[],
  fallbackOld?: AccessoryExcelItemData | null,
): AccessoryExcelPreviewRow {
  const errors: string[] = [];
  const code = (data.code || '').trim();
  const name = (data.name || '').trim();
  if (!code) errors.push('Thiếu mã phụ kiện');
  if (!name) errors.push('Thiếu tên phụ kiện');

  const brand = brands.find((b) => b.id === Number(data.brandId));
  if (!brand) errors.push('Chưa chọn hãng phụ kiện');
  if (Number(data.unitPrice) < 0) errors.push('Đơn giá không hợp lệ');

  const cat = categories.find((c) => c.id === Number(data.categoryId));
  const matched = code
    ? existingAccessories.find((a) => (a.code || '').trim().toUpperCase() === code.toUpperCase())
    : null;
  const action: ExcelRowAction = errors.length > 0 ? 'ERROR' : matched ? 'UPDATE' : 'CREATE';

  return {
    rowIndex,
    action,
    existingId: matched ? matched.id : null,
    data: {
      ...data,
      brandCode: brand?.code ?? data.brandCode,
      brandName: brand?.name ?? data.brandName,
      categoryCode: cat?.code ?? data.categoryCode,
      categoryName: cat?.name ?? data.categoryName,
    },
    oldData: matched
      ? {
          code: matched.code || '',
          name: matched.name,
          brandId: matched.brandId ?? null,
          categoryId: matched.categoryId ?? null,
          unit: matched.unit || 'pcs',
          color: matched.color || 'black',
          specification: matched.specification ?? null,
          unitPrice: matched.unitPrice ?? matched.salePrice ?? 0,
          costPrice: matched.costPrice ?? 0,
          isActive: matched.isActive !== false,
        }
      : (fallbackOld ?? null),
    errors,
    warnings: [],
  };
}

export function AccessoryExcelModal({
  isOpen,
  onClose,
  brands,
  categories,
}: AccessoryExcelModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [rows, setRows] = useState<AccessoryExcelPreviewRow[]>([]);
  const [filterTab, setFilterTab] = useState<FilterTab>('ALL');
  const [fileName, setFileName] = useState<string>('');

  const { data: existingAccessories = [] } = useQuery({
    queryKey: ['accessories', 'all-for-excel'],
    queryFn: async () =>
      (await getAccessories({ offset: 0, limit: 5000, allowDeleted: false })).items,
    enabled: isOpen,
  });

  const { mutate: previewMutate, isPending: isPreviewing } = useMutation({
    mutationFn: (file: File) => previewAccessoriesExcel(file),
    onSuccess: (res) => {
      setRows(res.rows || []);
      setFilterTab('ALL');
      toast.success(`Đã phân tích ${res.totalRows} dòng phụ kiện từ file Excel`);
    },
    onError: (err) => showErrorToast(err, 'Không thể đọc file Excel'),
  });

  const { mutate: upsertMutate, isPending: isSaving } = useMutation({
    mutationFn: bulkUpsertAccessories,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast.success(
        `Hoàn tất: Thêm mới ${res.createdCount}, Cập nhật ${res.updatedCount} phụ kiện!`,
      );
      setRows([]);
      setFileName('');
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi lưu danh sách phụ kiện'),
  });

  const counts = useMemo(() => {
    let create = 0;
    let update = 0;
    let error = 0;
    rows.forEach((r) => {
      if (r.action === 'CREATE') create++;
      else if (r.action === 'UPDATE') update++;
      else error++;
    });
    return { total: rows.length, create, update, error, valid: create + update };
  }, [rows]);

  const filteredRows = useMemo(
    () => (filterTab === 'ALL' ? rows : rows.filter((r) => r.action === filterTab)),
    [rows, filterTab],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    previewMutate(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    setRows([]);
    setFileName('');
    setFilterTab('ALL');
    toast.success('Đã xóa toàn bộ dữ liệu đang nhập');
  };

  const handleUpdateCell = (rowIndex: number, patch: Partial<AccessoryExcelItemData>) => {
    setRows((prev) =>
      prev.map((r) =>
        r.rowIndex === rowIndex
          ? validateAccessoryRow(
              { ...r.data, ...patch },
              r.rowIndex,
              brands,
              categories,
              existingAccessories,
              r.oldData,
            )
          : r,
      ),
    );
  };

  const handleAddBlankRow = () => {
    const nextIdx = rows.length > 0 ? Math.max(...rows.map((r) => r.rowIndex)) + 1 : 2;
    const blank: AccessoryExcelItemData = {
      code: '',
      name: '',
      brandId: brands[0]?.id ?? null,
      categoryId: categories[0]?.id ?? null,
      unit: 'pcs',
      color: 'black',
      specification: null,
      unitPrice: 150000,
      costPrice: 120000,
      isActive: true,
    };
    setRows((prev) => [
      ...prev,
      validateAccessoryRow(blank, nextIdx, brands, categories, existingAccessories),
    ]);
  };

  const handleConfirmSave = () => {
    const validRows = rows.filter((r) => r.action === 'CREATE' || r.action === 'UPDATE');
    if (validRows.length === 0) {
      toast.error('Không có dòng phụ kiện hợp lệ nào để lưu');
      return;
    }
    upsertMutate({
      items: validRows.map((r) => ({
        existingId: r.existingId,
        code: r.data.code.trim(),
        name: r.data.name.trim(),
        brandId: r.data.brandId ? Number(r.data.brandId) : null,
        categoryId: r.data.categoryId ? Number(r.data.categoryId) : null,
        unit: r.data.unit,
        color: r.data.color,
        specification: r.data.specification,
        unitPrice: Number(r.data.unitPrice) || 0,
        costPrice: Number(r.data.costPrice) || 0,
        isActive: r.data.isActive,
      })),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title={
        <div className="flex items-center gap-2.5">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-slate-900">
            Nhập Excel & Kiểm tra dữ liệu Phụ Kiện Kim Khí
          </span>
        </div>
      }
      bodyClassName="p-4 sm:p-6 bg-slate-50/60 min-h-[calc(100vh-65px)] flex flex-col gap-4"
    >
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <input ref={fileInputRef} type="file" accept=".xlsx" onChange={handleFileChange} className="hidden" />
          <Button variant="primary" size="sm" leftIcon={<Upload size={15} />} loading={isPreviewing} onClick={() => fileInputRef.current?.click()}>
            {fileName ? 'Chọn file Excel khác' : 'Tải file Excel (.xlsx) lên'}
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Download size={15} />} onClick={() => exportAccessoriesExcel({ templateOnly: true }).catch((err) => showErrorToast(err, 'Lỗi tải file mẫu'))}>
            Tải file mẫu (có sẵn Select Hãng & Danh mục)
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Plus size={15} />} onClick={handleAddBlankRow}>
            Thêm dòng trực tiếp
          </Button>
          {rows.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 size={15} />}
              onClick={handleClearAll}
              className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
            >
              Xóa toàn bộ ({counts.total})
            </Button>
          )}
          {fileName && <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">File: <strong>{fileName}</strong></span>}
        </div>

        {rows.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button type="button" onClick={() => setFilterTab('ALL')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${filterTab === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}>Tất cả ({counts.total})</button>
            <button type="button" onClick={() => setFilterTab('CREATE')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${filterTab === 'CREATE' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'}`}><PlusCircle size={13} /> Thêm mới ({counts.create})</button>
            <button type="button" onClick={() => setFilterTab('UPDATE')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${filterTab === 'UPDATE' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}><RefreshCw size={13} /> Cập nhật ({counts.update})</button>
            <button type="button" onClick={() => setFilterTab('ERROR')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${filterTab === 'ERROR' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'}`}><AlertTriangle size={13} /> Lỗi ({counts.error})</button>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div onClick={() => fileInputRef.current?.click()} className="flex-1 bg-white border-2 border-dashed border-slate-300 hover:border-primary rounded-2xl flex flex-col items-center justify-center p-10 cursor-pointer transition">
          <Upload className="w-12 h-12 text-slate-400 mb-3 stroke-1" />
          <p className="text-sm font-semibold text-slate-700">Bấm để chọn file Excel (.xlsx) danh sách Phụ kiện</p>
          <p className="text-xs text-slate-500 mt-1 text-center max-w-lg">Tự động phân loại Thêm mới, Cập nhật hoặc Báo lỗi và hỗ trợ chỉnh sửa trực tiếp ngay trong bảng.</p>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-2xs">
          <AccessoryExcelTable rows={filteredRows} brands={brands} categories={categories} onUpdateCell={handleUpdateCell} onRemoveRow={(idx) => setRows((prev) => prev.filter((r) => r.rowIndex !== idx))} />
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              Sẵn sàng lưu <strong className="text-emerald-600">{counts.create} phụ kiện mới</strong> và <strong className="text-blue-600">{counts.update} phụ kiện cập nhật</strong>.
              {counts.error > 0 && <span className="text-rose-600 font-semibold ml-2">(Còn {counts.error} dòng lỗi sẽ bị bỏ qua nếu không sửa)</span>}
            </div>
            <div className="flex items-center gap-2.5">
              <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>Đóng</Button>
              <Button variant="primary" size="sm" loading={isSaving} disabled={counts.valid === 0} onClick={handleConfirmSave}>Xác nhận lưu ({counts.valid} dòng hợp lệ)</Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
