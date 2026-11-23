'use client';

import React, { useRef, useState } from 'react';
import { CheckCircle2, FileSpreadsheet, Upload } from 'lucide-react';
import { Button, Modal, Select } from '@/components';
import { importTaxInvoicesExcel } from '@/actions';
import type {
  TaxInvoiceDirection,
  TaxInvoiceExcelImportResponse,
} from '@/types';
import { showErrorToast, showSuccessToast } from '@/utils';
import { TAX_DIRECTION_OPTIONS } from '../tax-tab.constants';
import { ImportExcelPreview } from './import-excel-preview';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => Promise<void> | void;
  onOpenVoucherDetail: (voucherId: number) => void;
}

function ImportExcelModalBody({
  onClose,
  onImported,
  onOpenVoucherDetail,
}: Omit<ImportExcelModalProps, 'isOpen'>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [direction, setDirection] = useState<TaxInvoiceDirection>('input');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<TaxInvoiceExcelImportResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [importing, setImporting] = useState(false);

  const runPreview = async (file: File, nextDir: TaxInvoiceDirection) => {
    setSelectedFile(file);
    setLoadingPreview(true);
    try {
      const res = await importTaxInvoicesExcel(file, nextDir, true);
      setPreview(res);
    } catch (err) {
      setPreview(null);
      showErrorToast(err, 'Không thể đọc file Excel bảng kê GDT');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    void runPreview(file, direction);
  };

  const handleDirectionChange = (nextDir: TaxInvoiceDirection) => {
    setDirection(nextDir);
    if (selectedFile) {
      void runPreview(selectedFile, nextDir);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile || !preview) return;
    setImporting(true);
    try {
      const res = await importTaxInvoicesExcel(selectedFile, direction, false);
      await onImported();
      showSuccessToast(
        `Đã nhập ${res.createCount} hóa đơn mới, cập nhật ${res.updateStatusCount} trạng thái`,
      );
      if (res.postedVoucherWarnings.length === 0) {
        onClose();
      } else {
        setPreview(res);
      }
    } catch (err) {
      showErrorToast(err, 'Không thể lưu danh sách hóa đơn từ file Excel');
    } finally {
      setImporting(false);
    }
  };

  const actionableCount = (preview?.createCount || 0) + (preview?.updateStatusCount || 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <Select
          label="Loại bảng kê Excel"
          value={direction}
          onChange={(e) => handleDirectionChange(e.target.value as TaxInvoiceDirection)}
          options={TAX_DIRECTION_OPTIONS}
          disabled={loadingPreview || importing}
          fullWidth
        />
        <div className="md:col-span-2 flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xlsm,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={loadingPreview}
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Upload size={14} />}
          >
            {selectedFile ? 'Chọn file khác' : 'Chọn file .xlsx / .csv'}
          </Button>
          {selectedFile && (
            <span className="text-xs font-mono text-slate-600 truncate max-w-xs">
              {selectedFile.name}
            </span>
          )}
        </div>
      </div>

      {!preview ? (
        <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-xs text-slate-600 space-y-1.5">
          <div className="font-semibold text-primary flex items-center gap-1.5">
            <FileSpreadsheet size={14} />
            Hướng dẫn lấy file Excel hàng loạt từ Tổng cục Thuế
          </div>
          <p>
            1. Đăng nhập <span className="font-mono">hoadondientu.gdt.gov.vn</span> →{' '}
            <strong>Tra cứu → Tra cứu hóa đơn</strong> (chọn Mua vào hoặc Bán ra).
          </p>
          <p>2. Chọn khoảng ngày → bấm <strong>Tìm kiếm</strong> → bấm <strong>Kết xuất Excel</strong>.</p>
          <p>3. Chọn file <span className="font-mono">.xlsx</span> vừa tải về tại đây để xem trước và nhập hàng loạt.</p>
        </div>
      ) : (
        <ImportExcelPreview preview={preview} onOpenVoucherDetail={onOpenVoucherDetail} />
      )}

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={importing}>
          Đóng
        </Button>
        {preview && preview.dryRun && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={importing}
            disabled={actionableCount === 0}
            onClick={handleConfirmImport}
            leftIcon={<CheckCircle2 size={14} />}
          >
            Xác nhận nhập ({actionableCount} hóa đơn)
          </Button>
        )}
      </div>
    </div>
  );
}

export function ImportExcelModal({ isOpen, ...props }: ImportExcelModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={props.onClose} size="xl" title="Nhập Hóa đơn GTGT hàng loạt từ Excel Cổng Thuế (GDT)">
      {isOpen && <ImportExcelModalBody {...props} />}
    </Modal>
  );
}
