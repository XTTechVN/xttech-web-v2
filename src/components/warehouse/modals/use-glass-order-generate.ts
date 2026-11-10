'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { createProjectGlassOrder, getGlasses, previewProjectGlassPanes } from '@/actions';
import { getProjectFloors } from '@/actions/project';
import { Glass, GlassPanePreviewItem, ProjectFloor } from '@/types';
import { showErrorToast } from '@/utils';
import { DoorOption, EditablePaneItem } from './glass-order-panes-editor';

interface UseGlassOrderGenerateParams {
  projectId?: number;
  productionOrderId?: number;
  onSuccess: () => void;
  onClose: () => void;
}

function mapPreviewToEditablePanes(
  data: GlassPanePreviewItem[],
  glassFilter: string,
): { panes: EditablePaneItem[]; doors: DoorOption[] } {
  const filtered = glassFilter ? data.filter((it) => it.glassType === glassFilter) : data;
  const panes: EditablePaneItem[] = filtered.map((it, idx) => ({
    tempId: `preview_${idx}_${Date.now()}`,
    positionId: it.positionId,
    positionCode: it.positionCode,
    doorName: it.doorName,
    sourcePositionRevision: it.sourcePositionRevision,
    paneSource: 'door',
    manualReason: null,
    paneLabel: it.paneLabel || `Ô kính ${idx + 1}`,
    widthMm: it.widthMm,
    heightMm: it.heightMm,
    glassType: it.glassType,
    grindType: it.grindType || 'grind_edge',
    unitPrice: 0,
    isMeasured: it.isMeasured !== false,
  }));
  const doorMap = new Map<number, DoorOption>();
  for (const it of filtered) {
    if (it.positionId && !doorMap.has(it.positionId)) {
      doorMap.set(it.positionId, { id: it.positionId, code: it.positionCode || `Cửa #${it.positionId}`, name: it.doorName, isMeasured: it.isMeasured !== false });
    }
  }
  return { panes, doors: Array.from(doorMap.values()) };
}

export function useGlassOrderGenerate({ projectId, productionOrderId, onSuccess, onClose }: UseGlassOrderGenerateParams) {
  const [expectedDate, setExpectedDate] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [panes, setPanes] = useState<EditablePaneItem[]>([]);
  const [knownDoors, setKnownDoors] = useState<DoorOption[]>([]);
  const [allProjectGlassTypes, setAllProjectGlassTypes] = useState<string[]>([]);
  const [catalogGlasses, setCatalogGlasses] = useState<Glass[]>([]);
  const [floors, setFloors] = useState<ProjectFloor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<number | undefined>();
  const [filterGlassType, setFilterGlassType] = useState('');
  const [isLoadingPanes, setIsLoadingPanes] = useState<boolean>(() => Boolean(projectId));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [floorList, glassRes, previewData] = await Promise.all([
          projectId ? getProjectFloors(projectId).catch(() => []) : Promise.resolve([]),
          getGlasses({ limit: 999, isActive: true }).catch(() => null),
          projectId ? previewProjectGlassPanes(projectId, { productionOrderId, defaultUnitPrice: 0 }) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setFloors(floorList || []);
        setCatalogGlasses((glassRes?.items || []).filter((g) => !g.category?.materialType || g.category.materialType === 'glass'));
        setAllProjectGlassTypes(Array.from(new Set(previewData.map((it) => it.glassType).filter(Boolean))));
        const mapped = mapPreviewToEditablePanes(previewData, '');
        setPanes(mapped.panes);
        setKnownDoors(mapped.doors);
      } catch (err: unknown) {
        if (!cancelled) { showErrorToast(err, 'Không thể bóc tách ô kính tự động'); setPanes([]); }
      } finally {
        if (!cancelled) setIsLoadingPanes(false);
      }
    })();
    return () => { cancelled = true; };
  }, [projectId, productionOrderId]);

  const reloadPreview = useCallback(async (floorId: number | undefined, glassType: string) => {
    if (!projectId) return;
    setIsLoadingPanes(true);
    try {
      const data = await previewProjectGlassPanes(projectId, { productionOrderId, defaultUnitPrice: 0, floorId });
      setAllProjectGlassTypes(Array.from(new Set(data.map((it) => it.glassType).filter(Boolean))));
      const mapped = mapPreviewToEditablePanes(data, glassType);
      setPanes(mapped.panes);
      setKnownDoors(mapped.doors);
    } catch (err: unknown) {
      showErrorToast(err, 'Không thể bóc tách ô kính tự động');
      setPanes([]);
    } finally {
      setIsLoadingPanes(false);
    }
  }, [projectId, productionOrderId]);

  const handleFloorChange = (nextFloorId: number | undefined) => { setSelectedFloorId(nextFloorId); reloadPreview(nextFloorId, filterGlassType); };
  const handleFilterGlassChange = (nextType: string) => { setFilterGlassType(nextType); reloadPreview(selectedFloorId, nextType); };

  const availableGlassTypes = useMemo(() => Array.from(new Set([...allProjectGlassTypes, ...panes.map((p) => p.glassType).filter(Boolean)])), [allProjectGlassTypes, panes]);
  const glassCatalogNames = useMemo(() => Array.from(new Set([...catalogGlasses.map((g) => g.name).filter(Boolean), ...availableGlassTypes])), [catalogGlasses, availableGlassTypes]);
  const defaultGlassType = useMemo(() => catalogGlasses.find((g) => g.isDefault)?.name || catalogGlasses[0]?.name || availableGlassTypes[0], [catalogGlasses, availableGlassTypes]);

  const summary = useMemo(() => {
    let manualCount = 0, unmeasuredCount = 0, totalArea = 0;
    for (const p of panes) {
      totalArea += (p.widthMm * p.heightMm) / 1_000_000.0;
      if (p.paneSource === 'manual' || !p.positionId) manualCount += 1;
      else if (p.isMeasured === false) unmeasuredCount += 1;
    }
    return { totalPanes: panes.length, manualCount, unmeasuredCount, totalArea: Number(totalArea.toFixed(3)) };
  }, [panes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || panes.length === 0) {
      toast.error(!projectId ? 'Dự án không hợp lệ' : 'Đơn đặt kính cần có ít nhất 1 tấm kính');
      return;
    }
    const unmeasured = panes.filter((p) => (p.paneSource === 'door' || p.positionId) && p.isMeasured === false);
    if (unmeasured.length > 0) {
      const codes = Array.from(new Set(unmeasured.map((p) => p.positionCode || 'N/A'))).join(', ');
      toast.error(`Không thể tạo đơn kính: Các cửa [${codes}] chưa được khảo sát đo ô chờ thực tế!`);
      return;
    }
    if (panes.some((p) => (p.paneSource === 'manual' || !p.positionId) && (!p.manualReason || p.paneLabel.trim().length < 2))) {
      toast.error('Ô kính lẻ bắt buộc chọn Lý do đặt kính và nhập Ký hiệu ít nhất 2 ký tự!');
      return;
    }

    setIsSubmitting(true);
    try {
      await createProjectGlassOrder(projectId, {
        productionOrderId,
        expectedDate: expectedDate || undefined,
        note: orderNote.trim() || undefined,
        items: panes.map((p) => {
          const isManual = p.paneSource === 'manual' || !p.positionId;
          return {
            positionId: isManual ? null : p.positionId,
            sourcePositionRevision: isManual ? null : (p.sourcePositionRevision ?? 1),
            manualReason: isManual ? (p.manualReason || 'spare') : undefined,
            paneLabel: p.paneLabel, widthMm: p.widthMm, heightMm: p.heightMm,
            glassType: p.glassType, grindType: p.grindType, unitPrice: 0,
          };
        }),
      });
      toast.success('Đã lập đơn đặt kính thành công!');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi tạo đơn đặt kính');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    expectedDate, setExpectedDate, orderNote, setOrderNote, panes, setPanes, knownDoors, floors,
    selectedFloorId, handleFloorChange, filterGlassType, handleFilterGlassChange,
    availableGlassTypes, glassCatalogNames, defaultGlassType, summary, isLoadingPanes, isSubmitting, handleSubmit,
  };
}
