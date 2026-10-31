'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
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
  exportGlassGasketsExcel,
  previewGlassGasketsExcel,
  bulkUpsertGlassGaskets,
} from '@/actions';
import type {
  Glass,
  GlassCategory,
  Gasket,
  GlassExcelItemData,
  GlassExcelPreviewRow,
  GasketExcelItemData,
  GasketExcelPreviewRow,
} from '@/types';
import { getCategoryMaterialType } from '../glass-category-sidebar';
import { GlassExcelTable } from './glass-gasket-excel-tables';
import { GasketExcelTable } from './gasket-excel-table';
import { validateGlassRow, validateGasketRow } from './glass-gasket-excel-utils';

interface GlassGasketExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: GlassCategory[];
  existingGlasses: Glass[];
  existingGaskets: Gasket[];
}

type SheetTab = 'GLASS' | 'GASKET';
type FilterTab = 'ALL' | 'CREATE' | 'UPDATE' | 'ERROR';

export function GlassGasketExcelModal({
  isOpen,
  onClose,
  categories,
  existingGlasses,
  existingGaskets,
}: GlassGasketExcelModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [glassRows, setGlassRows] = useState<GlassExcelPreviewRow[]>([]);
  const [gasketRows, setGasketRows] = useState<GasketExcelPreviewRow[]>([]);
  const [sheetTab, setSheetTab] = useState<SheetTab>('GLASS');
  const [filterTab, setFilterTab] = useState<FilterTab>('ALL');
  const [fileName, setFileName] = useState<string>('');

  const { mutate: previewMutate, isPending: isPreviewing } = useMutation({
    mutationFn: (file: File) => previewGlassGasketsExcel(file),
    onSuccess: (res) => {
      setGlassRows(res.glasses || []);
      setGasketRows(res.gaskets || []);
      setSheetTab(
        (res.glasses?.length ?? 0) > 0 || (res.gaskets?.length ?? 0) === 0 ? 'GLASS' : 'GASKET',
      );
      setFilterTab('ALL');
      toast.success(`Đã đọc ${res.totalRows} dòng dữ liệu từ file Excel`);
    },
    onError: (err) => showErrorToast(err, 'Không thể đọc file Excel'),
  });

  const { mutate: upsertMutate, isPending: isSaving } = useMutation({
    mutationFn: bulkUpsertGlassGaskets,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['glasses'] });
      queryClient.invalidateQueries({ queryKey: ['gaskets'] });
      toast.success(`Hoàn tất: Thêm mới ${res.createdCount}, Cập nhật ${res.updatedCount} mục!`);
      setGlassRows([]);
      setGasketRows([]);
      setFileName('');
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi lưu dữ liệu Kính & Gioăng'),
  });

  const counts = useMemo(() => {
    const all = [...glassRows, ...gasketRows];
    let create = 0;
    let update = 0;
    let error = 0;
    all.forEach((r) => {
      if (r.action === 'CREATE') create++;
      else if (r.action === 'UPDATE') update++;
      else error++;
    });
    return { total: all.length, create, update, error, valid: create + update };
  }, [glassRows, gasketRows]);

  const filteredGlasses = useMemo(
    () => (filterTab === 'ALL' ? glassRows : glassRows.filter((r) => r.action === filterTab)),
    [glassRows, filterTab],
  );
  const filteredGaskets = useMemo(
    () => (filterTab === 'ALL' ? gasketRows : gasketRows.filter((r) => r.action === filterTab)),
    [gasketRows, filterTab],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    previewMutate(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    setGlassRows([]);
    setGasketRows([]);
    setFileName('');
    setFilterTab('ALL');
    toast.success('Đã xóa toàn bộ dữ liệu đang nhập');
  };

  const handleUpdateGlassCell = (rowIndex: number, patch: Partial<GlassExcelItemData>) => {
    setGlassRows((prev) =>
      prev.map((r) => {
        if (r.rowIndex !== rowIndex) return r;
        const nextData: GlassExcelItemData = { ...r.data, ...patch };
        if (patch.materialType && patch.materialType !== r.data.materialType) {
          const firstCat = categories.find(
            (c) => getCategoryMaterialType(c) === patch.materialType,
          );
          nextData.categoryId = firstCat ? firstCat.id : null;
        }
        return validateGlassRow(nextData, r.rowIndex, categories, existingGlasses, r.oldData);
      }),
    );
  };

  const handleUpdateGasketCell = (rowIndex: number, patch: Partial<GasketExcelItemData>) => {
    setGasketRows((prev) =>
      prev.map((r) =>
        r.rowIndex === rowIndex
          ? validateGasketRow({ ...r.data, ...patch }, r.rowIndex, existingGaskets, r.oldData)
          : r,
      ),
    );
  };

  const handleAddRow = () => {
    if (sheetTab === 'GLASS') {
      const firstCat = categories[0] || null;
      const nextIdx = glassRows.length > 0 ? Math.max(...glassRows.map((r) => r.rowIndex)) + 1 : 2;
      const blank: GlassExcelItemData = {
        code: '',
        name: '',
        materialType: firstCat ? getCategoryMaterialType(firstCat) : 'glass',
        categoryId: firstCat?.id ?? null,
        glassType: 'cuong_luc',
        thicknessMm: 8,
        unitPrice: 450000,
        weightPerM2: 20,
        maxWidthMm: 2400,
        maxHeightMm: 3600,
        isDefault: false,
        isActive: true,
      };
      setGlassRows((prev) => [
        ...prev,
        validateGlassRow(blank, nextIdx, categories, existingGlasses),
      ]);
    } else {
      const nextIdx =
        gasketRows.length > 0 ? Math.max(...gasketRows.map((r) => r.rowIndex)) + 1 : 2;
      const blank: GasketExcelItemData = {
        code: '',
        name: '',
        unit: 'm',
        pricePerUnit: 8000,
        isActive: true,
      };
      setGasketRows((prev) => [...prev, validateGasketRow(blank, nextIdx, existingGaskets)]);
    }
  };

  const handleConfirmSave = () => {
    const validGlasses = glassRows.filter((r) => r.action === 'CREATE' || r.action === 'UPDATE');
    const validGaskets = gasketRows.filter((r) => r.action === 'CREATE' || r.action === 'UPDATE');
    if (validGlasses.length === 0 && validGaskets.length === 0) {
      toast.error('Không có dòng hợp lệ nào để lưu');
      return;
    }
    upsertMutate({
      glasses: validGlasses.map((r) => ({
        existingId: r.existingId,
        categoryId: Number(r.data.categoryId),
        code: r.data.code.trim(),
        name: r.data.name.trim(),
        glassType: r.data.glassType || 'cuong_luc',
        thicknessMm: Number(r.data.thicknessMm),
        unitPrice: Number(r.data.unitPrice) || 0,
        weightPerM2: Number(r.data.weightPerM2) || 0,
        maxWidthMm: r.data.maxWidthMm,
        maxHeightMm: r.data.maxHeightMm,
        isDefault: r.data.isDefault,
        isActive: r.data.isActive,
      })),
      gaskets: validGaskets.map((r) => ({
        existingId: r.existingId,
        code: r.data.code.trim(),
        name: r.data.name.trim(),
        unit: r.data.unit,
        pricePerUnit: Number(r.data.pricePerUnit) || 0,
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
            Nhập Excel & Kiểm tra Kính, Tấm Pano, Lưới Muỗi & Gioăng Keo
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
          <Button variant="outline" size="sm" leftIcon={<Download size={15} />} onClick={() => exportGlassGasketsExcel({ templateOnly: true }).catch((err) => showErrorToast(err, 'Lỗi tải file mẫu'))}>
            Tải file mẫu (2 Sheet: Kính & Gioăng)
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Plus size={15} />} onClick={handleAddRow}>
            Thêm dòng trực tiếp
          </Button>
          {counts.total > 0 && (
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

        {counts.total > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button type="button" onClick={() => setFilterTab('ALL')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${filterTab === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}>Tất cả ({counts.total})</button>
            <button type="button" onClick={() => setFilterTab('CREATE')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${filterTab === 'CREATE' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'}`}><PlusCircle size={13} /> Thêm mới ({counts.create})</button>
            <button type="button" onClick={() => setFilterTab('UPDATE')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${filterTab === 'UPDATE' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}><RefreshCw size={13} /> Cập nhật ({counts.update})</button>
            <button type="button" onClick={() => setFilterTab('ERROR')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${filterTab === 'ERROR' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'}`}><AlertTriangle size={13} /> Lỗi ({counts.error})</button>
          </div>
        )}
      </div>

      {counts.total === 0 ? (
        <div onClick={() => fileInputRef.current?.click()} className="flex-1 bg-white border-2 border-dashed border-slate-300 hover:border-primary rounded-2xl flex flex-col items-center justify-center p-10 cursor-pointer transition">
          <Upload className="w-12 h-12 text-slate-400 mb-3 stroke-1" />
          <p className="text-sm font-semibold text-slate-700">Bấm để chọn file Excel (.xlsx) Kính / Tấm / Lưới & Gioăng</p>
          <p className="text-xs text-slate-500 mt-1 text-center max-w-lg">Hỗ trợ đồng thời cả 2 sheet <strong>Kinh_Tam_Luoi</strong> và <strong>Gioang_Keo</strong> trong cùng 1 file Excel.</p>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-2xs">
          <div className="px-4 pt-3 border-b border-slate-200 flex items-center gap-2 bg-slate-50/70">
            <button type="button" onClick={() => setSheetTab('GLASS')} className={`px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 transition cursor-pointer ${sheetTab === 'GLASS' ? 'border-primary text-primary bg-white' : 'border-transparent text-slate-600'}`}>
              Sheet 1: Kính / Tấm / Lưới ({glassRows.length})
            </button>
            <button type="button" onClick={() => setSheetTab('GASKET')} className={`px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 transition cursor-pointer ${sheetTab === 'GASKET' ? 'border-primary text-primary bg-white' : 'border-transparent text-slate-600'}`}>
              Sheet 2: Gioăng / Keo ({gasketRows.length})
            </button>
          </div>

          {sheetTab === 'GLASS' ? (
            <GlassExcelTable rows={filteredGlasses} categories={categories} onUpdateCell={handleUpdateGlassCell} onRemoveRow={(idx) => setGlassRows((prev) => prev.filter((r) => r.rowIndex !== idx))} />
          ) : (
            <GasketExcelTable rows={filteredGaskets} onUpdateCell={handleUpdateGasketCell} onRemoveRow={(idx) => setGasketRows((prev) => prev.filter((r) => r.rowIndex !== idx))} />
          )}

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              Sẵn sàng lưu <strong className="text-emerald-600">{counts.create} mục mới</strong> và <strong className="text-blue-600">{counts.update} mục cập nhật</strong>.
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
