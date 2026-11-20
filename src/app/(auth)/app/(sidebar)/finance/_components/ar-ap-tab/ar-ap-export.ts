import * as XLSX from 'xlsx';
import { PARTNER_TYPE_MAP } from '@/config/finance';
import type { ArApAgingReport } from '@/types';
import { downloadOrShareBlob } from '@/utils/file';

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export async function exportArApAgingExcel(report: ArApAgingReport): Promise<void> {
  const title =
    report.kind === 'receivable'
      ? 'BÁO CÁO TUỔI NỢ PHẢI THU KHÁCH HÀNG (TK 131)'
      : 'BÁO CÁO TUỔI NỢ PHẢI TRẢ NHÀ CUNG CẤP (TK 331)';

  const rows: Array<Array<string | number>> = [
    [title],
    [`Đến ngày: ${report.asOfDate}`, 'Sổ Tài chính hợp nhất', `Tổng số dư: ${report.totalBalance}`],
    [],
    [
      'STT',
      'Loại đối tượng',
      'Mã đối tượng',
      'Tên đối tượng',
      'Số điện thoại',
      'Tổng phát sinh Nợ',
      'Tổng phát sinh Có',
      'Số dư công nợ',
      'Trong hạn',
      'Quá hạn 1-30 ngày',
      'Quá hạn 31-60 ngày',
      'Quá hạn 61-90 ngày',
      'Quá hạn > 90 ngày',
    ],
  ];

  report.items.forEach((item, index) => {
    rows.push([
      index + 1,
      PARTNER_TYPE_MAP[item.partnerType]?.shortLabel || item.partnerType,
      item.partnerCode || '',
      item.partnerName,
      item.partnerPhone || '',
      item.totalDebit,
      item.totalCredit,
      item.netBalance,
      item.currentAmount,
      item.overdue1To30,
      item.overdue31To60,
      item.overdue61To90,
      item.overdueOver90,
    ]);
  });

  rows.push([
    '',
    '',
    '',
    'TỔNG CỘNG',
    '',
    report.items.reduce((sum, i) => sum + i.totalDebit, 0),
    report.items.reduce((sum, i) => sum + i.totalCredit, 0),
    report.totalBalance,
    report.items.reduce((sum, i) => sum + i.currentAmount, 0),
    report.items.reduce((sum, i) => sum + i.overdue1To30, 0),
    report.items.reduce((sum, i) => sum + i.overdue31To60, 0),
    report.items.reduce((sum, i) => sum + i.overdue61To90, 0),
    report.items.reduce((sum, i) => sum + i.overdueOver90, 0),
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 16 },
    { wch: 30 },
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, report.kind === 'receivable' ? 'Cong_No_131' : 'Cong_No_331');

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

  const prefix = report.kind === 'receivable' ? 'Tuoi_No_Phai_Thu_131' : 'Tuoi_No_Phai_Tra_331';
  await downloadOrShareBlob(buffer, `${prefix}_${report.asOfDate}.xlsx`, XLSX_MIME);
}
