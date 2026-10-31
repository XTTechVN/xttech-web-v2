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
  exportProfileBarsExcel,
  previewProfileBarsExcel,
  bulkUpsertProfileBars,
  getDoorSeriesList,
  getProfileSections,
  getProfileBars,
} from '@/actions';
import type {
  Brand,
  DoorSeries,
  ProfileBar,
  ProfileBarExcelItemData,
  ProfileBarExcelPreviewRow,
  ExcelRowAction,
} from '@/types';
import { ProfileBarExcelTable } from './profile-bar-excel-table';

interface ProfileBarExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: Brand[];
}

type FilterTab = 'ALL' | 'CREATE' | 'UPDATE' | 'ERROR';

function validateAndClassifyBarRow(
  data: ProfileBarExcelItemData,
  rowIndex: number,
  brands: Brand[],
  seriesList: DoorSeries[],
  existingBars: ProfileBar[],
  fallbackOldData?: ProfileBarExcelItemData | null,
): ProfileBarExcelPreviewRow {
  const errors: string[] = [];
  const code = (data.code || '').trim();
  const name = (data.name || '').trim();
  if (!code) errors.push('Thiếu mã thanh');
  if (!name) errors.push('Thiếu tên thanh');

  const brand = brands.find((b) => b.id === Number(data.brandId));
  if (!brand) errors.push('Chưa chọn hãng nhôm hợp lệ');

  const series = seriesList.find((s) => s.id === Number(data.seriesId));
  if (!series || (brand && series.brandId !== brand.id)) {
    errors.push('Hệ nhôm không thuộc hãng đã chọn');
  }
  if (!data.weightPerM || Number(data.weightPerM) <= 0) errors.push('Tỷ trọng phải > 0');

  const matched =
    code && series
      ? existingBars.find(
          (eb) => eb.seriesId === series.id && eb.code.trim().toUpperCase() === code.toUpperCase(),
        )
      : null;

  const oldData: ProfileBarExcelItemData | null = matched
    ? {
        code: matched.code,
        name: matched.name,
        brandId: matched.brandId ?? null,
        seriesId: matched.seriesId,
        barType: matched.barType,
        weightPerM: matched.weightPerM,
        barLengthMm: matched.barLengthMm ?? 6000,
        sectionHeightMm: matched.sectionHeightMm ?? 0,
        deductSashMm: matched.deductSashMm ?? 0,
        deductBeadMm: matched.deductBeadMm ?? 0,
        deductGlassMm: matched.deductGlassMm ?? 0,
        deductMullionMm: matched.deductMullionMm ?? 0,
        sectionLibraryId: matched.sectionLibraryId ?? null,
        isActive: matched.isActive !== false,
      }
    : (fallbackOldData ?? null);

  const action: ExcelRowAction = errors.length > 0 ? 'ERROR' : matched ? 'UPDATE' : 'CREATE';

  return {
    rowIndex,
    action,
    existingId: matched ? matched.id : null,
    data: {
      ...data,
      brandCode: brand?.code ?? data.brandCode,
      brandName: brand?.name ?? data.brandName,
      seriesCode: series?.code ?? data.seriesCode,
      seriesName: series?.name ?? data.seriesName,
    },
    oldData,
    errors,
    warnings: [],
  };
}

export function ProfileBarExcelModal({ isOpen, onClose, brands }: ProfileBarExcelModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [rows, setRows] = useState<ProfileBarExcelPreviewRow[]>([]);
  const [filterTab, setFilterTab] = useState<FilterTab>('ALL');
  const [fileName, setFileName] = useState<string>('');

  const { data: seriesList = [] } = useQuery({
    queryKey: ['door-series', 'all-for-excel'],
    queryFn: async () => (await getDoorSeriesList({ offset: 0, limit: 9999 })).items,
    enabled: isOpen,
  });

  const { data: sectionsList = [] } = useQuery({
    queryKey: ['profile-sections', 'all-for-excel'],
    queryFn: async () => await getProfileSections({ limit: 500 }),
    enabled: isOpen,
  });

  const { data: existingBars = [] } = useQuery({
    queryKey: ['profile-bars', 'all-for-excel'],
    queryFn: async () =>
      (await getProfileBars({ offset: 0, limit: 5000, allowDeleted: false })).items,
    enabled: isOpen,
  });

  const { mutate: previewMutate, isPending: isPreviewing } = useMutation({
    mutationFn: (file: File) => previewProfileBarsExcel(file),
    onSuccess: (res) => {
      setRows(res.rows || []);
      setFilterTab('ALL');
      toast.success(`Đã phân tích ${res.totalRows} dòng dữ liệu từ file Excel`);
    },
    onError: (err) => showErrorToast(err, 'Không thể đọc file Excel'),
  });

  const { mutate: upsertMutate, isPending: isSaving } = useMutation({
    mutationFn: bulkUpsertProfileBars,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['profile-bars'] });
      toast.success(
        `Hoàn tất nhập Excel: Thêm mới ${res.createdCount}, Cập nhật ${res.updatedCount} thanh profile!`,
      );
      setRows([]);
      setFileName('');
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi lưu dữ liệu thanh profile'),
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

  const handleUpdateCell = (rowIndex: number, patch: Partial<ProfileBarExcelItemData>) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.rowIndex !== rowIndex) return r;
        const nextData: ProfileBarExcelItemData = { ...r.data, ...patch };
        if (patch.brandId !== undefined && patch.brandId !== r.data.brandId) {
          const firstSeries = seriesList.find((s) => s.brandId === Number(patch.brandId));
          nextData.seriesId = firstSeries ? firstSeries.id : null;
        }
        return validateAndClassifyBarRow(
          nextData,
          r.rowIndex,
          brands,
          seriesList,
          existingBars,
          r.oldData,
        );
      }),
    );
  };

  const handleAddBlankRow = () => {
    const defaultBrand = brands[0] || null;
    const defaultSeries = defaultBrand
      ? seriesList.find((s) => s.brandId === defaultBrand.id) || null
      : null;
    const nextIdx = rows.length > 0 ? Math.max(...rows.map((r) => r.rowIndex)) + 1 : 2;
    const blankData: ProfileBarExcelItemData = {
      code: '',
      name: '',
      brandId: defaultBrand?.id ?? null,
      seriesId: defaultSeries?.id ?? null,
      barType: 'FRAME',
      weightPerM: 1.2,
      barLengthMm: 6000,
      sectionHeightMm: 55,
      deductSashMm: 0,
      deductBeadMm: 0,
      deductGlassMm: 0,
      deductMullionMm: 0,
      sectionLibraryId: null,
      isActive: true,
    };
    setRows((prev) => [
      ...prev,
      validateAndClassifyBarRow(blankData, nextIdx, brands, seriesList, existingBars),
    ]);
  };

  const handleConfirmSave = () => {
    const validRows = rows.filter((r) => r.action === 'CREATE' || r.action === 'UPDATE');
    if (validRows.length === 0) {
      toast.error('Không có dòng dữ liệu hợp lệ nào để lưu');
      return;
    }
    upsertMutate({
      items: validRows.map((r) => ({
        existingId: r.existingId,
        brandId: Number(r.data.brandId),
        seriesId: Number(r.data.seriesId),
        code: r.data.code.trim(),
        name: r.data.name.trim(),
        barType: r.data.barType,
        weightPerM: Number(r.data.weightPerM) || 0,
        barLengthMm: Number(r.data.barLengthMm) || 6000,
        sectionHeightMm: Number(r.data.sectionHeightMm) || 0,
        deductSashMm: Number(r.data.deductSashMm) || 0,
        deductBeadMm: Number(r.data.deductBeadMm) || 0,
        deductGlassMm: Number(r.data.deductGlassMm) || 0,
        deductMullionMm: Number(r.data.deductMullionMm) || 0,
        sectionLibraryId: r.data.sectionLibraryId ? Number(r.data.sectionLibraryId) : null,
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
            Nhập Excel & Kiểm tra dữ liệu Thanh Profile Nhôm
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
          <Button variant="outline" size="sm" leftIcon={<Download size={15} />} onClick={() => exportProfileBarsExcel({ templateOnly: true }).catch((err) => showErrorToast(err, 'Lỗi tải file mẫu'))}>
            Tải file mẫu (có sẵn Select Hãng → Hệ nhôm)
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
          <p className="text-sm font-semibold text-slate-700">Bấm vào đây để chọn file Excel (.xlsx) danh sách Thanh Profile</p>
          <p className="text-xs text-slate-500 mt-1 text-center max-w-lg">Hệ thống tự động đối chiếu mã thanh nhôm để phân loại Thêm mới, Cập nhật hoặc Báo lỗi. Bạn có thể sửa trực tiếp từng ô trong bảng trước khi lưu.</p>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-2xs">
          <ProfileBarExcelTable rows={filteredRows} brands={brands} seriesList={seriesList} sectionsList={sectionsList} onUpdateCell={handleUpdateCell} onRemoveRow={(idx) => setRows((prev) => prev.filter((r) => r.rowIndex !== idx))} />
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              Sẵn sàng lưu <strong className="text-emerald-600">{counts.create} thanh mới</strong> và <strong className="text-blue-600">{counts.update} thanh cập nhật</strong>.
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
