'use client';

import { Modal } from '@/components';
import type { ProjectContractItem, ProjectDetail } from '@/types';
import { ContractPreview } from '../components/contract-preview';
import { buildSourceFromContract } from '../utils/contract-source';

interface ContractPreviewModalProps {
  contract: ProjectContractItem | null;
  project?: ProjectDetail | null;
  quotationCode?: string | null;
  onClose: () => void;
}

export function ContractPreviewModal({ contract, project, quotationCode, onClose }: ContractPreviewModalProps) {
  return (
    <Modal
      isOpen={!!contract}
      onClose={onClose}
      title={contract ? `Hợp đồng ${contract.contractCode}` : 'Hợp đồng'}
      size="full"
      bodyClassName="no-scrollbar overflow-hidden"
    >
      {contract && (
        <div className="h-full">
          <ContractPreview
            source={buildSourceFromContract(contract, project, quotationCode)}
            terms={contract.contractTerms}
            printTitle={`Hop-dong-${contract.contractCode}`}
          />
        </div>
      )}
    </Modal>
  );
}
