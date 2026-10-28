import { CONTRACT_TEMPLATE } from '@/config';
import { escapeHtml } from '@/utils';
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

// Sinh HTML các đợt thanh toán để chèn vào vị trí biến $phuong_thuc_thanh_toan
export function buildPaymentSectionHtml(source: ContractDocumentSource, values: ContractVariableValues): string {
  const { intro, installmentLine, dueDateLabel } = CONTRACT_TEMPLATE.paymentMethod;
  if (source.installments.length === 0) {
    return '<p class="ct-hint ct-no-print">Chưa có thông tin đợt thanh toán (vui lòng cấu hình ở tab “Đợt thanh toán”).</p>';
  }

  const introText = escapeHtml(fillContractVariables(intro, values, 'text'));
  const lines = source.installments.map((installment, index) => {
    const line = escapeHtml(fillContractVariables(installmentLine, buildInstallmentValues(installment, index), 'text'));
    const dueText = installment.dueDate ? ` ${escapeHtml(dueDateLabel)} ${formatDateVN(installment.dueDate)}.` : '';
    return `<p>- ${line}${dueText}</p>`;
  });

  return `<p>${introText}</p>${lines.join('')}`;
}

// Phương thức thanh toán: số lần và từng lần thanh toán lấy từ các đợt của hợp đồng
export function ContractPaymentSection({ source, values }: ContractPaymentSectionProps) {
  const { heading, intro, installmentLine, dueDateLabel, terms } = CONTRACT_TEMPLATE.paymentMethod;
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
      {terms.map((term, index) => (
        <p key={index} className="ct-line">
          • {term}
        </p>
      ))}
    </>
  );
}
