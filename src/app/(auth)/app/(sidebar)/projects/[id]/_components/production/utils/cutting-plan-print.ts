import { escapeHtml } from '@/utils/html';
import { printHtmlDocument } from '@/utils/print';
import type { CuttingBar, CuttingPlan, ProductionOrder } from '@/types';
import type { CuttingBarGroup } from '../types';
import { groupBarsByProfile } from './cutting-plan-utils';

const PRINT_CSS = `
  @page { size: A4; margin: 12mm; }
  body { font-family: 'Times New Roman', serif; font-size: 12px; color: #111; }
  h1 { font-size: 16px; text-align: center; margin: 0 0 4px; text-transform: uppercase; }
  .meta { text-align: center; margin-bottom: 10px; color: #444; }
  h2 { font-size: 13px; margin: 14px 0 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
  th, td { border: 1px solid #555; padding: 3px 5px; text-align: left; vertical-align: top; }
  th { background: #eee; }
  .num { text-align: right; white-space: nowrap; }
  .warn { color: #b45309; font-weight: bold; margin-bottom: 8px; }
`;

const formatPieces = (bar: CuttingBar): string =>
  bar.pieces
    .map(
      (piece) =>
        `${Math.round(piece.lengthMm)}${piece.positionCode ? ` (${escapeHtml(piece.positionCode)})` : ''}`,
    )
    .join(' + ');

const buildGroupTable = (group: CuttingBarGroup): string => {
  const rows = group.bars
    .map(
      (bar, index) => `<tr>
        <td>${bar.sourceType === 'offcut' ? 'Đoạn dư' : 'Cây'} ${index + 1}</td>
        <td class="num">${Math.round(bar.stockLengthMm)}</td>
        <td>${formatPieces(bar)}</td>
        <td class="num">${Math.round(bar.wasteMm)}</td>
      </tr>`,
    )
    .join('');
  return `<h2>${escapeHtml(group.profileName)} (${escapeHtml(group.profileCode)}) - ${escapeHtml(group.colorName)} - ${group.bars.length} cây</h2>
    <table><thead><tr><th>Cây</th><th>Dài (mm)</th><th>Các đoạn cắt (mm)</th><th>Dư (mm)</th></tr></thead><tbody>${rows}</tbody></table>`;
};

// In sơ đồ cắt cho thợ xưởng theo từng loại nhôm/màu
export async function printCuttingPlan(order: ProductionOrder, plan: CuttingPlan): Promise<void> {
  const { summary } = plan;
  const warning = plan.isEstimated
    ? '<div class="warn">Lưu ý: có cửa dùng số liệu ước tính, cần kiểm tra lại trước khi cắt.</div>'
    : '';
  const html = `<h1>Sơ đồ cắt thanh nhôm</h1>
    <div class="meta">Lệnh ${escapeHtml(order.code)} - ${escapeHtml(order.name)} · Bản ${plan.version} ·
      ${summary.totalBars} cây (${summary.standardBars} cây nguyên, ${summary.offcutBars} đoạn dư) · Hao hụt ${summary.wastePercent}% · Mạch cưa ${plan.kerfMm} mm</div>
    ${warning}
    ${groupBarsByProfile(plan.bars).map(buildGroupTable).join('')}`;
  await printHtmlDocument(html, `Sơ đồ cắt ${order.code}`, PRINT_CSS);
}

