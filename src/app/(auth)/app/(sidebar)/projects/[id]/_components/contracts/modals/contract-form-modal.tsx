'use client';

import React, { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button, Input, Modal } from '@/components';
import { DEFAULT_CONTRACT_TERMS_HTML } from '@/config';
import type {
  ContractCreatePayload,
  ContractMilestoneInput,
  ContractPartyA,
  ContractTerms,
  ProjectContractItem,
  ProjectDetail,
  ProjectQuotationDetail,
} from '@/types';
import { formatCurrency } from '@/utils';
import { ContractPartyAForm } from '../components/contract-party-a-form';
import { ContractPreview } from '../components/contract-preview';
import { ContractTermsEditor } from '../components/contract-terms-editor';
import { DEFAULT_MILESTONES, MilestoneEditor, sumPercentage } from '../components/milestone-editor';
import { toPartyAOverride } from '../utils/contract-party';
import { hasTermsContent, readTermsContent } from '../utils/contract-terms';
import { buildDefaultPartyAFromProject, buildSourceFromDraft } from '../utils/contract-source';

type FormTab = 'payment' | 'partyA' | 'terms';

const FORM_TABS: { key: FormTab; label: string }[] = [
  { key: 'payment', label: 'Đợt thanh toán' },
  { key: 'partyA', label: 'Bên A' },
  { key: 'terms', label: 'Cơ chế, điều khoản & chính sách' },
];

// Kế thừa nội dung đã soạn của hợp đồng cũ (bỏ các khóa hệ thống); chưa có thì dùng nội dung mặc định
const pickEditableTerms = (terms?: ContractTerms | null): ContractTerms =>
  ({ content: hasTermsContent(terms) ? readTermsContent(terms) : DEFAULT_CONTRACT_TERMS_HTML });

interface ContractFormModalProps {
  isOpen: boolean;
  quotation: ProjectQuotationDetail | null;
  project?: ProjectDetail | null;
  liveContract?: ProjectContractItem;
  collectedAmount: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: ContractCreatePayload) => void;
}

const toPayloadMilestones = (milestones: ContractMilestoneInput[]): ContractMilestoneInput[] =>
  milestones.map((m, index) => ({
    ...m,
    milestoneOrder: index + 1,
    installmentName: m.installmentName.trim(),
    dueDate: m.dueDate || undefined,
  }));

export function ContractFormModal({ isOpen, ...formProps }: ContractFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={formProps.onClose}
      title={formProps.liveContract ? 'Lập hợp đồng thay thế' : 'Lập hợp đồng từ báo giá'}
      size="full"
      bodyClassName="no-scrollbar overflow-hidden"
    >
      <ContractForm {...formProps} />
    </Modal>
  );
}

// State nằm ở component con, chỉ mount khi modal mở nên luôn bắt đầu từ giá trị mặc định
function ContractForm({
  quotation,
  project,
  liveContract,
  collectedAmount,
  isSubmitting,
  onClose,
  onSubmit,
}: Omit<ContractFormModalProps, 'isOpen'>) {
  const [contractName, setContractName] = useState(quotation ? `Hợp đồng thi công - ${quotation.name}` : '');
  const [milestones, setMilestones] = useState<ContractMilestoneInput[]>(DEFAULT_MILESTONES);
  const [terms, setTerms] = useState<ContractTerms>(pickEditableTerms(liveContract?.contractTerms));
  const [activeTab, setActiveTab] = useState<FormTab>('payment');
  // Chỉ lưu các trường Bên A người dùng đã sửa; phần còn lại luôn lấy theo khách hàng / dự án
  const [partyAEdits, setPartyAEdits] = useState<Partial<ContractPartyA>>({});

  const defaultPartyA = buildDefaultPartyAFromProject(project);
  const partyA: ContractPartyA = { ...defaultPartyA, ...partyAEdits };

  const isOutdated = !!quotation?.isOutdated;
  const hasEmptyName = milestones.some((m) => !m.installmentName.trim());
  const canSubmit = !!quotation && !isOutdated && !!contractName.trim() && sumPercentage(milestones) === 100 && !hasEmptyName;

  const partyAOverride = toPartyAOverride(partyA, defaultPartyA);
  const draftSource = buildSourceFromDraft({
    totalAmount: quotation?.totalAmount ?? 0,
    quotationCode: quotation?.code,
    project,
    milestones,
    partyA,
  });

  const handleSubmit = () =>
    onSubmit({
      contractName: contractName.trim(),
      milestones: toPayloadMilestones(milestones),
      contractTerms: hasTermsContent(terms) ? terms : undefined,
      partyAOverride: Object.keys(partyAOverride).length > 0 ? partyAOverride : undefined,
    });

  return (
    <div className="grid h-full grid-cols-1 grid-rows-[minmax(0,1fr)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-4">
      <div className="space-y-4 min-w-0 min-h-0 overflow-y-auto no-scrollbar">
        {quotation && (
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-600">
              Báo giá áp dụng:{' '}
              <strong className="text-slate-800">
                {quotation.code} (v{quotation.version})
              </strong>
            </span>
            <span className="font-bold text-slate-800">{formatCurrency(quotation.totalAmount)}</span>
          </div>
        )}

        {isOutdated && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <RefreshCw size={14} className="text-amber-600" /> Báo giá đã cũ so với danh sách cửa
            </div>
            <p className="text-[11px] text-amber-700">Hãy đóng cửa sổ này, đồng bộ lại báo giá ở tab Báo giá rồi lập hợp đồng.</p>
          </div>
        )}

        {liveContract && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle size={14} className="text-blue-600" /> Hợp đồng {liveContract.contractCode} sẽ bị hủy và thay thế
            </div>
            <p className="text-[11px] text-blue-700">
              Số tiền đã thu {formatCurrency(collectedAmount)} được kế thừa sang hợp đồng mới; các đợt chưa thu được chia lại để tổng khớp giá trị báo
              giá.
            </p>
          </div>
        )}

        <Input label="Tên hợp đồng *" value={contractName} onChange={(e) => setContractName(e.target.value)} fullWidth />

        <div className="flex gap-1 border-b border-slate-200">
          {FORM_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 text-xs font-semibold border-0 bg-transparent cursor-pointer -mb-px border-b-2 transition-colors ${
                activeTab === tab.key ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'payment' && (
          <MilestoneEditor milestones={milestones} totalAmount={quotation?.totalAmount ?? 0} onChange={setMilestones} />
        )}
        {activeTab === 'partyA' && (
          <ContractPartyAForm partyA={partyA} onChange={(field, value) => setPartyAEdits((prev) => ({ ...prev, [field]: value }))} />
        )}
        {activeTab === 'terms' && <ContractTermsEditor terms={terms} onChange={setTerms} />}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" size="sm" disabled={!canSubmit || isSubmitting} loading={isSubmitting} onClick={handleSubmit}>
            {liveContract ? 'Lập hợp đồng thay thế' : 'Lập hợp đồng'}
          </Button>
        </div>
      </div>

      <div className="hidden lg:block h-full min-h-0">
        <ContractPreview source={draftSource} terms={terms} printTitle="Hop-dong-nhap" />
      </div>
    </div>
  );
}
