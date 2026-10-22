'use client';

import React, { useState } from 'react';
import { AlertCircle, FilePlus2 } from 'lucide-react';
import { Button } from '@/components';
import type { ContractTerms, PaymentTransactionItem, ProjectContractItem } from '@/types';
import { CancelContractModal } from './modals/cancel-contract-modal';
import { ContractFormModal } from './modals/contract-form-modal';
import { ContractList } from './components/contract-list';
import { ContractPreviewModal } from './modals/contract-preview-modal';
import { ContractTermsModal } from './modals/contract-terms-modal';
import { LedgerSummary } from './components/ledger-summary';
import { PaymentTransactionModal } from './modals/payment-transaction-modal';
import { ReversalModal } from './modals/reversal-modal';
import { TransactionHistory } from './components/transaction-history';
import {
  findLiveContract,
  isContractSigned,
  sortContractsLiveFirst,
  useProjectContracts,
} from './hooks/use-project-contracts';

interface ProjectContractsLedgerProps {
  projectId: number;
}

export function ProjectContractsLedger({ projectId }: ProjectContractsLedgerProps) {
  const {
    contracts,
    transactions,
    ledger,
    quotation,
    project,
    isLoadingContracts,
    isLoadingTransactions,
    createContract,
    signContract,
    cancelContract,
    updateContract,
    createTransaction,
    reverseTransaction,
  } = useProjectContracts(projectId);

  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [cancelingContract, setCancelingContract] = useState<ProjectContractItem | null>(null);
  const [editingTermsContract, setEditingTermsContract] = useState<ProjectContractItem | null>(null);
  const [previewingContract, setPreviewingContract] = useState<ProjectContractItem | null>(null);
  const [reversingTransaction, setReversingTransaction] = useState<PaymentTransactionItem | null>(null);

  const liveContract = findLiveContract(contracts);
  const signedContract = contracts.find((c) => c.status !== 'cancelled' && isContractSigned(c));
  const isOutdatedQuotation = !!quotation?.isOutdated;

  const handleCreate = (payload: Parameters<typeof createContract.mutate>[0]) =>
    createContract.mutate(payload, { onSuccess: () => setIsContractModalOpen(false) });

  const handleCancel = (contract: ProjectContractItem, reason?: string) =>
    cancelContract.mutate(
      { contractId: contract.id, reason },
      { onSuccess: () => setCancelingContract(null) },
    );

  const handleSaveTerms = (contract: ProjectContractItem, contractTerms: ContractTerms) =>
    updateContract.mutate(
      { contractId: contract.id, payload: { contractTerms } },
      { onSuccess: () => setEditingTermsContract(null) },
    );

  const handleCollect = (payload: Parameters<typeof createTransaction.mutate>[0]) =>
    createTransaction.mutate(payload, { onSuccess: () => setIsTransactionModalOpen(false) });

  const handleReverse = (transaction: PaymentTransactionItem, note: string) =>
    reverseTransaction.mutate(
      { reversalOfId: transaction.id, note },
      { onSuccess: () => setReversingTransaction(null) },
    );

  return (
    <div className="space-y-4">
      <LedgerSummary ledger={ledger} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-7 bg-white rounded-lg border border-slate-200/70 p-4 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800">Hợp đồng</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hợp đồng mới sẽ thay thế hợp đồng cũ và kế thừa số tiền đã thu
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FilePlus2 size={14} />}
              disabled={!quotation}
              title={quotation ? undefined : 'Cần lập báo giá trước khi lập hợp đồng'}
              onClick={() => setIsContractModalOpen(true)}
              className="h-7.5 text-xs font-semibold px-2.5"
            >
              {liveContract ? 'Lập hợp đồng thay thế' : 'Lập hợp đồng'}
            </Button>
          </div>

          {isOutdatedQuotation && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-start gap-1.5">
              <AlertCircle size={14} className="text-amber-600 shrink-0 mt-px" />
              Báo giá đã cũ so với danh sách cửa. Hãy đồng bộ lại báo giá (tab Báo giá) trước khi lập hoặc ký
              hợp đồng.
            </div>
          )}

          <ContractList
            contracts={sortContractsLiveFirst(contracts)}
            isLoading={isLoadingContracts}
            isOutdatedQuotation={isOutdatedQuotation}
            isSigning={signContract.isPending}
            onSign={(contract) => signContract.mutate(contract.id)}
            onCancel={setCancelingContract}
            onEditTerms={setEditingTermsContract}
            onPreview={setPreviewingContract}
          />
        </div>

        <div className="xl:col-span-5">
          <TransactionHistory
            transactions={transactions}
            ledger={ledger}
            isLoading={isLoadingTransactions}
            canCollect={!!signedContract}
            onCollect={() => setIsTransactionModalOpen(true)}
            onReverse={setReversingTransaction}
          />
        </div>
      </div>

      <ContractFormModal
        isOpen={isContractModalOpen}
        quotation={quotation}
        project={project}
        liveContract={liveContract}
        collectedAmount={ledger?.totalCollected ?? 0}
        isSubmitting={createContract.isPending}
        onClose={() => setIsContractModalOpen(false)}
        onSubmit={handleCreate}
      />
      <CancelContractModal
        contract={cancelingContract}
        isSubmitting={cancelContract.isPending}
        onClose={() => setCancelingContract(null)}
        onConfirm={handleCancel}
      />
      <ContractTermsModal
        contract={editingTermsContract}
        isSubmitting={updateContract.isPending}
        onClose={() => setEditingTermsContract(null)}
        onSave={handleSaveTerms}
      />
      <ContractPreviewModal
        contract={previewingContract}
        project={project}
        quotationCode={quotation?.id === previewingContract?.quotationId ? quotation?.code : null}
        onClose={() => setPreviewingContract(null)}
      />
      <PaymentTransactionModal
        isOpen={isTransactionModalOpen}
        projectId={projectId}
        signedContract={signedContract}
        isSubmitting={createTransaction.isPending}
        onClose={() => setIsTransactionModalOpen(false)}
        onSubmit={handleCollect}
      />
      <ReversalModal
        transaction={reversingTransaction}
        isSubmitting={reverseTransaction.isPending}
        onClose={() => setReversingTransaction(null)}
        onConfirm={handleReverse}
      />
    </div>
  );
}
