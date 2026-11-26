import * as XLSX from 'xlsx';
import { PIT_CONTRACT_CATEGORY_MAP, STATUTORY_FORM_META_MAP } from '@/config/finance';
import type { FinanceSetting, PitLedgerSummary, StatutoryFiling } from '@/types';
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

function buildSignatureBlock(setting?: FinanceSetting | null): SheetCell[][] {
  return [
    [],
    ['', 'Người lập biểu', '', 'Kế toán trưởng', 'Người đại diện theo pháp luật'],
    ['', '(Ký, họ tên)', '', '(Ký, họ tên)', '(Ký, họ tên, đóng dấu)'],
    [],
    [
      '',
      setting?.preparerName || '',
      '',
      setting?.chiefAccountant || '',
      setting?.legalRepresentative || '',
    ],
  ];
}

function buildBctcSheet(
  filing: StatutoryFiling,
  headerRows: SheetCell[][],
  setting?: FinanceSetting | null,
): XLSX.WorkSheet {
  if (filing.formCode === 'CDTK') {
    const rows: SheetCell[][] = [
      ...headerRows,
      [
        'Số hiệu TK',
        'Tên tài khoản',
        'Đầu kỳ Nợ',
        'Đầu kỳ Có',
        'Phát sinh Nợ',
        'Phát sinh Có',
        'Cuối kỳ Nợ',
        'Cuối kỳ Có',
      ],
    ];
    for (const ind of filing.indicators) {
      rows.push([
        ind.code,
        ind.label,
        ind.openingDebit ?? 0,
        ind.openingCredit ?? 0,
        ind.periodDebit ?? 0,
        ind.periodCredit ?? 0,
        ind.closingDebit ?? 0,
        ind.closingCredit ?? 0,
      ]);
    }
    rows.push(...buildSignatureBlock(setting));
    return buildSheetFromAoa(rows, [14, 42, 18, 18, 18, 18, 18, 18], [2, 3, 4, 5, 6, 7], 5);
  }

  const isComparative =
    filing.formCode === 'B01_DN' ||
    filing.formCode === 'B02_DN' ||
    filing.formCode === 'B03_DN';

  if (isComparative) {
    const rows: SheetCell[][] = [
      ...headerRows,
      ['STT', 'Chỉ tiêu', 'Mã số', 'Kỳ này / Số cuối năm', 'Kỳ trước / Số đầu năm', 'Ghi chú'],
    ];
    for (const ind of filing.indicators) {
      rows.push([
        ind.lineNo || '',
        ind.label,
        ind.code,
        ind.value,
        ind.priorValue ?? 0,
        ind.note || ind.formulaNote || '',
      ]);
    }
    rows.push(...buildSignatureBlock(setting));
    return buildSheetFromAoa(rows, [10, 52, 12, 22, 22, 30], [3, 4], 5);
  }

  const rows: SheetCell[][] = [
    ...headerRows,
    ['Mục / Phần', 'Mã chỉ tiêu', 'Tên chỉ tiêu / Nội dung', 'Giá trị (VNĐ)', 'Nguồn dữ liệu', 'Ghi chú'],
  ];
  for (const ind of filing.indicators) {
    rows.push([
      ind.section || '',
      ind.code,
      ind.label,
      ind.value,
      ind.sourceKind === 'manual_input' ? 'Nhập tay' : 'Tự động từ sổ sách',
      ind.note || ind.formulaNote || '',
    ]);
  }
  rows.push(...buildSignatureBlock(setting));
  return buildSheetFromAoa(rows, [22, 16, 52, 22, 22, 30], [3], 5);
}

export async function exportStatutoryFilingExcel(
  filing: StatutoryFiling,
  setting?: FinanceSetting | null,
  pitLedger?: PitLedgerSummary | null,
): Promise<void> {
  const formTitle = STATUTORY_FORM_META_MAP[filing.formCode]?.title || filing.formCode;
  const periodLabel =
    filing.periodType === 'quarter'
      ? `Quý ${filing.periodIndex}/${filing.taxYear}`
      : filing.periodType === 'month'
        ? `Tháng ${String(filing.periodIndex).padStart(2, '0')}/${filing.taxYear}`
        : `Năm ${filing.taxYear}`;

  const headerRows: SheetCell[][] = [
    [formTitle.toUpperCase()],
    [
      `Người nộp thuế: ${setting?.taxpayerName || '---'}`,
      `MST: ${setting?.taxCode || '---'}`,
      `Kỳ lập: ${periodLabel}`,
    ],
    [
      `Thông tư: ${filing.circularCode}`,
      `HTKK tham chiếu: ${filing.targetHtkkVersion}`,
      `SHA-256: ${filing.exportSha256 || 'Bản xem trước'}`,
    ],
    [],
  ];

  const wb = XLSX.utils.book_new();
  const wsMain = buildBctcSheet(filing, headerRows, setting);
  XLSX.utils.book_append_sheet(wb, wsMain, filing.formCode.slice(0, 31));

  if (filing.formCode === '05_KK_TNCN' && pitLedger) {
    const pitRows: SheetCell[][] = [
      ['BẢNG KÊ CHI TIẾT KHẤU TRỪ THUẾ TNCN'],
      [`Kỳ tính thuế: ${periodLabel}`, `MST: ${setting?.taxCode || '---'}`],
      [],
      [
        'STT',
        'Họ và tên',
        'MST cá nhân',
        'CCCD/CMND',
        'Nhóm hợp đồng',
        'Thu nhập chịu thuế',
        'Giảm trừ bản thân',
        'Số NPT',
        'Giảm trừ NPT',
        'BHXH bắt buộc',
        'Thu nhập tính thuế',
        'Thuế TNCN đã khấu trừ',
        'Trạng thái',
      ],
    ];
    pitLedger.items.forEach((item, idx) => {
      pitRows.push([
        idx + 1,
        item.fullName,
        item.taxCode || '',
        item.idNumber || '',
        PIT_CONTRACT_CATEGORY_MAP[item.contractCategory]?.shortLabel || item.contractCategory,
        item.grossTaxableIncome,
        item.personalDeduction,
        item.dependentCount,
        item.dependentDeduction,
        item.insuranceDeduction,
        item.assessableIncome,
        item.withheldPitAmount,
        item.status === 'verified' ? 'Đã xác nhận' : 'Nháp cần đối chiếu',
      ]);
    });
    pitRows.push(...buildSignatureBlock(setting));
    const wsPit = buildSheetFromAoa(
      pitRows,
      [6, 26, 16, 16, 20, 18, 18, 10, 16, 16, 18, 18, 22],
      [5, 6, 7, 8, 9, 10, 11],
      4,
    );
    XLSX.utils.book_append_sheet(wb, wsPit, 'Bang_ke_TNCN');
  }

  const filename = `${filing.formCode}_${filing.taxYear}_${filing.periodType}_${filing.periodIndex}.xlsx`;
  await saveWorkbook(wb, filename);
}
