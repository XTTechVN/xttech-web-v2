import type { ProfileBar, ProfileBarCompanion } from '@/types';

export interface CombineWayGroup {
  groupId: string;
  code: string;
  name: string;
  items: ProfileBarCompanion[];
}

export function buildSuggestedCombineCode(
  parentCode: string,
  items: ProfileBarCompanion[],
  barById: ReadonlyMap<number, ProfileBar>,
): string {
  const baseCode = (parentCode || '').trim();
  const childCodes = items
    .map((item) => (barById.get(item.companionBarId)?.code || item.companionCode || '').trim())
    .filter(Boolean);
  if (!baseCode && childCodes.length === 0) return '';
  return [baseCode, ...childCodes].filter(Boolean).join('+');
}

export function buildSuggestedCombineName(
  parentName: string,
  items: ProfileBarCompanion[],
  barById: ReadonlyMap<number, ProfileBar>,
): string {
  const baseName = (parentName || '').trim();
  const childNames = items
    .map((item) => (barById.get(item.companionBarId)?.name || item.companionName || '').trim())
    .filter(Boolean);
  if (!baseName && childNames.length === 0) return '';
  return [baseName, ...childNames].filter(Boolean).join(' + ');
}

export function groupCompanionsByWay(
  companions: ProfileBarCompanion[],
  parentCode: string,
  parentName: string,
): CombineWayGroup[] {
  if (!companions || companions.length === 0) return [];
  const groups: CombineWayGroup[] = [];
  const groupIdxByCode = new Map<string, number>();

  companions.forEach((companion, idx) => {
    const rawCode = (companion.code ?? '').trim();
    const rawName = (companion.name ?? '').trim();

    if (rawCode !== '' && groupIdxByCode.has(rawCode)) {
      const targetIdx = groupIdxByCode.get(rawCode)!;
      groups[targetIdx].items.push(companion);
      if (!groups[targetIdx].name && rawName) {
        groups[targetIdx].name = rawName;
      }
      return;
    }

    const groupId = rawCode ? `way-${rawCode}-${groups.length}` : `way-idx-${idx}`;
    const newGroup: CombineWayGroup = {
      groupId,
      code: rawCode || (companion.companionCode && parentCode ? `${parentCode}+${companion.companionCode}` : ''),
      name: rawName || (companion.companionName && parentName ? `${parentName} + ${companion.companionName}` : ''),
      items: [companion],
    };

    if (rawCode !== '') {
      groupIdxByCode.set(rawCode, groups.length);
    }
    groups.push(newGroup);
  });

  return groups;
}

export function flattenCombineWayGroups(groups: CombineWayGroup[]): ProfileBarCompanion[] {
  const result: ProfileBarCompanion[] = [];
  groups.forEach((group) => {
    const cleanCode = group.code.trim();
    const cleanName = group.name.trim();
    group.items.forEach((item) => {
      result.push({
        ...item,
        code: cleanCode,
        name: cleanName,
        sortOrder: result.length,
      });
    });
  });
  return result;
}
