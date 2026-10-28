'use client';

import type { Ref } from 'react';
import { CONTRACT_BODY_START_ARTICLE, CONTRACT_TEMPLATE } from '@/config';
import type { ContractTerms } from '@/types';
import { sanitizeRichHtml } from '@/utils';
import { readTermsContent } from '../utils/contract-terms';
import { buildContractValues, fillContractVariables, type ContractDocumentSource } from '../utils/contract-values';
import { buildPaymentSectionHtml, ContractPaymentSection } from './contract-payment-section';

const PAYMENT_TAG_REGEX = /<p>\s*(\$phuong_thuc_thanh_toan)\s*<\/p>/i;
const PAYMENT_VAR_REGEX = /\$phuong_thuc_thanh_toan/i;
const TWO_COL_SPLIT_REGEX = /\s{3,}/;

function ContractLine({ text }: { text: string }) {
  const parts = text.split(TWO_COL_SPLIT_REGEX);
  if (parts.length === 2 && parts[0] && parts[1]) {
    return (
      <div className="ct-row-2col">
        <span className="ct-col">{parts[0]}</span>
        <span className="ct-col">{parts[1]}</span>
      </div>
    );
  }
  return <p className="ct-line">{text}</p>;
}

interface ContractDocumentProps {
  source: ContractDocumentSource;
  terms?: ContractTerms | null;
  ref?: Ref<HTMLDivElement>;
}

export function ContractDocument({ source, terms, ref }: ContractDocumentProps) {
  const values = buildContractValues(source);
  const fillText = (text: string) => fillContractVariables(text, values, 'text');

  const rawTerms = readTermsContent(terms);
  const sanitizedTerms = sanitizeRichHtml(rawTerms);
  const hasPaymentPlaceholder = PAYMENT_VAR_REGEX.test(sanitizedTerms);

  let contentWithPayment = sanitizedTerms;
  if (hasPaymentPlaceholder) {
    const paymentHtml = buildPaymentSectionHtml(source, values);
    contentWithPayment = PAYMENT_TAG_REGEX.test(sanitizedTerms)
      ? sanitizedTerms.replace(PAYMENT_TAG_REGEX, paymentHtml)
      : sanitizedTerms.replace(PAYMENT_VAR_REGEX, paymentHtml);
  }

  const bodyHtml = fillContractVariables(contentWithPayment, values, 'html');
  const { partyA: partyATemplate, partyB, article1, paymentNotice, signing } = CONTRACT_TEMPLATE;
  const customerName = source.partyA.name.trim().toUpperCase() || fillText('$ten_khach_hang');

  return (
    <div ref={ref} className="ct-page">
      <p className="ct-national">{CONTRACT_TEMPLATE.nationalTitle}</p>
      <p className="ct-national ct-motto">{CONTRACT_TEMPLATE.nationalMotto}</p>
      <p className="ct-national">{CONTRACT_TEMPLATE.nationalDivider}</p>
      <h1 className="ct-title">{CONTRACT_TEMPLATE.title}</h1>
      <p className="ct-number">{fillText(CONTRACT_TEMPLATE.numberLine)}</p>

      {CONTRACT_TEMPLATE.legalBases.map((line) => (
        <p key={line} className="ct-line">
          <em>- {line}</em>
        </p>
      ))}
      <p className="ct-line">{fillText(CONTRACT_TEMPLATE.meetingLine)}</p>

      <p className="ct-heading">
        {partyATemplate.heading} {customerName}
      </p>
      {partyATemplate.lines.map((line) => (
        <ContractLine key={line} text={fillText(line)} />
      ))}

      <p className="ct-heading">
        {partyB.heading} {partyB.name}
      </p>
      {partyB.lines.map((line) => (
        <ContractLine key={line} text={line} />
      ))}
      <p className="ct-line">{CONTRACT_TEMPLATE.agreementLine}</p>

      <p className="ct-article">{article1.heading}</p>
      <p className="ct-line">{article1.content}</p>

      {bodyHtml ? (
        <div className="ct-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      ) : (
        <p className="ct-hint ct-no-print">
          Nội dung từ Điều {CONTRACT_BODY_START_ARTICLE} trở đi sẽ hiển thị phần bạn soạn ở tab “Cơ chế, điều khoản &amp;
          chính sách”.
        </p>
      )}

      {!hasPaymentPlaceholder && <ContractPaymentSection source={source} values={values} />}

      <div className="ct-notice">
        <div className="ct-notice-text">
          <p className="ct-heading">{paymentNotice.heading}</p>
          {paymentNotice.lines.map((line) => (
            <p key={line} className="ct-line">
              {fillText(line)}
            </p>
          ))}
        </div>
      </div>

      <p className="ct-line ct-right"><em>{fillText(signing.placeLine)}</em></p>
      <table className="ct-sign">
        <tbody>
          <tr>
            <td>
              <div className="ct-sign-label">{signing.partyALabel}</div>
              <div className="ct-sign-hint">{signing.signHint}</div>
            </td>
            <td>
              <div className="ct-sign-label">{signing.partyBLabel}</div>
              <div className="ct-sign-hint">{signing.signHint}</div>
            </td>
          </tr>
          <tr>
            <td className="ct-sign-space" />
            <td className="ct-sign-space" />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
