'use client';

import React, { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button, Input, Modal } from '@/components';
import type { ContractCreatePayload, ContractMilestoneInput, ProjectContractItem, ProjectQuotationDetail } from '@/types';
import { formatCurrency } from '@/utils';
import { DEFAULT_MILESTONES, MilestoneEditor, sumPercentage } from '../components/milestone-editor';

interface ContractFormModalProps {
  isOpen: boolean;
  quotation: ProjectQuotationDetail | null;
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
      size="lg"
      className="md:!max-w-3xl w-full"
    >
      <ContractForm {...formProps} />
    </Modal>
  );
}

// State nằm ở component con, chỉ mount khi modal mở nên luôn bắt đầu từ giá trị mặc định
function ContractForm({ quotation, liveContract, collectedAmount, isSubmitting, onClose, onSubmit }: Omit<ContractFormModalProps, 'isOpen'>) {
  const [contractName, setContractName] = useState(quotation ? `Hợp đồng thi công - ${quotation.name}` : '');
  const [milestones, setMilestones] = useState<ContractMilestoneInput[]>(DEFAULT_MILESTONES);

  const isOutdated = !!quotation?.isOutdated;
  const hasEmptyName = milestones.some((m) => !m.installmentName.trim());
  const canSubmit = !!quotation && !isOutdated && !!contractName.trim() && sumPercentage(milestones) === 100 && !hasEmptyName;

  const handleSubmit = () => onSubmit({ contractName: contractName.trim(), milestones: toPayloadMilestones(milestones) });

  return (
    <div className="space-y-4">
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

      <MilestoneEditor milestones={milestones} totalAmount={quotation?.totalAmount ?? 0} onChange={setMilestones} />

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <Button variant="outline" size="sm" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="primary" size="sm" disabled={!canSubmit || isSubmitting} loading={isSubmitting} onClick={handleSubmit}>
          {liveContract ? 'Lập hợp đồng thay thế' : 'Lập hợp đồng'}
        </Button>
      </div>
    </div>
  );
}
