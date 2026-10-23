'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBrands, getDoors, getDoorSeriesList, getProject } from '@/actions';
import { normalizeDoorType, type Brand, type Door, type DoorSeries } from '@/types';

export const DOOR_TYPE_FILTERS: Array<{ value: string | null; label: string }> = [
  { value: null, label: 'Tất cả' },
  { value: 'glass_wall', label: 'Vách kính' },
  { value: 'casement_window', label: 'Cửa sổ mở quay' },
  { value: 'sliding_window', label: 'Cửa sổ lùa' },
  { value: 'casement_door', label: 'Cửa đi mở quay' },
  { value: 'sliding_door', label: 'Cửa đi lùa' },
  { value: 'folding_door', label: 'Cửa gấp xếp' },
  { value: 'sliding_casement_door', label: 'Cửa trượt quay' },
  { value: 'curtain_wall', label: 'Mặt dựng' },
  { value: 'composite', label: 'Tổng hợp' },
];

export interface BrandPillItem extends Brand {
  isDefault: boolean;
}

export interface DoorSeriesGroup {
  seriesId: number | null;
  seriesCode: string;
  seriesName: string;
  isDefaultSeries: boolean;
  doors: Door[];
}

function matchDoorType(doorType: string | null | undefined, filterType: string | null): boolean {
  if (!filterType) return true;
  if (!doorType) return false;
  return normalizeDoorType(doorType) === normalizeDoorType(filterType);
}

function buildSeriesGroups(
  doors: Door[],
  seriesById: Map<number, DoorSeries>,
  effectiveSeriesId: number | null,
): DoorSeriesGroup[] {
  const groupMap = new Map<string, DoorSeriesGroup>();
  for (const door of doors) {
    const sid = door.doorSeriesId ?? door.doorSeries?.id ?? null;
    const fallbackSeries = sid ? seriesById.get(sid) : undefined;
    const code = door.doorSeries?.code || fallbackSeries?.code || '';
    const name = door.doorSeries?.name || fallbackSeries?.name || code || 'Chưa phân hệ nhôm';
    const key = sid ? `series-${sid}` : `unassigned-${name}`;

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        seriesId: sid,
        seriesCode: code,
        seriesName: name,
        isDefaultSeries: Boolean(sid && effectiveSeriesId && sid === effectiveSeriesId),
        doors: [],
      });
    }
    groupMap.get(key)!.doors.push(door);
  }

  return Array.from(groupMap.values()).sort((a, b) => {
    if (a.isDefaultSeries !== b.isDefaultSeries) return a.isDefaultSeries ? -1 : 1;
    if (a.seriesId === null && b.seriesId !== null) return 1;
    if (a.seriesId !== null && b.seriesId === null) return -1;
    return a.seriesName.localeCompare(b.seriesName, 'vi', { sensitivity: 'base' });
  });
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
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(propDefaultBrandId ?? null);
  const [isBrandReady, setIsBrandReady] = useState<boolean>(false);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
  const [groupBySeries, setGroupBySeries] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => (projectId ? getProject(projectId) : null),
    enabled: Boolean(projectId) && isOpen,
  });

  const effectiveBrandId = propDefaultBrandId ?? project?.defaultBrandId ?? project?.defaultBrand?.id ?? null;
  const effectiveSeriesId = propDefaultSeriesId ?? project?.defaultSeriesId ?? project?.defaultSeries?.id ?? null;

  useEffect(() => {
    if (!isOpen) {
      setIsBrandReady(false);
      setSelectedSeriesId(null);
      setSelectedType(null);
      setSearch('');
    }
  }, [isOpen]);

  const { data: brandsData, isLoading: isLoadingBrands } = useQuery({
    queryKey: ['brands-picker', 'aluminum'],
    queryFn: () => getBrands({ limit: 100, brandType: 'aluminum' }),
    enabled: isOpen,
    staleTime: 60_000,
  });

  const brandsList = useMemo<BrandPillItem[]>(() => {
    const raw = (brandsData?.items || []).filter(
      (b) => !b.brandType || b.brandType === 'aluminum' || b.brandType === 'both',
    );
    const enriched = raw.map((b) => ({
      ...b,
      isDefault: Boolean(effectiveBrandId && b.id === effectiveBrandId),
    }));
    return enriched.sort((a, b) => {
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
      return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
    });
  }, [brandsData, effectiveBrandId]);

  useEffect(() => {
    if (!isOpen || isBrandReady) return;
    if (isLoadingBrands || brandsData === undefined) return;
    if (Boolean(projectId) && propDefaultBrandId === undefined && isLoadingProject) return;

    const hasDefaultBrand = Boolean(effectiveBrandId && brandsList.some((b) => b.id === effectiveBrandId));
    const targetBrandId = hasDefaultBrand ? effectiveBrandId : brandsList[0]?.id ?? null;
    setSelectedBrandId(targetBrandId);
    setIsBrandReady(true);
  }, [
    isOpen,
    isBrandReady,
    isLoadingBrands,
    brandsData,
    projectId,
    propDefaultBrandId,
    isLoadingProject,
    effectiveBrandId,
    brandsList,
  ]);

  const handleSelectBrand = (brandId: number | null) => {
    setIsBrandReady(true);
    setSelectedBrandId(brandId);
    setSelectedSeriesId(null);
  };

  const { data: seriesData } = useQuery({
    queryKey: ['series-picker', selectedBrandId ?? 'all'],
    queryFn: () => getDoorSeriesList({ brandId: selectedBrandId ?? undefined, limit: 500 }),
    enabled: isOpen && isBrandReady,
  });

  const seriesList = useMemo(() => {
    const items = seriesData?.items || [];
    return [...items].sort((a, b) => {
      const aDef = Boolean(effectiveSeriesId && a.id === effectiveSeriesId);
      const bDef = Boolean(effectiveSeriesId && b.id === effectiveSeriesId);
      if (aDef !== bDef) return aDef ? -1 : 1;
      return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
    });
  }, [seriesData, effectiveSeriesId]);

  const seriesById = useMemo(() => new Map(seriesList.map((s) => [s.id, s])), [seriesList]);

  const { data: doorsData, isLoading: isLoadingDoors } = useQuery({
    queryKey: ['doors-picker', selectedBrandId ?? 'all'],
    queryFn: () => getDoors({ brandId: selectedBrandId ?? undefined, limit: 1000 }),
    enabled: isOpen && isBrandReady,
  });

  const baseFilteredDoors = useMemo(() => {
    let result = doorsData?.items || [];
    if (selectedSeriesId) {
      result = result.filter((d) => (d.doorSeriesId ?? d.doorSeries?.id) === selectedSeriesId);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (d) => d.name.toLowerCase().includes(q) || Boolean(d.code && d.code.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [doorsData, selectedSeriesId, search]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: baseFilteredDoors.length };
    for (const d of baseFilteredDoors) {
      const norm = d.type ? normalizeDoorType(d.type) : '';
      if (norm) counts[norm] = (counts[norm] || 0) + 1;
    }
    return counts;
  }, [baseFilteredDoors]);

  const filteredDoors = useMemo(() => {
    if (!selectedType) return baseFilteredDoors;
    return baseFilteredDoors.filter((d) => matchDoorType(d.type, selectedType));
  }, [baseFilteredDoors, selectedType]);

  const groupedDoors = useMemo(
    () => buildSeriesGroups(filteredDoors, seriesById, effectiveSeriesId),
    [filteredDoors, seriesById, effectiveSeriesId],
  );

  return {
    selectedBrandId,
    setSelectedBrandId: handleSelectBrand,
    selectedSeriesId,
    setSelectedSeriesId,
    groupBySeries,
    setGroupBySeries,
    selectedType,
    setSelectedType,
    search,
    setSearch,
    effectiveBrandId,
    effectiveSeriesId,
    brandsList,
    seriesList,
    typeCounts,
    filteredDoors,
    groupedDoors,
    isLoadingDoors: !isBrandReady || isLoadingDoors,
  };
}
