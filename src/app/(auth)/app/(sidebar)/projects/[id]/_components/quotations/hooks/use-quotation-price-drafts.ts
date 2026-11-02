'use client';

import { useMemo, useState } from 'react';
import type { ProjectQuotationUpdatePayload, QuotationDoorItemSnapshot } from '@/types';
import { isSeparatedManual } from '../utils/quotation-form-utils';

type DraftMap = Record<number, string>;

interface PriceChanges {
  changedPrices: Record<number, number>;
  clearedIds: Set<number>;
  separatedOverrides: Record<number, { total: number; acc: number }>;
}

export const getSuggestedUnitPriceM2 = (item: QuotationDoorItemSnapshot): number => {
  const area = item.areaM2 || 0;
  return area > 0 ? Math.round(item.suggestedPrice / area) : item.suggestedPrice;
};

export const getSavedUnitPriceM2 = (item: QuotationDoorItemSnapshot): number => {
  const area = item.areaM2 || 0;
  return area > 0 ? Math.round(item.sellingPrice / area) : item.sellingPrice;
};

export const getSuggestedDoorUnitPriceM2 = (item: QuotationDoorItemSnapshot): number => {
  const area = item.areaM2 || 0;
  return area > 0 ? Math.round(item.doorOnlySuggestedPrice / area) : item.doorOnlySuggestedPrice;
};

export const getSavedDoorUnitPriceM2 = (item: QuotationDoorItemSnapshot): number => {
  const area = item.areaM2 || 0;
  return area > 0 ? Math.round(item.doorOnlySellingPrice / area) : item.doorOnlySellingPrice;
};

/**
 * Quản lý giá bán linh hoạt 2 chiều (Đơn giá đ/m² <-> Thành tiền đ)
 * Hỗ trợ áp dụng hàng loạt và chuẩn hóa cho cả 2 chế độ báo giá.
 */
export function useQuotationPriceDrafts(
  items: QuotationDoorItemSnapshot[],
  isSeparated: boolean,
  vatPercent: number = 10,
) {
  // Combined mode drafts
  const [unitPriceM2Drafts, setUnitPriceM2Drafts] = useState<DraftMap>({});
  const [totalDrafts, setTotalDrafts] = useState<DraftMap>({});

  // Separated mode drafts
  const [doorUnitM2Drafts, setDoorUnitM2Drafts] = useState<DraftMap>({});
  const [doorTotalDrafts, setDoorTotalDrafts] = useState<DraftMap>({});
  const [accDrafts, setAccDrafts] = useState<DraftMap>({});

  const resetDrafts = () => {
    setUnitPriceM2Drafts({});
    setTotalDrafts({});
    setDoorUnitM2Drafts({});
    setDoorTotalDrafts({});
    setAccDrafts({});
  };

  // --- Giá có hiệu lực (Live) ---

  const getUnitPriceM2Live = (item: QuotationDoorItemSnapshot): number => {
    const draft = unitPriceM2Drafts[item.positionId];
    if (draft !== undefined && draft !== '') return Number(draft);
    if (draft === '') return getSuggestedUnitPriceM2(item);
    return item.isManuallyEdited ? getSavedUnitPriceM2(item) : getSuggestedUnitPriceM2(item);
  };

  const getDoorUnitPriceM2Live = (item: QuotationDoorItemSnapshot): number => {
    const draft = doorUnitM2Drafts[item.positionId];
    if (draft !== undefined && draft !== '') return Number(draft);
    if (draft === '') return getSuggestedDoorUnitPriceM2(item);
    return isSeparatedManual(item)
      ? getSavedDoorUnitPriceM2(item)
      : getSuggestedDoorUnitPriceM2(item);
  };

  const getDoorLive = (item: QuotationDoorItemSnapshot): number => {
    const draft = doorTotalDrafts[item.positionId];
    if (draft !== undefined && draft !== '') return Number(draft);
    if (draft === '') return item.doorOnlySuggestedPrice;
    return isSeparatedManual(item) ? item.doorOnlySellingPrice : item.doorOnlySuggestedPrice;
  };

  const getAccessoryLive = (item: QuotationDoorItemSnapshot): number => {
    const draft = accDrafts[item.positionId];
    if (draft !== undefined && draft !== '') return Number(draft);
    if (draft === '') return item.accessorySuggestedPrice;
    return isSeparatedManual(item) ? item.accessorySellingPrice : item.accessorySuggestedPrice;
  };

  const getTotalLive = (item: QuotationDoorItemSnapshot): number => {
    if (isSeparated) return getDoorLive(item) + getAccessoryLive(item);
    const draft = totalDrafts[item.positionId];
    if (draft !== undefined && draft !== '') return Number(draft);
    if (draft === '') return item.suggestedPrice;
    return item.isManuallyEdited ? item.sellingPrice : item.suggestedPrice;
  };

  const isBelowCostLive = (item: QuotationDoorItemSnapshot): boolean => {
    const totalLive = getTotalLive(item);
    const vatFactor = 1.0 + (vatPercent || 0) / 100;
    const netLive = vatFactor > 0 ? totalLive / vatFactor : totalLive;
    return netLive < item.costPrice;
  };

  // --- Setters đồng bộ 2 chiều (Bidirectional) ---

  const setUnitPriceM2Draft = (item: QuotationDoorItemSnapshot, digits: string) => {
    const id = item.positionId;
    if (digits === '') {
      setUnitPriceM2Drafts((prev) => ({ ...prev, [id]: '' }));
      setTotalDrafts((prev) => ({ ...prev, [id]: '' }));
      return;
    }
    const unitPrice = Number(digits);
    const total = Math.round(unitPrice * (item.areaM2 || 0));
    setUnitPriceM2Drafts((prev) => ({ ...prev, [id]: digits }));
    setTotalDrafts((prev) => ({ ...prev, [id]: String(total) }));
  };

  const setTotalPriceDraft = (item: QuotationDoorItemSnapshot, digits: string) => {
    const id = item.positionId;
    if (digits === '') {
      setUnitPriceM2Drafts((prev) => ({ ...prev, [id]: '' }));
      setTotalDrafts((prev) => ({ ...prev, [id]: '' }));
      return;
    }
    const total = Number(digits);
    const unitM2 = item.areaM2 > 0 ? Math.round(total / item.areaM2) : total;
    setTotalDrafts((prev) => ({ ...prev, [id]: digits }));
    setUnitPriceM2Drafts((prev) => ({ ...prev, [id]: String(unitM2) }));
  };

  const setDoorUnitPriceM2Draft = (item: QuotationDoorItemSnapshot, digits: string) => {
    const id = item.positionId;
    if (digits === '') {
      setDoorUnitM2Drafts((prev) => ({ ...prev, [id]: '' }));
      setDoorTotalDrafts((prev) => ({ ...prev, [id]: '' }));
      return;
    }
    const unitPrice = Number(digits);
    const total = Math.round(unitPrice * (item.areaM2 || 0));
    setDoorUnitM2Drafts((prev) => ({ ...prev, [id]: digits }));
    setDoorTotalDrafts((prev) => ({ ...prev, [id]: String(total) }));
  };

  const setDoorTotalPriceDraft = (item: QuotationDoorItemSnapshot, digits: string) => {
    const id = item.positionId;
    if (digits === '') {
      setDoorUnitM2Drafts((prev) => ({ ...prev, [id]: '' }));
      setDoorTotalDrafts((prev) => ({ ...prev, [id]: '' }));
      return;
    }
    const total = Number(digits);
    const unitM2 = item.areaM2 > 0 ? Math.round(total / item.areaM2) : total;
    setDoorTotalDrafts((prev) => ({ ...prev, [id]: digits }));
    setDoorUnitM2Drafts((prev) => ({ ...prev, [id]: String(unitM2) }));
  };

  const setAccessoryDraft = (positionId: number, digits: string) => {
    setAccDrafts((prev) => ({ ...prev, [positionId]: digits }));
  };

  // --- Batch Actions ---

  const applyBatchUnitPrice = (
    targetItems: QuotationDoorItemSnapshot[],
    unitPriceM2: number,
  ) => {
    if (unitPriceM2 <= 0) return;
    const digits = String(unitPriceM2);

    if (isSeparated) {
      setDoorUnitM2Drafts((prev) => {
        const next = { ...prev };
        targetItems.forEach((item) => {
          next[item.positionId] = digits;
        });
        return next;
      });
      setDoorTotalDrafts((prev) => {
        const next = { ...prev };
        targetItems.forEach((item) => {
          next[item.positionId] = String(Math.round(unitPriceM2 * (item.areaM2 || 0)));
        });
        return next;
      });
    } else {
      setUnitPriceM2Drafts((prev) => {
        const next = { ...prev };
        targetItems.forEach((item) => {
          next[item.positionId] = digits;
        });
        return next;
      });
      setTotalDrafts((prev) => {
        const next = { ...prev };
        targetItems.forEach((item) => {
          next[item.positionId] = String(Math.round(unitPriceM2 * (item.areaM2 || 0)));
        });
        return next;
      });
    }
  };

  const revertAllToSuggested = () => {
    if (isSeparated) {
      setDoorUnitM2Drafts((prev) => {
        const next = { ...prev };
        items.forEach((item) => {
          next[item.positionId] = '';
        });
        return next;
      });
      setDoorTotalDrafts((prev) => {
        const next = { ...prev };
        items.forEach((item) => {
          next[item.positionId] = '';
        });
        return next;
      });
      setAccDrafts((prev) => {
        const next = { ...prev };
        items.forEach((item) => {
          next[item.positionId] = '';
        });
        return next;
      });
    } else {
      setUnitPriceM2Drafts((prev) => {
        const next = { ...prev };
        items.forEach((item) => {
          next[item.positionId] = '';
        });
        return next;
      });
      setTotalDrafts((prev) => {
        const next = { ...prev };
        items.forEach((item) => {
          next[item.positionId] = '';
        });
        return next;
      });
    }
  };

  // --- Thu thập thay đổi ---

  const collectSeparatedChange = (item: QuotationDoorItemSnapshot, changes: PriceChanges) => {
    const id = item.positionId;
    if (doorTotalDrafts[id] === undefined && accDrafts[id] === undefined) return;
    const door = getDoorLive(item);
    const acc = getAccessoryLive(item);
    const isBackToSuggested =
      door === item.doorOnlySuggestedPrice && acc === item.accessorySuggestedPrice;
    const isUnchangedManual =
      isSeparatedManual(item) &&
      door === item.doorOnlySellingPrice &&
      acc === item.accessorySellingPrice;

    if (isBackToSuggested) {
      if (isSeparatedManual(item)) changes.clearedIds.add(id);
    } else if (!isUnchangedManual) {
      changes.separatedOverrides[id] = { total: door + acc, acc };
    }
  };

  const collectCombinedChange = (item: QuotationDoorItemSnapshot, changes: PriceChanges) => {
    const id = item.positionId;
    const raw = totalDrafts[id];
    if (raw === undefined) return;
    if (raw === '') {
      if (item.isManuallyEdited) changes.clearedIds.add(id);
      return;
    }
    const value = Number(raw);
    const current = item.isManuallyEdited ? item.sellingPrice : undefined;
    if (Number.isFinite(value) && value >= 0 && value !== current) {
      changes.changedPrices[id] = value;
    }
  };

  const changes = useMemo<PriceChanges>(() => {
    const result: PriceChanges = { changedPrices: {}, clearedIds: new Set(), separatedOverrides: {} };
    items.forEach((item) =>
      isSeparated ? collectSeparatedChange(item, result) : collectCombinedChange(item, result),
    );
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, isSeparated, totalDrafts, doorTotalDrafts, accDrafts]);

  const changedCount =
    Object.keys(changes.changedPrices).length +
    Object.keys(changes.separatedOverrides).length +
    changes.clearedIds.size;

  const hasAnyManual = useMemo(() => {
    const hasSavedManual = items.some((item) =>
      isSeparated ? isSeparatedManual(item) : item.isManuallyEdited,
    );
    return hasSavedManual || changedCount > 0;
  }, [items, isSeparated, changedCount]);

  const buildPayload = (): ProjectQuotationUpdatePayload => {
    const manual: Record<number, number> = {};
    const manualAccessory: Record<number, number> = {};
    items.forEach((item) => {
      const id = item.positionId;
      if (changes.clearedIds.has(id)) return;
      const override = changes.separatedOverrides[id];
      if (isSeparated && override) {
        manual[id] = override.total;
        manualAccessory[id] = override.acc;
      } else if (isSeparated && isSeparatedManual(item)) {
        manual[id] = item.sellingPrice;
        manualAccessory[id] = item.accessorySellingPrice;
      } else if (!isSeparated && changes.changedPrices[id] !== undefined) {
        manual[id] = changes.changedPrices[id];
      } else if (!isSeparated && item.isManuallyEdited) {
        manual[id] = item.sellingPrice;
      }
    });
    return {
      customSellingPrices: manual,
      customAccessoryPrices: isSeparated ? manualAccessory : undefined,
    };
  };

  return {
    unitPriceM2Drafts,
    totalDrafts,
    doorUnitM2Drafts,
    doorTotalDrafts,
    accDrafts,
    setUnitPriceM2Draft,
    setTotalPriceDraft,
    setDoorUnitPriceM2Draft,
    setDoorTotalPriceDraft,
    setAccessoryDraft,
    applyBatchUnitPrice,
    revertAllToSuggested,
    resetDrafts,
    getUnitPriceM2Live,
    getDoorUnitPriceM2Live,
    getDoorLive,
    getAccessoryLive,
    getTotalLive,
    isBelowCostLive,
    hasAnyManual,
    changedCount,
    buildPayload,
  };
}
