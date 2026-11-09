import type { ProfileBarCreate, ProfileBarVariant, ProfileBarCompanion, ProfileSection } from '@/types';
import { toNullableNumber } from './profile-bar-config';

const emptyToNull = (value?: string | null) => (value && value.trim() !== '' ? value.trim() : null);

/** Nhân bản biến thể (bỏ id/profileBarId) để dùng cho form sửa/sao chép. */
export const cloneVariants = (variants: ProfileBarVariant[] = []): ProfileBarVariant[] =>
  variants.map(({ id: _id, profileBarId: _profileBarId, ...rest }, index) => ({ ...rest, sortOrder: index }));

/** Nhân bản thanh kèm (bỏ id/profileBarId và các trường read-only). */
export const cloneCompanions = (companions: ProfileBarCompanion[] = []): ProfileBarCompanion[] =>
  companions.map((companion, index) => ({
    companionBarId: companion.companionBarId,
    code: companion.code ?? null,
    name: companion.name ?? null,
    offsetMm: companion.offsetMm ?? 0,
    qty: companion.qty ?? 1,
    goc1: companion.goc1 ?? null,
    goc2: companion.goc2 ?? null,
    note: companion.note ?? null,
    sortOrder: index,
    companionCode: companion.companionCode ?? null,
    companionName: companion.companionName ?? null,
  }));

export function buildProfileBarPayload(
  data: ProfileBarCreate,
  section: ProfileSection | null,
  variants: ProfileBarVariant[],
  companions: ProfileBarCompanion[],
): ProfileBarCreate {
  const isFullCompanion = Boolean(data.isFullCompanion);
  return {
    ...data,
    brandId: Number(data.brandId),
    seriesId: Number(data.seriesId),
    barType: String(data.barType || 'FRAME').toUpperCase(),
    weightPerM: Number(data.weightPerM) || 0,
    sectionHeightMm: Number(data.sectionHeightMm) || 0,
    barLengthMm: Number(data.barLengthMm) || 6000,
    deductMullionMm: Number(data.deductMullionMm) || 0,
    deductSashMm: Number(data.deductSashMm) || 0,
    deductBeadMm: Number(data.deductBeadMm) || 0,
    deductGlassMm: Number(data.deductGlassMm) || 0,
    sectionLibraryId: section ? section.id : null,
    note: emptyToNull(data.note),
    isVirtual: Boolean(data.isVirtual),
    isFullCompanion,
    variants: variants.map((variant, index) => ({
      role: variant.role,
      code: variant.code.trim(),
      name: emptyToNull(variant.name),
      note: emptyToNull(variant.note),
      sectionHeightMm: toNullableNumber(variant.sectionHeightMm),
      deductSashMm: toNullableNumber(variant.deductSashMm),
      deductBeadMm: toNullableNumber(variant.deductBeadMm),
      deductGlassMm: toNullableNumber(variant.deductGlassMm),
      deductMullionMm: toNullableNumber(variant.deductMullionMm),
      sortOrder: index,
    })),
    companions: companions.map((companion, index) => ({
      companionBarId: Number(companion.companionBarId),
      code: isFullCompanion ? null : emptyToNull(companion.code),
      name: isFullCompanion ? null : emptyToNull(companion.name),
      offsetMm: Number(companion.offsetMm) || 0,
      qty: Number(companion.qty) || 1,
      goc1: toNullableNumber(companion.goc1),
      goc2: toNullableNumber(companion.goc2),
      note: emptyToNull(companion.note),
      sortOrder: index,
    })),
  };
}
