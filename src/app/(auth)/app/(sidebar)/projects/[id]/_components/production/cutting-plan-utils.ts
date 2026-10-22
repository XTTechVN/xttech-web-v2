import type { CuttingBar, CuttingPlan } from '@/types';

export interface CuttingBarGroup {
  key: string;
  profileCode: string;
  profileName: string;
  colorName: string;
  bars: CuttingBar[];
}

// Gom các cây theo (mã profile, màu) để hiển thị và in theo từng loại nhôm
export function groupBarsByProfile(bars: CuttingBar[]): CuttingBarGroup[] {
  const groups = new Map<string, CuttingBarGroup>();
  bars.forEach((bar) => {
    const key = `${bar.profileCode}|${bar.colorId ?? ''}`;
    const group = groups.get(key) ?? {
      key,
      profileCode: bar.profileCode,
      profileName: bar.profileName ?? bar.profileCode,
      colorName: bar.colorName ?? 'Chưa gán màu',
      bars: [],
    };
    group.bars.push(bar);
    groups.set(key, group);
  });
  return Array.from(groups.values());
}

export const getReturnableBars = (plan: CuttingPlan): CuttingBar[] =>
  plan.bars.filter((bar) => bar.isOffcutReturnSuggested && !bar.isOffcutReturned);
