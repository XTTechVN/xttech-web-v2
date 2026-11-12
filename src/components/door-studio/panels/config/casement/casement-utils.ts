import { StudioProfileId } from '../../../utils/profile-combine-utils';

export const buildSyncedRawVariants = (
  rawVariants?: Record<string, unknown>,
  leftId?: StudioProfileId,
  topId?: StudioProfileId,
  rightId?: StudioProfileId,
  bottomId?: StudioProfileId
): Record<string, unknown> | undefined => {
  if (!rawVariants) return undefined;
  const nextRawVariants: Record<string, unknown> = { ...rawVariants };
  let hasSwingBranch = false;
  for (const key of ['mo-ra', 'mo-vao', 'mo-hat', 'mo-lat']) {
    if (key in nextRawVariants) {
      hasSwingBranch = true;
      const existingBranch =
        nextRawVariants[key] && typeof nextRawVariants[key] === 'object'
          ? (nextRawVariants[key] as Record<string, unknown>)
          : {};
      nextRawVariants[key] = {
        ...existingBranch,
        '1': leftId ? String(leftId) : '',
        '2': topId && topId !== leftId ? String(topId) : '',
        '3': rightId && rightId !== leftId ? String(rightId) : '',
        '4': bottomId && bottomId !== (topId || leftId) ? String(bottomId) : '',
      };
    }
  }
  return hasSwingBranch ? nextRawVariants : rawVariants;
};

