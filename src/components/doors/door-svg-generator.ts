export interface DoorSvgParams {
  w: number;
  h: number;
  layout:
    | 'so-1-canh'
    | 'so-2-canh'
    | 'so-hat'
    | 'so-2-canh-fix-tren'
    | 'so-lua-2-canh'
    | 'di-1-canh'
    | 'di-2-canh'
    | 'vach-kinh';
  openType:
    | 'le-trai-mo-ra'
    | 'le-phai-mo-ra'
    | 'mo-hat'
    | 'mo-quay-trong'
    | 'truot-lua'
    | 'co-dinh';
  surfaceColor?: string;
  hasHandle?: boolean;
  handleColor?: string;
  hasMullionH?: boolean;
  mullionHPos?: number;
}

export function generateDoorSvg(params: DoorSvgParams): string {
  const {
    w = 1400,
    h = 1600,
    layout = 'so-2-canh',
    openType = 'le-trai-mo-ra',
    surfaceColor = '#955F20',
    hasHandle = true,
    hasMullionH = layout === 'so-2-canh-fix-tren',
    mullionHPos = 400,
  } = params;

  const vbW = 430;
  const vbH = 460;
  const scale = Math.min(280 / w, 320 / h);

  const ox = 65;
  const oy = 35;
  const fw = Math.round(w * scale);
  const fh = Math.round(h * scale);
  const frameD = Math.max(8, Math.round(48 * scale));
  const sashD = Math.max(9, Math.round(55 * scale));

  // Stroke and fill colors
  const strokeColor = '#3e2715';
  const glassColor = '#b2f5ea';
  const dimColor = '#3182ce';
  const openingSymbolColor = '#e53e3e';

  // Inner frame bounding
  const ix = ox + frameD;
  const iy = oy + frameD;
  const iw = fw - 2 * frameD;
  const ih = fh - 2 * frameD;

  // --- Dimension Lines Elements ---
  const dimTotalH = oy + fh + 35;
  const dimTotalW = ox + fw + 32;

  let dimSvg = `
    <!-- Total Width Dimension (Bottom) -->
    <g stroke="${dimColor}" stroke-width="0.8" stroke-dasharray="2,2">
      <line x1="${ox}" y1="${oy + fh}" x2="${ox}" y2="${dimTotalH}" />
      <line x1="${ox + fw}" y1="${oy + fh}" x2="${ox + fw}" y2="${dimTotalH}" />
    </g>
    <line x1="${ox}" y1="${dimTotalH}" x2="${ox + fw}" y2="${dimTotalH}" stroke="${dimColor}" stroke-width="1.4" />
    <circle cx="${ox}" cy="${dimTotalH}" r="3" fill="${dimColor}" />
    <circle cx="${ox + fw}" cy="${dimTotalH}" r="3" fill="${dimColor}" />
    <text x="${ox + fw / 2}" y="${dimTotalH - 5}" text-anchor="middle" font-size="9" fill="${dimColor}" font-family="Arial, sans-serif" font-weight="700">${w}</text>

    <!-- Total Height Dimension (Right) -->
    <g stroke="${dimColor}" stroke-width="0.8" stroke-dasharray="2,2">
      <line x1="${ox + fw}" y1="${oy}" x2="${dimTotalW}" y2="${oy}" />
      <line x1="${ox + fw}" y1="${oy + fh}" x2="${dimTotalW}" y2="${oy + fh}" />
    </g>
    <line x1="${dimTotalW}" y1="${oy}" x2="${dimTotalW}" y2="${oy + fh}" stroke="${dimColor}" stroke-width="1.4" />
    <circle cx="${dimTotalW}" cy="${oy}" r="3" fill="${dimColor}" />
    <circle cx="${dimTotalW}" cy="${oy + fh}" r="3" fill="${dimColor}" />
    <text x="${dimTotalW - 4}" y="${oy + fh / 2}" font-size="9" fill="${dimColor}" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle" dominant-baseline="middle" transform="rotate(-90, ${dimTotalW - 4}, ${oy + fh / 2})">${h}</text>
  `;

  // --- Outer Frame Miter Bars ---
  const frameBarsSvg = `
    <g fill="${surfaceColor}" stroke="${strokeColor}" stroke-width="0.7" stroke-linejoin="miter">
      <polygon points="${ox},${oy} ${ox + fw},${oy} ${ox + fw - frameD},${oy + frameD} ${ox + frameD},${oy + frameD}" />
      <polygon points="${ox},${oy + fh} ${ox + fw},${oy + fh} ${ox + fw - frameD},${oy + fh - frameD} ${ox + frameD},${oy + fh - frameD}" />
      <polygon points="${ox},${oy} ${ox + frameD},${oy + frameD} ${ox + frameD},${oy + fh - frameD} ${ox},${oy + fh}" />
      <polygon points="${ox + fw},${oy} ${ox + fw - frameD},${oy + frameD} ${ox + fw - frameD},${oy + fh - frameD} ${ox + fw},${oy + fh}" />
    </g>
  `;

  // --- Interior Render (Fix, Sashes, Mullions) ---
  let contentSvg = '';

  if (layout === 'vach-kinh') {
    // Vách kính đơn giản
    contentSvg = `
      <rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="${glassColor}" opacity="0.6" stroke="${strokeColor}" stroke-width="0.5" />
    `;
  } else if (hasMullionH) {
    // Cửa có đố ngang ô fix trên
    const mullHOffset = Math.round(mullionHPos * scale);
    const mullHThickness = Math.max(6, Math.round(36 * scale));
    const topFixH = mullHOffset;
    const botSashY = iy + topFixH + mullHThickness;
    const botSashH = ih - topFixH - mullHThickness;

    // Top fix glass
    contentSvg += `
      <rect x="${ix}" y="${iy}" width="${iw}" height="${topFixH}" fill="${glassColor}" opacity="0.5" stroke="${strokeColor}" stroke-width="0.5" />
      <text x="${ix + iw / 2}" y="${iy + topFixH / 2 + 3}" text-anchor="middle" font-size="8" fill="#4a5568" font-family="Arial">Ô FIX (${mullionHPos}mm)</text>
      <!-- Horizontal Mullion Bar -->
      <rect x="${ix}" y="${iy + topFixH}" width="${iw}" height="${mullHThickness}" fill="${surfaceColor}" stroke="${strokeColor}" stroke-width="0.7" />
    `;

    // Bottom Sashes (2 sashes)
    const sw = Math.round(iw / 2);
    contentSvg += renderSashPair(
      ix,
      botSashY,
      iw,
      botSashH,
      sashD,
      surfaceColor,
      strokeColor,
      glassColor,
      openingSymbolColor,
      hasHandle,
    );
  } else if (layout === 'so-1-canh' || layout === 'so-hat' || layout === 'di-1-canh') {
    // Cửa 1 cánh
    contentSvg = renderSingleSash(
      ix,
      iy,
      iw,
      ih,
      sashD,
      surfaceColor,
      strokeColor,
      glassColor,
      openingSymbolColor,
      openType,
      hasHandle,
    );
  } else {
    // Mặc định: Cửa sổ / cửa đi 2 cánh mở quay
    contentSvg = renderSashPair(
      ix,
      iy,
      iw,
      ih,
      sashD,
      surfaceColor,
      strokeColor,
      glassColor,
      openingSymbolColor,
      hasHandle,
    );

    // Sub-dimension for 2 sashes
    const halfW = Math.round(w / 2);
    const subDimY = dimTotalH - 16;
    dimSvg += `
      <line x1="${ox}" y1="${subDimY}" x2="${ox + fw}" y2="${subDimY}" stroke="${dimColor}" stroke-width="0.8" />
      <line x1="${ox + fw / 2}" y1="${oy + fh}" x2="${ox + fw / 2}" y2="${subDimY}" stroke="${dimColor}" stroke-width="0.8" stroke-dasharray="2,2" />
      <circle cx="${ox + fw / 2}" cy="${subDimY}" r="2" fill="${dimColor}" />
      <text x="${ox + fw / 4}" y="${subDimY - 3}" text-anchor="middle" font-size="7.5" fill="${dimColor}" font-family="Arial" font-weight="600">${halfW}</text>
      <text x="${ox + (3 * fw) / 4}" y="${subDimY - 3}" text-anchor="middle" font-size="7.5" fill="${dimColor}" font-family="Arial" font-weight="600">${halfW}</text>
    `;
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${vbW} ${vbH}" class="w-full h-auto select-none overflow-visible" data-door-type-drawing="true" data-wmm="${w}" data-hmm="${h}">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.08" />
    </filter>
  </defs>
  <g filter="url(#shadow)">
    ${frameBarsSvg}
    ${contentSvg}
  </g>
  ${dimSvg}
</svg>
  `.trim();
}

function renderSingleSash(
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  sd: number,
  surfaceColor: string,
  strokeColor: string,
  glassColor: string,
  symbolColor: string,
  openType: string,
  hasHandle: boolean,
): string {
  const gx = sx + sd;
  const gy = sy + sd;
  const gw = sw - 2 * sd;
  const gh = sh - 2 * sd;

  let symbolSvg = '';
  if (openType === 'mo-hat') {
    // Đáy trên, đỉnh dưới
    symbolSvg = `
      <line x1="${gx}" y1="${gy}" x2="${gx + gw / 2}" y2="${gy + gh}" stroke="${symbolColor}" stroke-width="1.2" stroke-dasharray="4,3" />
      <line x1="${gx + gw}" y1="${gy}" x2="${gx + gw / 2}" y2="${gy + gh}" stroke="${symbolColor}" stroke-width="1.2" stroke-dasharray="4,3" />
    `;
  } else if (openType === 'le-phai-mo-ra') {
    // Bản lề phải, đỉnh trái
    symbolSvg = `
      <line x1="${gx + gw}" y1="${gy}" x2="${gx}" y2="${gy + gh / 2}" stroke="${symbolColor}" stroke-width="1.2" stroke-dasharray="4,3" />
      <line x1="${gx + gw}" y1="${gy + gh}" x2="${gx}" y2="${gy + gh / 2}" stroke="${symbolColor}" stroke-width="1.2" stroke-dasharray="4,3" />
    `;
  } else {
    // Bản lề trái, đỉnh phải (mặc định)
    symbolSvg = `
      <line x1="${gx}" y1="${gy}" x2="${gx + gw}" y2="${gy + gh / 2}" stroke="${symbolColor}" stroke-width="1.2" stroke-dasharray="4,3" />
      <line x1="${gx}" y1="${gy + gh}" x2="${gx + gw}" y2="${gy + gh / 2}" stroke="${symbolColor}" stroke-width="1.2" stroke-dasharray="4,3" />
    `;
  }

  // Handle
  const handleX = openType === 'le-phai-mo-ra' ? gx + 4 : gx + gw - 9;
  const handleY = gy + gh / 2 - 10;
  const handleSvg = hasHandle
    ? `<rect x="${handleX}" y="${handleY}" width="5" height="20" rx="1.5" fill="#111827" stroke="#374151" stroke-width="0.5" />`
    : '';

  return `
    <!-- Sash Frame Miter Bars -->
    <g fill="${surfaceColor}" stroke="${strokeColor}" stroke-width="0.6">
      <polygon points="${sx},${sy} ${sx + sw},${sy} ${sx + sw - sd},${sy + sd} ${sx + sd},${sy + sd}" />
      <polygon points="${sx},${sy + sh} ${sx + sw},${sy + sh} ${sx + sw - sd},${sy + sh - sd} ${sx + sd},${sy + sh - sd}" />
      <polygon points="${sx},${sy} ${sx + sd},${sy + sd} ${sx + sd},${sy + sh - sd} ${sx},${sy + sh}" />
      <polygon points="${sx + sw},${sy} ${sx + sw - sd},${sy + sd} ${sx + sw - sd},${sy + sh - sd} ${sx + sw},${sy + sh}" />
    </g>
    <!-- Glass Pane -->
    <rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="${glassColor}" opacity="0.65" stroke="${strokeColor}" stroke-width="0.5" />
    <!-- Opening Symbol & Handle -->
    ${symbolSvg}
    ${handleSvg}
  `;
}

function renderSashPair(
  ix: number,
  iy: number,
  iw: number,
  ih: number,
  sd: number,
  surfaceColor: string,
  strokeColor: string,
  glassColor: string,
  symbolColor: string,
  hasHandle: boolean,
): string {
  const sashW = Math.round(iw / 2);
  const midX = ix + sashW;

  // Sash 1 (Left - Hinge Left)
  const sash1 = renderSingleSash(
    ix,
    iy,
    sashW,
    ih,
    sd,
    surfaceColor,
    strokeColor,
    glassColor,
    symbolColor,
    'le-trai-mo-ra',
    false,
  );

  // Sash 2 (Right - Hinge Right + Handle on Lock edge)
  const sash2 = renderSingleSash(
    midX,
    iy,
    sashW,
    ih,
    sd,
    surfaceColor,
    strokeColor,
    glassColor,
    symbolColor,
    'le-phai-mo-ra',
    hasHandle,
  );

  // Dynamic Mullion Line
  const dodongSvg = `
    <rect x="${midX - 1.5}" y="${iy}" width="3" height="${ih}" fill="${surfaceColor}" stroke="${strokeColor}" stroke-width="0.5" />
  `;

  return `
    ${sash1}
    ${sash2}
    ${dodongSvg}
  `;
}

export function generateDoorSvgDataUrl(params: DoorSvgParams): string {
  const svg = generateDoorSvg(params);
  const b64 = typeof window !== 'undefined'
    ? window.btoa(unescape(encodeURIComponent(svg)))
    : Buffer.from(svg, 'utf-8').toString('base64');
  return `data:image/svg+xml;base64,${b64}`;
}

export function generateSystemConfig(params: DoorSvgParams): Record<string, any> {
  const {
    w,
    h,
    layout = 'so-2-canh',
    openType = 'le-trai-mo-ra',
    surfaceColor = '#955F20',
  } = params;

  return {
    accessory_color: 'black',
    surface_color: surfaceColor,
    surface_color_id: 9,
    surface_type: 'son_tinh_dien',
    frame: {
      left: '54',
      type: '4',
    },
    mullion: {
      type: 'shared',
      profile: '61',
    },
    bead: '68',
    bead_joint: '90-do',
    drawing: {
      w: w,
      h: h,
      root: {
        id: 'root_node',
        type: 'cell',
        open_type: openType,
        pane: 'glass',
        sash_layout: layout,
        sash_nodes:
          layout === 'so-1-canh' || layout === 'so-hat'
            ? {
                '0': {
                  id: 'sash_0',
                  type: 'cell',
                  open_type: openType,
                  pane: 'glass',
                  _dim_wmm: w - 46,
                  _dim_hmm: h - 46,
                },
              }
            : {
                '0': {
                  id: 'sash_0',
                  type: 'cell',
                  open_type: 'fixed',
                  pane: 'glass',
                  _dim_wmm: Math.round(w / 2 - 26),
                  _dim_hmm: h - 46,
                },
                '1': {
                  id: 'sash_1',
                  type: 'cell',
                  open_type: 'fixed',
                  pane: 'glass',
                  _dim_wmm: Math.round(w / 2 - 26),
                  _dim_hmm: h - 46,
                },
              },
      },
    },
    sash: {
      family: 'cua-so',
      profile: {
        variants: {
          'mo-ra': '57',
          'mo-hat': '57',
          'mo-lat': '57',
        },
      },
      do_ngam_ngang: 5,
      do_ngam_doc: 5,
      bead: '68',
      dodong: '60',
      bead_joint: '90-do',
      op_dodong: 42,
    },
  };
}
