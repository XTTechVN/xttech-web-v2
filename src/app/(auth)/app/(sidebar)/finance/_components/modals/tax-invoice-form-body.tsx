'use client';

import React, { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import {
  Alert,
  Button,
  Checkbox,
  CurrencyInput,
  Input,
  Select,
} from '@/components';
import {
  createTaxInvoice,
  parseTaxInvoiceXml,
  updateTaxInvoice,
} from '@/actions/finance';
import { getCustomers } from '@/actions/customer';
import { getWarehouseSuppliers } from '@/actions/warehouse';
import { VAT_RATE_MAP, VAT_RATE_OPTIONS } from '@/config/finance';
import { showErrorToast, showSuccessToast } from '@/utils/error';
import { getLocalDateString } from '@/hooks/use-local-today';
import type {
  ParsedEinvoiceXml,
  TaxInvoice,
  TaxInvoiceDirection,
  VatRate,
} from '@/types';
import {
  createInitialTaxInvoiceState,
  type TaxInvoiceFormState,
} from './modals.constants';

export interface TaxInvoiceFormBodyProps {
  initialData?: TaxInvoice | null;
  defaultDirection?: TaxInvoiceDirection;
  defaultVoucherId?: number | null;
  prefillXml?: ParsedEinvoiceXml | null;
  onClose: () => void;
  onSuccess?: (invoice: TaxInvoice) => void;
}

export function TaxInvoiceFormBody({
  initialData,
  defaultDirection = 'input',
  defaultVoucherId = null,
  prefillXml = null,
  onClose,
  onSuccess,
}: TaxInvoiceFormBodyProps) {
  const queryClient = useQueryClient();
  const xmlRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [form, setForm] = useState<TaxInvoiceFormState>(() =>
    createInitialTaxInvoiceState({
      initialData,
      prefillXml,
      defaultDirection,
      today: getLocalDateString(),
    }),
  );

  const patchForm = (patch: Partial<TaxInvoiceFormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const { data: customersRes } = useQuery({
    queryKey: ['finance', 'lookups', 'customers'],
    queryFn: () => getCustomers({ limit: 200 }),
    staleTime: 60_000,
  });
  const { data: suppliersRes } = useQuery({
    queryKey: ['finance', 'lookups', 'suppliers'],
    queryFn: () => getWarehouseSuppliers({ limit: 200 }),
    staleTime: 60_000,
  });

  const recomputeAmounts = (nextTaxable: number, nextRate: VatRate) => {
    const pct = VAT_RATE_MAP[nextRate]?.numericRate ?? 0;
    const nextVat = Math.round((nextTaxable * pct) / 100);
    patchForm({
      taxableAmount: nextTaxable,
      vatRate: nextRate,
      vatAmount: nextVat,
      totalAmount: nextTaxable + nextVat,
    });
  };

  const handleParseXml = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setParsing(true);
    try {
      const parsed = await parseTaxInvoiceXml(file, form.direction);
      patchForm({
        direction: parsed.direction || form.direction,
        templateCode: parsed.invoiceTemplateCode || form.templateCode,
        series: parsed.invoiceSeries || form.series,
        invoiceNumber: parsed.invoiceNumber || form.invoiceNumber,
        invoiceDate: parsed.invoiceDate || form.invoiceDate,
        partnerTaxCode:
          parsed.partnerTaxCode || parsed.xmlRawMeta?.sellerTaxCode || form.partnerTaxCode,
        partnerName: parsed.partnerName || parsed.xmlRawMeta?.sellerName || form.partnerName,
        partnerAddress:
          parsed.partnerAddress || parsed.xmlRawMeta?.sellerAddress || form.partnerAddress,
        customerId: parsed.suggestedCustomerId ?? form.customerId,
        supplierId: parsed.suggestedSupplierId ?? form.supplierId,
        taxableAmount: parsed.taxableAmount,
        vatRate: parsed.vatRate,
        vatAmount: parsed.vatAmount,
        totalAmount: parsed.totalAmount,
        xmlFileUrl: parsed.xmlFileUrl,
        xmlRawMeta: parsed.xmlRawMeta,
        isDuplicateXml: parsed.isDuplicate,
      });
      showSuccessToast(`Đã tự điền từ XML hóa đơn ${parsed.invoiceNumber || ''}`);
    } catch (err) {
      showErrorToast(err, 'Không thể đọc tệp XML');
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.series.trim() ||
      !form.invoiceNumber.trim() ||
      !form.partnerTaxCode.trim() ||
      !form.partnerName.trim()
    ) {
      showErrorToast('Vui lòng điền đầy đủ Ký hiệu, Số HĐ, MST và Tên đối tác.');
      return;
    }
    setSubmitting(true);
    try {
      const d = new Date(form.invoiceDate);
      const payload = {
        voucherId: initialData?.voucherId ?? defaultVoucherId,
        direction: form.direction,
        invoiceTemplateCode: form.templateCode.trim() || null,
        invoiceSeries: form.series.trim(),
        invoiceNumber: form.invoiceNumber.trim(),
        invoiceDate: form.invoiceDate,
        partnerTaxCode: form.partnerTaxCode.trim(),
        partnerName: form.partnerName.trim(),
        partnerAddress: form.partnerAddress.trim() || null,
        customerId: form.customerId,
        supplierId: form.supplierId,
        taxableAmount: form.taxableAmount,
        vatRate: form.vatRate,
        vatAmount: form.vatAmount,
        totalAmount: form.totalAmount,
        isTaxDeductible: form.isTaxDeductible,
        xmlFileUrl: form.xmlFileUrl,
        xmlRawMeta: form.xmlRawMeta,
        taxPeriodMonth: Number.isNaN(d.getTime()) ? undefined : d.getMonth() + 1,
        taxPeriodYear: Number.isNaN(d.getTime()) ? undefined : d.getFullYear(),
      };
      const saved = initialData
        ? await updateTaxInvoice(initialData.id, payload)
        : await createTaxInvoice(payload);
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      showSuccessToast(initialData ? 'Đã cập nhật hóa đơn GTGT' : 'Đã thêm hóa đơn GTGT');
      onSuccess?.(saved);
      onClose();
    } catch (err) {
      showErrorToast(err, 'Lỗi lưu hóa đơn GTGT');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <input ref={xmlRef} type="file" accept=".xml,text/xml,application/xml" onChange={handleParseXml} className="hidden" />
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
        <span className="text-xs text-slate-700 font-medium">Có sẵn file XML hóa đơn điện tử?</span>
        <Button type="button" variant="primary" size="xs" loading={parsing} leftIcon={<Upload size={13} />} onClick={() => xmlRef.current?.click()}>
          Tải XML tự điền
        </Button>
      </div>
      {form.isDuplicateXml && (
        <Alert variant="warning" title="Cảnh báo trùng hóa đơn">
          Số hóa đơn {form.series}/{form.invoiceNumber} của MST {form.partnerTaxCode} đã tồn tại trong hệ thống.
        </Alert>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select label="Loại hóa đơn *" fullWidth value={form.direction} options={[{ value: 'input', label: 'Đầu vào (133)' }, { value: 'output', label: 'Đầu ra (3331)' }]} onChange={(e) => patchForm({ direction: e.target.value as TaxInvoiceDirection })} />
        <Input label="Mẫu số" fullWidth value={form.templateCode} onChange={(e) => patchForm({ templateCode: e.target.value })} />
        <Input label="Ngày hóa đơn *" type="date" fullWidth value={form.invoiceDate} onChange={(e) => patchForm({ invoiceDate: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Ký hiệu hóa đơn *" fullWidth value={form.series} placeholder="1C24TAA" onChange={(e) => patchForm({ series: e.target.value })} />
        <Input label="Số hóa đơn *" fullWidth value={form.invoiceNumber} placeholder="00001234" onChange={(e) => patchForm({ invoiceNumber: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Mã số thuế đối tác *" fullWidth value={form.partnerTaxCode} onChange={(e) => patchForm({ partnerTaxCode: e.target.value })} />
        {form.direction === 'input' ? (
          <Select label="Nhà cung cấp" fullWidth searchable value={form.supplierId ?? ''} options={[{ value: '', label: '-- Tự nhập tay --' }, ...(suppliersRes?.items || []).map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` }))]} onChange={(e) => { const sup = (suppliersRes?.items || []).find((s) => s.id === Number(e.target.value)); patchForm({ supplierId: sup?.id ?? null, partnerName: sup?.name || form.partnerName, partnerTaxCode: sup?.taxCode || form.partnerTaxCode }); }} />
        ) : (
          <Select label="Khách hàng" fullWidth searchable value={form.customerId ?? ''} options={[{ value: '', label: '-- Tự nhập tay --' }, ...(customersRes?.items || []).map((c) => ({ value: c.id, label: c.name }))]} onChange={(e) => { const cust = (customersRes?.items || []).find((c) => c.id === Number(e.target.value)); patchForm({ customerId: cust?.id ?? null, partnerName: cust?.name || form.partnerName }); }} />
        )}
      </div>
      <Input label="Tên đơn vị *" fullWidth value={form.partnerName} onChange={(e) => patchForm({ partnerName: e.target.value })} />
      <Input label="Địa chỉ" fullWidth value={form.partnerAddress} onChange={(e) => patchForm({ partnerAddress: e.target.value })} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <CurrencyInput label="Chưa thuế *" fullWidth value={form.taxableAmount || ''} className="font-mono tabular-nums text-right" onChange={(v) => recomputeAmounts(v, form.vatRate)} />
        <Select label="Thuế suất" fullWidth value={form.vatRate} options={VAT_RATE_OPTIONS} onChange={(e) => recomputeAmounts(form.taxableAmount, e.target.value as VatRate)} />
        <CurrencyInput label="Tiền VAT" fullWidth value={form.vatAmount || ''} className="font-mono tabular-nums text-right" onChange={(v) => patchForm({ vatAmount: v, totalAmount: form.taxableAmount + v })} />
        <CurrencyInput label="Tổng tiền" fullWidth value={form.totalAmount || ''} className="font-mono tabular-nums text-right font-bold text-primary" onChange={(v) => patchForm({ totalAmount: v })} />
      </div>
      <Checkbox label="Đủ điều kiện khấu trừ GTGT / Chi phí hợp lệ TNDN" checked={form.isTaxDeductible} onChange={(e) => patchForm({ isTaxDeductible: e.target.checked })} />
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>Hủy</Button>
        <Button type="submit" variant="primary" size="sm" loading={submitting}>{initialData ? 'Lưu thay đổi' : 'Lưu Hóa đơn'}</Button>
      </div>
    </form>
  );
}
