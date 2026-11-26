'use client';

import React from 'react';
import { Button } from '@/components';
import {
  Upload,
  AlertTriangle,
  PlusCircle,
  RefreshCw,
  Download,
  Plus,
  Trash2,
  ImagePlus,
  Wand2,
} from 'lucide-react';

export type AccessoryExcelFilterTab = 'ALL' | 'CREATE' | 'UPDATE' | 'ERROR';

interface AccessoryExcelHeaderProps {
  fileName: string;
  isPreviewing: boolean;
  counts: { total: number; create: number; update: number; error: number; valid: number };
  duplicateRowCount: number;
  filterTab: AccessoryExcelFilterTab;
  onFilterTabChange: (tab: AccessoryExcelFilterTab) => void;
  onPickExcelFile: () => void;
  onDownloadTemplate: () => void;
  onAddBlankRow: () => void;
  onDisambiguateDuplicates: () => void;
  onPickBatchImages: () => void;
  onClearAll: () => void;
}

export function AccessoryExcelHeader({
  fileName,
  isPreviewing,
  counts,
  duplicateRowCount,
  filterTab,
  onFilterTabChange,
  onPickExcelFile,
  onDownloadTemplate,
  onAddBlankRow,
  onDisambiguateDuplicates,
  onPickBatchImages,
  onClearAll,
}: AccessoryExcelHeaderProps) {
  return (
    <>
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button variant="primary" size="sm" leftIcon={<Upload size={15} />} loading={isPreviewing} onClick={onPickExcelFile}>
            {fileName ? 'Chọn file Excel khác' : 'Tải file Excel (.xlsx) lên'}
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Download size={15} />} onClick={onDownloadTemplate}>
            Tải file mẫu (có sẵn Select Hãng &amp; Danh mục)
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Plus size={15} />} onClick={onAddBlankRow}>
            Thêm dòng trực tiếp
          </Button>
          {duplicateRowCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Wand2 size={15} />}
              onClick={onDisambiguateDuplicates}
              className="border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:border-amber-400"
            >
              Tự tách mã trùng ({duplicateRowCount})
            </Button>
          )}
          {counts.total > 0 && (
            <>
              <Button variant="outline" size="sm" leftIcon={<ImagePlus size={15} />} onClick={onPickBatchImages}>
                Ghép ảnh theo Mã
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Trash2 size={15} />}
                onClick={onClearAll}
                className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
              >
                Xóa toàn bộ ({counts.total})
              </Button>
            </>
          )}
          {fileName && (
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              File: <strong>{fileName}</strong>
            </span>
          )}
        </div>

        {counts.total > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => onFilterTabChange('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                filterTab === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Tất cả ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => onFilterTabChange('CREATE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                filterTab === 'CREATE' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              <PlusCircle size={13} /> Thêm mới ({counts.create})
            </button>
            <button
              type="button"
              onClick={() => onFilterTabChange('UPDATE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                filterTab === 'UPDATE' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
              }`}
            >
              <RefreshCw size={13} /> Cập nhật ({counts.update})
            </button>
            <button
              type="button"
              onClick={() => onFilterTabChange('ERROR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                filterTab === 'ERROR' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'
              }`}
            >
              <AlertTriangle size={13} /> Lỗi ({counts.error})
            </button>
          </div>
        )}
      </div>

      {duplicateRowCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900">
          <div className="flex items-start sm:items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              Có <strong>{duplicateRowCount} dòng</strong> đang dùng chung <strong>Mã phụ kiện</strong> trong cùng file Excel. Mỗi phụ kiện cần mã duy nhất để đồng bộ chuẩn với Tồn kho Xưởng &amp; Combo (nếu giữ trùng mã sẽ ghi đè mất các dòng trước).
            </span>
          </div>
          <Button variant="primary" size="sm" leftIcon={<Wand2 size={14} />} onClick={onDisambiguateDuplicates} className="shrink-0">
            Tự tách mã trùng ngay
          </Button>
        </div>
      )}
    </>
  );
}

