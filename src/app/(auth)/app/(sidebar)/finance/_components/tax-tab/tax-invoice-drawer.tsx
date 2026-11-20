'use client';

import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Save, X } from 'lucide-react';
import { Button, Checkbox, CurrencyInput, Input, Select } from '@/components';
import { createTaxInvoice, updateTaxInvoice } from '@/actions';
import { VAT_RATE_MAP, VAT_RATE_OPTIONS } from '@/config/finance';
import type {
  Account,
  ParsedEinvoiceXml,
  TaxInvoice,
  TaxInvoiceDirection,
  TaxInvoiceStatus,
  VatBreakdownItem,
  VatRate,
} from '@/types';
import { showErrorToast, showSuccessToast } from '@/utils';
import { INVOICE_STATUS_OPTIONS, TAX_DIRECTION_OPTIONS } from './tax-tab.constants';
import { TaxInvoiceXmlPanel } from './tax-invoice-xml-panel';

interface TaxInvoiceDrawerProps {
  invoice: TaxInvoice | null;
  accounts: Account[];
  initialShowXml?: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

export function TaxInvoiceDrawer({
  invoice,
  accounts,
  initialShowXml = false,
  onClose,
  onSaved,
}: TaxInvoiceDrawerProps) {
  const today = dayjs().format('YYYY-MM-DD');
  const [direction, setDirection] = useState<TaxInvoiceDirection>(invoice?.direction || 'input');
  const [templateCode, setTemplateCode] = useState(invoice?.invoiceTemplateCode || '1');
  const [series, setSeries] = useState(invoice?.invoiceSeries || '');
  const [number, setNumber] = useState(invoice?.invoiceNumber || '');
  const [invoiceDate, setInvoiceDate] = useState(invoice?.invoiceDate?.slice(0, 10) || today);
  const [partnerTaxCode, setPartnerTaxCode] = useState(invoice?.partnerTaxCode || '');
  const [partnerName, setPartnerName] = useState(invoice?.partnerName || '');
  const [partnerAddress, setPartnerAddress] = useState(invoice?.partnerAddress || '');
  const [taxableAmount, setTaxableAmount] = useState<number>(invoice?.taxableAmount ?? 0);
  const [vatRate, setVatRate] = useState<VatRate>(invoice?.vatRate || '8');
  const [vatAmount, setVatAmount] = useState<number>(invoice?.vatAmount ?? 0);
  const [totalAmount, setTotalAmount] = useState<number>(invoice?.totalAmount ?? 0);
  const [vatAccountId, setVatAccountId] = useState<string>(
    invoice?.vatAccountId ? String(invoice.vatAccountId) : '',
  );
  const [isTaxDeductible, setIsTaxDeductible] = useState<boolean>(
    invoice?.isTaxDeductible ?? true,
  );
  const [status, setStatus] = useState<string>(invoice?.status || 'active');
  const [parsedXml, setParsedXml] = useState<ParsedEinvoiceXml | null>(null);
  const [vatBreakdown, setVatBreakdown] = useState<VatBreakdownItem[]>(invoice?.vatBreakdown || []);
  const [matchedCustomerId, setMatchedCustomerId] = useState<number | null>(
    invoice?.customerId ?? null,
  );
  const [matchedSupplierId, setMatchedSupplierId] = useState<number | null>(
    invoice?.supplierId ?? null,
  );
  const [saving, setSaving] = useState(false);

  const vatAccountOptions = useMemo(
    () => [
      { value: '', label: 'Tự động theo TK thuế mặc định (1331 / 33311)' },
      ...accounts
        .filter((a) => a.isPostable && (a.accountCode.startsWith('133') || a.accountCode.startsWith('333')))
        .map((a) => ({ value: String(a.id), label: `${a.accountCode} - ${a.name}` })),
    ],
    [accounts],
  );

  const recalcAmounts = (nextTaxable: number, nextRate: VatRate) => {
    const pct = VAT_RATE_MAP[nextRate]?.numericRate ?? 0;
    const nextVat = Math.round((nextTaxable * pct) / 100);
    setTaxableAmount(nextTaxable);
    setVatRate(nextRate);
    setVatAmount(nextVat);
    setTotalAmount(nextTaxable + nextVat);
  };

  const handleXmlParsed = (data: ParsedEinvoiceXml) => {
    setParsedXml(data);
    if (data.direction) setDirection(data.direction);
    if (data.invoiceTemplateCode) setTemplateCode(data.invoiceTemplateCode);
    if (data.invoiceSeries) setSeries(data.invoiceSeries);
    if (data.invoiceNumber) setNumber(data.invoiceNumber);
    if (data.invoiceDate) setInvoiceDate(data.invoiceDate.slice(0, 10));
    if (data.partnerTaxCode) setPartnerTaxCode(data.partnerTaxCode);
    if (data.partnerName) setPartnerName(data.partnerName);
    if (data.partnerAddress) setPartnerAddress(data.partnerAddress);
    setTaxableAmount(data.taxableAmount);
    setVatRate(data.vatRate);
    setVatAmount(data.vatAmount);
    setTotalAmount(data.totalAmount);
    setVatBreakdown(data.vatBreakdown || []);
    setMatchedCustomerId(data.suggestedCustomerId ?? null);
    setMatchedSupplierId(data.suggestedSupplierId ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!series.trim() || !number.trim() || !partnerTaxCode.trim() || !partnerName.trim()) {
      showErrorToast('Vui lòng nhập đầy đủ Ký hiệu, Số hóa đơn, MST và Tên đối tác');
      return;
    }
    const parsedDate = dayjs(invoiceDate);
    setSaving(true);
    try {
      const payload = {
        direction,
        invoiceTemplateCode: templateCode.trim() || null,
        invoiceSeries: series.trim(),
        invoiceNumber: number.trim(),
        invoiceDate,
        partnerTaxCode: partnerTaxCode.trim(),
        partnerName: partnerName.trim(),
        partnerAddress: partnerAddress.trim() || null,
        customerId: matchedCustomerId,
        supplierId: matchedSupplierId,
        taxableAmount,
        vatRate,
        vatAmount,
        totalAmount,
        vatAccountId: vatAccountId ? Number(vatAccountId) : null,
        vatBreakdown,
        isTaxDeductible,
        xmlFileUrl: parsedXml?.xmlFileUrl ?? invoice?.xmlFileUrl ?? null,
        xmlRawMeta: parsedXml?.xmlRawMeta ?? invoice?.xmlRawMeta ?? null,
        taxPeriodMonth: parsedDate.month() + 1,
        taxPeriodYear: parsedDate.year(),
      };
      if (invoice) {
        await updateTaxInvoice(invoice.id, { ...payload, status: status as TaxInvoiceStatus });
        showSuccessToast(`Đã cập nhật hóa đơn ${series}-${number}`);
      } else {
        await createTaxInvoice(payload);
        showSuccessToast(`Đã lưu hóa đơn điện tử ${series}-${number}`);
      }
      await onSaved();
      onClose();
    } catch (err) {
      showErrorToast(err, 'Không thể lưu hóa đơn thuế GTGT');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[1px]">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-primary/5">
          <h3 className="text-base font-bold text-slate-900">
            {invoice
              ? `Cập nhật Hóa đơn ${invoice.invoiceSeries}-${invoice.invoiceNumber}`
              : initialShowXml
                ? 'Đọc XML & Lưu Hóa đơn Điện tử'
                : 'Thêm mới Hóa đơn Thuế GTGT'}
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <TaxInvoiceXmlPanel direction={direction} parsedXml={parsedXml} onParsed={handleXmlParsed} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select label="Loại hóa đơn" value={direction} onChange={(e) => setDirection(e.target.value as TaxInvoiceDirection)} options={TAX_DIRECTION_OPTIONS} fullWidth />
            <Input label="Ngày hóa đơn" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} fullWidth />
            <Input label="Mẫu số" value={templateCode} onChange={(e) => setTemplateCode(e.target.value)} fullWidth />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Ký hiệu" placeholder="C26TAA" value={series} onChange={(e) => setSeries(e.target.value)} fullWidth />
              <Input label="Số hóa đơn" placeholder="0000123" value={number} onChange={(e) => setNumber(e.target.value)} fullWidth />
            </div>
            <Input label="Mã số thuế đối tác" placeholder="010xxxxxxx" value={partnerTaxCode} onChange={(e) => setPartnerTaxCode(e.target.value)} fullWidth />
            <Input label="Tên công ty / đối tác" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} fullWidth />
          </div>

          <Input label="Địa chỉ trên hóa đơn" value={partnerAddress} onChange={(e) => setPartnerAddress(e.target.value)} fullWidth />

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <CurrencyInput label="Tiền chưa thuế" value={taxableAmount} onChange={(val) => recalcAmounts(val, vatRate)} fullWidth />
            <Select label="Thuế suất" value={vatRate} onChange={(e) => recalcAmounts(taxableAmount, e.target.value as VatRate)} options={VAT_RATE_OPTIONS} fullWidth />
            <CurrencyInput label="Tiền thuế GTGT" value={vatAmount} onChange={(val) => { setVatAmount(val); setTotalAmount(taxableAmount + val); }} fullWidth />
            <CurrencyInput label="Tổng thanh toán" value={totalAmount} onChange={setTotalAmount} fullWidth />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select label="Tài khoản thuế GTGT" value={vatAccountId} onChange={(e) => setVatAccountId(e.target.value)} options={vatAccountOptions} fullWidth />
            {invoice && (
              <Select label="Trạng thái hóa đơn" value={status} onChange={(e) => setStatus(e.target.value)} options={INVOICE_STATUS_OPTIONS} fullWidth />
            )}
          </div>

          <Checkbox label="Hóa đơn hợp lệ & đủ điều kiện khấu trừ thuế GTGT / tính chi phí TNDN" checked={isTaxDeductible} onChange={(e) => setIsTaxDeductible(e.target.checked)} />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>Hủy</Button>
            <Button type="submit" variant="primary" size="sm" loading={saving} leftIcon={<Save size={14} />}>
              {invoice ? 'Lưu cập nhật' : 'Lưu Hóa đơn'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
