import { forwardRef } from 'react';
import type { QuotationSheet } from '@/types';
import { QUOTATION_TEMPLATE } from '@/config';
import { formatLongDate, formatSheetDate } from '../utils/quotation-sheet-format';
import { QuotationSheetTable } from './quotation-sheet-table';

interface QuotationDocumentProps {
  sheet: QuotationSheet;
}

const { blankText } = QUOTATION_TEMPLATE;

// Trang A4 báo giá: chỉ dùng class thuần (qt-*) để in qua iframe không cần Tailwind
export const QuotationDocument = forwardRef<HTMLDivElement, QuotationDocumentProps>(
  function QuotationDocument({ sheet }, ref) {
    const noteLines = (sheet.quotationNote ?? '').split('\n').filter((line) => line.trim());

    return (
      <div ref={ref} className="qt-page">
        <div className="qt-header">
          <img className="qt-logo" src={QUOTATION_TEMPLATE.logoUrl} alt="Logo" />
          <div className="qt-company">
            <p className="qt-company-name">{QUOTATION_TEMPLATE.companyName}</p>
            {QUOTATION_TEMPLATE.companyLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        <p className="qt-date">
          {QUOTATION_TEMPLATE.city}, {formatLongDate(sheet.sheetDate)}
        </p>
        <p className="qt-doc-title">{QUOTATION_TEMPLATE.documentTitle}</p>
        <p className="qt-title">{QUOTATION_TEMPLATE.title}</p>
        <p className="qt-code">Số: {sheet.quotationCode}</p>
        <p className="qt-contract-ref">
          (Đính kèm theo hợp đồng số: {sheet.contractCode || blankText})
        </p>

        <div className="qt-customer">
          <p>
            <b>KHÁCH HÀNG:</b> {sheet.customerName} &nbsp;&nbsp;&nbsp; <b>ĐIỆN THOẠI:</b>{' '}
            {sheet.customerPhone}
          </p>
          <p>
            <b>ĐỊA CHỈ CT:</b> {sheet.siteAddress}
          </p>
        </div>

        <QuotationSheetTable sheet={sheet} />

        <p className="qt-words">
          <b>Bằng chữ:</b> <i>{sheet.payableInWords}</i>
        </p>
        <p className="qt-advance">
          <b>TẠM ỨNG NGÀY:</b> {formatSheetDate(sheet.advanceDate) || blankText}
        </p>
        {noteLines.length > 0 && (
          <>
            <p className="qt-notes-title">CHÚ Ý:</p>
            <p className="qt-notes">{noteLines.join('\n')}</p>
          </>
        )}

        <table className="qt-sign">
          <tbody>
            <tr>
              <td>{QUOTATION_TEMPLATE.customerSignLabel}</td>
              <td>{QUOTATION_TEMPLATE.companySignLabel}</td>
            </tr>
            <tr>
              <td className="qt-sign-space" colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>
    );
  },
);
