'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDoors, getDoorSeriesList, getBrands, getProject } from '@/actions';
import { normalizeDoorType } from '@/types';

export const DOOR_TYPE_FILTERS: Array<{ value: string | null; label: string }> = [
  { value: null, label: 'Tất cả' },
  { value: 'casement_door', label: 'Cửa đi mở quay' },
  { value: 'sliding_door', label: 'Cửa đi lùa' },
  { value: 'casement_window', label: 'Cửa sổ mở quay' },
  { value: 'sliding_window', label: 'Cửa sổ lùa' },
  { value: 'folding_door', label: 'Cửa gấp xếp' },
  { value: 'sliding_casement_door', label: 'Cửa trượt quay' },
  { value: 'glass_wall', label: 'Vách kính' },
  { value: 'curtain_wall', label: 'Mặt dựng' },
  { value: 'composite', label: 'Tổng hợp' },
];

function matchDoorType(doorType: string | null | undefined, filterType: string | null): boolean {
  if (!filterType) return true;
  if (!doorType) return false;
  return normalizeDoorType(doorType) === normalizeDoorType(filterType);
}

interface UseTemplateDoorPickerParams {
  isOpen: boolean;
  projectId?: number;
  propDefaultBrandId?: number | null;
  propDefaultSeriesId?: number | null;
}

export function useTemplateDoorPicker({
  isOpen,
  projectId,
  propDefaultBrandId,
  propDefaultSeriesId,
}: UseTemplateDoorPickerParams) {
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => (projectId ? getProject(projectId) : null),
    enabled: Boolean(projectId) && isOpen,
  });

  const effectiveBrandId = propDefaultBrandId ?? project?.defaultBrandId ?? project?.defaultBrand?.id ?? null;
  const effectiveSeriesId = propDefaultSeriesId ?? project?.defaultSeriesId ?? project?.defaultSeries?.id ?? null;

  const initializedBrandRef = useRef(false);
  const initializedSeriesRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      initializedBrandRef.current = false;
      initializedSeriesRef.current = false;
      setSelectedSeriesId(null);
    }
  }, [isOpen]);

  const { data: brandsData } = useQuery({
    queryKey: ['brands-picker', 'aluminum'],
    queryFn: () => getBrands({ limit: 100, brandType: 'aluminum' }),
    enabled: isOpen,
    staleTime: 60_000,
  });

  const brandsList = useMemo(() => {
    const list = (brandsData?.items || []).filter(
      (b) => !b.brandType || b.brandType === 'aluminum' || b.brandType === 'both',
    );
    return list.sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [brandsData]);

  const brandOptions = useMemo(
    () => brandsList.map((b) => ({ value: b.id, label: b.name })),
    [brandsList],
  );

  useEffect(() => {
    if (!isOpen || brandsList.length === 0) return;
    if (!initializedBrandRef.current) {
      const hasDefaultBrand = effectiveBrandId && brandsList.some((b) => b.id === effectiveBrandId);
      const targetBrandId = hasDefaultBrand ? effectiveBrandId : brandsList[0]?.id;
      if (targetBrandId) {
        setSelectedBrandId(targetBrandId);
      }
      if (hasDefaultBrand || !project) {
        initializedBrandRef.current = true;
      }
    }
  }, [isOpen, brandsList, effectiveBrandId, project]);

  const { data: seriesData } = useQuery({
    queryKey: ['series-picker', selectedBrandId],
    queryFn: () => getDoorSeriesList({ brandId: selectedBrandId! }),
    enabled: isOpen && Boolean(selectedBrandId),
  });

  const seriesList = useMemo(() => seriesData?.items || [], [seriesData]);

  const seriesOptions = useMemo(
    () =>
      [...seriesList]
        .sort((a, b) =>
          `${a.code} - ${a.name}`.localeCompare(`${b.code} - ${b.name}`, 'vi', { sensitivity: 'base' }),
        )
        .map((s) => ({
          value: s.id,
          label: `${s.code} - ${s.name}`,
        })),
    [seriesList],
  );

  useEffect(() => {
    if (!isOpen || seriesList.length === 0) return;
    if (!initializedSeriesRef.current) {
      if (effectiveSeriesId && seriesList.some((s) => s.id === effectiveSeriesId)) {
        setSelectedSeriesId(effectiveSeriesId);
        initializedSeriesRef.current = true;
      }
    }
  }, [isOpen, seriesList, effectiveSeriesId]);

  const { data: doorsData, isLoading: isLoadingDoors } = useQuery({
    queryKey: ['doors-picker', selectedBrandId],
    queryFn: () => getDoors({ brandId: selectedBrandId!, limit: 1000 }),
    enabled: isOpen && Boolean(selectedBrandId),
  });

  const filteredDoors = useMemo(() => {
    let result = doorsData?.items || [];
    if (selectedSeriesId) {
      result = result.filter((d) => d.doorSeriesId === selectedSeriesId);
    }
    if (selectedType) {
      result = result.filter((d) => matchDoorType(d.type, selectedType));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (d) => d.name.toLowerCase().includes(q) || (d.code && d.code.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [doorsData, selectedSeriesId, selectedType, search]);

  return {
    selectedBrandId,
    setSelectedBrandId,
    selectedSeriesId,
    setSelectedSeriesId,
    selectedType,
    setSelectedType,
    search,
    setSearch,
    brandOptions,
    seriesOptions,
    filteredDoors,
    isLoadingDoors,
  };
}

