'use client';

import React, { useRef } from 'react';
import { Modal, Button } from '@/components';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { showErrorToast } from '@/utils';
import { exportAccessoriesExcel } from '@/actions';
import type { Brand, AccessoryCategory } from '@/types';
import { AccessoryExcelHeader } from './accessory-excel-header';
import { AccessoryExcelTable } from './accessory-excel-table';
import { useAccessoryExcel } from './use-accessory-excel';

interface AccessoryExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: Brand[];
  categories: AccessoryCategory[];
  defaultBrandId?: number | null;
  onImportSuccess?: (
    importedBrandIds: number[],
    importedCategoryIds: Array<number | null>,
  ) => void;
}

export function AccessoryExcelModal({
  isOpen,
  onClose,
  brands,
  categories,
  defaultBrandId,
  onImportSuccess,
}: AccessoryExcelModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const batchImageInputRef = useRef<HTMLInputElement | null>(null);

  const {
    rows,
    filteredRows,
    filterTab,
    setFilterTab,
    fileName,
    uploadingRows,
    counts,
    duplicateRowCount,
    isPreviewing,
    isSaving,
    handleFileChange,
    handleUpdateCell,
    handleRemoveRow,
    handleDisambiguateDuplicates,
    handleUploadRowImage,
    handleBatchImageMatch,
    handleAddBlankRow,
    handleClearAll,
    handleConfirmSave,
  } = useAccessoryExcel({
    isOpen,
    onClose,
    brands,
    categories,
    defaultBrandId,
    onImportSuccess,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title={
        <div className="flex items-center gap-2.5">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-slate-900">
            Nhập Excel &amp; Kiểm tra dữ liệu Phụ Kiện, Roan &amp; Keo
          </span>
        </div>
      }
      bodyClassName="p-4 sm:p-6 bg-slate-50/60 min-h-[calc(100vh-65px)] flex flex-col gap-4"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={batchImageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleBatchImageMatch}
        className="hidden"
      />

      <AccessoryExcelHeader
        fileName={fileName}
        isPreviewing={isPreviewing}
        counts={counts}
        duplicateRowCount={duplicateRowCount}
        filterTab={filterTab}
        onFilterTabChange={setFilterTab}
        onPickExcelFile={() => fileInputRef.current?.click()}
        onDownloadTemplate={() =>
          exportAccessoriesExcel({ templateOnly: true, brandId: defaultBrandId }).catch((err) =>
            showErrorToast(err, 'Lỗi tải file mẫu'),
          )
        }
        onAddBlankRow={handleAddBlankRow}
        onDisambiguateDuplicates={handleDisambiguateDuplicates}
        onPickBatchImages={() => batchImageInputRef.current?.click()}
        onClearAll={handleClearAll}
      />

      {rows.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 bg-white border-2 border-dashed border-slate-300 hover:border-primary rounded-2xl flex flex-col items-center justify-center p-10 cursor-pointer transition"
        >
          <Upload className="w-12 h-12 text-slate-400 mb-3 stroke-1" />
          <p className="text-sm font-semibold text-slate-700">
            Bấm để chọn file Excel (.xlsx) danh sách Phụ kiện
          </p>
          <p className="text-xs text-slate-500 mt-1 text-center max-w-lg">
            Tự động phân loại Thêm mới, Cập nhật hoặc Báo lỗi, trích xuất ảnh từ Excel và hỗ trợ chỉnh sửa/ghép ảnh trực tiếp ngay trong bảng.
          </p>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-2xs">
          <AccessoryExcelTable
            rows={filteredRows}
            brands={brands}
            categories={categories}
            uploadingRowIndices={uploadingRows}
            onUpdateCell={handleUpdateCell}
            onUploadRowImage={handleUploadRowImage}
            onRemoveRow={handleRemoveRow}
          />
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              Sẵn sàng lưu <strong className="text-emerald-600">{counts.create} phụ kiện mới</strong> và{' '}
              <strong className="text-blue-600">{counts.update} phụ kiện cập nhật</strong>.
              {counts.error > 0 && (
                <span className="text-rose-600 font-semibold ml-2">
                  (Còn {counts.error} dòng lỗi đang tạm bỏ qua — hãy sửa hoặc bấm Tự tách mã trùng)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
                Đóng
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isSaving}
                disabled={counts.valid === 0}
                onClick={handleConfirmSave}
              >
                Xác nhận lưu ({counts.valid} dòng hợp lệ)
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
