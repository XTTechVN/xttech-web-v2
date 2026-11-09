'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PenTool } from 'lucide-react';
import { getBrands, getDoorSeriesList, getProject } from '@/actions';
import { Button, Input, Modal, Select } from '@/components';
import type { Brand, DoorSeries, ProjectDoorPosition, ProjectFloor } from '@/types';

const DOOR_TYPE_OPTIONS = [
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

export interface PositionDrawInitPayload {
  code: string;
  description: string;
  floorId?: number;
  brandId: number | null;
  brand?: Brand;
  doorSeriesId?: number;
  doorSeries?: DoorSeries;
  doorType: string;
  width: number;
  height: number;
  aluminumColor?: string;
}

export interface PositionDrawInitModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  floors: ProjectFloor[];
  selectedFloorId: number | 'all';
  existingPositions: ProjectDoorPosition[];
  onConfirm: (payload: PositionDrawInitPayload) => void;
}

export function generateNextPositionCode(existingPositions: ProjectDoorPosition[]): string {
  const existingCodes = new Set(
    existingPositions.map((p) => (p.code || '').trim().toUpperCase()),
  );
  for (let i = 1; i <= 999; i++) {
    const candidate = `D-${String(i).padStart(2, '0')}`;
    if (!existingCodes.has(candidate)) {
      return candidate;
    }
  }
  return `D-${existingPositions.length + 1}`;
}

interface PositionDrawInitFormProps {
  onClose: () => void;
  projectId: number;
  floors: ProjectFloor[];
  selectedFloorId: number | 'all';
  suggestedCode: string;
  onConfirm: (payload: PositionDrawInitPayload) => void;
}

function PositionDrawInitForm({
  onClose,
  projectId,
  floors,
  selectedFloorId,
  suggestedCode,
  onConfirm,
}: PositionDrawInitFormProps) {
  const [code, setCode] = useState<string>(suggestedCode);
  const [description, setDescription] = useState<string>('');
  const [floorId, setFloorId] = useState<number>(
    typeof selectedFloorId === 'number' ? selectedFloorId : floors[0]?.id || 0,
  );
  const [doorType, setDoorType] = useState<string>('casement_door');
  const [width, setWidth] = useState<number>(1200);
  const [height, setHeight] = useState<number>(2200);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
    enabled: Boolean(projectId),
  });

  const defaultProjectBrandId = project?.defaultBrandId ?? project?.defaultBrand?.id ?? null;
  const defaultProjectSeriesId = project?.defaultSeriesId ?? project?.defaultSeries?.id ?? null;

  const { data: brandsData, isLoading: isLoadingBrands } = useQuery({
    queryKey: ['brands-picker', 'aluminum'],
    queryFn: () => getBrands({ limit: 100, brandType: 'aluminum' }),
    staleTime: 60_000,
  });

  const brandsList = useMemo<Brand[]>(() => {
    const raw = (brandsData?.items || []).filter(
      (b) => !b.brandType || b.brandType === 'aluminum' || b.brandType === 'both',
    );
    return [...raw].sort((a, b) => {
      const aDef = Boolean(defaultProjectBrandId && a.id === defaultProjectBrandId);
      const bDef = Boolean(defaultProjectBrandId && b.id === defaultProjectBrandId);
      if (aDef !== bDef) return aDef ? -1 : 1;
      return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
    });
  }, [brandsData, defaultProjectBrandId]);

  const effectiveBrandId = useMemo<number | null>(() => {
    if (selectedBrandId && brandsList.some((b) => b.id === selectedBrandId)) {
      return selectedBrandId;
    }
    if (defaultProjectBrandId && brandsList.some((b) => b.id === defaultProjectBrandId)) {
      return defaultProjectBrandId;
    }
    return brandsList[0]?.id ?? defaultProjectBrandId ?? null;
  }, [selectedBrandId, defaultProjectBrandId, brandsList]);

  const { data: seriesData, isLoading: isLoadingSeries } = useQuery({
    queryKey: ['series-picker', effectiveBrandId ?? 'all'],
    queryFn: () => getDoorSeriesList({ brandId: effectiveBrandId ?? undefined, limit: 500 }),
    enabled: effectiveBrandId !== null,
  });

  const seriesList = useMemo<DoorSeries[]>(() => {
    const items = seriesData?.items || [];
    return [...items].sort((a, b) => {
      const aDef = Boolean(defaultProjectSeriesId && a.id === defaultProjectSeriesId);
      const bDef = Boolean(defaultProjectSeriesId && b.id === defaultProjectSeriesId);
      if (aDef !== bDef) return aDef ? -1 : 1;
      return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
    });
  }, [seriesData, defaultProjectSeriesId]);

  const effectiveSeriesId = useMemo<number | undefined>(() => {
    if (selectedSeriesId && seriesList.some((s) => s.id === selectedSeriesId)) {
      return selectedSeriesId;
    }
    if (defaultProjectSeriesId && seriesList.some((s) => s.id === defaultProjectSeriesId)) {
      return defaultProjectSeriesId;
    }
    return seriesList[0]?.id ?? undefined;
  }, [selectedSeriesId, defaultProjectSeriesId, seriesList]);

  const trimmedCode = code.trim();
  const isValid =
    Boolean(trimmedCode) &&
    Number(width) >= 100 &&
    Number(height) >= 100 &&
    Boolean(effectiveBrandId) &&
    Boolean(effectiveSeriesId);

  const handleStartDrawing = () => {
    if (!isValid) return;
    const chosenBrand = brandsList.find((b) => b.id === effectiveBrandId);
    const chosenSeries = seriesList.find((s) => s.id === effectiveSeriesId);
    const typeLabel =
      DOOR_TYPE_OPTIONS.find((opt) => opt.value === doorType)?.label || 'Cửa nhôm kính';
    const finalDescription =
      description.trim() ||
      `${typeLabel}${chosenSeries?.code ? ` ${chosenSeries.code}` : ''}`;

    onConfirm({
      code: trimmedCode,
      description: finalDescription,
      floorId: floorId > 0 ? floorId : undefined,
      brandId: effectiveBrandId,
      brand: chosenBrand,
      doorSeriesId: effectiveSeriesId,
      doorSeries: chosenSeries,
      doorType,
      width: Number(width),
      height: Number(height),
      aluminumColor: project?.defaultColor?.colorHex || undefined,
    });
  };

  return (
    <div className="p-4 space-y-3.5">
      <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-slate-600">
        Chọn <strong className="text-slate-800">Hãng nhôm & Hệ nhôm</strong> ngay từ bước khởi tạo.
        Sau khi vào bàn vẽ CAD, hãng nhôm sẽ được cố định cho bộ cửa này.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
        <Select
          label="Hãng nhôm *"
          value={effectiveBrandId ? String(effectiveBrandId) : ''}
          onChange={(e) => {
            const nextBrandId = e.target.value ? Number(e.target.value) : null;
            setSelectedBrandId(nextBrandId);
            setSelectedSeriesId(null);
          }}
          placeholder={isLoadingBrands ? 'Đang tải hãng nhôm...' : 'Chọn hãng nhôm...'}
          options={brandsList.map((b) => ({
            value: String(b.id),
            label:
              defaultProjectBrandId && b.id === defaultProjectBrandId
                ? `${b.name} (Mặc định dự án)`
                : b.name,
          }))}
          fullWidth
        />

        <Select
          label="Hệ nhôm *"
          value={effectiveSeriesId ? String(effectiveSeriesId) : ''}
          onChange={(e) => setSelectedSeriesId(e.target.value ? Number(e.target.value) : null)}
          placeholder={isLoadingSeries ? 'Đang tải hệ nhôm...' : 'Chọn hệ nhôm...'}
          options={seriesList.map((s) => ({
            value: String(s.id),
            label:
              defaultProjectSeriesId && s.id === defaultProjectSeriesId
                ? `${s.name} (Mặc định dự án)`
                : s.name,
          }))}
          disabled={!effectiveBrandId || seriesList.length === 0}
          fullWidth
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
        <Input
          label="Mã vị trí cửa (Code) *"
          placeholder="VD: D-01"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
          fullWidth
        />

        {floors.length > 0 ? (
          <Select
            label="Tầng bố trí *"
            value={floorId ? String(floorId) : ''}
            onChange={(e) => setFloorId(Number(e.target.value))}
            options={floors.map((fl) => ({
              value: String(fl.id),
              label: fl.name,
            }))}
            fullWidth
          />
        ) : (
          <Select
            label="Loại cửa"
            value={doorType}
            onChange={(e) => setDoorType(e.target.value)}
            options={DOOR_TYPE_OPTIONS}
            fullWidth
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
        {floors.length > 0 && (
          <Select
            label="Loại cửa"
            value={doorType}
            onChange={(e) => setDoorType(e.target.value)}
            options={DOOR_TYPE_OPTIONS}
            fullWidth
          />
        )}
        <Input
          type="number"
          label="Rộng (mm) *"
          min={100}
          value={width || ''}
          onChange={(e) => setWidth(Number(e.target.value))}
          fullWidth
        />
        <Input
          type="number"
          label="Cao (mm) *"
          min={100}
          value={height || ''}
          onChange={(e) => setHeight(Number(e.target.value))}
          fullWidth
        />
      </div>

      <Input
        label="Mô tả / Vị trí lắp đặt"
        placeholder="VD: Cửa đi mặt tiền tầng 1"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
      />

      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          Hủy
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<PenTool size={14} />}
          disabled={!isValid}
          onClick={handleStartDrawing}
        >
          Bắt đầu vẽ
        </Button>
      </div>
    </div>
  );
}

export function PositionDrawInitModal({
  isOpen,
  onClose,
  projectId,
  floors,
  selectedFloorId,
  existingPositions,
  onConfirm,
}: PositionDrawInitModalProps) {
  const suggestedCode = useMemo(
    () => generateNextPositionCode(existingPositions),
    [existingPositions],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Khởi tạo thông số vẽ cửa mới"
      size="md"
      className="max-w-lg w-full p-0 overflow-hidden"
    >
      {isOpen && (
        <PositionDrawInitForm
          key={`${projectId}-${String(selectedFloorId)}-${suggestedCode}`}
          onClose={onClose}
          projectId={projectId}
          floors={floors}
          selectedFloorId={selectedFloorId}
          suggestedCode={suggestedCode}
          onConfirm={onConfirm}
        />
      )}
    </Modal>
  );
}

