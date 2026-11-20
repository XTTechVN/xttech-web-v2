import { TAX_DEDUCTIBLE_BADGE_MAP } from '@/config/finance';
import type { AccountingRegime, VoucherDetail } from '@/types';
import { formatCurrency, readVietnameseNumber } from '@/utils/currency';
import { escapeHtml } from '@/utils/html';
import { printHtmlDocument } from '@/utils/print';

export interface VoucherPrintOptions {
  companyName?: string;
  companyAddress?: string;
  companyTaxCode?: string;
  accountingRegime?: AccountingRegime;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  beneficiaryAccountNumber?: string | null;
  beneficiaryBankName?: string | null;
}

const DEFAULT_COMPANY_NAME = 'CÔNG TY TNHH XTTECH';
const DEFAULT_COMPANY_ADDRESS = 'Hệ thống ERP Nội thất & Nhôm kính XTTECH';

const VOUCHER_PRINT_CSS = `
@page { size: A5 landscape; margin: 10mm; }
@media print {
  body { margin: 0; }
}
body {
  font-family: 'Times New Roman', Times, serif;
  color: #0f172a;
  font-size: 12pt;
  line-height: 1.45;
  margin: 0;
  padding: 8mm;
}
.vp-wrap {
  width: 100%;
  max-width: 200mm;
  margin: 0 auto;
}
.vp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12pt;
  margin-bottom: 10pt;
}
.vp-company {
  flex: 1;
  font-size: 10.5pt;
}
.vp-company-name {
  font-weight: bold;
  text-transform: uppercase;
  font-size: 11pt;
}
.vp-form-meta {
  width: 72mm;
  text-align: center;
  font-size: 10pt;
}
.vp-form-code {
  font-weight: bold;
}
.vp-form-circular {
  font-style: italic;
  font-size: 9pt;
}
.vp-title-block {
  text-align: center;
  margin: 6pt 0 10pt;
}
.vp-title {
  margin: 0;
  font-size: 16pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.4pt;
}
.vp-date {
  font-style: italic;
  font-size: 10.5pt;
  margin-top: 2pt;
}
.vp-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12pt;
  margin-bottom: 8pt;
  font-size: 10.5pt;
}
.vp-posting-box {
  border: 1px solid #334155;
  padding: 4pt 8pt;
  min-width: 58mm;
  font-size: 10pt;
}
.vp-field {
  margin: 3.5pt 0;
}
.vp-label {
  font-weight: bold;
}
.vp-amount {
  font-weight: bold;
  font-size: 12.5pt;
}
.vp-words {
  font-style: italic;
  font-weight: bold;
}
.vp-table {
  width: 100%;
  border-collapse: collapse;
  margin: 8pt 0;
  font-size: 10pt;
}
.vp-table th,
.vp-table td {
  border: 1px solid #475569;
  padding: 3.5pt 5pt;
}
.vp-table th {
  background: #f1f5f9;
  text-align: center;
  font-weight: bold;
}
.vp-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.vp-center {
  text-align: center;
}
.vp-signatures {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8pt;
  margin-top: 14pt;
  page-break-inside: avoid;
}
.vp-sign-col {
  text-align: center;
  font-size: 10pt;
}
.vp-sign-title {
  font-weight: bold;
}
.vp-sign-hint {
  font-style: italic;
  font-size: 9pt;
  color: #475569;
}
.vp-sign-space {
  height: 44pt;
}
.vp-sign-name {
  font-weight: bold;
}
.vp-ack-line {
  margin-top: 10pt;
  font-size: 10pt;
  border-top: 1px dashed #cbd5e1;
  padding-top: 6pt;
}
.vp-unc-box {
  border: 1px solid #334155;
  padding: 6pt 8pt;
  margin-bottom: 6pt;
  font-size: 10.5pt;
}
.vp-unc-box-title {
  font-weight: bold;
  text-transform: uppercase;
  font-size: 9.5pt;
  color: #045863;
  margin-bottom: 3pt;
}
`;

function formatVietnameseDateLine(isoDate: string): string {
  const parts = isoDate.slice(0, 10).split('-');
  if (parts.length !== 3) return escapeHtml(isoDate);
  const [year, month, day] = parts;
  return `Ngày ${escapeHtml(day)} tháng ${escapeHtml(month)} năm ${escapeHtml(year)}`;
}

function getCircularNotice(regime?: AccountingRegime): string {
  if (regime === 'tt133') {
    return '(Ban hành theo Thông tư số 133/2016/TT-BTC ngày 26/08/2016 của Bộ Tài chính)';
  }
  return '(Ban hành theo Thông tư số 200/2014/TT-BTC ngày 22/12/2014 của Bộ Tài chính)';
}

function renderTaxStatusLine(voucher: VoucherDetail): string {
  const invoiceLabel = voucher.hasValidInvoice
    ? 'Có hóa đơn GTGT'
    : 'Không có hóa đơn GTGT';
  const taxBadge =
    TAX_DEDUCTIBLE_BADGE_MAP[voucher.isTaxDeductible ? 'true' : 'false'];
  return `<div><span class="vp-label">Thuế &amp; HĐ:</span> ${escapeHtml(invoiceLabel)} &bull; ${escapeHtml(taxBadge.label)}</div>`;
}

function summarizeDebitCreditAccounts(voucher: VoucherDetail): {
  debitCodes: string;
  creditCodes: string;
} {
  const debitSet = new Set<string>();
  const creditSet = new Set<string>();

  for (const line of voucher.lines) {
    if (line.debitAccountCode) debitSet.add(line.debitAccountCode);
    if (line.creditAccountCode) creditSet.add(line.creditAccountCode);
  }

  return {
    debitCodes: debitSet.size > 0 ? Array.from(debitSet).join(', ') : '---',
    creditCodes: creditSet.size > 0 ? Array.from(creditSet).join(', ') : '---',
  };
}

function renderLinesTable(voucher: VoucherDetail): string {
  if (!voucher.lines || voucher.lines.length === 0) return '';

  const rowsHtml = voucher.lines
    .map(
      (line, index) => `
      <tr>
        <td class="vp-center">${index + 1}</td>
        <td>${escapeHtml(line.description)}</td>
        <td class="vp-center">${escapeHtml(line.debitAccountCode || String(line.debitAccountId))}</td>
        <td class="vp-center">${escapeHtml(line.creditAccountCode || String(line.creditAccountId))}</td>
        <td class="vp-num">${escapeHtml(formatCurrency(line.amount))}</td>
      </tr>`,
    )
    .join('');

  return `
    <table class="vp-table">
      <thead>
        <tr>
          <th style="width: 32pt;">STT</th>
          <th>Nội dung / Diễn giải hạch toán</th>
          <th style="width: 58pt;">TK Nợ</th>
          <th style="width: 58pt;">TK Có</th>
          <th style="width: 100pt;">Số tiền</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>`;
}

function renderFourSignatures(
  roles: Array<{ title: string; hint: string; signerName?: string | null }>,
): string {
  const cols = roles
    .slice(0, 4)
    .map(
      (role) => `
      <div class="vp-sign-col">
        <div class="vp-sign-title">${escapeHtml(role.title)}</div>
        <div class="vp-sign-hint">${escapeHtml(role.hint)}</div>
        <div class="vp-sign-space"></div>
        <div class="vp-sign-name">${escapeHtml(role.signerName || '')}</div>
      </div>`,
    )
    .join('');

  return `<div class="vp-signatures">${cols}</div>`;
}

function buildCashVoucherHtml(
  voucher: VoucherDetail,
  options: VoucherPrintOptions,
): string {
  const isReceipt = voucher.voucherType === 'cash_receipt';
  const formCode = isReceipt ? 'Mẫu số 01-TT' : 'Mẫu số 02-TT';
  const title = isReceipt ? 'PHIẾU THU' : 'PHIẾU CHI';
  const personLabel = isReceipt ? 'Họ và tên người nộp tiền' : 'Họ và tên người nhận tiền';
  const reasonLabel = isReceipt ? 'Lý do nộp' : 'Lý do chi';
  const partnerRoleTitle = isReceipt ? 'Người nộp tiền' : 'Người nhận tiền';
  const displayNo = voucher.voucherNo;
  const { debitCodes, creditCodes } = summarizeDebitCreditAccounts(voucher);
  const amountWords =
    voucher.amountInWords || readVietnameseNumber(Math.round(Math.abs(voucher.totalAmount)));
  const personName = voucher.contactName || voucher.partnerName || '---';
  const address = voucher.contactAddress || '---';
  const attachmentCount = voucher.attachments?.length ?? 0;
  const companyName = options.companyName || DEFAULT_COMPANY_NAME;
  const companyAddress = options.companyAddress || DEFAULT_COMPANY_ADDRESS;

  return `
  <div class="vp-wrap">
    <div class="vp-header">
      <div class="vp-company">
        <div class="vp-company-name">${escapeHtml(companyName)}</div>
        <div>Địa chỉ: ${escapeHtml(companyAddress)}</div>
        ${options.companyTaxCode ? `<div>MST: ${escapeHtml(options.companyTaxCode)}</div>` : ''}
      </div>
      <div class="vp-form-meta">
        <div class="vp-form-code">${formCode}</div>
        <div class="vp-form-circular">${escapeHtml(getCircularNotice(options.accountingRegime))}</div>
      </div>
    </div>

    <div class="vp-title-block">
      <h1 class="vp-title">${title}</h1>
      <div class="vp-date">${formatVietnameseDateLine(voucher.voucherDate)}</div>
    </div>

    <div class="vp-meta-row">
      <div>
        <div><span class="vp-label">Số chứng từ:</span> ${escapeHtml(displayNo)}</div>
        <div><span class="vp-label">Quỹ tiền mặt:</span> Quỹ Tiền mặt (TK 1111)</div>
        ${renderTaxStatusLine(voucher)}
      </div>
      <div class="vp-posting-box">
        <div><span class="vp-label">Nợ TK:</span> ${escapeHtml(debitCodes)}</div>
        <div><span class="vp-label">Có TK:</span> ${escapeHtml(creditCodes)}</div>
      </div>
    </div>

    <div class="vp-field"><span class="vp-label">${personLabel}:</span> ${escapeHtml(personName)}</div>
    <div class="vp-field"><span class="vp-label">Địa chỉ:</span> ${escapeHtml(address)}</div>
    <div class="vp-field"><span class="vp-label">${reasonLabel}:</span> ${escapeHtml(voucher.description)}</div>
    <div class="vp-field">
      <span class="vp-label">Số tiền:</span>
      <span class="vp-amount">${escapeHtml(formatCurrency(voucher.totalAmount))}</span>
      <span class="vp-words"> (Viết bằng chữ: ${escapeHtml(amountWords)})</span>
    </div>
    <div class="vp-field">
      <span class="vp-label">Kèm theo:</span> ${attachmentCount > 0 ? `${attachmentCount} chứng từ gốc` : '.............................. chứng từ gốc'}
    </div>

    ${renderLinesTable(voucher)}

    ${renderFourSignatures([
      { title: 'Giám đốc', hint: '(Ký, họ tên, đóng dấu)' },
      { title: 'Kế toán trưởng', hint: '(Ký, họ tên)' },
      { title: 'Thủ quỹ', hint: '(Ký, họ tên)' },
      { title: partnerRoleTitle, hint: '(Ký, họ tên)', signerName: personName !== '---' ? personName : '' },
    ])}

    <div class="vp-ack-line">
      Đã nhận đủ số tiền (viết bằng chữ): ..................................................................................................................
    </div>
  </div>`;
}

function buildBankPaymentOrderHtml(
  voucher: VoucherDetail,
  options: VoucherPrintOptions,
): string {
  const displayNo = voucher.voucherNo;
  const { debitCodes, creditCodes } = summarizeDebitCreditAccounts(voucher);
  const amountWords =
    voucher.amountInWords || readVietnameseNumber(Math.round(Math.abs(voucher.totalAmount)));
  const companyName = options.companyName || DEFAULT_COMPANY_NAME;
  const payerAccount = options.bankAccountNumber || voucher.bankAccountNumber || '---';
  const payerBank = options.bankName || voucher.bankName || '---';
  const beneficiaryName = voucher.contactName || voucher.partnerName || '---';
  const beneficiaryAccount = options.beneficiaryAccountNumber || '................................................';
  const beneficiaryBank = options.beneficiaryBankName || voucher.contactAddress || '................................................';

  return `
  <div class="vp-wrap">
    <div class="vp-header">
      <div class="vp-company">
        <div class="vp-company-name">${escapeHtml(companyName)}</div>
        ${options.companyTaxCode ? `<div>MST: ${escapeHtml(options.companyTaxCode)}</div>` : ''}
      </div>
      <div class="vp-form-meta">
        <div class="vp-form-code">ỦY NHIỆM CHI (CHUYỂN KHOẢN)</div>
        <div>Số: <strong>${escapeHtml(displayNo)}</strong></div>
      </div>
    </div>

    <div class="vp-title-block">
      <h1 class="vp-title">ỦY NHIỆM CHI</h1>
      <div class="vp-date">${formatVietnameseDateLine(voucher.voucherDate)}</div>
    </div>

    <div class="vp-unc-box">
      <div class="vp-unc-box-title">Đơn vị trả tiền (Bên trích tài khoản)</div>
      <div class="vp-field"><span class="vp-label">Tên đơn vị:</span> ${escapeHtml(companyName)}</div>
      <div class="vp-field"><span class="vp-label">Số tài khoản:</span> ${escapeHtml(payerAccount)} &nbsp;&nbsp;|&nbsp;&nbsp; <span class="vp-label">Tại Ngân hàng:</span> ${escapeHtml(payerBank)}</div>
    </div>

    <div class="vp-unc-box">
      <div class="vp-unc-box-title">Đơn vị thụ hưởng (Bên nhận tiền)</div>
      <div class="vp-field"><span class="vp-label">Tên đơn vị / Cá nhân:</span> ${escapeHtml(beneficiaryName)}</div>
      <div class="vp-field"><span class="vp-label">Số tài khoản:</span> ${escapeHtml(beneficiaryAccount)} &nbsp;&nbsp;|&nbsp;&nbsp; <span class="vp-label">Tại Ngân hàng:</span> ${escapeHtml(beneficiaryBank)}</div>
    </div>

    <div class="vp-meta-row">
      <div style="flex: 1;">
        <div class="vp-field">
          <span class="vp-label">Số tiền:</span>
          <span class="vp-amount">${escapeHtml(formatCurrency(voucher.totalAmount))}</span>
        </div>
        <div class="vp-field">
          <span class="vp-label">Bằng chữ:</span>
          <span class="vp-words">${escapeHtml(amountWords)}</span>
        </div>
        <div class="vp-field">
          <span class="vp-label">Nội dung thanh toán:</span> ${escapeHtml(voucher.description)}
        </div>
        ${renderTaxStatusLine(voucher)}
      </div>
      <div class="vp-posting-box">
        <div><span class="vp-label">Nợ TK:</span> ${escapeHtml(debitCodes)}</div>
        <div><span class="vp-label">Có TK:</span> ${escapeHtml(creditCodes)}</div>
      </div>
    </div>

    ${renderLinesTable(voucher)}

    ${renderFourSignatures([
      { title: 'Người lập phiếu', hint: '(Ký, họ tên)', signerName: voucher.createdByName },
      { title: 'Kế toán trưởng', hint: '(Ký, họ tên)' },
      { title: 'Chủ tài khoản', hint: '(Ký, họ tên, đóng dấu)' },
      { title: 'Ngân hàng thực hiện', hint: '(Ghi sổ & ký xác nhận)' },
    ])}
  </div>`;
}

function buildGeneralVoucherHtml(
  voucher: VoucherDetail,
  options: VoucherPrintOptions,
): string {
  const displayNo = voucher.voucherNo;
  const { debitCodes, creditCodes } = summarizeDebitCreditAccounts(voucher);
  const amountWords =
    voucher.amountInWords || readVietnameseNumber(Math.round(Math.abs(voucher.totalAmount)));
  const companyName = options.companyName || DEFAULT_COMPANY_NAME;
  const companyAddress = options.companyAddress || DEFAULT_COMPANY_ADDRESS;
  const title =
    voucher.voucherType === 'bank_receipt'
      ? 'GIẤY BÁO CÓ NGÂN HÀNG'
      : 'CHỨNG TỪ KẾ TOÁN';

  return `
  <div class="vp-wrap">
    <div class="vp-header">
      <div class="vp-company">
        <div class="vp-company-name">${escapeHtml(companyName)}</div>
        <div>Địa chỉ: ${escapeHtml(companyAddress)}</div>
      </div>
      <div class="vp-form-meta">
        <div class="vp-form-code">Chứng từ hạch toán</div>
        <div class="vp-form-circular">${escapeHtml(getCircularNotice(options.accountingRegime))}</div>
      </div>
    </div>

    <div class="vp-title-block">
      <h1 class="vp-title">${title}</h1>
      <div class="vp-date">${formatVietnameseDateLine(voucher.voucherDate)}</div>
    </div>

    <div class="vp-meta-row">
      <div>
        <div><span class="vp-label">Số chứng từ:</span> ${escapeHtml(displayNo)}</div>
        <div><span class="vp-label">Đối tượng:</span> ${escapeHtml(voucher.contactName || voucher.partnerName || '---')}</div>
        ${voucher.bankAccountNumber ? `<div><span class="vp-label">Tài khoản NH:</span> ${escapeHtml(voucher.bankAccountNumber)} (${escapeHtml(voucher.bankName || '')})</div>` : ''}
        ${renderTaxStatusLine(voucher)}
      </div>
      <div class="vp-posting-box">
        <div><span class="vp-label">Nợ TK:</span> ${escapeHtml(debitCodes)}</div>
        <div><span class="vp-label">Có TK:</span> ${escapeHtml(creditCodes)}</div>
      </div>
    </div>

    <div class="vp-field"><span class="vp-label">Diễn giải:</span> ${escapeHtml(voucher.description)}</div>
    <div class="vp-field">
      <span class="vp-label">Tổng số tiền:</span>
      <span class="vp-amount">${escapeHtml(formatCurrency(voucher.totalAmount))}</span>
      <span class="vp-words"> (Viết bằng chữ: ${escapeHtml(amountWords)})</span>
    </div>

    ${renderLinesTable(voucher)}

    ${renderFourSignatures([
      { title: 'Người lập biểu', hint: '(Ký, họ tên)', signerName: voucher.createdByName },
      { title: 'Kế toán trưởng', hint: '(Ký, họ tên)' },
      { title: 'Thủ trưởng đơn vị', hint: '(Ký, họ tên, đóng dấu)' },
      { title: 'Người ghi sổ', hint: '(Ký, họ tên)', signerName: voucher.postedByName },
    ])}
  </div>`;
}

/**
 * Tạo chuỗi HTML chuẩn Mẫu số 01-TT (Phiếu Thu), Mẫu số 02-TT (Phiếu Chi) hoặc Ủy nhiệm chi.
 */
export function buildVoucherPrintHtml(
  voucher: VoucherDetail,
  options: VoucherPrintOptions = {},
): string {
  if (voucher.voucherType === 'cash_receipt' || voucher.voucherType === 'cash_payment') {
    return buildCashVoucherHtml(voucher, options);
  }
  if (voucher.voucherType === 'bank_payment') {
    return buildBankPaymentOrderHtml(voucher, options);
  }
  return buildGeneralVoucherHtml(voucher, options);
}

/**
 * Mở hộp thoại in chứng từ kế toán (01-TT / 02-TT / Ủy nhiệm chi) qua iframe ẩn dùng chung.
 */
export async function printAccountingVoucher(
  voucher: VoucherDetail,
  options: VoucherPrintOptions = {},
): Promise<void> {
  const displayNo = voucher.voucherNo;
  const html = buildVoucherPrintHtml(voucher, options);
  await printHtmlDocument(html, `Chung-tu-${displayNo}`, VOUCHER_PRINT_CSS);
}
