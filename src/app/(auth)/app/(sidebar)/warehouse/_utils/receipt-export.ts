import toast from 'react-hot-toast';
import { WarehouseReceipt } from '@/types';
import { RECEIPT_REASON_MAP, RECEIPT_STATUS_MAP } from '@/config';
import { printHtmlDocument, showErrorToast } from '@/utils';
import { toDisplayUnit } from './unit-mapping';

/**
 * Xuất dữ liệu phiếu xuất/nhập kho thành file Excel (.xlsx) chuẩn
 */
export async function exportReceiptToExcel(receipt: WarehouseReceipt): Promise<void> {
  const items = receipt.items || [];
  if (items.length === 0) {
    toast.error('Phiếu kho không có mặt hàng nào để xuất Excel!');
    return;
  }

  try {
    const XLSX = await import('xlsx');
    const isImport = receipt.receiptType === 'import';
    const typeTitle = isImport ? 'PHIẾU NHẬP KHO' : 'PHIẾU XUẤT KHO';
    const reasonLabel = RECEIPT_REASON_MAP[receipt.receiptReason] || receipt.receiptReason;
    const statusLabel = RECEIPT_STATUS_MAP[receipt.status]?.label || receipt.status;
    const createdDateStr = new Date(receipt.createdAt).toLocaleString('vi-VN');

    const rows: (string | number)[][] = [
      [typeTitle],
      [`Mã phiếu: ${receipt.code}`, `Trạng thái: ${statusLabel}`],
      [`Loại giao dịch: ${isImport ? 'Nhập kho' : 'Xuất kho'}`, `Lý do: ${reasonLabel}`],
      [`Công trình: ${receipt.projectName || 'Kho xưởng tổng'}`, `Lệnh sản xuất: ${receipt.productionOrderCode || '-'}`],
      [`Nhà cung cấp: ${receipt.supplierName || '-'}`, `Thời gian tạo: ${createdDateStr}`],
    ];

    if (receipt.note) {
      rows.push([`Ghi chú: ${receipt.note}`]);
    }

    rows.push([]);
    rows.push([
      'STT',
      'Mã hàng',
      'Tên mặt hàng',
      'Số lượng',
      'Đơn vị tính',
      'Đơn giá (VNĐ)',
      'Thành tiền (VNĐ)',
      'Ghi chú',
    ]);

    items.forEach((it, idx) => {
      const noteParts: string[] = [];
      if (it.offcutLengthMm) {
        noteParts.push(`Nhôm thừa: ${it.offcutLengthMm}mm`);
      }
      if (it.note) {
        noteParts.push(it.note);
      }

      rows.push([
        idx + 1,
        it.itemCode,
        it.itemName,
        it.quantity,
        toDisplayUnit(it.unit),
        it.unitPrice || 0,
        it.totalPrice || 0,
        noteParts.join(' | '),
      ]);
    });

    rows.push([]);
    rows.push(['', '', '', '', 'TỔNG CỘNG TIỀN (VNĐ):', '', receipt.totalAmount || 0, '']);

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Căn độ rộng cột tối ưu
    ws['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 34 },
      { wch: 12 },
      { wch: 10 },
      { wch: 16 },
      { wch: 18 },
      { wch: 26 },
    ];

    const wb = XLSX.utils.book_new();
    const sheetName = isImport ? 'PhieuNhapKho' : 'PhieuXuatKho';
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const filename = `${isImport ? 'Phieu_Nhap_Kho' : 'Phieu_Xuat_Kho'}_${receipt.code}.xlsx`;
    XLSX.writeFile(wb, filename);
    toast.success('Đã xuất file Excel phiếu kho thành công!');
  } catch (err: unknown) {
    showErrorToast(err, 'Lỗi xuất file Excel phiếu kho');
  }
}

/**
 * Mở hộp thoại in phiếu xuất/nhập kho theo mẫu biểu chuẩn công ty
 */
export async function printReceiptDocument(receipt: WarehouseReceipt): Promise<void> {
  const items = receipt.items || [];
  if (items.length === 0) {
    toast.error('Phiếu kho không có mặt hàng nào để in!');
    return;
  }

  try {
    const isImport = receipt.receiptType === 'import';
    const typeTitle = isImport ? 'PHIẾU NHẬP KHO' : 'PHIẾU XUẤT KHO';
    const reasonLabel = RECEIPT_REASON_MAP[receipt.receiptReason] || receipt.receiptReason;
    const createdDateStr = new Date(receipt.createdAt).toLocaleString('vi-VN');

    const itemsRowsHtml = items
      .map(
        (it, idx) => `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td style="font-family: monospace; font-weight: 600;">${it.itemCode}</td>
          <td>
            <div style="font-weight: 500;">${it.itemName}</div>
            ${
              it.offcutLengthMm
                ? `<div style="font-size: 10px; color: #6b21a8; font-family: monospace;">(Thanh thừa: ${it.offcutLengthMm}mm)</div>`
                : ''
            }
          </td>
          <td style="text-align: right; font-weight: 700;">${it.quantity.toLocaleString('vi-VN')}</td>
          <td style="text-align: center;">${toDisplayUnit(it.unit)}</td>
          <td style="text-align: right;">${(it.unitPrice || 0).toLocaleString('vi-VN')} đ</td>
          <td style="text-align: right; font-weight: 700;">${(it.totalPrice || 0).toLocaleString('vi-VN')} đ</td>
        </tr>`
      )
      .join('');

    const html = `
      <div class="company-header">
        <div class="company-name">CÔNG TY TNHH CÔNG NGHỆ & NHÔM KÍNH XTTECH</div>
        <div class="company-sub">Xưởng sản xuất & gia công nhôm kính kỹ thuật cao • Hotline: 098.xxx.xxxx</div>
      </div>
      <div class="receipt-title">
        <h2>${typeTitle}</h2>
        <div class="receipt-code">Số phiếu: <b>${receipt.code}</b></div>
        <div class="receipt-date">Ngày lập: ${createdDateStr}</div>
      </div>
      <div class="meta-box">
        <div class="meta-row">
          <div><b>Loại giao dịch:</b> ${isImport ? 'Nhập kho vật tư' : 'Xuất kho sản xuất'}</div>
          <div><b>Lý do nghiệp vụ:</b> ${reasonLabel}</div>
        </div>
        <div class="meta-row">
          <div><b>Công trình:</b> ${receipt.projectName || 'Kho xưởng tổng'}</div>
          <div><b>Lệnh sản xuất:</b> ${receipt.productionOrderCode || 'Không'}</div>
        </div>
        ${
          receipt.supplierName
            ? `<div class="meta-row"><div><b>Nhà cung cấp:</b> ${receipt.supplierName}</div></div>`
            : ''
        }
        ${
          receipt.note
            ? `<div class="meta-row"><div><b>Ghi chú:</b> ${receipt.note}</div></div>`
            : ''
        }
      </div>
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">STT</th>
            <th style="width: 110px;">Mã hàng</th>
            <th>Tên mặt hàng & Quy cách</th>
            <th style="width: 65px; text-align: right;">SL</th>
            <th style="width: 55px; text-align: center;">ĐVT</th>
            <th style="width: 95px; text-align: right;">Đơn giá</th>
            <th style="width: 110px; text-align: right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRowsHtml}
          <tr class="total-row">
            <td colspan="6" style="text-align: right; font-weight: bold; text-transform: uppercase;">Tổng cộng tiền hàng:</td>
            <td style="text-align: right; font-weight: bold; font-size: 13px;">${(receipt.totalAmount || 0).toLocaleString('vi-VN')} đ</td>
          </tr>
        </tbody>
      </table>
      <div class="signatures-grid">
        <div class="sig-col">
          <b>Người lập phiếu</b>
          <div class="sig-note">(Ký, họ tên)</div>
        </div>
        <div class="sig-col">
          <b>${isImport ? 'Người giao hàng' : 'Người nhận vật tư'}</b>
          <div class="sig-note">(Ký, họ tên)</div>
        </div>
        <div class="sig-col">
          <b>Thủ kho</b>
          <div class="sig-note">(Ký, họ tên)</div>
        </div>
        <div class="sig-col">
          <b>Quản đốc xưởng duyệt</b>
          <div class="sig-note">(Ký, họ tên)</div>
        </div>
      </div>
    `;

    const css = `
      @page { size: A4 portrait; margin: 15mm; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 12px;
        color: #1e293b;
        line-height: 1.5;
        margin: 0;
        padding: 0;
      }
      .company-header {
        border-bottom: 2px solid #0f172a;
        padding-bottom: 8px;
        margin-bottom: 16px;
      }
      .company-name {
        font-size: 13.5px;
        font-weight: 800;
        text-transform: uppercase;
        color: #0f172a;
        letter-spacing: 0.3px;
      }
      .company-sub {
        font-size: 11px;
        color: #64748b;
      }
      .receipt-title {
        text-align: center;
        margin-bottom: 16px;
      }
      .receipt-title h2 {
        font-size: 18px;
        font-weight: 800;
        margin: 0 0 4px 0;
        color: #0f172a;
        letter-spacing: 0.5px;
      }
      .receipt-code {
        font-size: 13px;
        color: #334155;
      }
      .receipt-date {
        font-size: 11px;
        color: #64748b;
        font-style: italic;
      }
      .meta-box {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 10px 14px;
        margin-bottom: 16px;
      }
      .meta-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        font-size: 11.5px;
      }
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 24px;
        font-size: 11.5px;
      }
      .items-table th, .items-table td {
        border: 1px solid #cbd5e1;
        padding: 6px 8px;
      }
      .items-table th {
        background-color: #f1f5f9;
        font-weight: 700;
        color: #1e293b;
        text-align: left;
      }
      .items-table .total-row td {
        background-color: #f8fafc;
        border-top: 2px solid #94a3b8;
      }
      .signatures-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        text-align: center;
        margin-top: 30px;
        page-break-inside: avoid;
      }
      .sig-col b {
        display: block;
        font-size: 12px;
        margin-bottom: 2px;
      }
      .sig-note {
        font-size: 10px;
        color: #64748b;
        font-style: italic;
        margin-bottom: 55px;
      }
    `;

    await printHtmlDocument(html, `${typeTitle} - ${receipt.code}`, css);
  } catch (err: unknown) {
    showErrorToast(err, 'Lỗi in phiếu kho');
  }
}
