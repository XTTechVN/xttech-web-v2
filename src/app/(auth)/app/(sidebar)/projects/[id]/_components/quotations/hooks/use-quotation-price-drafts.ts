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

/**
 * Giá bán đang nhập dở (chưa lưu) trên bảng chi tiết bộ cửa.
 * Ô để trống nghĩa là quay về giá gợi ý của hệ thống.
 */
export function useQuotationPriceDrafts(items: QuotationDoorItemSnapshot[], isSeparated: boolean) {
  const [priceDrafts, setPriceDrafts] = useState<DraftMap>({});
  const [doorDrafts, setDoorDrafts] = useState<DraftMap>({});
  const [accDrafts, setAccDrafts] = useState<DraftMap>({});

  const resetDrafts = () => {
    setPriceDrafts({});
    setDoorDrafts({});
    setAccDrafts({});
  };

  // Giá cửa / phụ kiện đang có hiệu lực: đang nhập > giá tay đã lưu > giá gợi ý
  const getDoorLive = (item: QuotationDoorItemSnapshot): number => {
    const draft = doorDrafts[item.positionId];
    if (draft !== undefined) return draft === '' ? item.doorOnlySuggestedPrice : Number(draft);
    return isSeparatedManual(item) ? item.doorOnlySellingPrice : item.doorOnlySuggestedPrice;
  };

  const getAccessoryLive = (item: QuotationDoorItemSnapshot): number => {
    const draft = accDrafts[item.positionId];
    if (draft !== undefined) return draft === '' ? item.accessorySuggestedPrice : Number(draft);
    return isSeparatedManual(item) ? item.accessorySellingPrice : item.accessorySuggestedPrice;
  };

  // Tổng giá bộ cửa đang có hiệu lực
  const getTotalLive = (item: QuotationDoorItemSnapshot): number => {
    if (isSeparated) return getDoorLive(item) + getAccessoryLive(item);
    const draft = priceDrafts[item.positionId];
    if (draft !== undefined && draft !== '') return Number(draft);
    return item.isManuallyEdited && draft === undefined ? item.sellingPrice : item.suggestedPrice;
  };

  const isBelowCostLive = (item: QuotationDoorItemSnapshot): boolean =>
    getTotalLive(item) < item.costPrice;

  const collectSeparatedChange = (item: QuotationDoorItemSnapshot, changes: PriceChanges) => {
    const id = item.positionId;
    if (doorDrafts[id] === undefined && accDrafts[id] === undefined) return;
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
    const raw = priceDrafts[id];
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
  }, [items, isSeparated, priceDrafts, doorDrafts, accDrafts]);

  const changedCount =
    Object.keys(changes.changedPrices).length +
    Object.keys(changes.separatedOverrides).length +
    changes.clearedIds.size;

  // Backend không gộp giá tay cũ nên phải gửi lại đủ cả giá cũ và mới
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
      } else if (!isSeparated && item.isManuallyEdited) {
        manual[id] = item.sellingPrice;
      }
    });
    return {
      customSellingPrices: { ...manual, ...changes.changedPrices },
      customAccessoryPrices: manualAccessory,
    };
  };

  const setDraft = (setter: typeof setPriceDrafts) => (positionId: number, digits: string) =>
    setter((prev) => ({ ...prev, [positionId]: digits }));

  return {
    priceDrafts,
    doorDrafts,
    accDrafts,
    setPriceDraft: setDraft(setPriceDrafts),
    setDoorDraft: setDraft(setDoorDrafts),
    setAccessoryDraft: setDraft(setAccDrafts),
    resetDrafts,
    getTotalLive,
    isBelowCostLive,
    changedCount,
    buildPayload,
  };
}
