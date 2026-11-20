'use client';

import React, { useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileCode2, Upload } from 'lucide-react';
import { Alert, Badge, Button } from '@/components';
import { parseTaxInvoiceXml } from '@/actions';
import { VAT_RATE_MAP } from '@/config/finance';
import type { ParsedEinvoiceXml, TaxInvoiceDirection } from '@/types';
import { formatCurrency, showErrorToast, showSuccessToast } from '@/utils';

interface TaxInvoiceXmlPanelProps {
  direction: TaxInvoiceDirection;
  parsedXml: ParsedEinvoiceXml | null;
  onParsed: (data: ParsedEinvoiceXml) => void;
}

export function TaxInvoiceXmlPanel({
  direction,
  parsedXml,
  onParsed,
}: TaxInvoiceXmlPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.xml')) {
      showErrorToast('Vui lòng chọn tệp XML hóa đơn điện tử (.xml)');
      return;
    }
    setParsing(true);
    try {
      const result = await parseTaxInvoiceXml(file, direction);
      onParsed(result);
      showSuccessToast('Đã đọc tự động dữ liệu XML hóa đơn điện tử');
    } catch (err) {
      showErrorToast(err, 'Không thể đọc tệp XML hóa đơn điện tử');
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3.5 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileCode2 size={18} className="text-primary shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-900">
              Đọc XML Hóa đơn Điện tử Chuẩn Tổng cục Thuế (GDT)
            </div>
            <div className="text-[11px] text-slate-500">
              Tự động bóc tách Ký hiệu, Số HĐ, MST đối tác, Tiền hàng &amp; Đa thuế suất GTGT
            </div>
          </div>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept=".xml,text/xml,application/xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              handleFile(file);
            }}
          />
          <Button
            type="button"
            variant="primary"
            size="xs"
            loading={parsing}
            onClick={() => inputRef.current?.click()}
            leftIcon={<Upload size={13} />}
          >
            Chọn file XML HĐĐT
          </Button>
        </div>
      </div>

      {parsedXml && (
        <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
              <CheckCircle2 size={14} />
              Đã nạp dữ liệu XML: {parsedXml.invoiceSeries || ''}-{parsedXml.invoiceNumber || ''}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {parsedXml.isDuplicate && (
                <Badge variant="danger" size="sm">
                  Trùng hóa đơn đã tồn tại
                </Badge>
              )}
              {parsedXml.suggestedCustomerId && (
                <Badge variant="success" size="sm">
                  Khớp KH #{parsedXml.suggestedCustomerId}
                </Badge>
              )}
              {parsedXml.suggestedSupplierId && (
                <Badge variant="info" size="sm">
                  Khớp NCC #{parsedXml.suggestedSupplierId}
                </Badge>
              )}
            </div>
          </div>

          {parsedXml.warnings.length > 0 && (
            <Alert variant="warning" icon={<AlertTriangle size={14} />}>
              <ul className="list-disc pl-4 space-y-0.5">
                {parsedXml.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </Alert>
          )}

          {parsedXml.vatBreakdown.length > 0 && (
            <div className="overflow-x-auto border border-slate-100 rounded-md">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-1.5">Nhóm thuế suất</th>
                    <th className="p-1.5 text-right">Tiền chưa thuế</th>
                    <th className="p-1.5 text-right">Thuế GTGT</th>
                    <th className="p-1.5 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedXml.vatBreakdown.map((b, idx) => (
                    <tr key={idx}>
                      <td className="p-1.5">
                        {b.itemName || VAT_RATE_MAP[b.vatRate]?.shortLabel || b.vatRate}
                      </td>
                      <td className="p-1.5 font-mono tabular-nums text-right">
                        {formatCurrency(b.taxableAmount)}
                      </td>
                      <td className="p-1.5 font-mono tabular-nums text-right">
                        {formatCurrency(b.vatAmount)}
                      </td>
                      <td className="p-1.5 font-mono tabular-nums text-right font-semibold">
                        {formatCurrency(b.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
