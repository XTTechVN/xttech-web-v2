'use client';

import React, { useState } from 'react';
import { Building2, Save } from 'lucide-react';
import { Button, Input, Select } from '@/components';
import { updateFinanceSetting } from '@/actions';
import { FILING_FREQUENCY_OPTIONS } from '@/config/finance';
import type { FilingFrequency, FinanceSetting } from '@/types';
import { showErrorToast, showSuccessToast } from '@/utils';

interface TaxpayerProfileSectionProps {
  setting: FinanceSetting | null;
  onRefreshMaster: () => Promise<void> | void;
}

export function TaxpayerProfileSection({
  setting,
  onRefreshMaster,
}: TaxpayerProfileSectionProps) {
  const [taxpayerName, setTaxpayerName] = useState(setting?.taxpayerName || '');
  const [taxCode, setTaxCode] = useState(setting?.taxCode || '');
  const [registeredAddress, setRegisteredAddress] = useState(setting?.registeredAddress || '');
  const [provinceCode, setProvinceCode] = useState(setting?.provinceCode || '');
  const [taxAuthorityCode, setTaxAuthorityCode] = useState(setting?.taxAuthorityCode || '');
  const [taxAuthorityName, setTaxAuthorityName] = useState(setting?.taxAuthorityName || '');
  const [legalRepresentative, setLegalRepresentative] = useState(setting?.legalRepresentative || '');
  const [chiefAccountant, setChiefAccountant] = useState(setting?.chiefAccountant || '');
  const [preparerName, setPreparerName] = useState(setting?.preparerName || '');
  const [contactPhone, setContactPhone] = useState(setting?.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(setting?.contactEmail || '');
  const [vatFreq, setVatFreq] = useState<FilingFrequency>(setting?.vatFilingFrequency || 'quarterly');
  const [pitFreq, setPitFreq] = useState<FilingFrequency>(setting?.pitFilingFrequency || 'quarterly');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateFinanceSetting({
        taxpayerName: taxpayerName.trim() || null,
        taxCode: taxCode.trim() || null,
        registeredAddress: registeredAddress.trim() || null,
        provinceCode: provinceCode.trim() || null,
        taxAuthorityCode: taxAuthorityCode.trim() || null,
        taxAuthorityName: taxAuthorityName.trim() || null,
        legalRepresentative: legalRepresentative.trim() || null,
        chiefAccountant: chiefAccountant.trim() || null,
        preparerName: preparerName.trim() || null,
        contactPhone: contactPhone.trim() || null,
        contactEmail: contactEmail.trim() || null,
        vatFilingFrequency: vatFreq,
        pitFilingFrequency: pitFreq,
      });
      showSuccessToast('Đã lưu Hồ sơ Pháp lý Người nộp thuế & Kỳ kê khai');
      await onRefreshMaster();
    } catch (err) {
      showErrorToast(err, 'Không thể lưu hồ sơ pháp lý người nộp thuế');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs"
    >
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Building2 size={16} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Hồ sơ Pháp lý Người nộp thuế &amp; Kỳ kê khai GTGT / TNCN
          </h4>
          <p className="text-xs text-slate-500">
            Thông tin định danh doanh nghiệp xuất lên BCTC (TT99/2025) và Tờ khai XML HTKK (TT89/2026)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <Input
            label="Tên người nộp thuế (Tên doanh nghiệp đầy đủ)"
            value={taxpayerName}
            placeholder="VD: CÔNG TY TNHH..."
            onChange={(e) => setTaxpayerName(e.target.value)}
            disabled={saving}
            fullWidth
          />
        </div>
        <Input
          label="Mã số thuế (MST)"
          value={taxCode}
          placeholder="010xxxxxxx"
          onChange={(e) => setTaxCode(e.target.value)}
          disabled={saving}
          fullWidth
        />
      </div>

      <Input
        label="Địa chỉ trụ sở đăng ký thuế"
        value={registeredAddress}
        placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố..."
        onChange={(e) => setRegisteredAddress(e.target.value)}
        disabled={saving}
        fullWidth
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="Mã tỉnh / thành phố (HTKK)"
          value={provinceCode}
          placeholder="VD: 01TTT"
          onChange={(e) => setProvinceCode(e.target.value)}
          disabled={saving}
          fullWidth
        />
        <Input
          label="Mã cơ quan thuế quản lý"
          value={taxAuthorityCode}
          placeholder="VD: 10100"
          onChange={(e) => setTaxAuthorityCode(e.target.value)}
          disabled={saving}
          fullWidth
        />
        <Input
          label="Tên cơ quan thuế quản lý trực tiếp"
          value={taxAuthorityName}
          placeholder="VD: Chi cục Thuế Khu vực I"
          onChange={(e) => setTaxAuthorityName(e.target.value)}
          disabled={saving}
          fullWidth
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="Người đại diện theo pháp luật (Giám đốc)"
          value={legalRepresentative}
          placeholder="Họ và tên..."
          onChange={(e) => setLegalRepresentative(e.target.value)}
          disabled={saving}
          fullWidth
        />
        <Input
          label="Kế toán trưởng / Phụ trách kế toán"
          value={chiefAccountant}
          placeholder="Họ và tên..."
          onChange={(e) => setChiefAccountant(e.target.value)}
          disabled={saving}
          fullWidth
        />
        <Input
          label="Người lập biểu BCTC"
          value={preparerName}
          placeholder="Họ và tên..."
          onChange={(e) => setPreparerName(e.target.value)}
          disabled={saving}
          fullWidth
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Input
          label="Số điện thoại liên hệ thuế"
          value={contactPhone}
          placeholder="09xxxxxxxx"
          onChange={(e) => setContactPhone(e.target.value)}
          disabled={saving}
          fullWidth
        />
        <Input
          label="Email nhận thông báo thuế"
          type="email"
          value={contactEmail}
          placeholder="ketoan@company.vn"
          onChange={(e) => setContactEmail(e.target.value)}
          disabled={saving}
          fullWidth
        />
        <Select
          label="Kỳ kê khai Thuế GTGT (01/GTGT)"
          value={vatFreq}
          onChange={(e) => setVatFreq(e.target.value as FilingFrequency)}
          options={FILING_FREQUENCY_OPTIONS}
          disabled={saving}
          fullWidth
        />
        <Select
          label="Kỳ kê khai Thuế TNCN (05/KK-TNCN)"
          value={pitFreq}
          onChange={(e) => setPitFreq(e.target.value as FilingFrequency)}
          options={FILING_FREQUENCY_OPTIONS}
          disabled={saving}
          fullWidth
        />
      </div>

      <div className="flex items-center justify-end pt-3 border-t border-slate-100">
        <Button type="submit" variant="primary" size="sm" loading={saving} leftIcon={<Save size={14} />}>
          Lưu Hồ sơ Người nộp thuế
        </Button>
      </div>
    </form>
  );
}
