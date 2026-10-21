'use client';

import React, { useState } from 'react';
import { ChevronDown, CheckCircle2, Printer } from 'lucide-react';
import { Badge, Button } from '@/components';
import {
  CONTRACT_KIND_MAP,
  CONTRACT_STATUS_MAP,
  PAYMENT_MILESTONE_STATUS_MAP,
} from '@/config';
import type { ProjectContractItem, ProjectPaymentMilestoneItem } from '@/types';
import { formatCurrency } from '@/utils';
import { isContractSigned } from '../hooks/use-project-contracts';

interface ContractListProps {
  contracts: ProjectContractItem[];
  isLoading: boolean;
  isOutdatedQuotation: boolean;
  isSigning: boolean;
  onSign: (contract: ProjectContractItem) => void;
  onCancel: (contract: ProjectContractItem) => void;
  onEditTerms: (contract: ProjectContractItem) => void;
  onPreview: (contract: ProjectContractItem) => void;
}

export function ContractList({
  contracts,
  isLoading,
  isOutdatedQuotation,
  isSigning,
  onSign,
  onCancel,
  onEditTerms,
  onPreview,
}: ContractListProps) {
  if (isLoading) {
    return <p className="text-xs text-slate-400 text-center py-6">Đang tải danh sách hợp đồng...</p>;
  }
  if (contracts.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
        Chưa có hợp đồng nào được lập từ báo giá.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
      {contracts.map((contract) => (
        <ContractRow
          key={contract.id}
          contract={contract}
          isOutdatedQuotation={isOutdatedQuotation}
          isSigning={isSigning}
          onSign={onSign}
          onCancel={onCancel}
          onEditTerms={onEditTerms}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
}

interface ContractRowProps {
  contract: ProjectContractItem;
  isOutdatedQuotation: boolean;
  isSigning: boolean;
  onSign: (contract: ProjectContractItem) => void;
  onCancel: (contract: ProjectContractItem) => void;
  onEditTerms: (contract: ProjectContractItem) => void;
  onPreview: (contract: ProjectContractItem) => void;
}

function ContractRow({
  contract,
  isOutdatedQuotation,
  isSigning,
  onSign,
  onCancel,
  onEditTerms,
  onPreview,
}: ContractRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = CONTRACT_STATUS_MAP[contract.status];
  const isCancelled = contract.status === 'cancelled';
  const isDraft = contract.status === 'draft';
  const hasPayments = !!contract.payments?.length;

  return (
    <div className={`transition-colors hover:bg-slate-50/40 ${isCancelled ? 'opacity-60' : ''}`}>
      <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 text-xs">{contract.contractCode}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold border bg-blue-50 text-blue-700 border-blue-200/60">
              {CONTRACT_KIND_MAP[contract.kind] ?? contract.kind}
            </span>
            <Badge variant={status?.variant ?? 'default'} size="sm">
              {status?.label ?? contract.status}
            </Badge>
          </div>
          <div className="text-xs font-medium text-slate-700 truncate">{contract.contractName}</div>
          {contract.replacedContractCode && (
            <div className="text-[11px] text-slate-400">
              Thay thế {contract.replacedContractCode}
              {contract.inheritedPaidAmount > 0 &&
                `, kế thừa ${formatCurrency(contract.inheritedPaidAmount)} đã thu`}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="text-left sm:text-right">
            <div className="text-xs font-bold text-slate-800">{formatCurrency(contract.totalAmount)}</div>
            <div className="text-[11px] text-slate-400">
              Đã thu: <span className="text-emerald-600 font-medium">{formatCurrency(contract.paidAmount)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-7 text-[11px] px-2" onClick={() => onPreview(contract)}>
              <Printer size={12} className="mr-1" /> Xem / In
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] px-2"
              onClick={() => onEditTerms(contract)}
            >
              {isDraft ? 'Soạn điều khoản' : 'Xem điều khoản'}
            </Button>
            {isDraft && (
              <Button
                variant="primary"
                size="sm"
                className="h-7 text-xs px-2.5"
                disabled={isSigning || isOutdatedQuotation}
                title={
                  isOutdatedQuotation
                    ? 'Báo giá đã cũ, hãy đồng bộ báo giá và lập lại hợp đồng trước khi ký'
                    : undefined
                }
                onClick={() => onSign(contract)}
              >
                Ký hợp đồng
              </Button>
            )}
            {isContractSigned(contract) && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 size={13} /> Đã ký
              </span>
            )}
            {!isCancelled && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] px-2 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => onCancel(contract)}
              >
                Hủy hợp đồng
              </Button>
            )}
            {hasPayments && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer bg-transparent border-0"
                title={isExpanded ? 'Thu gọn các đợt thanh toán' : 'Xem các đợt thanh toán'}
              >
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {isExpanded && hasPayments && <MilestoneList payments={contract.payments ?? []} />}
    </div>
  );
}

function MilestoneList({ payments }: { payments: ProjectPaymentMilestoneItem[] }) {
  return (
    <div className="px-3.5 pb-3.5 pt-1 bg-slate-50/70 border-t border-slate-100 space-y-2">
      <div className="text-[11px] font-semibold text-slate-500">Kế hoạch thanh toán theo đợt:</div>
      <div className="space-y-1.5">
        {payments.map((p) => {
          const status = PAYMENT_MILESTONE_STATUS_MAP[p.status];
          return (
            <div
              key={p.id}
              className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-200/60"
            >
              <div>
                <span className="font-medium text-slate-700">
                  Đợt {p.milestoneOrder}: {p.installmentName}
                </span>
                <span className="text-slate-400 ml-1.5 text-[11px]">({p.percentage}%)</span>
                {status && (
                  <Badge variant={status.variant} size="sm" className="ml-1.5">
                    {status.label}
                  </Badge>
                )}
                {p.dueDate && (
                  <span className="text-[11px] text-slate-400 block">
                    Hạn thanh toán: {new Date(p.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="font-semibold text-slate-800">{formatCurrency(p.expectedAmount)}</div>
                <div className="text-[11px] text-emerald-600">Đã thu: {formatCurrency(p.paidAmount)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
