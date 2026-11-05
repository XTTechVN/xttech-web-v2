import toast from 'react-hot-toast';
import { GlassOrder } from '@/types';
import {
  GLASS_GRIND_LABEL_MAP,
  formatPaneShapeSummary,
  exportGlassOrderToDxf,
} from './glass-order-dxf-export';

export { exportGlassOrderToDxf, formatPaneShapeSummary };

export async function exportGlassOrderToExcel(fullOrder: GlassOrder): Promise<void> {
  const items = fullOrder.items || [];
  if (items.length === 0) {
    toast.error('Đơn hàng không có ô kính nào để xuất!');
    return;
  }

  const XLSX = await import('xlsx');
  const rows = [
    ['ĐƠN ĐẶT KÍNH TÔI GIA CÔNG NHÀ MÁY'],
    [`Mã đơn: ${fullOrder.code}`, `Dự án: ${fullOrder.projectName || ''}`],
    [
      `Ngày lập: ${new Date(fullOrder.createdAt).toLocaleDateString('vi-VN')}`,
      `Số lượng tấm: ${fullOrder.totalPanes}`,
      `Tổng diện tích: ${fullOrder.totalAreaM2} m²`,
    ],
    [],
    [
      'STT',
      'Vị trí cửa',
      'Ký hiệu ô kính',
      'Chủng loại kính',
      'Hình dạng',
      'Rộng (mm)',
      'Cao (mm)',
      'Diện tích (m²)',
      'Mài cạnh',
      'Ghi chú',
    ],
    ...items.map((it, idx) => [
      idx + 1,
      it.doorName ||
        it.positionCode ||
        (it.paneSource === 'manual' ? 'Kính lẻ' : `Vị trí #${it.positionId}`),
      it.paneLabel || '-',
      it.glassType,
      formatPaneShapeSummary(it.frameShape, it.archConfig),
      it.widthMm,
      it.heightMm,
      Number(it.areaM2.toFixed(3)),
      GLASS_GRIND_LABEL_MAP[it.grindType || ''] || it.grindType || 'Mài xiết cạnh',
      it.manualReason || '',
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 18 },
    { wch: 30 },
    { wch: 22 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DonDatKinh');
  XLSX.writeFile(wb, `Don_Dat_Kinh_${fullOrder.code}.xlsx`);
  toast.success('Đã xuất file Excel đơn kính thành công!');
}

export function printGlassOrderHtml(fullOrder: GlassOrder): void {
  const items = fullOrder.items || [];
  if (items.length === 0) {
    toast.error('Đơn hàng không có ô kính nào để in!');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast.error('Trình duyệt đã chặn mở tab in');
    return;
  }

  const tableRows = items
    .map(
      (it, idx) => `
      <tr>
        <td style="text-align: center; border: 1px solid #ccc; padding: 6px;">${idx + 1}</td>
        <td style="border: 1px solid #ccc; padding: 6px;">${
          it.doorName ||
          it.positionCode ||
          (it.paneSource === 'manual' ? 'Kính lẻ' : `Vị trí #${it.positionId}`)
        }</td>
        <td style="border: 1px solid #ccc; padding: 6px; font-weight: bold;">${it.paneLabel || '-'}</td>
        <td style="border: 1px solid #ccc; padding: 6px;">${it.glassType}</td>
        <td style="border: 1px solid #ccc; padding: 6px;">${formatPaneShapeSummary(it.frameShape, it.archConfig)}</td>
        <td style="text-align: right; border: 1px solid #ccc; padding: 6px; font-family: monospace;">${it.widthMm}</td>
        <td style="text-align: right; border: 1px solid #ccc; padding: 6px; font-family: monospace;">${it.heightMm}</td>
        <td style="text-align: right; border: 1px solid #ccc; padding: 6px;">${it.areaM2.toFixed(3)}</td>
        <td style="border: 1px solid #ccc; padding: 6px;">${GLASS_GRIND_LABEL_MAP[it.grindType || ''] || it.grindType || 'Mài xiết cạnh'}</td>
      </tr>`,
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Đơn Đặt Kính - ${fullOrder.code}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
        h2 { text-transform: uppercase; margin-bottom: 4px; font-size: 18px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 16px; font-size: 13px; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
        th { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 6px; text-align: left; }
        @media print {
          @page { size: A4 landscape; margin: 12mm; }
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <h2>ĐƠN ĐẶT KÍNH GIA CÔNG TÔI NHÀ MÁY</h2>
      <div class="info-grid">
        <div>
          <p><b>Mã đơn đặt kính:</b> ${fullOrder.code}</p>
          <p><b>Dự án:</b> ${fullOrder.projectName || ''}</p>
          <p><b>Ngày lập:</b> ${new Date(fullOrder.createdAt).toLocaleDateString('vi-VN')}</p>
        </div>
        <div>
          <p><b>Tổng số tấm:</b> ${fullOrder.totalPanes} tấm</p>
          <p><b>Tổng diện tích:</b> ${fullOrder.totalAreaM2.toFixed(3)} m²</p>
          <p><b>Ghi chú:</b> ${fullOrder.note || 'Không có'}</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">STT</th>
            <th>Vị Trí Cửa</th>
            <th>Ký Hiệu Ô Kính</th>
            <th>Chủng Loại Kính</th>
            <th style="width: 120px;">Hình Dạng</th>
            <th style="text-align: right; width: 80px;">Rộng (mm)</th>
            <th style="text-align: right; width: 80px;">Cao (mm)</th>
            <th style="text-align: right; width: 80px;">Diện Tích (m²)</th>
            <th style="width: 100px;">Mài Cạnh</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <div style="margin-top: 36px; display: flex; justify-content: space-between; font-size: 13px;">
        <div style="text-align: center; width: 200px;">
          <p><b>Người lập đơn</b></p>
          <p style="margin-top: 48px;">(Ký & ghi rõ họ tên)</p>
        </div>
        <div style="text-align: center; width: 200px;">
          <p><b>Xác nhận Nhà máy kính</b></p>
          <p style="margin-top: 48px;">(Ký & ghi rõ họ tên)</p>
        </div>
      </div>
      <script>
        window.onafterprint = function() { window.close(); };
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

