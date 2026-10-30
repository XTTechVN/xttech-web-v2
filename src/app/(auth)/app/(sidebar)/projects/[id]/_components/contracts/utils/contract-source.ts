import type { ContractMilestoneInput, ContractPartyA, ProjectContractItem, ProjectDetail } from '@/types';
import { buildDefaultPartyA, readPartyA } from './contract-party';
import type { ContractDocumentSource } from './contract-values';

export const buildDefaultPartyAFromProject = (project?: ProjectDetail | null): ContractPartyA =>
  buildDefaultPartyA(project?.customer, project?.address);

// Nguồn dữ liệu từ hợp đồng đã lưu (lấy Bên A theo snapshot tại thời điểm lập)
export const buildSourceFromContract = (
  contract: ProjectContractItem,
  project?: ProjectDetail | null,
  quotationCode?: string | null,
): ContractDocumentSource => ({
  contractCode: contract.contractCode,
  contractDate: contract.contractDate ?? contract.createdAt,
  totalAmount: contract.totalAmount,
  quotationCode,
  projectName: project?.name,
  installments: (contract.payments ?? []).map((payment) => ({
    name: payment.installmentName,
    percentage: payment.percentage,
    amount: payment.expectedAmount,
    dueDate: payment.dueDate,
  })),
  partyA: readPartyA(contract.partySnapshot, buildDefaultPartyAFromProject(project)),
});

interface DraftSourceInput {
  totalAmount: number;
  quotationCode?: string | null;
  project?: ProjectDetail | null;
  milestones: ContractMilestoneInput[];
  partyA: ContractPartyA;
}

// Nguồn dữ liệu từ bản nháp đang soạn trong form (chưa có số hợp đồng)
export const buildSourceFromDraft = ({
  totalAmount,
  quotationCode,
  project,
  milestones,
  partyA,
}: DraftSourceInput): ContractDocumentSource => ({
  totalAmount,
  quotationCode,
  projectName: project?.name,
  installments: milestones.map((milestone) => ({
    name: milestone.installmentName,
    percentage: milestone.percentage,
    amount: Math.round((totalAmount * milestone.percentage) / 100),
    dueDate: milestone.dueDate,
  })),
  partyA,
});
