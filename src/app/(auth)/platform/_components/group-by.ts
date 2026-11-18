export const SCOPE_LABEL: Record<string, string> = { own: 'Của mình', dept: 'Phòng ban', org: 'Toàn doanh nghiệp' };

export const groupBy = <T>(items: T[], key: (item: T) => string): [string, T[]][] => {
  const groups = new Map<string, T[]>();
  for (const item of items) groups.set(key(item), [...(groups.get(key(item)) ?? []), item]);
  return [...groups.entries()];
};
