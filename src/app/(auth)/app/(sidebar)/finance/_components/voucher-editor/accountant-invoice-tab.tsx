'use client';

import React, { useRef, useState } from 'react';
import { CheckCircle2, FileCode2, Plus, Sparkles, Upload } from 'lucide-react';
import { Alert, Badge, Button } from '@/components';
import { createTaxInvoice, parseTaxInvoiceXml } from '@/actions/finance';
import { formatCurrency } from '@/utils/currency';
import { showErrorToast, showSuccessToast } from '@/utils/error';
import type {
  ParsedEinvoiceXml,
  TaxInvoice,
  TaxInvoiceDirection,
  VoucherType,
} from '@/types';
import { AccountantInvoiceList } from './accountant-invoice-list';

export interface AccountantInvoiceTabProps {
  hasValidInvoice: boolean;
  hasVatInputLine: boolean;
  voucherType: VoucherType;
  vatLineTotal: number;
  linkedInvoices: TaxInvoice[];
  availableInvoices: TaxInvoice[];
  onLinkInvoice: (invoice: TaxInvoice) => void;
  onUnlinkInvoice: (invoiceId: number) => void;
  onGenerateVatLineFromInvoice: (invoice: TaxInvoice) => void;
  onOpenCreateInvoice?: (prefill?: ParsedEinvoiceXml | null) => void;
  disabled?: boolean;
}

export function AccountantInvoiceTab({
  hasValidInvoice,
  hasVatInputLine,
  voucherType,
  vatLineTotal,
  linkedInvoices,
  availableInvoices,
  onLinkInvoice,
  onUnlinkInvoice,
  onGenerateVatLineFromInvoice,
  onOpenCreateInvoice,
  disabled = false,
}: AccountantInvoiceTabProps) {
  const xmlInputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [lastParsed, setLastParsed] = useState<ParsedEinvoiceXml | null>(null);

  const defaultDirection: TaxInvoiceDirection =
    voucherType === 'cash_receipt' || voucherType === 'bank_receipt' ? 'output' : 'input';
  const requiresInvoice = hasValidInvoice && (hasVatInputLine || vatLineTotal > 0);

  const handleXmlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setParsing(true);
    try {
      const parsed = await parseTaxInvoiceXml(file, defaultDirection);
      setLastParsed(parsed);
      showSuccessToast(`Đã đọc XML hóa đơn số ${parsed.invoiceNumber || '---'}`);
    } catch (err) {
      showErrorToast(err, 'Không thể đọc tệp XML hóa đơn điện tử');
    } finally {
      setParsing(false);
    }
  };

  const handleSaveParsedAsInvoice = async () => {
    if (!lastParsed) return;
    setParsing(true);
    try {
      const created = await createTaxInvoice({
        direction: lastParsed.direction || defaultDirection,
        invoiceTemplateCode: lastParsed.invoiceTemplateCode,
        invoiceSeries: lastParsed.invoiceSeries || '1C24T',
        invoiceNumber: lastParsed.invoiceNumber || '00000001',
        invoiceDate: lastParsed.invoiceDate || new Date().toISOString().slice(0, 10),
        partnerTaxCode: lastParsed.partnerTaxCode || lastParsed.xmlRawMeta?.sellerTaxCode || '',
        partnerName: lastParsed.partnerName || lastParsed.xmlRawMeta?.sellerName || 'Đối tác',
        partnerAddress: lastParsed.partnerAddress || lastParsed.xmlRawMeta?.sellerAddress || null,
        customerId: lastParsed.suggestedCustomerId ?? null,
        supplierId: lastParsed.suggestedSupplierId ?? null,
        taxableAmount: lastParsed.taxableAmount,
        vatRate: lastParsed.vatRate,
        vatAmount: lastParsed.vatAmount,
        totalAmount: lastParsed.totalAmount,
        vatBreakdown: lastParsed.vatBreakdown,
        isTaxDeductible: true,
        xmlFileUrl: lastParsed.xmlFileUrl,
        xmlRawMeta: lastParsed.xmlRawMeta,
      });
      onLinkInvoice(created);
      onGenerateVatLineFromInvoice(created);
      setLastParsed(null);
      showSuccessToast('Đã lưu hóa đơn GTGT và tự sinh dòng thuế!');
    } catch (err) {
      showErrorToast(err, 'Lỗi lưu hóa đơn GTGT từ XML');
    } finally {
      setParsing(false);
    }
  };

  const unlinkedOptions = availableInvoices.filter(
    (inv) => !linkedInvoices.some((l) => l.id === inv.id),
  );

  return (
    <div className="space-y-3">
      <input
        ref={xmlInputRef}
        type="file"
        accept=".xml,text/xml,application/xml"
        onChange={handleXmlUpload}
        className="hidden"
      />

      {requiresInvoice && linkedInvoices.length === 0 && (
        <Alert variant="warning" title="Bắt buộc đính kèm Hóa đơn GTGT">
          Chứng từ đang bật <strong>Có Hóa đơn GTGT hợp lệ</strong> và có phát sinh thuế GTGT đầu vào (TK 133*:{' '}
          <strong>{formatCurrency(vatLineTotal)}</strong>). Hãy tải XML HĐĐT hoặc gắn hóa đơn trước khi lưu.
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <FileCode2 size={16} className="text-primary shrink-0" />
          <span>
            Đọc tự động tệp <strong>XML Hóa đơn điện tử (chuẩn Tổng cục Thuế)</strong> để tự điền MST, số hóa đơn và dòng thuế.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="primary" size="xs" loading={parsing} disabled={disabled} leftIcon={<Upload size={14} />} onClick={() => xmlInputRef.current?.click()}>
            Tải XML HĐĐT tự điền
          </Button>
          {onOpenCreateInvoice && (
            <Button type="button" variant="outline" size="xs" disabled={disabled} leftIcon={<Plus size={14} />} onClick={() => onOpenCreateInvoice(lastParsed)}>
              Nhập tay HĐĐT
            </Button>
          )}
        </div>
      </div>

      {lastParsed && (
        <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/60 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-emerald-900 flex flex-wrap items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-600" />
              Đã trích xuất XML: {lastParsed.invoiceSeries} - Số {lastParsed.invoiceNumber}
              {lastParsed.isDuplicate && (
                <Badge variant="danger" size="sm">
                  Cảnh báo: Trùng hóa đơn đã tồn tại
                </Badge>
              )}
            </span>
            <Button type="button" variant="primary" size="xs" loading={parsing} leftIcon={<Sparkles size={13} />} onClick={handleSaveParsedAsInvoice}>
              Lưu &amp; Gắn vào chứng từ + Tạo dòng VAT
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700">
            <div>Đối tác: <strong>{lastParsed.partnerName || lastParsed.xmlRawMeta?.sellerName || '---'}</strong></div>
            <div>MST: <strong className="font-mono">{lastParsed.partnerTaxCode || lastParsed.xmlRawMeta?.sellerTaxCode || '---'}</strong></div>
            <div className="font-mono tabular-nums">
              VAT: <strong>{formatCurrency(lastParsed.vatAmount)}</strong> / Tổng:{' '}
              <strong className="text-primary">{formatCurrency(lastParsed.totalAmount)}</strong>
            </div>
          </div>
        </div>
      )}

      {unlinkedOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-600 font-medium">Hoặc gắn hóa đơn chưa liên kết:</span>
          <select
            disabled={disabled}
            value=""
            onChange={(e) => {
              const found = unlinkedOptions.find((x) => x.id === Number(e.target.value));
              if (found) onLinkInvoice(found);
            }}
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs max-w-full"
          >
            <option value="">-- Chọn hóa đơn GTGT có sẵn --</option>
            {unlinkedOptions.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoiceSeries}/{inv.invoiceNumber} - {inv.partnerName} ({formatCurrency(inv.totalAmount)})
              </option>
            ))}
          </select>
        </div>
      )}

      <AccountantInvoiceList
        linkedInvoices={linkedInvoices}
        onGenerateVatLineFromInvoice={onGenerateVatLineFromInvoice}
        onUnlinkInvoice={onUnlinkInvoice}
        disabled={disabled}
      />
    </div>
  );
}
