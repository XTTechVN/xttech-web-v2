import * as XLSX from 'xlsx';
import type { CashflowReport } from '@/types';
import { downloadOrShareBlob } from '@/utils/file';

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export async function exportCashflowExcel(report: CashflowReport): Promise<void> {
  const rows: Array<Array<string | number>> = [
    ['BÁO CÁO LƯU CHUYỂN DÒNG TIỀN (CASHFLOW)'],
    [`Từ ngày: ${report.fromDate}`, `Đến ngày: ${report.toDate}`, 'Sổ Tài chính hợp nhất'],
    [
      `Tổng Thu: ${report.totalIn}`,
      `Tổng Chi: ${report.totalOut}`,
      `Lưu chuyển thuần: ${report.netCashflow}`,
    ],
    [],
    [
      'Kỳ báo cáo',
      'Thu Tiền mặt',
      'Thu Ngân hàng',
      'Tổng Thu',
      'Chi Tiền mặt',
      'Chi Ngân hàng',
      'Tổng Chi',
      'Lưu chuyển thuần',
      'Số dư lũy kế',
    ],
  ];

  for (const item of report.series) {
    rows.push([
      item.periodLabel,
      item.cashIn,
      item.bankIn,
      item.totalIn,
      item.cashOut,
      item.bankOut,
      item.totalOut,
      item.netCashflow,
      item.cumulativeBalance,
    ]);
  }

  rows.push([
    'TỔNG CỘNG',
    report.series.reduce((s, r) => s + r.cashIn, 0),
    report.series.reduce((s, r) => s + r.bankIn, 0),
    report.totalIn,
    report.series.reduce((s, r) => s + r.cashOut, 0),
    report.series.reduce((s, r) => s + r.bankOut, 0),
    report.totalOut,
    report.netCashflow,
    '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Luu_Chuyen_Dong_Tien');

  const rawBytes = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array',
    compression: true,
  }) as ArrayBuffer | Uint8Array;
  const uint8 = rawBytes instanceof Uint8Array ? rawBytes : new Uint8Array(rawBytes);
  const buffer = uint8.buffer.slice(
    uint8.byteOffset,
    uint8.byteOffset + uint8.byteLength,
  ) as ArrayBuffer;

  await downloadOrShareBlob(
    buffer,
    `Bao_Cao_Dong_Tien_${report.fromDate}_${report.toDate}.xlsx`,
    XLSX_MIME,
  );
}
