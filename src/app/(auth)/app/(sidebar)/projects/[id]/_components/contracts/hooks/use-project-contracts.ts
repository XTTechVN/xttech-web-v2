'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  cancelProjectContract,
  updateProjectContract,
  createPaymentTransaction,
  createProjectContract,
  getProject,
  getProjectContracts,
  getProjectLedgerSummary,
  getProjectPaymentTransactions,
  reversePaymentTransaction,
  signProjectContract,
} from '@/actions';
import { SIGNED_CONTRACT_STATUSES } from '@/config';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import type {
  ContractCreatePayload,
  ContractUpdatePayload,
  PaymentTransactionCreatePayload,
  PaymentTransactionItem,
  ProjectContractItem,
  ProjectLedgerSummary,
} from '@/types';
import { invalidateQuotationQueries, useActiveQuotation } from '../../hooks/use-active-quotation';

const contractsKey = (projectId: number) => ['project_contracts', projectId];
const ledgerKey = (projectId: number) => ['project_ledger_summary', projectId];
const transactionsKey = (projectId: number) => ['project_transactions', projectId];

// Làm mới hợp đồng, sổ cái, phiếu thu và báo giá (trạng thái khóa thay đổi theo hợp đồng)
const invalidateContractQueries = (projectId: number) => {
  [contractsKey, ledgerKey, transactionsKey].forEach((keyOf) =>
    queryClient.invalidateQueries({ queryKey: keyOf(projectId) }),
  );
  invalidateQuotationQueries(projectId);
};

export const isContractSigned = (contract: ProjectContractItem): boolean =>
  SIGNED_CONTRACT_STATUSES.includes(contract.status);

// Hợp đồng đang hiệu lực: chưa bị hủy, mới nhất đứng đầu
export const findLiveContract = (contracts: ProjectContractItem[]): ProjectContractItem | undefined =>
  contracts.find((c) => c.kind === 'main' && c.status !== 'cancelled');

// Hợp đồng còn hiệu lực lên đầu danh sách, hợp đồng đã hủy xuống cuối (giữ thứ tự mới -> cũ)
export const sortContractsLiveFirst = (contracts: ProjectContractItem[]): ProjectContractItem[] => [
  ...contracts.filter((c) => c.status !== 'cancelled'),
  ...contracts.filter((c) => c.status === 'cancelled'),
];

export function useProjectContracts(projectId: number) {
  const enabled = !!projectId;

  const { data: contractsData, isLoading: isLoadingContracts } = useQuery({
    queryKey: contractsKey(projectId),
    queryFn: () => getProjectContracts(projectId),
    enabled,
  });
  const { data: ledger } = useQuery<ProjectLedgerSummary>({
    queryKey: ledgerKey(projectId),
    queryFn: () => getProjectLedgerSummary(projectId),
    enabled,
  });
  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: transactionsKey(projectId),
    queryFn: () => getProjectPaymentTransactions(projectId),
    enabled,
  });
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
    enabled,
  });
  const { quotation } = useActiveQuotation(projectId);

  const contracts: ProjectContractItem[] = contractsData?.items ?? [];
  const transactions: PaymentTransactionItem[] = transactionsData?.items ?? [];

  const createContract = useMutation({
    mutationFn: (payload: ContractCreatePayload) => createProjectContract(projectId, payload),
    onSuccess: (res) => {
      invalidateContractQueries(projectId);
      toast.success(
        res.replacedContractCode
          ? `Đã lập hợp đồng ${res.contractCode} thay thế ${res.replacedContractCode}`
          : `Đã lập hợp đồng ${res.contractCode}`,
      );
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi lập hợp đồng'),
  });

  const signContract = useMutation({
    mutationFn: (contractId: number) => signProjectContract(projectId, contractId, {}),
    onSuccess: (res) => {
      invalidateContractQueries(projectId);
      toast.success(`Đã ký hợp đồng ${res.contractCode}, báo giá được khóa`);
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi ký hợp đồng'),
  });

  const updateContract = useMutation({
    mutationFn: ({ contractId, payload }: { contractId: number; payload: ContractUpdatePayload }) =>
      updateProjectContract(projectId, contractId, payload),
    onSuccess: (res) => {
      invalidateContractQueries(projectId);
      toast.success(`Đã lưu điều khoản hợp đồng ${res.contractCode}`);
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi lưu điều khoản hợp đồng'),
  });

  const cancelContract = useMutation({
    mutationFn: ({ contractId, reason }: { contractId: number; reason?: string }) =>
      cancelProjectContract(projectId, contractId, { reason }),
    onSuccess: (res) => {
      invalidateContractQueries(projectId);
      toast.success(`Đã hủy hợp đồng ${res.contractCode}, báo giá được mở khóa`);
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi hủy hợp đồng'),
  });

  const createTransaction = useMutation({
    mutationFn: (payload: PaymentTransactionCreatePayload) =>
      createPaymentTransaction(projectId, payload),
    onSuccess: () => {
      invalidateContractQueries(projectId);
      toast.success('Đã lưu phiếu thu tiền thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi lưu phiếu thu'),
  });

  const reverseTransaction = useMutation({
    mutationFn: ({ reversalOfId, note }: { reversalOfId: number; note: string }) =>
      reversePaymentTransaction(projectId, { reversalOfId, note }),
    onSuccess: () => {
      invalidateContractQueries(projectId);
      toast.success('Đã tạo phiếu hoàn tiền thành công');
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi tạo phiếu hoàn tiền'),
  });

  return {
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
  };
}
