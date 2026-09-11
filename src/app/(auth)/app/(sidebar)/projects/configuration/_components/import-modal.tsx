'use client';

import React, { useState, useRef } from 'react';
import { Modal, Button } from '@/components';
import { UploadCloud, Loader2, Download, FileCheck, Search, X } from 'lucide-react';
import { previewImportProjectExcel, importProjectExcel, downloadProjectImportTemplate } from '@/actions';
import type { ImportPreviewResult, ImportPreviewSheet, ImportResult } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHEET_LABELS: Record<string, string> = {
  Phu_Kien: 'Phụ kiện',
  accessories: 'Phụ kiện',
  He_Nhom: 'Hệ nhôm',
  materials: 'Hệ nhôm',
  Cua: 'Biên dạng cửa',
  doors: 'Biên dạng cửa',
};

const UNIT_LABELS: Record<string, string> = {
  area: 'm²',
  set: 'Bộ',
  pcs: 'Cái',
  unit: 'Chiếc',
  pair: 'Đôi',
  m: 'm',
  md: 'md',
  kg: 'kg',
};

const DOOR_TYPE_LABELS: Record<string, string> = {
  cd: 'Cửa đi',
  cs: 'Cửa sổ',
  ck: 'Cửa kính',
};

const formatPrice = (val: unknown): string => {
  if (val === null || val === undefined || val === '') return '—';
  const num = Number(val);
  if (isNaN(num)) return '—';
  return `${num.toLocaleString('vi-VN')} đ`;
};

export const ProjectImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewResult, setPreviewResult] = useState<ImportPreviewResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state khi đóng hoặc mở modal
  const handleClose = () => {
    if (isImporting || isPreviewing) return;
    setFile(null);
    setPreviewResult(null);
    setImportResult(null);
    setActiveTab('');
    setSearchTerm('');
    onClose();
  };

  // 1. Tải template
  const handleDownloadTemplate = async () => {
    try {
      await downloadProjectImportTemplate();
      toast.success('Đang tải xuống file mẫu...');
    } catch {
      toast.error('Lỗi khi tải xuống file mẫu');
    }
  };

  // 2. Chọn file và tự động preview
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.xlsx')) {
      toast.error('Vui lòng chọn file Excel có định dạng .xlsx');
      return;
    }

    setFile(selectedFile);
    setImportResult(null);
    setIsPreviewing(true);

    try {
      const res = await previewImportProjectExcel(selectedFile);
      setPreviewResult(res);

      // Chọn tab đầu tiên có dữ liệu
      const sheetNames = Object.keys(res.sheets || {});
      if (sheetNames.length > 0) {
        setActiveTab(sheetNames[0]);
      }
      toast.success('Kiểm tra dữ liệu thành công!');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Lỗi khi đọc và kiểm tra dữ liệu file Excel');
      setFile(null);
      setPreviewResult(null);
    } finally {
      setIsPreviewing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 3. Thực hiện import thật
  const handleConfirmImport = async () => {
    if (!file) return;
    setIsImporting(true);
    const toastId = toast.loading('Đang nhập dữ liệu vào hệ thống...');

    try {
      const res = await importProjectExcel(file);
      setImportResult(res);
      toast.success(`Đã nhập thành công ${res.total_imported} bản ghi!`, { id: toastId });

      // Refresh các query liên quan
      queryClient.invalidateQueries({ queryKey: ['doors'] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Lỗi khi nhập dữ liệu vào hệ thống', { id: toastId });
    } finally {
      setIsImporting(false);
    }
  };

  const sheetKeys = Object.keys(previewResult?.sheets || {});
  const currentSheet: ImportPreviewSheet | undefined = previewResult?.sheets?.[activeTab];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nhập dữ liệu từ Excel" size="xl" className="max-w-5xl w-full">
      <div className="flex flex-col gap-5 py-1 text-slate-800">
        {/* Top Header Controls: Tải template & upload file */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">{file ? file.name : 'Chưa chọn file'}</span>
            <span className="text-xs text-slate-500">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Hỗ trợ file template chuẩn (.xlsx) gồm các sheet Cửa, Phụ kiện, Hệ nhôm'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={14} />}
              onClick={handleDownloadTemplate}
              className="text-xs font-semibold hover:text-primary hover:border-primary/40 shrink-0"
            >
              Tải file mẫu
            </Button>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx" className="hidden" />

            <Button
              variant="primary"
              size="sm"
              leftIcon={isPreviewing ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
              onClick={() => fileInputRef.current?.click()}
              disabled={isPreviewing || isImporting}
              className="text-xs font-semibold shrink-0"
            >
              {file ? 'Chọn file khác' : 'Tải lên file Excel'}
            </Button>
          </div>
        </div>

        {/* Trạng thái Loading khi đang preview */}
        {isPreviewing && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
            <Loader2 className="w-9 h-9 text-primary animate-spin" />
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-sm font-semibold text-slate-800">Đang đọc và phân tích dữ liệu...</span>
              <span className="text-xs text-slate-500">Hệ thống đang kiểm tra tính hợp lệ và đối chiếu cơ sở dữ liệu</span>
            </div>
          </div>
        )}

        {/* Kết quả sau khi Import thành công */}
        {importResult && !isPreviewing && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col gap-2">
            <div className="font-bold text-sm">
              Nhập dữ liệu thành công! Tổng số bản ghi: {importResult.total_imported ?? importResult.totalImported ?? 0}
            </div>
            <div className="text-xs text-emerald-800 flex flex-wrap gap-x-4 gap-y-1">
              {Object.entries(importResult.sheets || {}).map(([sName, sRes]) => (
                <span key={sName}>
                  • <b>{SHEET_LABELS[sName] || sName}:</b> {sRes.success} thành công
                  {sRes.errors?.length > 0 && ` (${sRes.errors.length} lỗi)`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Preview Data Block */}
        {previewResult && !isPreviewing && (
          <div className="flex flex-col gap-4">
            {/* Thanh thống kê tổng quan */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col">
                <span className="text-xs text-slate-500 font-medium">Tổng số dòng đọc được</span>
                <span className="text-lg font-bold text-slate-900">{previewResult.total_rows ?? previewResult.totalRows ?? 0}</span>
              </div>
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col">
                <span className="text-xs text-emerald-700 font-medium">Hợp lệ</span>
                <span className="text-lg font-bold text-emerald-700">{previewResult.total_valid ?? previewResult.totalValid ?? 0}</span>
              </div>
              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col">
                <span className="text-xs text-rose-700 font-medium">Không hợp lệ</span>
                <span className="text-lg font-bold text-rose-700">{previewResult.total_invalid ?? previewResult.totalInvalid ?? 0}</span>
              </div>
            </div>

            {/* Tabs chuyển đổi các sheet & Ô tìm kiếm */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-1">
              {sheetKeys.length > 0 && (
                <div className="flex overflow-x-auto gap-2">
                  {sheetKeys.map((sKey) => {
                    const s = previewResult.sheets?.[sKey];
                    const isActive = activeTab === sKey;
                    const invalidCount = s?.invalid_count ?? s?.invalidCount ?? 0;
                    return (
                      <button
                        key={sKey}
                        type="button"
                        onClick={() => {
                          setActiveTab(sKey);
                        }}
                        className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                          isActive ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <span>{SHEET_LABELS[sKey] || sKey}</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600 font-semibold">{s?.total ?? 0} dòng</span>
                        {invalidCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold">{invalidCount} lỗi</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Ô tìm kiếm dữ liệu */}
              <div className="relative w-full sm:w-64 shrink-0 pb-1 sm:pb-0">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm mã, tên, lỗi (vd: CH)..."
                  className="w-full h-8 pl-8 pr-7 text-xs bg-white border border-slate-200 rounded-lg outline-none text-slate-800 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Bảng chi tiết dòng của sheet đang chọn */}
            {currentSheet && (() => {
              const isDoorSheet = activeTab === 'doors' || activeTab === 'Cua' || activeTab === 'Mau_Cua';
              const colSpanCount = isDoorSheet ? 5 : 6;

              const cleanQuery = searchTerm.trim().toLowerCase();

              const rawInvalidRows = currentSheet.invalid_rows ?? currentSheet.invalidRows ?? [];
              const rawValidRows = currentSheet.valid_rows ?? currentSheet.validRows ?? [];

              const filteredInvalidRows = cleanQuery
                ? rawInvalidRows.filter((r) => {
                    const name = String(r.data?.name || '').toLowerCase();
                    const code = String(r.data?.code || '').toLowerCase();
                    const errors = (r.errors || []).join(' ').toLowerCase();
                    const rowIdx = String(r.row_index ?? r.rowIndex ?? '');
                    return name.includes(cleanQuery) || code.includes(cleanQuery) || errors.includes(cleanQuery) || rowIdx.includes(cleanQuery);
                  })
                : rawInvalidRows;

              const filteredValidRows = cleanQuery
                ? rawValidRows.filter((r) => {
                    const name = String(r.data?.name || '').toLowerCase();
                    const code = String(r.data?.code || '').toLowerCase();
                    const warnings = (r.warnings || []).join(' ').toLowerCase();
                    const rowIdx = String(r.row_index ?? r.rowIndex ?? '');
                    return name.includes(cleanQuery) || code.includes(cleanQuery) || warnings.includes(cleanQuery) || rowIdx.includes(cleanQuery);
                  })
                : rawValidRows;

              const totalFiltered = filteredInvalidRows.length + filteredValidRows.length;

              return (
                <div className="flex flex-col gap-3">
                  {cleanQuery && (
                    <div className="text-xs text-slate-500 px-1">
                      Tìm thấy <b className="text-slate-900">{totalFiltered}</b> kết quả cho từ khóa &ldquo;{cleanQuery}&rdquo;
                      {filteredInvalidRows.length > 0 && (
                        <span className="text-rose-600 ml-1.5 font-medium">({filteredInvalidRows.length} lỗi)</span>
                      )}
                    </div>
                  )}

                  <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-10">
                        <tr>
                          <th className="p-2.5 border-b border-slate-200 w-12 text-center">Dòng</th>
                          <th className="p-2.5 border-b border-slate-200 w-24">Hành động</th>
                          <th className="p-2.5 border-b border-slate-200 min-w-[200px]">Mã / Tên</th>
                          <th className="p-2.5 border-b border-slate-200 w-24 text-center">{isDoorSheet ? 'Loại cửa' : 'ĐVT'}</th>
                          {!isDoorSheet && <th className="p-2.5 border-b border-slate-200 w-28 text-right">Giá</th>}
                          <th className="p-2.5 border-b border-slate-200 min-w-[260px]">Chi tiết / Cảnh báo / Lỗi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {/* Dòng lỗi (invalid rows) hiển thị trước */}
                        {filteredInvalidRows.map((row, rIdx) => {
                          const rowIdx = row.row_index ?? row.rowIndex ?? rIdx + 1;
                          const rowData = row.data || {};
                          const rowErrors = row.errors || [];
                          const unitDisplay =
                            UNIT_LABELS[rowData.unit] || rowData.unit || (rowData.type ? DOOR_TYPE_LABELS[rowData.type] || rowData.type : '—');
                          const priceDisplay = formatPrice(rowData.retail_price ?? rowData.retailPrice ?? rowData.price);

                          return (
                            <tr key={`inv-${rIdx}`} className="bg-rose-50/40 hover:bg-rose-50/70 transition-colors">
                              <td className="p-2.5 text-center font-bold text-rose-700">#{rowIdx}</td>
                              <td className="p-2.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">LỖI</span>
                              </td>
                              <td className="p-2.5">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-800">{rowData.name || '—'}</span>
                                  <span className="text-[11px] text-slate-500">{rowData.code || ''}</span>
                                </div>
                              </td>
                              <td className="p-2.5 text-center text-slate-600">
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[11px] font-medium text-slate-600">{unitDisplay}</span>
                              </td>
                              {!isDoorSheet && (
                                <td className="p-2.5 text-right font-medium text-slate-700 whitespace-nowrap">{priceDisplay}</td>
                              )}
                              <td className="p-2.5">
                                <div className="flex flex-col gap-1">
                                  {rowErrors.map((err, eIdx) => (
                                    <span key={eIdx} className="text-rose-600 text-[11px] leading-snug font-medium">
                                      • {err}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {/* Dòng hợp lệ (valid rows) */}
                        {filteredValidRows.map((row, rIdx) => {
                          const isCreate = row.action === 'CREATE';
                          const rowIdx = row.row_index ?? row.rowIndex ?? rIdx + 1;
                          const rowData = row.data || {};
                          const rowWarnings = row.warnings || [];
                          const unitDisplay =
                            UNIT_LABELS[rowData.unit] || rowData.unit || (rowData.type ? DOOR_TYPE_LABELS[rowData.type] || rowData.type : '—');
                          const priceDisplay = formatPrice(rowData.retail_price ?? rowData.retailPrice ?? rowData.price);

                          return (
                            <tr key={`val-${rIdx}`} className="hover:bg-slate-50 transition-colors">
                              <td className="p-2.5 text-center font-medium text-slate-500">#{rowIdx}</td>
                              <td className="p-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    isCreate ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}
                                >
                                  {isCreate ? 'TẠO MỚI' : 'CẬP NHẬT'}
                                </span>
                              </td>
                              <td className="p-2.5">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-800">{rowData.name || '—'}</span>
                                  <span className="text-[11px] text-slate-500">{rowData.code || ''}</span>
                                </div>
                              </td>
                              <td className="p-2.5 text-center text-slate-600">
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[11px] font-medium text-slate-600">{unitDisplay}</span>
                              </td>
                              {!isDoorSheet && (
                                <td className="p-2.5 text-right font-medium text-slate-800 whitespace-nowrap">{priceDisplay}</td>
                              )}
                              <td className="p-2.5">
                                {rowWarnings.length > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    {rowWarnings.map((warn, wIdx) => (
                                      <span key={wIdx} className="text-amber-600 text-[11px] leading-snug">
                                        • {warn}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-[11px] italic">Dữ liệu sẵn sàng</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}

                        {filteredValidRows.length === 0 && filteredInvalidRows.length === 0 && (
                          <tr>
                            <td colSpan={colSpanCount} className="p-6 text-center text-slate-400 italic">
                              {cleanQuery ? `Không tìm thấy dòng nào khớp với "${cleanQuery}"` : 'Không có dữ liệu trong sheet này'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isImporting}>
            {importResult ? 'Đóng' : 'Hủy'}
          </Button>

          {previewResult &&
            !importResult &&
            (() => {
              const totalValid = previewResult.total_valid ?? previewResult.totalValid ?? 0;
              const totalInvalid = previewResult.total_invalid ?? previewResult.totalInvalid ?? 0;
              return (
                <div className="flex items-center gap-3">
                  {totalInvalid > 0 && <span className="text-xs text-amber-600">Các dòng lỗi sẽ tự động bị bỏ qua</span>}
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={isImporting ? <Loader2 size={14} className="animate-spin" /> : <FileCheck size={14} />}
                    onClick={handleConfirmImport}
                    disabled={isImporting || totalValid === 0}
                    loading={isImporting}
                    className="font-semibold"
                  >
                    Xác nhận nhập ({totalValid} dòng)
                  </Button>
                </div>
              );
            })()}
        </div>
      </div>
    </Modal>
  );
};
