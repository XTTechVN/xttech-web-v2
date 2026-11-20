'use client';

import React, { useMemo, useState } from 'react';
import { ArrowRightCircle, Sparkles, X } from 'lucide-react';
import { Badge, Button, Checkbox, Input, Select, Textarea } from '@/components';
import { SOURCE_TYPE_MAP, VOUCHER_TYPE_OPTIONS } from '@/config/finance';
import type {
  Account,
  AutoPostingTemplate,
  BankAccount,
  CostItem,
  SourceQueueImportPayload,
  SourceQueueItem,
  VoucherType,
} from '@/types';
import { formatCurrency } from '@/utils';

interface SourceQueueImportDrawerProps {
  item: SourceQueueItem | null;
  accounts: Account[];
  bankAccounts: BankAccount[];
  costItems: CostItem[];
  templates: AutoPostingTemplate[];
  canAutoPost?: boolean;
  enforceMakerChecker?: boolean;
  submitting: boolean;
  onClose: () => void;
  onConfirmImport: (payload: SourceQueueImportPayload) => Promise<void>;
}

export function SourceQueueImportDrawer({
  item,
  accounts,
  bankAccounts,
  costItems,
  templates,
  canAutoPost = false,
  enforceMakerChecker = true,
  submitting,
  onClose,
  onConfirmImport,
}: SourceQueueImportDrawerProps) {
  const [voucherType, setVoucherType] = useState<VoucherType>(
    item?.suggestedVoucherType || 'general_journal',
  );
  const [hasValidInvoice, setHasValidInvoice] = useState<boolean>(
    item?.suggestedHasValidInvoice ?? false,
  );
  const [templateId, setTemplateId] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');
  const [debitAccountId, setDebitAccountId] = useState('');
  const [creditAccountId, setCreditAccountId] = useState('');
  const [costItemId, setCostItemId] = useState('');
  const [voucherDate, setVoucherDate] = useState(item?.sourceDate.slice(0, 10) || '');
  const [description, setDescription] = useState(item?.description || item?.title || '');
  const [autoPost, setAutoPost] = useState(false);

  const postableAccountOptions = useMemo(
    () => accounts.filter((a) => a.isPostable && a.isActive).map((a) => ({ value: String(a.id), label: `${a.accountCode} - ${a.name}` })),
    [accounts],
  );

  const templateOptions = useMemo(
    () => [
      { value: '', label: 'Tự động theo nghiệp vụ nguồn' },
      ...templates.filter((t) => t.isActive).map((t) => ({ value: String(t.id), label: `${t.code} - ${t.name}` })),
    ],
    [templates],
  );

  if (!item) return null;

  const sourceMeta = SOURCE_TYPE_MAP[item.sourceType as keyof typeof SOURCE_TYPE_MAP];
  const isCashVoucher = voucherType === 'cash_receipt' || voucherType === 'cash_payment';
  const isBankVoucher = voucherType === 'bank_receipt' || voucherType === 'bank_payment';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirmImport({
      sourceType: item.sourceType,
      sourceId: item.sourceId,
      voucherType,
      hasValidInvoice,
      autoPostingTemplateId: templateId ? Number(templateId) : null,
      bankAccountId: bankAccountId ? Number(bankAccountId) : null,
      debitAccountId: debitAccountId ? Number(debitAccountId) : null,
      creditAccountId: creditAccountId ? Number(creditAccountId) : null,
      costItemId: costItemId ? Number(costItemId) : null,
      voucherDate: voucherDate || undefined,
      postingDate: voucherDate || undefined,
      description: description.trim() || undefined,
      autoPost: canAutoPost ? autoPost : false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[1px]">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-primary/5">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles size={16} className="text-primary shrink-0" />
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 truncate">
                Kiểm duyệt &amp; Import Chứng từ
              </h3>
              <p className="text-xs text-slate-500 truncate">{item.sourceCode} • {item.title}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <Badge variant={sourceMeta?.variant || 'default'}>{sourceMeta?.label || item.sourceType}</Badge>
              <span className="font-mono font-bold text-base text-primary tabular-nums">{formatCurrency(item.amount)}</span>
            </div>
            <div className="text-slate-700 font-medium">{item.description}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select label="Loại chứng từ sinh ra" value={voucherType} onChange={(e) => setVoucherType(e.target.value as VoucherType)} options={VOUCHER_TYPE_OPTIONS} fullWidth />
            <Input label="Ngày chứng từ / Ghi sổ" type="date" value={voucherDate} onChange={(e) => setVoucherDate(e.target.value)} fullWidth />
          </div>

          <Select label="Mẫu định khoản nhanh" value={templateId} onChange={(e) => setTemplateId(e.target.value)} options={templateOptions} searchable fullWidth />

          {isCashVoucher && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
              Hạch toán vào Quỹ Tiền mặt hợp nhất (TK 1111 — Sổ quỹ S07-DN).
            </div>
          )}

          {isBankVoucher && (
            <Select
              label="Tài khoản ngân hàng áp dụng"
              value={bankAccountId}
              onChange={(e) => setBankAccountId(e.target.value)}
              options={[{ value: '', label: 'Dùng TK ngân hàng mặc định' }, ...bankAccounts.filter((b) => b.isActive).map((b) => ({ value: String(b.id), label: `${b.bankCode} - ${b.accountNumber}` }))]}
              fullWidth
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select label="TK Nợ ghi đè" value={debitAccountId} onChange={(e) => setDebitAccountId(e.target.value)} options={[{ value: '', label: 'Tự động theo nguồn' }, ...postableAccountOptions]} searchable fullWidth />
            <Select label="TK Có ghi đè" value={creditAccountId} onChange={(e) => setCreditAccountId(e.target.value)} options={[{ value: '', label: 'Tự động theo nguồn' }, ...postableAccountOptions]} searchable fullWidth />
          </div>

          <Select
            label="Khoản mục chi phí"
            value={costItemId}
            onChange={(e) => setCostItemId(e.target.value)}
            options={[{ value: '', label: 'Mặc định theo loại nguồn' }, ...costItems.filter((c) => c.isActive).map((c) => ({ value: String(c.id), label: `${c.code} - ${c.name}` }))]}
            searchable
            fullWidth
          />

          <Textarea label="Diễn giải chứng từ" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} fullWidth />

          <div className="rounded-xl border border-slate-200 p-3 space-y-2 bg-slate-50">
            <Checkbox
              label="Có Hóa đơn GTGT hợp lệ (hasValidInvoice)"
              checked={hasValidInvoice}
              onChange={(e) => setHasValidInvoice(e.target.checked)}
            />
            <Checkbox
              label="Tự động ghi sổ cái (Post GL) ngay sau khi Import (Mặc định lưu Nháp)"
              checked={canAutoPost && autoPost}
              disabled={!canAutoPost}
              onChange={(e) => setAutoPost(e.target.checked)}
            />
            {!canAutoPost && (
              <p className="text-[11px] text-amber-700 pl-6">
                {enforceMakerChecker
                  ? 'Chế độ tách quyền Người lập ≠ Người ghi sổ đang bật: bắt buộc lưu Nháp để kế toán khác kiểm tra và Ghi sổ.'
                  : 'Bạn không có quyền Ghi sổ cái (canPostVoucher), chứng từ sẽ được lưu Nháp.'}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>Hủy</Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting} leftIcon={<ArrowRightCircle size={15} />}>
              Xác nhận Import
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
