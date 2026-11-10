import type { ProfileBar, ProfileBarCompanion } from '@/types';

export type StudioProfileId = number | string;

export function parseStudioProfileId(val: unknown): StudioProfileId | undefined {
  if (val === undefined || val === null || val === '') return undefined;
  const s = String(val).trim();
  if (!s) return undefined;
  if (s.includes('_comp_') || s.includes('_compgrp_')) {
    const head = Number(s.split('_')[0]);
    if (Number.isFinite(head) && head > 0) return s;
  }
  const head = s.split('_')[0];
  const n = Number(head);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function getBaseProfileNumericId(val: StudioProfileId | null | undefined): number | undefined {
  if (val === undefined || val === null || val === '') return undefined;
  const n = Number(String(val).trim().split('_')[0]);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function isSameProfileId(
  a: StudioProfileId | null | undefined,
  b: StudioProfileId | null | undefined,
): boolean {
  if (a === undefined || a === null || a === '' || b === undefined || b === null || b === '') {
    return false;
  }
  return String(a) === String(b);
}

export function findStudioProfile(
  profiles: ProfileBar[] | undefined,
  pid: StudioProfileId | null | undefined,
): ProfileBar | undefined {
  if (!profiles || pid === undefined || pid === null || pid === '') return undefined;
  const direct = profiles.find((p) => isSameProfileId(p.id, pid));
  if (direct) return direct;
  const baseId = getBaseProfileNumericId(pid);
  if (baseId === undefined) return undefined;
  return profiles.find((p) => p.id === baseId);
}

interface CompanionWayBucket {
  code: string;
  name: string;
  items: ProfileBarCompanion[];
}

export function expandStudioProfilesWithCombine(bars: ProfileBar[]): ProfileBar[] {
  const result: ProfileBar[] = [];

  for (const bar of bars) {
    result.push(bar);
    if (bar.isFullCompanion || !bar.companions || bar.companions.length === 0) {
      continue;
    }

    const groups: CompanionWayBucket[] = [];
    const groupIdxByCode = new Map<string, number>();

    for (const comp of bar.companions) {
      const code = (comp.code || '').trim();
      const name = (comp.name || '').trim();
      if (code !== '' && groupIdxByCode.has(code)) {
        const gIdx = groupIdxByCode.get(code)!;
        groups[gIdx].items.push(comp);
        if (!groups[gIdx].name && name) groups[gIdx].name = name;
      } else {
        if (code !== '') groupIdxByCode.set(code, groups.length);
        groups.push({ code, name, items: [comp] });
      }
    }

    const singleCompanionIdCount = new Map<number, number>();
    for (const grp of groups) {
      if (grp.items.length === 1 && grp.items[0].companionBarId) {
        const cid = grp.items[0].companionBarId;
        singleCompanionIdCount.set(cid, (singleCompanionIdCount.get(cid) || 0) + 1);
      }
    }

    groups.forEach((grp, groupIdx) => {
      const isUniqueSingle =
        grp.items.length === 1 &&
        Boolean(grp.items[0].companionBarId) &&
        singleCompanionIdCount.get(grp.items[0].companionBarId) === 1;

      const combineId = isUniqueSingle
        ? `${bar.id}_comp_${grp.items[0].companionBarId}`
        : `${bar.id}_compgrp_${groupIdx}`;

      result.push({
        ...bar,
        id: combineId as unknown as number,
        code: grp.code || `${bar.code}+combine`,
        name: `⊕ ${grp.name || bar.name}`,
        companions: [],
      });
    });
  }

  return result;
}
