import toast from 'react-hot-toast';
import { GLASS_GRIND_LABEL_MAP } from '@/config/warehouse';
import { GlassOrder } from '@/types';
import { downloadOrShareBlob } from './file';
import {
  exportGlassOrderToDxf,
  formatPaneShapeSummary,
} from './glass-order-dxf-export';
import { captureAllDoorSectionAssets } from './glass-excel/door-cad-snapshot';
import { groupGlassOrderForExcel } from './glass-excel/glass-order-grouping';
import { buildGlassOrderWorksheets } from './glass-excel/glass-order-sheets-builder';
import { renderAllPaneAssets } from './glass-excel/glass-pane-canvas';
import { packWorksheetsToXlsx } from './glass-excel/xlsx-openxml-packager';

export { exportGlassOrderToDxf, formatPaneShapeSummary };

export async function exportGlassOrderToExcel(fullOrder: GlassOrder): Promise<void> {
  const grouped = groupGlassOrderForExcel(fullOrder);
  if (grouped.activeItems.length === 0) {
    toast.error('Đơn hàng không có ô kính hợp lệ nào để xuất!');
    return;
  }

  const paneAssets = renderAllPaneAssets(grouped.specGroups);
  const doorAssets = await captureAllDoorSectionAssets(
    grouped.doorSections,
    paneAssets.size + 1,
  );
  const sheets = buildGlassOrderWorksheets(fullOrder, grouped, paneAssets, doorAssets);
  const allAssets = [...Array.from(paneAssets.values()), ...Array.from(doorAssets.values())];
  const xlsxBytes = packWorksheetsToXlsx(sheets, allAssets);
  const blobBuffer = xlsxBytes.buffer.slice(
    xlsxBytes.byteOffset,
    xlsxBytes.byteOffset + xlsxBytes.byteLength,
  ) as ArrayBuffer;
  const blob = new Blob([blobBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  await downloadOrShareBlob(blob, `Don_Dat_Kinh_${fullOrder.code}.xlsx`);
  toast.success('Đã xuất file Excel đơn kính 2 Sheet kèm hình vẽ thành công!');
}

export function printGlassOrderHtml(fullOrder: GlassOrder): void {
  const grouped = groupGlassOrderForExcel(fullOrder);
  const items = grouped.activeItems;
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
        h2 { text-transform: uppercase; margin-bottom: 4px; font-size: 18px; color: #045863; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 16px; font-size: 13px; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
        th { background-color: #e6f2f3; color: #045863; border: 1px solid #cbd5e1; padding: 8px 6px; text-align: left; }
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
          <p><b>Tổng số tấm:</b> ${grouped.totalPanes} tấm</p>
          <p><b>Tổng diện tích:</b> ${grouped.totalAreaM2.toFixed(3)} m²</p>
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
