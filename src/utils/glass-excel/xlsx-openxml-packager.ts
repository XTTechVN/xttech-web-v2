import * as XLSX from 'xlsx';
import {
  ExcelImageAsset,
  SheetCellSpec,
  SheetDrawingAnchor,
  SheetRowSpec,
  WorksheetSpec,
} from './glass-excel-types';

const EMU_PER_PX = 9525;
const EMU_PER_PT = 12700;

export const XLSX_STYLE = {
  DEFAULT: 0, TITLE_BANNER: 1, META_BOX: 2, META_HIGHLIGHT: 3, TABLE_HEADER: 4,
  CELL_CENTER: 5, CELL_CODE: 6, CELL_TEXT: 7, CELL_INT: 8, CELL_INT_BOLD: 9,
  CELL_AREA: 10, DOOR_BANNER: 11, TOTAL_LABEL: 12, TOTAL_INT: 13, TOTAL_AREA: 14,
  SIGN_TITLE: 15, SIGN_SUB: 16,
} as const;

export function colIndexToLetters(col0: number): string {
  let n = col0 + 1;
  let letters = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

function lettersToColIndex(letters: string): number {
  let col = 0;
  for (let i = 0; i < letters.length; i++) col = col * 26 + (letters.charCodeAt(i) - 64);
  return col - 1;
}

const escXml = (v: string | number | null | undefined): string =>
  String(v ?? '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

function buildStylesXml(): string {
  const fonts = [
    '<font><sz val="10"/><color rgb="FF0F172A"/><name val="Arial"/></font>',
    '<font><b/><sz val="13"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>',
    '<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>',
    '<font><b/><sz val="10"/><color rgb="FF045863"/><name val="Arial"/></font>',
    '<font><sz val="10"/><color rgb="FF334155"/><name val="Arial"/></font>',
    '<font><b/><sz val="11"/><color rgb="FF045863"/><name val="Arial"/></font>',
    '<font><i/><sz val="9"/><color rgb="FF475569"/><name val="Arial"/></font>',
  ];
  const fills = [
    '<fill><patternFill patternType="none"/></fill>',
    '<fill><patternFill patternType="gray125"/></fill>',
    '<fill><patternFill patternType="solid"><fgColor rgb="FF045863"/><bgColor indexed="64"/></patternFill></fill>',
    '<fill><patternFill patternType="solid"><fgColor rgb="FFE6F2F3"/><bgColor indexed="64"/></patternFill></fill>',
    '<fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/><bgColor indexed="64"/></patternFill></fill>',
  ];
  const borders = [
    '<border><left/><right/><top/><bottom/><diagonal/></border>',
    '<border><left style="thin"><color rgb="FFCBD5E1"/></left><right style="thin"><color rgb="FFCBD5E1"/></right><top style="thin"><color rgb="FFCBD5E1"/></top><bottom style="thin"><color rgb="FFCBD5E1"/></bottom><diagonal/></border>',
  ];
  const xfs = [
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>',
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>',
    '<xf numFmtId="0" fontId="4" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>',
    '<xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>',
    '<xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>',
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>',
    '<xf numFmtId="0" fontId="3" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>',
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>',
    '<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>',
    '<xf numFmtId="164" fontId="3" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>',
    '<xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>',
    '<xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>',
    '<xf numFmtId="0" fontId="5" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>',
    '<xf numFmtId="164" fontId="5" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>',
    '<xf numFmtId="165" fontId="5" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>',
    '<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>',
    '<xf numFmtId="0" fontId="6" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>',
  ];
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="2"><numFmt numFmtId="164" formatCode="#,##0"/><numFmt numFmtId="165" formatCode="#,##0.000"/></numFmts><fonts count="${fonts.length}">${fonts.join('')}</fonts><fills count="${fills.length}">${fills.join('')}</fills><borders count="${borders.length}">${borders.join('')}</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${xfs.length}">${xfs.join('')}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
}

function populateMergedCells(rows: SheetRowSpec[], merges: string[]): SheetRowSpec[] {
  const rowMap = new Map<number, Map<number, SheetCellSpec>>();
  const heightMap = new Map<number, number>();
  for (const r of rows) {
    heightMap.set(r.row1, r.heightPt);
    const cellMap = new Map<number, SheetCellSpec>();
    for (const c of r.cells) cellMap.set(c.col0, c);
    rowMap.set(r.row1, cellMap);
  }
  for (const range of merges) {
    const m = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(range);
    if (!m) continue;
    const [cStart, rStart, cEnd, rEnd] = [lettersToColIndex(m[1]), Number(m[2]), lettersToColIndex(m[3]), Number(m[4])];
    const anchorStyle = rowMap.get(rStart)?.get(cStart)?.styleId ?? 0;
    for (let r = rStart; r <= rEnd; r++) {
      const cellMap = rowMap.get(r) || new Map<number, SheetCellSpec>();
      for (let c = cStart; c <= cEnd; c++) {
        if (!cellMap.has(c)) cellMap.set(c, { col0: c, styleId: anchorStyle, kind: 'empty' });
      }
      rowMap.set(r, cellMap);
    }
  }
  return Array.from(rowMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([row1, cellMap]) => ({
      row1,
      heightPt: heightMap.get(row1) ?? 20,
      cells: Array.from(cellMap.values()).sort((a, b) => a.col0 - b.col0),
    }));
}

function renderCellXml(row1: number, cell: SheetCellSpec): string {
  const ref = `${colIndexToLetters(cell.col0)}${row1}`;
  if (cell.kind === 'str') {
    return `<c r="${ref}" s="${cell.styleId}" t="inlineStr"><is><t xml:space="preserve">${escXml(cell.text)}</t></is></c>`;
  }
  if (cell.kind === 'num') {
    return `<c r="${ref}" s="${cell.styleId}"><v>${Number.isFinite(cell.num) ? cell.num : 0}</v></c>`;
  }
  if (cell.kind === 'formula') {
    return `<c r="${ref}" s="${cell.styleId}"><f>${escXml(cell.formula)}</f><v>${Number.isFinite(cell.num) ? cell.num : 0}</v></c>`;
  }
  return `<c r="${ref}" s="${cell.styleId}"/>`;
}

function buildWorksheetXml(spec: WorksheetSpec, isSelected: boolean): string {
  const normalizedRows = populateMergedCells(spec.rows, spec.merges);
  const colsXml = spec.colWidths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('');
  const rowsXml = normalizedRows
    .map((r) => `<row r="${r.row1}" ht="${r.heightPt}" customHeight="1">${r.cells.map((c) => renderCellXml(r.row1, c)).join('')}</row>`)
    .join('');
  const paneXml = spec.freezeTopRows
    ? `<pane ySplit="${spec.freezeTopRows}" topLeftCell="A${spec.freezeTopRows + 1}" activePane="bottomLeft" state="frozen"/>`
    : '';
  const mergesXml = spec.merges.length > 0
    ? `<mergeCells count="${spec.merges.length}">${spec.merges.map((ref) => `<mergeCell ref="${ref}"/>`).join('')}</mergeCells>`
    : '';
  const drawingXml = spec.anchors.length > 0 ? '<drawing r:id="rId1"/>' : '';

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetViews><sheetView tabSelected="${isSelected ? 1 : 0}" workbookViewId="0">${paneXml}</sheetView></sheetViews><sheetFormatPr defaultRowHeight="20"/><cols>${colsXml}</cols><sheetData>${rowsXml}</sheetData>${mergesXml}<pageMargins left="0.35" right="0.35" top="0.45" bottom="0.45" header="0.25" footer="0.25"/><pageSetup paperSize="9" orientation="landscape"/>${drawingXml}</worksheet>`;
}

function buildSheetDrawingParts(spec: WorksheetSpec, assetById: Map<string, ExcelImageAsset>): { drawingXml: string; relsXml: string } {
  const rowHeightPtMap = new Map(spec.rows.map((r) => [r.row1 - 1, r.heightPt]));
  const getRowEmu = (row0: number): number => Math.round((rowHeightPtMap.get(row0) ?? 20) * EMU_PER_PT);
  const relIdByAsset = new Map<string, string>();
  const relEntries: string[] = [];
  const anchorNodes: string[] = [];

  spec.anchors.forEach((anc: SheetDrawingAnchor, idx: number) => {
    const asset = assetById.get(anc.assetId);
    if (!asset) return;
    let rId = relIdByAsset.get(asset.id);
    if (!rId) {
      rId = `rId${relEntries.length + 1}`;
      relIdByAsset.set(asset.id, rId);
      relEntries.push(`<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${asset.fileName}"/>`);
    }

    const boxWEmu = Math.round(((spec.colWidths[anc.col0] ?? 24) * 7 + 5) * EMU_PER_PX);
    let boxHEmu = 0;
    for (let r = anc.startRow0; r <= anc.endRow0; r++) boxHEmu += getRowEmu(r);

    const pad = 4 * EMU_PER_PX;
    const scale = Math.min(Math.max(8 * EMU_PER_PX, boxWEmu - pad * 2) / Math.max(1, asset.widthPx * EMU_PER_PX), Math.max(8 * EMU_PER_PX, boxHEmu - pad * 2) / Math.max(1, asset.heightPx * EMU_PER_PX));
    const cx = Math.max(EMU_PER_PX, Math.round(asset.widthPx * EMU_PER_PX * scale));
    const cy = Math.max(EMU_PER_PX, Math.round(asset.heightPx * EMU_PER_PX * scale));
    const colOff = Math.max(0, Math.min(boxWEmu - 1, Math.round((boxWEmu - cx) / 2)));

    let remTop = Math.max(0, Math.round((boxHEmu - cy) / 2));
    let anchorRow = anc.startRow0;
    for (let r = anc.startRow0; r < anc.endRow0; r++) {
      const rEmu = getRowEmu(r);
      if (remTop < rEmu) { anchorRow = r; break; }
      remTop -= rEmu;
      anchorRow = r + 1;
    }
    const rowOff = Math.max(0, Math.min(getRowEmu(anchorRow) - 1, remTop));
    const picId = idx + 1;
    anchorNodes.push(`<xdr:oneCellAnchor><xdr:from><xdr:col>${anc.col0}</xdr:col><xdr:colOff>${colOff}</xdr:colOff><xdr:row>${anchorRow}</xdr:row><xdr:rowOff>${rowOff}</xdr:rowOff></xdr:from><xdr:ext cx="${cx}" cy="${cy}"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="${picId}" name="Picture ${picId}"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr><xdr:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor>`);
  });

  return {
    drawingXml: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${anchorNodes.join('')}</xdr:wsDr>`,
    relsXml: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relEntries.join('')}</Relationships>`,
  };
}

export function packWorksheetsToXlsx(sheets: WorksheetSpec[], assets: ExcelImageAsset[]): Uint8Array {
  const enc = new TextEncoder();
  const cfb = XLSX.CFB.utils.cfb_new();
  const assetById = new Map(assets.map((a) => [a.id, a]));

  const sheetOverrides = sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('');
  const drawingOverrides = sheets.map((s, i) => s.anchors.length > 0 ? `<Override PartName="/xl/drawings/drawing${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>` : '').join('');
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheetOverrides}${drawingOverrides}</Types>`;
  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${escXml(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`;
  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;

  XLSX.CFB.utils.cfb_add(cfb, '[Content_Types].xml', enc.encode(contentTypes));
  XLSX.CFB.utils.cfb_add(cfb, '_rels/.rels', enc.encode(rootRels));
  XLSX.CFB.utils.cfb_add(cfb, 'xl/workbook.xml', enc.encode(workbookXml));
  XLSX.CFB.utils.cfb_add(cfb, 'xl/_rels/workbook.xml.rels', enc.encode(workbookRels));
  XLSX.CFB.utils.cfb_add(cfb, 'xl/styles.xml', enc.encode(buildStylesXml()));
  for (const asset of assets) XLSX.CFB.utils.cfb_add(cfb, `xl/media/${asset.fileName}`, asset.bytes);

  sheets.forEach((spec, idx) => {
    const n = idx + 1;
    XLSX.CFB.utils.cfb_add(cfb, `xl/worksheets/sheet${n}.xml`, enc.encode(buildWorksheetXml(spec, idx === 0)));
    if (spec.anchors.length > 0) {
      const sheetRel = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing${n}.xml"/></Relationships>`;
      const { drawingXml, relsXml } = buildSheetDrawingParts(spec, assetById);
      XLSX.CFB.utils.cfb_add(cfb, `xl/worksheets/_rels/sheet${n}.xml.rels`, enc.encode(sheetRel));
      XLSX.CFB.utils.cfb_add(cfb, `xl/drawings/drawing${n}.xml`, enc.encode(drawingXml));
      XLSX.CFB.utils.cfb_add(cfb, `xl/drawings/_rels/drawing${n}.xml.rels`, enc.encode(relsXml));
    }
  });

  const zipBytes = XLSX.CFB.write(cfb, { fileType: 'zip', type: 'array', compression: true });
  return zipBytes instanceof Uint8Array ? zipBytes : new Uint8Array(zipBytes);
}
