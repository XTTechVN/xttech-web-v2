import * as XLSX from 'xlsx';
import {
  ACCOUNT_NATURE_MAP,
  REPORT_VIEW_MODE_MAP,
  TAX_DEDUCTIBLE_BADGE_MAP,
  VAT_RATE_MAP,
  VOUCHER_TYPE_MAP,
} from '@/config/finance';
import type {
  CashbookReport,
  GeneralLedgerReport,
  NonDeductibleReport,
  ProjectPnlReport,
  TaxInvoice,
  TrialBalanceReport,
  VatLedgerReport,
} from '@/types';
import { downloadOrShareBlob } from '@/utils/file';

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

type SheetCell = string | number | boolean | null | undefined;

function buildSheetFromAoa(
  rows: SheetCell[][],
  colWidths: number[],
  numericColIndices: number[] = [],
  startDataRowIndex = 0,
): XLSX.WorkSheet {
  const normalizedRows = rows.map((row) =>
    row.map((cell) => (cell === null || cell === undefined ? '' : cell)),
  );
  const worksheet = XLSX.utils.aoa_to_sheet(normalizedRows);
  worksheet['!cols'] = colWidths.map((wch) => ({ wch }));

  if (numericColIndices.length > 0 && worksheet['!ref']) {
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let r = startDataRowIndex; r <= range.e.r; r++) {
      for (const c of numericColIndices) {
        const addr = XLSX.utils.encode_cell({ r, c });
        const cell = worksheet[addr];
        if (cell && cell.t === 'n') {
          cell.z = '#,##0';
        }
      }
    }
  }

  return worksheet;
}

async function saveWorkbook(workbook: XLSX.WorkBook, filename: string): Promise<void> {
  const rawBytes = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
    compression: true,
  }) as ArrayBuffer | Uint8Array;
  const uint8 =
    rawBytes instanceof Uint8Array ? rawBytes : new Uint8Array(rawBytes);
  const buffer = uint8.buffer.slice(
    uint8.byteOffset,
    uint8.byteOffset + uint8.byteLength,
  ) as ArrayBuffer;
  await downloadOrShareBlob(buffer, filename, XLSX_MIME);
}

/**
 * Xuất Sổ Quỹ Tiền Mặt TK 1111 (Mẫu số S07-DN) ra file Excel.
 */
export async function exportCashbookExcel(report: CashbookReport): Promise<void> {
  const rows: SheetCell[][] = [
    ['SỔ QUỸ TIỀN MẶT (MẪU SỐ S07-DN)'],
    [
      'Quỹ: Quỹ Tiền mặt (TK 1111)',
      `Từ ngày: ${report.fromDate}`,
      `Đến ngày: ${report.toDate}`,
      `Phiếu nháp chờ ghi sổ: ${report.pendingDraftCount} (${report.pendingDraftAmount})`,
    ],
    [
      `Số dư đầu kỳ: ${report.openingBalance}`,
      `Tổng thu: ${report.totalReceipt}`,
      `Tổng chi: ${report.totalPayment}`,
      `Số dư cuối kỳ: ${report.closingBalance}`,
    ],
    [],
    [
      'STT',
      'Ngày chứng từ',
      'Ngày ghi sổ',
      'Số chứng từ',
      'Loại chứng từ',
      'Đối tượng',
      'Diễn giải',
      'TK đối ứng',
      'Thu (VNĐ)',
      'Chi (VNĐ)',
      'Tồn quỹ (VNĐ)',
      'Hóa đơn GTGT',
      'Tính hợp lệ thuế (B4)',
    ],
  ];

  report.items.forEach((item, index) => {
    const contraLabel = item.contraAccountCode
      ? item.contraAccountName
        ? `${item.contraAccountCode} - ${item.contraAccountName}`
        : item.contraAccountCode
      : '';
    const taxBadge = TAX_DEDUCTIBLE_BADGE_MAP[item.isTaxDeductible ? 'true' : 'false'];

    rows.push([
      index + 1,
      item.voucherDate,
      item.postingDate,
      item.voucherNo,
      VOUCHER_TYPE_MAP[item.voucherType]?.shortLabel || item.voucherType,
      item.partnerName || '',
      item.description,
      contraLabel,
      item.receiptAmount,
      item.paymentAmount,
      item.runningBalance,
      item.hasValidInvoice ? 'Có HĐ' : 'Không HĐ',
      taxBadge.shortLabel || taxBadge.label,
    ]);
  });

  rows.push([
    '',
    '',
    '',
    '',
    '',
    '',
    'TỔNG CỘNG PHÁT SINH & TỒN CUỐI KỲ',
    '',
    report.totalReceipt,
    report.totalPayment,
    report.closingBalance,
    '',
    '',
  ]);

  const ws = buildSheetFromAoa(
    rows,
    [6, 14, 14, 18, 16, 26, 38, 22, 18, 18, 18, 14, 20],
    [8, 9, 10],
    5,
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'So_Quy_1111_S07_DN');
  await saveWorkbook(wb, `So_Quy_Tien_Mat_TK1111_S07_DN_${report.fromDate}_${report.toDate}.xlsx`);
}

/**
 * Xuất Sổ Cái Tài Khoản (Mẫu số S03b-DN) ra file Excel.
 */
export async function exportGeneralLedgerExcel(
  report: GeneralLedgerReport,
): Promise<void> {
  const modeLabel =
    REPORT_VIEW_MODE_MAP[report.reportViewMode]?.label || report.reportViewMode;
  const accountLabel = report.accountCode
    ? `${report.accountCode} - ${report.accountName || ''}`
    : 'Tất cả tài khoản';

  const rows: SheetCell[][] = [
    ['SỔ CÁI TÀI KHOẢN (MẪU SỐ S03b-DN)'],
    [
      `Tài khoản: ${accountLabel}`,
      `Từ ngày: ${report.fromDate}`,
      `Đến ngày: ${report.toDate}`,
      `Chế độ lọc: ${modeLabel}`,
    ],
    [
      `Đầu kỳ Nợ: ${report.openingDebit}`,
      `Đầu kỳ Có: ${report.openingCredit}`,
      `Phát sinh Nợ: ${report.periodDebit}`,
      `Phát sinh Có: ${report.periodCredit}`,
      `Cuối kỳ Nợ: ${report.closingDebit}`,
      `Cuối kỳ Có: ${report.closingCredit}`,
    ],
    [],
    [
      'STT',
      'Ngày chứng từ',
      'Ngày ghi sổ',
      'Số chứng từ',
      'TK hạch toán',
      'TK đối ứng',
      'Diễn giải',
      'Đối tượng',
      'Công trình',
      'Khoản mục CP',
      'Phát sinh Nợ (VNĐ)',
      'Phát sinh Có (VNĐ)',
      'Số dư lũy kế (VNĐ)',
      'Tính hợp lệ thuế (B4)',
    ],
  ];

  report.items.forEach((item, index) => {
    const taxBadge = TAX_DEDUCTIBLE_BADGE_MAP[item.isTaxDeductible ? 'true' : 'false'];
    rows.push([
      index + 1,
      item.voucherDate,
      item.postingDate,
      item.voucherNo,
      item.accountCode,
      item.contraAccountCode,
      item.description,
      item.partnerName || '',
      item.projectCode || item.projectName || '',
      item.costItemName || '',
      item.debitAmount,
      item.creditAmount,
      item.runningBalance,
      taxBadge.shortLabel || taxBadge.label,
    ]);
  });

  rows.push([
    '',
    '',
    '',
    '',
    '',
    '',
    'CỘNG PHÁT SINH TRONG KỲ',
    '',
    '',
    '',
    report.periodDebit,
    report.periodCredit,
    '',
    '',
  ]);

  const ws = buildSheetFromAoa(
    rows,
    [6, 14, 14, 18, 12, 12, 38, 24, 20, 20, 18, 18, 18, 20],
    [10, 11, 12],
    5,
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'So_Cai_S03b_DN');
  const codeSlug = report.accountCode || 'ALL';
  await saveWorkbook(wb, `So_Cai_${codeSlug}_S03b_DN_${report.fromDate}_${report.toDate}.xlsx`);
}

/**
 * Xuất Bảng Cân Đối Phát Sinh (CĐPS) ra file Excel.
 */
export async function exportTrialBalanceExcel(
  report: TrialBalanceReport,
): Promise<void> {
  const rows: SheetCell[][] = [
    ['BẢNG CÂN ĐỐI PHÁT SINH TÀI KHOẢN'],
    [
      `Từ ngày: ${report.fromDate}`,
      `Đến ngày: ${report.toDate}`,
      'Sổ Tài chính hợp nhất',
    ],
    [],
    [
      'Mã TK',
      'Tên tài khoản',
      'Cấp',
      'Tính chất',
      'Đầu kỳ Nợ',
      'Đầu kỳ Có',
      'Phát sinh Nợ',
      'Phát sinh Có',
      'Cuối kỳ Nợ',
      'Cuối kỳ Có',
    ],
  ];

  for (const row of report.rows) {
    rows.push([
      row.accountCode,
      row.accountName,
      row.level,
      ACCOUNT_NATURE_MAP[row.nature]?.shortLabel || row.nature,
      row.openingDebit,
      row.openingCredit,
      row.periodDebit,
      row.periodCredit,
      row.closingDebit,
      row.closingCredit,
    ]);
  }

  rows.push([
    '',
    'TỔNG CỘNG',
    '',
    '',
    report.totalOpeningDebit,
    report.totalOpeningCredit,
    report.totalPeriodDebit,
    report.totalPeriodCredit,
    report.totalClosingDebit,
    report.totalClosingCredit,
  ]);

  const ws = buildSheetFromAoa(
    rows,
    [12, 38, 8, 14, 18, 18, 18, 18, 18, 18],
    [4, 5, 6, 7, 8, 9],
    4,
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bang_CDPS');
  await saveWorkbook(wb, `Bang_Can_Doi_Phat_Sinh_${report.fromDate}_${report.toDate}.xlsx`);
}

/**
 * Xuất Báo cáo Lãi / Lỗ Theo Công Trình (Project P&L) ra file Excel.
 */
export async function exportProjectPnlExcel(report: ProjectPnlReport): Promise<void> {
  const modeLabel =
    REPORT_VIEW_MODE_MAP[report.reportViewMode]?.label || report.reportViewMode;
  const rows: SheetCell[][] = [
    ['BÁO CÁO LÃI / LỖ THEO CÔNG TRÌNH (PROJECT P&L)'],
    [
      `Từ ngày: ${report.fromDate || 'Tất cả'}`,
      `Đến ngày: ${report.toDate || 'Tất cả'}`,
      `Chế độ lọc: ${modeLabel}`,
    ],
    [],
    [
      'STT',
      'Mã công trình',
      'Tên công trình',
      'Khách hàng',
      'Doanh thu HĐ',
      'NVL trực tiếp',
      'Nhân công TT',
      'SX chung',
      'Thuê ngoài',
      'Chi phí khác',
      'Tổng chi phí',
      'CP loại trừ B4',
      'Lãi / Lỗ gộp',
      'Biên LN (%)',
      'Đã thu',
      'Còn phải thu',
    ],
  ];

  report.rows.forEach((row, index) => {
    rows.push([
      index + 1,
      row.projectCode,
      row.projectName,
      row.customerName || '',
      row.contractRevenue,
      row.directMaterialCost,
      row.directLaborCost,
      row.factoryOverheadCost,
      row.subcontractCost,
      row.otherExpenseCost,
      row.totalCost,
      row.nonDeductibleCost,
      row.grossProfit,
      Number(row.grossMarginPct.toFixed(2)),
      row.collectedAmount,
      row.receivableAmount,
    ]);
  });

  rows.push([
    '',
    '',
    'TỔNG CỘNG TOÀN BỘ CÔNG TRÌNH',
    '',
    report.totalRevenue,
    '',
    '',
    '',
    '',
    '',
    report.totalCost,
    '',
    report.totalGrossProfit,
    '',
    '',
    '',
  ]);

  const ws = buildSheetFromAoa(
    rows,
    [6, 16, 32, 24, 18, 16, 16, 16, 16, 16, 18, 18, 18, 12, 18, 18],
    [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15],
    4,
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Lai_Lo_Cong_Trinh');
  await saveWorkbook(
    wb,
    `Bao_Cao_Lai_Lo_Cong_Trinh_${report.fromDate || 'all'}_${report.toDate || 'all'}.xlsx`,
  );
}

function mapVatInvoiceRows(invoices: TaxInvoice[]): SheetCell[][] {
  const rows: SheetCell[][] = [
    [
      'STT',
      'Mẫu số',
      'Ký hiệu',
      'Số hóa đơn',
      'Ngày hóa đơn',
      'MST đối tác',
      'Tên đối tác',
      'Giá trị chưa thuế',
      'Thuế suất',
      'Tiền thuế GTGT',
      'Tổng thanh toán',
      'Khấu trừ / Hợp lệ',
      'Số chứng từ kế toán',
    ],
  ];

  invoices.forEach((inv, index) => {
    rows.push([
      index + 1,
      inv.invoiceTemplateCode || '',
      inv.invoiceSeries,
      inv.invoiceNumber,
      inv.invoiceDate,
      inv.partnerTaxCode,
      inv.partnerName,
      inv.taxableAmount,
      VAT_RATE_MAP[inv.vatRate]?.shortLabel || inv.vatRate,
      inv.vatAmount,
      inv.totalAmount,
      inv.isTaxDeductible ? 'Có' : 'Không',
      inv.voucherNo || '',
    ]);
  });

  return rows;
}

/**
 * Xuất Bảng kê Thuế GTGT Đầu vào / Đầu ra ra file Excel (3 Sheets).
 */
export async function exportVatLedgerExcel(report: VatLedgerReport): Promise<void> {
  const periodText = report.month
    ? `Tháng ${report.month}/${report.year}`
    : report.quarter
      ? `Quý ${report.quarter}/${report.year}`
      : `Năm ${report.year}`;

  const summaryRows: SheetCell[][] = [
    [`TỔNG HỢP TỜ KHAI THUẾ GTGT - ${periodText}`],
    [],
    ['Chỉ tiêu', 'Giá trị (VNĐ)'],
    ['Tổng giá trị HHDV mua vào chưa thuế', report.totalInputTaxable],
    ['Tổng thuế GTGT đầu vào', report.totalInputVat],
    ['Thuế GTGT đầu vào được khấu trừ', report.deductibleInputVat],
    ['Thuế GTGT đầu vào không đủ ĐK khấu trừ', report.nonDeductibleInputVat],
    ['Tổng doanh thu HHDV bán ra chưa thuế', report.totalOutputTaxable],
    ['Tổng thuế GTGT đầu ra', report.totalOutputVat],
    ['Thuế GTGT phải nộp trong kỳ', report.netVatPayable],
    ['Thuế GTGT còn được khấu trừ chuyển kỳ sau', report.vatCarriedForward],
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    buildSheetFromAoa(summaryRows, [44, 22], [1], 3),
    'Tong_Hop_GTGT',
  );
  XLSX.utils.book_append_sheet(
    wb,
    buildSheetFromAoa(
      mapVatInvoiceRows(report.inputInvoices),
      [6, 12, 14, 14, 14, 16, 32, 18, 12, 18, 18, 18, 18],
      [7, 9, 10],
      1,
    ),
    'Bang_Ke_Dau_Vao',
  );
  XLSX.utils.book_append_sheet(
    wb,
    buildSheetFromAoa(
      mapVatInvoiceRows(report.outputInvoices),
      [6, 12, 14, 14, 14, 16, 32, 18, 12, 18, 18, 18, 18],
      [7, 9, 10],
      1,
    ),
    'Bang_Ke_Dau_Ra',
  );

  const periodSlug = report.month
    ? `${report.year}_T${report.month}`
    : report.quarter
      ? `${report.year}_Q${report.quarter}`
      : `${report.year}`;
  await saveWorkbook(wb, `Bang_Ke_Thue_GTGT_${periodSlug}.xlsx`);
}

/**
 * Xuất Bảng kê Chi phí không được trừ Thuế TNDN (Chỉ tiêu B4) & Dự toán CIT ra file Excel.
 */
export async function exportNonDeductibleExcel(
  report: NonDeductibleReport,
): Promise<void> {
  const rows: SheetCell[][] = [
    ['BẢNG KÊ CHI PHÍ KHÔNG ĐƯỢC TRỪ TNDN (CHỈ TIÊU B4) & DỰ TOÁN THUẾ CIT'],
    [
      `Từ ngày: ${report.fromDate}`,
      `Đến ngày: ${report.toDate}`,
      `Tổng chi phí loại trừ B4: ${report.totalNonDeductibleAmount}`,
    ],
    [
      `Lợi nhuận kế toán: ${report.accountingProfit}`,
      `CP B4 kỳ này: ${report.nonDeductibleExpenseTotal}`,
      `NVL/Dở dang không HĐ (154): ${report.nonDeductibleInventoryWipTotal}`,
    ],
    [
      `Thu nhập chịu thuế TNDN: ${report.taxableIncome}`,
      `Thuế TNDN ước tính (CIT): ${report.estimatedCitAmount}`,
      `Thuế mất khấu trừ do thiếu HĐ: ${report.taxSavingsLostEstimate}`,
    ],
    [],
    [
      'STT',
      'Ngày chứng từ',
      'Ngày ghi sổ',
      'Số chứng từ',
      'Loại chứng từ',
      'Hóa đơn GTGT',
      'Tính hợp lệ thuế (B4)',
      'Đối tượng',
      'Công trình',
      'Diễn giải',
      'Số tiền (VNĐ)',
    ],
  ];

  report.items.forEach((item, index) => {
    const taxBadge = TAX_DEDUCTIBLE_BADGE_MAP[item.isTaxDeductible ? 'true' : 'false'];
    rows.push([
      index + 1,
      item.voucherDate,
      item.postingDate,
      item.voucherNo,
      VOUCHER_TYPE_MAP[item.voucherType]?.shortLabel || item.voucherType,
      item.hasValidInvoice ? 'Có HĐ' : 'Không HĐ',
      taxBadge.shortLabel || taxBadge.label,
      item.contactName || item.partnerName || '',
      item.projectCode || item.projectName || '',
      item.description,
      item.totalAmount,
    ]);
  });

  rows.push([
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'TỔNG CHI PHÍ KHÔNG ĐƯỢC TRỪ (B4)',
    report.totalNonDeductibleAmount,
  ]);

  const ws = buildSheetFromAoa(
    rows,
    [6, 14, 14, 18, 16, 14, 20, 24, 20, 40, 18],
    [10],
    6,
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Chi_Phi_Loai_Tru_B4');
  await saveWorkbook(wb, `Chi_Phi_Loai_Tru_B4_${report.fromDate}_${report.toDate}.xlsx`);
}
