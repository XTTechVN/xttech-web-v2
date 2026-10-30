'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getBrands, getDoorSeriesList, getBrandColors, updateProject } from '@/actions';
import { showErrorToast } from '@/utils';
import type { ProjectDetail, ProjectUpdate } from '@/types';
import type { CompactSelectOption } from '../compact-select';

export const SURFACE_TYPE_LABEL_MAP: Record<string, string> = {
  powder_coat: 'Sơn tĩnh điện',
  anodize: 'Xi mạ Anodize',
  wood_grain: 'Vân gỗ',
  pvdf: 'Sơn PVDF',
};

export const formatSurfaceType = (surfaceType?: string | null): string => {
  if (!surfaceType) return '';
  return SURFACE_TYPE_LABEL_MAP[surfaceType] || surfaceType;
};

export function useOverviewMaterials(projectId: number, project?: ProjectDetail) {
  const queryClient = useQueryClient();
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const [shouldFetchCatalogs, setShouldFetchCatalogs] = useState(false);

  const enableCatalogs = useCallback(() => {
    setShouldFetchCatalogs(true);
  }, []);

  const currentBrandId = project?.defaultBrandId || project?.defaultBrand?.id;

  const { data: brandsData, isLoading: isLoadingBrands } = useQuery({
    queryKey: ['brands', 'aluminum'],
    queryFn: async () => {
      const res = await getBrands({ limit: 100, brandType: 'aluminum' });
      const items = Array.isArray(res?.items) ? res.items : [];
      return items.filter((b) => !b.brandType || b.brandType === 'aluminum' || b.brandType === 'both');
    },
    enabled: shouldFetchCatalogs,
    staleTime: 60_000,
  });

  const { data: seriesData, isLoading: isLoadingSeries } = useQuery({
    queryKey: ['project-overview-door-series', currentBrandId],
    queryFn: async () => {
      if (!currentBrandId) return [];
      const res = await getDoorSeriesList({
        limit: 100,
        brandId: Number(currentBrandId),
      });
      return Array.isArray(res?.items) ? res.items : [];
    },
    enabled: shouldFetchCatalogs && Boolean(currentBrandId),
  });

  const { data: colorsData, isLoading: isLoadingColors } = useQuery({
    queryKey: ['project-overview-brand-colors', currentBrandId],
    queryFn: async () => {
      if (!currentBrandId) return [];
      const res = await getBrandColors({
        limit: 100,
        brandId: Number(currentBrandId),
      });
      return Array.isArray(res?.items) ? res.items : [];
    },
    enabled: shouldFetchCatalogs && Boolean(currentBrandId),
  });

  const handleUpdate = async (field: string, payload: Partial<ProjectUpdate>) => {
    try {
      setUpdatingField(field);
      await updateProject(projectId, payload as ProjectUpdate);
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Đã cập nhật thông tin');
    } catch (error) {
      showErrorToast(error, 'Không thể cập nhật');
    } finally {
      setUpdatingField(null);
    }
  };

  const brandOptions: CompactSelectOption[] = useMemo(
    () =>
      (brandsData ?? [])
        .map((b) => ({
          value: b.id,
          label: `${b.name}${b.originCountry ? ` (${b.originCountry})` : ''}`,
          sublabel: b.barLengthMm ? `${(b.barLengthMm / 1000).toFixed(2)}m` : undefined,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'vi', { sensitivity: 'base' })),
    [brandsData],
  );

  const seriesOptions: CompactSelectOption[] = useMemo(
    () =>
      (seriesData ?? [])
        .map((s) => ({
          value: s.id,
          label: `${s.name}${s.aluminumThickness ? ` - Dày ${s.aluminumThickness} mm` : ''}`,
          sublabel: s.aluminumThickness ? `${s.aluminumThickness} mm` : undefined,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'vi', { sensitivity: 'base' })),
    [seriesData],
  );

  const colorOptions: CompactSelectOption[] = useMemo(
    () =>
      (colorsData ?? [])
        .map((c) => {
          const surfaceLabel = formatSurfaceType(c.surfaceType);
          return {
            value: c.id,
            label: `${c.name}${surfaceLabel ? ` (${surfaceLabel})` : ''}`,
            colorHex: c.colorHex,
            sublabel: c.pricePerKg ? `${c.pricePerKg.toLocaleString('vi-VN')} đ/kg` : undefined,
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label, 'vi', { sensitivity: 'base' })),
    [colorsData],
  );

  return {
    currentBrandId,
    updatingField,
    isLoadingBrands,
    isLoadingSeries,
    isLoadingColors,
    brandOptions,
    seriesOptions,
    colorOptions,
    enableCatalogs,
    handleUpdate,
  };
}

