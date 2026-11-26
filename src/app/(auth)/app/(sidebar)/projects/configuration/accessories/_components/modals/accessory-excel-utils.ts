import type {
  Brand,
  Accessory,
  AccessoryCategory,
  AccessoryExcelItemData,
  AccessoryExcelPreviewRow,
  ExcelRowAction,
} from '@/types';

const MAX_ACCESSORY_CODE_LEN = 50;

const UNIT_ALIAS_MAP: Record<string, string> = {
  set: 'set', bộ: 'set', bo: 'set',
  pcs: 'pcs', cái: 'pcs', cai: 'pcs', con: 'pcs',
  unit: 'unit', chiếc: 'unit', chiec: 'unit',
  pair: 'pair', đôi: 'pair', doi: 'pair', cặp: 'pair', cap: 'pair',
  roll: 'roll', cuộn: 'roll', cuon: 'roll',
  box: 'box', hộp: 'box', hop: 'box',
  bag: 'bag', túi: 'bag', tui: 'bag',
  meter: 'meter', m: 'meter', mét: 'meter', met: 'meter', roan: 'meter', gioang: 'meter', gioăng: 'meter', ron: 'meter',
  bottle: 'bottle', chai: 'bottle', tuýp: 'bottle', tuyp: 'bottle', tube: 'bottle', keo: 'bottle',
  sheet: 'sheet', tấm: 'sheet', tam: 'sheet',
};

export function normalizeUnitCode(raw?: string | null): string {
  const clean = (raw || '').trim().toLowerCase();
  return clean ? (UNIT_ALIAS_MAP[clean] || clean) : 'pcs';
}

function toAsciiUpper(input: string): string {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase()
    .trim();
}

function normalizeComparableText(input?: string | null): string {
  return toAsciiUpper(input || '').replace(/\s+/g, ' ');
}

function extractDistinguishingSuffix(baseCode: string, name: string, fallbackIndex: number): string {
  const codeUpper = toAsciiUpper(baseCode);
  const codeTokens = new Set(codeUpper.split(/[^A-Z0-9]+/).filter(Boolean));
  const nameUpper = toAsciiUpper(name);

  // 1. Mã số model 4-5 chữ số đứng độc lập trong tên (VD: 9409, 12009, 9401A, 5501)
  const modelMatches = Array.from(nameUpper.matchAll(/\b(\d{4,5}[A-Z]?)\b/g))
    .map((m) => m[1])
    .filter((tok) => !codeTokens.has(tok) && !codeUpper.includes(tok));
  if (modelMatches.length > 0) {
    return modelMatches[0];
  }

  // 2. Mã hệ nhôm ở cuối hoặc trong tên có dấu gạch ngang (VD: SL-H94, DL-120, MQ-65, XT-80)
  const seriesMatches = Array.from(nameUpper.matchAll(/\b([A-Z]{1,4})\s*-\s*([A-Z]?\d{2,4}[A-Z]?)\b/g))
    .map((m) => `${m[1]}-${m[2]}`)
    .filter((tok) => !codeUpper.includes(tok));
  if (seriesMatches.length > 0) {
    return seriesMatches.length === 1
      ? seriesMatches[0]
      : seriesMatches.slice(0, 2).map((s) => s.replace(/-/g, '')).join('-');
  }

  // 3. Ký tự đầu các từ của tên phụ kiện (VD: "Ke khung cửa sổ" -> "KKCS")
  const words = nameUpper.split(/[^A-Z0-9]+/).filter((w) => w.length > 0 && !codeTokens.has(w));
  if (words.length >= 2) {
    const initials = words.slice(0, 6).map((w) => w[0]).join('');
    if (initials.length >= 2) return initials;
  }
  if (words.length === 1 && words[0].length <= 8) {
    return words[0];
  }

  return String(fallbackIndex).padStart(2, '0');
}

function fitCodeWithSuffix(baseCode: string, suffix: string): string {
  const cleanBase = baseCode.trim();
  const cleanSuffix = suffix.replace(/[^A-Za-z0-9-_]/g, '').replace(/^-+|-+$/g, '') || '1';
  const maxBaseLen = Math.max(1, MAX_ACCESSORY_CODE_LEN - cleanSuffix.length - 1);
  return `${cleanBase.slice(0, maxBaseLen).trim()}-${cleanSuffix}`;
}

function allocateUniqueCode(
  baseCode: string,
  preferredSuffix: string,
  usedCodesUpper: Set<string>,
): string {
  const firstCandidate = fitCodeWithSuffix(baseCode, preferredSuffix);
  if (!usedCodesUpper.has(firstCandidate.toUpperCase())) {
    usedCodesUpper.add(firstCandidate.toUpperCase());
    return firstCandidate;
  }

  let seq = 2;
  while (seq < 9999) {
    const candidate = fitCodeWithSuffix(baseCode, `${preferredSuffix}-${seq}`);
    if (!usedCodesUpper.has(candidate.toUpperCase())) {
      usedCodesUpper.add(candidate.toUpperCase());
      return candidate;
    }
    seq++;
  }
  return firstCandidate;
}

export function countDuplicateCodeRows(rows: AccessoryExcelPreviewRow[]): number {
  const freq = new Map<string, number>();
  rows.forEach((r) => {
    const key = (r.data.code || '').trim().toUpperCase();
    if (key) freq.set(key, (freq.get(key) || 0) + 1);
  });
  let count = 0;
  rows.forEach((r) => {
    const key = (r.data.code || '').trim().toUpperCase();
    if (key && (freq.get(key) || 0) > 1) count++;
  });
  return count;
}

function toOldDataSnapshot(matched: Accessory): AccessoryExcelItemData {
  return {
    code: matched.code || '',
    name: matched.name,
    brandId: matched.brandId ?? null,
    categoryId: matched.categoryId ?? null,
    unit: matched.unit || 'pcs',
    color: matched.color || '',
    specification: matched.specification ?? null,
    costPrice: matched.costPrice ?? 0,
    imagePath: matched.imagePath ?? null,
    isActive: matched.isActive !== false,
  };
}

export function revalidateAllAccessoryRows(
  rows: AccessoryExcelPreviewRow[],
  brands: Brand[],
  categories: AccessoryCategory[],
  existingAccessories: Accessory[],
  pinnedExistingIds?: ReadonlyMap<number, number>,
): AccessoryExcelPreviewRow[] {
  const existingByCode = new Map<string, Accessory>();
  const existingById = new Map<number, Accessory>();
  existingAccessories.forEach((acc) => {
    existingById.set(acc.id, acc);
    const c = (acc.code || '').trim().toUpperCase();
    if (c) existingByCode.set(c, acc);
  });

  const codeRowsMap = new Map<string, number[]>();
  const exactMatchedIds = new Set<number>();

  rows.forEach((r) => {
    const codeUpper = (r.data.code || '').trim().toUpperCase();
    if (!codeUpper) return;
    const list = codeRowsMap.get(codeUpper) || [];
    list.push(r.rowIndex);
    codeRowsMap.set(codeUpper, list);

    const exact = existingByCode.get(codeUpper);
    if (exact) exactMatchedIds.add(exact.id);
  });

  return rows.map((row) => {
    const data = row.data;
    const errors: string[] = [];
    const code = (data.code || '').trim();
    const name = (data.name || '').trim();

    if (!code) {
      errors.push('Thiếu mã phụ kiện');
    } else if (code.length > MAX_ACCESSORY_CODE_LEN) {
      errors.push(`Mã phụ kiện tối đa ${MAX_ACCESSORY_CODE_LEN} ký tự`);
    } else {
      const dupIndices = codeRowsMap.get(code.toUpperCase()) || [];
      if (dupIndices.length > 1) {
        const others = dupIndices.filter((idx) => idx !== row.rowIndex).map((idx) => `#${idx}`);
        const more = others.length > 4 ? '...' : '';
        errors.push(`Trùng mã '${code}' với dòng ${others.slice(0, 4).join(', ')}${more} trong cùng file`);
      }
    }

    if (!name) errors.push('Thiếu tên phụ kiện');

    const brand = brands.find((b) => b.id === Number(data.brandId));
    if (!brand) errors.push('Chưa chọn hãng phụ kiện');
    if (Number(data.costPrice ?? 0) < 0) errors.push('Giá nhập không được âm');

    const cat = categories.find((c) => c.id === Number(data.categoryId));

    let matched: Accessory | null = code ? (existingByCode.get(code.toUpperCase()) ?? null) : null;
    if (!matched && pinnedExistingIds?.has(row.rowIndex)) {
      const pinnedId = pinnedExistingIds.get(row.rowIndex)!;
      if (!exactMatchedIds.has(pinnedId)) {
        matched = existingById.get(pinnedId) ?? null;
      }
    }

    const action: ExcelRowAction = errors.length > 0 ? 'ERROR' : matched ? 'UPDATE' : 'CREATE';
    const resolvedImagePath =
      data.imagePath === undefined ? (matched?.imagePath ?? null) : data.imagePath;

    return {
      rowIndex: row.rowIndex,
      action,
      existingId: matched ? matched.id : null,
      data: {
        ...data,
        unit: normalizeUnitCode(data.unit),
        imagePath: resolvedImagePath,
        brandCode: brand?.code ?? data.brandCode,
        brandName: brand?.name ?? data.brandName,
        categoryCode: cat?.code ?? data.categoryCode,
        categoryName: cat?.name ?? data.categoryName,
      },
      oldData: matched ? toOldDataSnapshot(matched) : null,
      errors,
      warnings: row.warnings || [],
    };
  });
}

export function autoDisambiguateAccessoryRows(
  rows: AccessoryExcelPreviewRow[],
  brands: Brand[],
  categories: AccessoryCategory[],
  existingAccessories: Accessory[],
  prevPinnedIds: ReadonlyMap<number, number>,
): { nextRows: AccessoryExcelPreviewRow[]; nextPinnedIds: Map<number, number>; changedCount: number } {
  const existingByCode = new Map<string, Accessory>();
  existingAccessories.forEach((acc) => {
    const c = (acc.code || '').trim().toUpperCase();
    if (c) existingByCode.set(c, acc);
  });

  const groups = new Map<string, AccessoryExcelPreviewRow[]>();
  rows.forEach((r) => {
    const key = (r.data.code || '').trim().toUpperCase();
    if (!key) return;
    const arr = groups.get(key) || [];
    arr.push(r);
    groups.set(key, arr);
  });

  const nextPinnedIds = new Map<number, number>(prevPinnedIds);
  const renamedExistingIds = new Set<number>();

  // Xác định bản ghi DB hiện hữu nào sẽ được đổi mã tại chỗ (khi trùng tên từ lần import trước)
  const pinnedRowByGroupKey = new Map<string, number>();
  groups.forEach((groupRows, codeUpper) => {
    if (groupRows.length <= 1) return;
    const existingAcc = existingByCode.get(codeUpper);
    if (!existingAcc) return;
    const targetNameNorm = normalizeComparableText(existingAcc.name);
    const matchingRow = groupRows.find(
      (gr) => normalizeComparableText(gr.data.name) === targetNameNorm,
    );
    if (matchingRow) {
      pinnedRowByGroupKey.set(codeUpper, matchingRow.rowIndex);
      nextPinnedIds.set(matchingRow.rowIndex, existingAcc.id);
      renamedExistingIds.add(existingAcc.id);
    }
  });

  const usedCodesUpper = new Set<string>();
  existingAccessories.forEach((acc) => {
    if (renamedExistingIds.has(acc.id)) return;
    const c = (acc.code || '').trim().toUpperCase();
    if (c) usedCodesUpper.add(c);
  });
  rows.forEach((r) => {
    const c = (r.data.code || '').trim().toUpperCase();
    if (c && (groups.get(c)?.length || 0) === 1) {
      usedCodesUpper.add(c);
    }
  });

  const newCodeByRowIndex = new Map<number, string>();
  let changedCount = 0;

  groups.forEach((groupRows, codeUpper) => {
    if (groupRows.length <= 1) return;
    groupRows.forEach((gr, idx) => {
      const baseCode = gr.data.code.trim();
      const suffix = extractDistinguishingSuffix(baseCode, gr.data.name, idx + 1);
      const uniqueCode = allocateUniqueCode(baseCode, suffix, usedCodesUpper);
      newCodeByRowIndex.set(gr.rowIndex, uniqueCode);
      if (uniqueCode.toUpperCase() !== codeUpper) changedCount++;
    });
  });

  const updatedDraftRows = rows.map((r) => {
    const nextCode = newCodeByRowIndex.get(r.rowIndex);
    if (!nextCode) return r;
    return {
      ...r,
      data: { ...r.data, code: nextCode },
    };
  });

  const nextRows = revalidateAllAccessoryRows(
    updatedDraftRows,
    brands,
    categories,
    existingAccessories,
    nextPinnedIds,
  );

  return { nextRows, nextPinnedIds, changedCount };
}
