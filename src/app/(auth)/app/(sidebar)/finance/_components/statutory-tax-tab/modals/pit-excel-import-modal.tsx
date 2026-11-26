'use client';

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { CheckCircle2, FileSpreadsheet, Upload } from 'lucide-react';
import { Alert, Button, Modal } from '@/components';
import type { PitContractCategory, PitEntryInput } from '@/types';
import { formatCurrency, showErrorToast } from '@/utils';

export interface PitExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (rows: PitEntryInput[]) => void;
}

function normalizeCategory(raw: unknown): PitContractCategory {
  const txt = String(raw || '').toLowerCase();
  if (txt.includes('non_resident') || txt.includes('không cư trú') || txt.includes('20%')) {
    return 'non_resident';
  }
  if (txt.includes('lt_3m') || txt.includes('vãng lai') || txt.includes('10%') || txt.includes('< 3')) {
    return 'resident_lt_3m_or_non_contract';
  }
  return 'resident_gte_3m';
}

function toInt(val: unknown): number {
  if (typeof val === 'number' && Number.isFinite(val)) return Math.max(0, Math.round(val));
  const cleaned = String(val || '').replace(/[^\d-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
}

export function PitExcelImportModal({
  isOpen,
  onClose,
  onConfirmImport,
}: PitExcelImportModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [previewRows, setPreviewRows] = useState<PitEntryInput[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const firstSheet = wb.SheetNames[0];
      if (!firstSheet) {
        showErrorToast('File Excel không có sheet dữ liệu.');
        return;
      }
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[firstSheet], {
        defval: '',
      });
      const parsed: PitEntryInput[] = [];
      for (const r of rows) {
        const fullName = String(
          r['Họ và tên'] || r['Ho va ten'] || r['fullName'] || r['Họ tên'] || '',
        ).trim();
        if (!fullName) continue;
        const gross = toInt(r['Thu nhập chịu thuế'] ?? r['Thu nhap chiu thue'] ?? r['grossTaxableIncome']);
        const personal = toInt(r['Giảm trừ bản thân'] ?? r['personalDeduction']) || 11_000_000;
        const depCount = toInt(r['Số NPT'] ?? r['dependentCount']);
        const depDed = toInt(r['Giảm trừ NPT'] ?? r['dependentDeduction']) || depCount * 4_400_000;
        const ins = toInt(r['BHXH bắt buộc'] ?? r['BHXH'] ?? r['insuranceDeduction']);
        const other = toInt(r['Giảm trừ khác'] ?? r['otherDeduction']);
        const assessable =
          toInt(r['Thu nhập tính thuế'] ?? r['assessableIncome']) ||
          Math.max(0, gross - personal - depDed - ins - other);
        const withheld = toInt(
          r['Thuế TNCN đã khấu trừ'] ?? r['Thue TNCN'] ?? r['withheldPitAmount'],
        );
        parsed.push({
          fullName,
          taxCode: String(r['MST cá nhân'] ?? r['MST'] ?? r['taxCode'] ?? '').trim() || null,
          idNumber: String(r['CCCD/CMND'] ?? r['CCCD'] ?? r['idNumber'] ?? '').trim() || null,
          contractCategory: normalizeCategory(r['Nhóm hợp đồng'] ?? r['contractCategory']),
          isTaxDeducted: true,
          grossTaxableIncome: gross,
          personalDeduction: personal,
          dependentCount: depCount,
          dependentDeduction: depDed,
          insuranceDeduction: ins,
          otherDeduction: other,
          assessableIncome: assessable,
          withheldPitAmount: withheld,
          status: 'verified',
        });
      }
      if (parsed.length === 0) {
        showErrorToast('Không đọc được dòng nhân sự hợp lệ (cần cột "Họ và tên").');
        return;
      }
      setFileName(file.name);
      setPreviewRows(parsed);
    } catch (err) {
      showErrorToast(err, 'Không thể phân tích file Excel bảng lương TNCN');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Nhập Bảng kê Khấu trừ Thuế TNCN từ Excel"
    >
      <div className="space-y-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            leftIcon={<Upload size={14} />}
          >
            {fileName ? 'Chọn file khác' : 'Chọn file Excel (.xlsx / .csv)'}
          </Button>
          {fileName && <span className="font-mono text-slate-600">{fileName}</span>}
        </div>

        {previewRows.length === 0 ? (
          <Alert variant="info" title="Định dạng cột Excel hỗ trợ" icon={<FileSpreadsheet size={15} />}>
            Hỗ trợ các cột tiếng Việt hoặc tiếng Anh: <strong>Họ và tên</strong>,{' '}
            <strong>MST cá nhân</strong>, <strong>CCCD/CMND</strong>,{' '}
            <strong>Nhóm hợp đồng</strong>, <strong>Thu nhập chịu thuế</strong>,{' '}
            <strong>Giảm trừ bản thân</strong>, <strong>Số NPT</strong>,{' '}
            <strong>BHXH bắt buộc</strong>, <strong>Thuế TNCN đã khấu trừ</strong>.
          </Alert>
        ) : (
          <div className="rounded-xl border border-slate-200 overflow-hidden max-h-[42vh] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="p-2">Họ tên</th>
                  <th className="p-2">MST / CCCD</th>
                  <th className="p-2 text-right">TN chịu thuế</th>
                  <th className="p-2 text-right">Thuế TNCN khấu trừ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewRows.map((row, idx) => (
                  <tr key={`${row.fullName}-${idx}`}>
                    <td className="p-2 font-medium text-slate-900">{row.fullName}</td>
                    <td className="p-2 font-mono text-slate-500">
                      {row.taxCode || row.idNumber || '---'}
                    </td>
                    <td className="p-2 font-mono tabular-nums text-right">
                      {formatCurrency(row.grossTaxableIncome)}
                    </td>
                    <td className="p-2 font-mono tabular-nums text-right font-semibold text-primary">
                      {formatCurrency(row.withheldPitAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={previewRows.length === 0}
            onClick={() => {
              onConfirmImport(previewRows);
              onClose();
            }}
            leftIcon={<CheckCircle2 size={14} />}
          >
            Áp dụng ({previewRows.length} nhân sự)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
