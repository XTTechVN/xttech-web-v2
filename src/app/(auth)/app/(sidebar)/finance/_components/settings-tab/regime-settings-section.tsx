'use client';

import React, { useState } from 'react';
import { CheckCircle2, Save, Sparkles } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  ConfirmActionModal,
  CurrencyInput,
  Input,
  Select,
  Switch,
} from '@/components';
import { seedFinanceDefaults, updateFinanceSetting } from '@/actions';
import { ACCOUNTING_REGIME_MAP, ACCOUNTING_REGIME_OPTIONS } from '@/config/finance';
import type {
  AccountingRegime,
  FinanceSeedResult,
  FinanceSetting,
} from '@/types';
import { cn, showErrorToast, showSuccessToast } from '@/utils';
import { OpeningBalanceBanner } from './opening-balance-banner';
import { RegimeHelpTooltip } from './regime-help-tooltip';

interface RegimeSettingsSectionProps {
  setting: FinanceSetting | null;
  onRefreshMaster: () => Promise<void> | void;
  onOpenOpeningBalance: () => void;
}

export function RegimeSettingsSection({
  setting,
  onRefreshMaster,
  onOpenOpeningBalance,
}: RegimeSettingsSectionProps) {
  const [regime, setRegime] = useState<AccountingRegime>(setting?.accountingRegime || 'tt200');
  const [fiscalStartMonth, setFiscalStartMonth] = useState(String(setting?.fiscalYearStartMonth ?? 1));
  const [nonCashThreshold, setNonCashThreshold] = useState<number>(setting?.nonCashVatThreshold ?? 5_000_000);
  const [enforceMakerChecker, setEnforceMakerChecker] = useState<boolean>(
    setting?.enforceMakerChecker ?? true,
  );
  const [nonInvoiceMedium, setNonInvoiceMedium] = useState<number>(
    setting?.nonInvoiceMediumThreshold ?? 500_000,
  );
  const [nonInvoiceLarge, setNonInvoiceLarge] = useState<number>(
    setting?.nonInvoiceLargeThreshold ?? 2_000_000,
  );
  const [defaultCashCode, setDefaultCashCode] = useState(setting?.defaultCashAccountCode || '1111');
  const [defaultBankCode, setDefaultBankCode] = useState(setting?.defaultBankAccountCode || '1121');
  const [defaultVatInCode, setDefaultVatInCode] = useState(setting?.defaultVatInputCode || '1331');
  const [defaultVatOutCode, setDefaultVatOutCode] = useState(setting?.defaultVatOutputCode || '33311');
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [confirmSeedOpen, setConfirmSeedOpen] = useState(false);
  const [seedResult, setSeedResult] = useState<FinanceSeedResult | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateFinanceSetting({
        accountingRegime: regime,
        fiscalYearStartMonth: Number(fiscalStartMonth) || 1,
        nonCashVatThreshold: nonCashThreshold,
        enforceMakerChecker,
        nonInvoiceMediumThreshold: nonInvoiceMedium,
        nonInvoiceLargeThreshold: nonInvoiceLarge,
        defaultCashAccountCode: defaultCashCode.trim() || '1111',
        defaultBankAccountCode: defaultBankCode.trim() || '1121',
        defaultVatInputCode: defaultVatInCode.trim() || '1331',
        defaultVatOutputCode: defaultVatOutCode.trim() || '33311',
      });
      showSuccessToast('Đã cập nhật cấu hình chế độ kế toán');
      await onRefreshMaster();
    } catch (err) {
      showErrorToast(err, 'Không thể cập nhật cấu hình kế toán');
    } finally {
      setSaving(false);
    }
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      const res = await seedFinanceDefaults(regime);
      setSeedResult(res);
      setConfirmSeedOpen(false);
      showSuccessToast(res.message || 'Đã khởi tạo dữ liệu kế toán chuẩn thành công');
      await onRefreshMaster();
    } catch (err) {
      showErrorToast(err, 'Không thể khởi tạo dữ liệu mặc định');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-slate-900">Chế độ Kế toán &amp; Ngưỡng Thuế Doanh nghiệp</h4>
              <RegimeHelpTooltip />
            </div>
            <p className="text-xs text-slate-500">
              Lựa chọn Thông tư 200 hoặc Thông tư 133 áp dụng cho toàn hệ thống sổ sách và báo cáo
            </p>
          </div>
          <Badge variant="primary" size="md">
            Hiện tại: {ACCOUNTING_REGIME_MAP[setting?.accountingRegime || 'tt200'].shortLabel}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ACCOUNTING_REGIME_OPTIONS.map((opt) => {
            const meta = ACCOUNTING_REGIME_MAP[opt.value];
            const active = regime === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRegime(opt.value)}
                className={cn(
                  'p-4 rounded-xl border text-left transition cursor-pointer',
                  active ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-slate-200 hover:border-slate-300 bg-white',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900">{meta.label}</span>
                  {active && <CheckCircle2 size={16} className="text-primary shrink-0" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">{meta.description}</p>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Select
            label="Tháng bắt đầu năm tài chính"
            value={fiscalStartMonth}
            onChange={(e) => setFiscalStartMonth(e.target.value)}
            options={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Tháng ${i + 1}` }))}
            fullWidth
          />
          <CurrencyInput label="Ngưỡng thanh toán không dùng tiền mặt (VNĐ)" value={nonCashThreshold} onChange={setNonCashThreshold} fullWidth />
          <Input label="TK Tiền mặt mặc định" value={defaultCashCode} onChange={(e) => setDefaultCashCode(e.target.value)} fullWidth />
          <Input label="TK Ngân hàng mặc định" value={defaultBankCode} onChange={(e) => setDefaultBankCode(e.target.value)} fullWidth />
          <Input label="TK GTGT Đầu vào mặc định" value={defaultVatInCode} onChange={(e) => setDefaultVatInCode(e.target.value)} fullWidth />
          <Input label="TK GTGT Đầu ra mặc định" value={defaultVatOutCode} onChange={(e) => setDefaultVatOutCode(e.target.value)} fullWidth />
          <CurrencyInput label="Ngưỡng chứng từ nội bộ Mức TB (VNĐ)" value={nonInvoiceMedium} onChange={setNonInvoiceMedium} fullWidth />
          <CurrencyInput label="Ngưỡng chứng từ nội bộ Mức Lớn (VNĐ)" value={nonInvoiceLarge} onChange={setNonInvoiceLarge} fullWidth />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-slate-900">
              Bắt buộc tách quyền Người lập ≠ Người ghi sổ (Maker-Checker)
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Khi bật: người lập chứng từ chỉ có thể Lưu nháp; phải do một nhân sự khác có quyền Ghi sổ kiểm tra và Post GL.
            </div>
          </div>
          <Switch
            label={enforceMakerChecker ? 'Đang bật' : 'Đang tắt'}
            checked={enforceMakerChecker}
            onChange={(e) => setEnforceMakerChecker(e.target.checked)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={() => setConfirmSeedOpen(true)} leftIcon={<Sparkles size={14} />}>
            Khởi tạo / Bổ sung Dữ liệu Chuẩn ({regime.toUpperCase()})
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={saving} leftIcon={<Save size={14} />}>
            Lưu thiết lập kế toán
          </Button>
        </div>
      </form>

      {seedResult && (
        <Alert variant="success" title="Kết quả khởi tạo dữ liệu chuẩn">
          Tài khoản tạo mới: {seedResult.accountsCreated} (bỏ qua {seedResult.accountsSkipped}) • Khoản mục: {seedResult.costItemsCreated} • Mẫu định khoản: {seedResult.templatesCreated}.
        </Alert>
      )}

      <OpeningBalanceBanner onOpenOpeningBalance={onOpenOpeningBalance} />

      <ConfirmActionModal
        isOpen={confirmSeedOpen}
        onClose={() => setConfirmSeedOpen(false)}
        variant="primary"
        confirmText="Khởi tạo dữ liệu chuẩn"
        title={`Khởi tạo danh mục chuẩn theo ${regime.toUpperCase()}`}
        description="Hệ thống sẽ bổ sung các tài khoản kế toán (gồm TK 1111), khoản mục chi phí nhôm kính và mẫu định khoản nhanh còn thiếu (không ghi đè dữ liệu đã có)."
        loading={seeding}
        onConfirm={handleSeedDefaults}
      />
    </div>
  );
}
