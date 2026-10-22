import { CONTRACT_TEMPLATE } from '@/config';
import {
  buildInstallmentValues,
  fillContractVariables,
  formatDateVN,
  type ContractDocumentSource,
  type ContractVariableValues,
} from '../utils/contract-values';

interface ContractPaymentSectionProps {
  source: ContractDocumentSource;
  values: ContractVariableValues;
}

// Phương thức thanh toán: số lần và từng lần thanh toán lấy từ các đợt của hợp đồng
export function ContractPaymentSection({ source, values }: ContractPaymentSectionProps) {
  const { heading, intro, installmentLine, dueDateLabel } = CONTRACT_TEMPLATE.paymentMethod;
  if (source.installments.length === 0) return null;

  return (
    <>
      <p className="ct-article">{heading}</p>
      <p className="ct-line">{fillContractVariables(intro, values, 'text')}</p>
      {source.installments.map((installment, index) => {
        const line = fillContractVariables(installmentLine, buildInstallmentValues(installment, index), 'text');
        const dueText = installment.dueDate ? ` ${dueDateLabel} ${formatDateVN(installment.dueDate)}.` : '';
        return (
          <p key={index} className="ct-line">
            - {line}
            {dueText}
          </p>
        );
      })}
    </>
  );
}
