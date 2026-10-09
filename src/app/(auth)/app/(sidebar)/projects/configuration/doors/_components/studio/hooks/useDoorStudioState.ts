/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Door, DoorCreate, DoorUpdate, DoorCalculateResponse, SelectedAccessoryItem } from '@/types';
import { calculateDoor, createDoor, updateDoor, getDoorSeriesList, getProfileBars, getAccessoryCombos, getAccessories, getGlasses, getBrandColors, getBrands, } from '@/actions';
import { FrameShape, SashOpenType, SceneCellNode, StudioMainTab, FrameConfig, SashConfig, DEFAULT_FRAME_CONFIG, DEFAULT_SASH_CONFIG, MullionInfo, MullionCutType, ColorSwatch, ALUMINUM_PALETTE, GlassGrilleConfig, } from '../studio-types';
import { ResizeSplitParams } from '../cad-engine/door-cad-renderer';
import { updateNode, findNode, findParentNode, createDefaultRootCell, rescaleTree, createSplitChildren, applySashTypeToCluster, resizeCellInParent, } from '../utils/door-tree-utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';

interface UseDoorStudioStateProps {
  isOpen: boolean;
  onClose: () => void;
  door?: Door | null;
  defaultBrandId?: number | null;
}

export function useDoorStudioState({ isOpen, onClose, door, defaultBrandId }: UseDoorStudioStateProps) {
  // Navigation Tabs
  const [activeMainTab, setActiveMainTab] = useState<StudioMainTab>('draw');

  // Selected Brand State
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);

  // Basic Door State
  const [w, setW] = useState<number>(1400);
  const [h, setH] = useState<number>(1600);
  const [name, setName] = useState<string>('Vách kính cố định');
  const [code, setCode] = useState<string>('');
  const [type, setType] = useState<string>('ck');
  const [aluminumColor, setAluminumColor] = useState<string>('#955F20');
  const [hardwareColor, setHardwareColor] = useState<string>('#1E293B');
  const [frameShape, setFrameShape] = useState<FrameShape>('rect');
  const [seriesId, setSeriesId] = useState<number | undefined>(1);
  const prevSeriesIdRef = useRef<number | undefined>(undefined);
  const [selectedComboIds, setSelectedComboIds] = useState<number[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<SelectedAccessoryItem[]>([]);

  // Flexible Configurations (Frame & Sash)
  const [frameConfig, setFrameConfig] = useState<FrameConfig>(DEFAULT_FRAME_CONFIG);
  const [sashConfig, setSashConfig] = useState<SashConfig>(DEFAULT_SASH_CONFIG);

  // Drawing View State
  const [activeLeftTab, setActiveLeftTab] = useState<'frame' | 'sash'>('sash');
  const [currentSashType, setCurrentSashType] = useState<SashOpenType>('fixed');
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [selectedMullion, setSelectedMullion] = useState<MullionInfo | null>(null);
  const [isMullionModalOpen, setIsMullionModalOpen] = useState<boolean>(false);
  const [isGrilleModalOpen, setIsGrilleModalOpen] = useState<boolean>(false);
  const [grilleEditingCell, setGrilleEditingCell] = useState<SceneCellNode | null>(null);

  // Scene Graph Root: Mặc định là Vách kính cố định (fixed)
  const [rootCell, setRootCell] = useState<SceneCellNode>(() => createDefaultRootCell(1400, 1600));

  // Undo / Redo Stack
  const [history, setHistory] = useState<SceneCellNode[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [calcData, setCalcData] = useState<DoorCalculateResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Fetch Door Series
  const { data: seriesData } = useQuery({
    queryKey: ['door-series-list'],
    queryFn: () => getDoorSeriesList({ limit: 9999 }),
    enabled: isOpen,
  });
  const allAvailableSeries = seriesData?.items || [];
  const availableSeries = useMemo(() => {
    if (!selectedBrandId) return allAvailableSeries;
    return allAvailableSeries.filter((s) => s.brandId === selectedBrandId);
  }, [allAvailableSeries, selectedBrandId]);

  // Fetch Profile Bars (filtered by seriesId)
  const { data: profilesData } = useQuery({
    queryKey: ['profile-bars', seriesId],
    queryFn: () => getProfileBars({ seriesId: seriesId || undefined, limit: 300 }),
    enabled: isOpen,
  });
  const availableProfiles = useMemo(() => profilesData?.items || [], [profilesData]);

  const availableBeads = useMemo(() => {
    return availableProfiles.filter(
      (p) => p.barType?.toUpperCase() === 'BEAD' || (p as any).category === 'bead'
    );
  }, [availableProfiles]);

  // Fetch Brands (Chỉ lấy hãng nhôm: brandType === 'aluminum')
  const { data: brandsData } = useQuery({
    queryKey: ['brands-list', 'aluminum'],
    queryFn: () => getBrands({ limit: 9999, isActive: true, brandType: 'aluminum' }),
    enabled: isOpen,
  });
  const availableBrands = useMemo(() => {
    const list = (brandsData?.items || []).filter((b) => !b.brandType || b.brandType === 'aluminum');
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [brandsData]);

  // Fetch Accessory Combos (Đầy đủ toàn bộ combo từ CSDL)
  const { data: combosData } = useQuery({
    queryKey: ['accessory-combos-list'],
    queryFn: () => getAccessoryCombos({ limit: 500 }),
    enabled: isOpen,
  });
  const availableCombos = combosData?.items || [];

  // Fetch Individual Accessories
  const { data: accessoriesData } = useQuery({
    queryKey: ['accessories-list'],
    queryFn: () => getAccessories({ limit: 1000, isActive: true }),
    enabled: isOpen,
  });
  const availableAccessories = accessoriesData?.items || [];

  // Fetch Glasses (for CellInspector dropdown)
  const { data: glassesData } = useQuery({
    queryKey: ['glasses-list'],
    queryFn: () => getGlasses({ limit: 200, isActive: true }),
    enabled: isOpen,
  });
  const availableGlasses = useMemo(() => glassesData?.items || [], [glassesData]);

  const defaultGlass = useMemo(() => {
    return availableGlasses.find((g) => g.isDefault) || availableGlasses[0] || null;
  }, [availableGlasses]);

  // Lấy brandId đang active
  const brandId = selectedBrandId;

  // Fetch danh sách màu thực tế của Hãng từ Database
  const { data: brandColorsData } = useQuery({
    queryKey: ['brand-colors', brandId],
    queryFn: () => getBrandColors({ brandId: brandId || undefined, limit: 100, isActive: true }),
    enabled: isOpen && !!brandId,
  });
  const availableBrandColors = useMemo(() => brandColorsData?.items || [], [brandColorsData]);

  // Bảng màu nhôm động
  const dynamicAluminumColors: ColorSwatch[] =
    availableBrandColors.length > 0
      ? availableBrandColors.map((bc) => ({
          code: bc.code,
          name: bc.name,
          colorHex: bc.colorHex,
        }))
      : ALUMINUM_PALETTE;

  // Tự động fallback màu khi người dùng đổi hệ nhôm trong Studio
  useEffect(() => {
    if (
      prevSeriesIdRef.current !== undefined &&
      seriesId !== undefined &&
      prevSeriesIdRef.current !== seriesId
    ) {
      prevSeriesIdRef.current = seriesId;
      if (availableBrandColors.length > 0) {
        const cleanCurrent = (aluminumColor || '').trim().toLowerCase();
        const exists = availableBrandColors.some(
          (c) => (c.colorHex || '').trim().toLowerCase() === cleanCurrent
        );
        if (!exists) {
          const defaultColor =
            availableBrandColors.find((c) => c.isDefault) || availableBrandColors[0];
          if (defaultColor) {
            setAluminumColor(defaultColor.colorHex.trim());
          }
        }
      }
    }
  }, [seriesId, availableBrandColors, aluminumColor]);

  // Khởi tạo hoặc nạp lại state khi sửa cửa cũ, HOẶC reset toàn bộ khi thêm cửa mới
  useEffect(() => {
    if (!isOpen) return;

    if (door) {
      if (door.name) setName(door.name);
      if (door.code) setCode(door.code);
      if (door.type) setType(door.type);

      const sc = (door.systemConfig || {}) as Record<string, any>;
      if (sc.w) setW(sc.w);
      if (sc.h) setH(sc.h);
      if (sc.frameShape) setFrameShape(sc.frameShape);
      const rawColor = (sc.aluminumColor || sc.surface_color || '').trim();
      if (rawColor) setAluminumColor(rawColor);
      const rawHwColor = (sc.hardwareColor || '').trim();
      if (rawHwColor) setHardwareColor(rawHwColor);
      if (sc.seriesId) {
        setSeriesId(sc.seriesId);
        prevSeriesIdRef.current = sc.seriesId;
        const curSeries = allAvailableSeries.find((s) => s.id === sc.seriesId);
        if (curSeries?.brandId) setSelectedBrandId(curSeries.brandId);
        else if (door.doorSeries?.brandId) setSelectedBrandId(door.doorSeries.brandId);
      } else if (door.doorSeriesId) {
        setSeriesId(door.doorSeriesId);
        prevSeriesIdRef.current = door.doorSeriesId;
        if (door.doorSeries?.brandId) setSelectedBrandId(door.doorSeries.brandId);
      } else if (defaultBrandId) {
        setSelectedBrandId(defaultBrandId);
        setSeriesId(undefined);
        prevSeriesIdRef.current = undefined;
      }
      if (sc.selectedComboIds && Array.isArray(sc.selectedComboIds)) {
        setSelectedComboIds(sc.selectedComboIds);
      } else if (sc.selectedComboId) {
        setSelectedComboIds([sc.selectedComboId]);
      } else {
        setSelectedComboIds([]);
      }
      if (sc.selectedAccessories && Array.isArray(sc.selectedAccessories)) {
        const cleanAccs = sc.selectedAccessories
          .filter((a: any) => a && (a.accessoryId || a.accessory_id))
          .map((a: any) => ({
            accessoryId: Number(a.accessoryId || a.accessory_id),
            quantity: Number(a.quantity || a.qty || 1),
            note: a.note || null,
          }));
        setSelectedAccessories(cleanAccs);
      } else {
        setSelectedAccessories([]);
      }
      if (sc.frameConfig) {
        setFrameConfig({
          ...DEFAULT_FRAME_CONFIG,
          ...sc.frameConfig,
          leftEdge: { ...DEFAULT_FRAME_CONFIG.leftEdge, ...(sc.frameConfig.leftEdge || {}) },
          topEdge: { ...DEFAULT_FRAME_CONFIG.topEdge, ...(sc.frameConfig.topEdge || {}) },
          rightEdge: { ...DEFAULT_FRAME_CONFIG.rightEdge, ...(sc.frameConfig.rightEdge || {}) },
          bottomEdge: { ...DEFAULT_FRAME_CONFIG.bottomEdge, ...(sc.frameConfig.bottomEdge || {}) },
          archConfig: {
            ...(DEFAULT_FRAME_CONFIG.archConfig || { isCutAtApex: false, bendingClampingMm: 400 }),
            ...(sc.frameConfig.archConfig || {}),
          },
        });
      }
      const defaultFamily = door?.type === 'cd' ? 'Cửa đi mở quay' : 'Cửa sổ mở quay/Hất';
      if (sc.sashConfig) {
        setSashConfig({
          ...DEFAULT_SASH_CONFIG,
          family: sc.sashConfig.family || defaultFamily,
          ...sc.sashConfig,
        });
      } else {
        setSashConfig({
          ...DEFAULT_SASH_CONFIG,
          family: defaultFamily,
        });
      }
      if (sc.rootCell) {
        setRootCell(sc.rootCell);
        setHistory([sc.rootCell]);
        setHistoryIdx(0);
      }
      setSelectedCellId(null);
      setSelectedMullion(null);
      setIsMullionModalOpen(false);
      setCalcData(null);
      setActiveMainTab('draw');
    } else {
      const defaultW = 1400;
      const defaultH = 1600;
      const initialRoot = createDefaultRootCell(defaultW, defaultH);

      setName('Cửa đi mở quay');
      setCode('');
      setType('casement_door');
      setW(defaultW);
      setH(defaultH);
      setFrameShape('rect');
      setAluminumColor('#955F20');
      setHardwareColor('#1E293B');
      const initialBrandId = defaultBrandId || (availableBrands[0]?.id ?? null);
      setSelectedBrandId(initialBrandId);
      const brandSeriesList = initialBrandId
        ? allAvailableSeries.filter((s) => s.brandId === initialBrandId)
        : allAvailableSeries;
      const initialSeriesId = brandSeriesList[0]?.id || undefined;
      setSeriesId(initialSeriesId);
      prevSeriesIdRef.current = initialSeriesId;
      setSelectedComboIds([]);
      setSelectedAccessories([]);
      setFrameConfig(DEFAULT_FRAME_CONFIG);
      setSashConfig(DEFAULT_SASH_CONFIG);
      setCurrentSashType('fixed');
      setRootCell(initialRoot);
      setHistory([initialRoot]);
      setHistoryIdx(0);
      setSelectedCellId(null);
      setSelectedMullion(null);
      setIsMullionModalOpen(false);
      setCalcData(null);
      setIsCalculating(false);
      setActiveMainTab('draw');
    }
  }, [door, isOpen, defaultBrandId, allAvailableSeries.length]);

  const pushState = (newRoot: SceneCellNode) => {
    const nextHist = [...history.slice(0, historyIdx + 1), newRoot];
    setHistory(nextHist);
    setHistoryIdx(nextHist.length - 1);
    setRootCell(newRoot);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setRootCell(history[historyIdx - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setRootCell(history[historyIdx + 1]);
    }
  };

  const handleReset = () => {
    const initRoot: SceneCellNode = createDefaultRootCell(w, h);
    setRootCell(initRoot);
    setHistory([initRoot]);
    setHistoryIdx(0);
    setSelectedCellId(null);
    setSelectedMullion(null);
    setIsMullionModalOpen(false);
    toast.success('Đã làm mới bản vẽ cửa về mặc định');
  };

  const handleChangeDimension = (newW: number, newH: number) => {
    const scaleX = newW / (w || 1);
    const scaleY = newH / (h || 1);
    setW(newW);
    setH(newH);
    pushState(rescaleTree(rootCell, scaleX, scaleY));
  };

  const handleSplitMullion = (count: number, direction: 'vertical' | 'horizontal') => {
    const countClamped = Math.max(2, Math.min(6, count));
    const targetNode = selectedCellId ? findNode(rootCell, selectedCellId) : null;
    const target = targetNode || rootCell;

    const children = createSplitChildren(target.id, target.w, target.h, countClamped, direction, 'fixed');
    const updated = updateNode(rootCell, target.id, {
      splitDirection: direction,
      splitType: 'mullion',
      children,
    });
    pushState(updated);
    if (children.length > 0) setSelectedCellId(children[0].id);
  };

  const handleCoupleFrame = (direction: 'vertical' | 'horizontal') => {
    const targetNode = selectedCellId ? findNode(rootCell, selectedCellId) : null;
    const target = targetNode || rootCell;

    const children = createSplitChildren(target.id, target.w, target.h, 2, direction, 'fixed');
    const updated = updateNode(rootCell, target.id, {
      splitDirection: direction,
      splitType: 'coupling',
      children,
    });
    pushState(updated);
    if (children.length > 0) setSelectedCellId(children[0].id);
  };

  const handleSelectSashType = (sashType: SashOpenType) => {
    setCurrentSashType(sashType);
    const targetId = selectedCellId || (rootCell.children?.[0]?.id || rootCell.id);
    const { updatedRoot, nextSelectedId } = applySashTypeToCluster(rootCell, targetId, sashType);
    pushState(updatedRoot);
    if (nextSelectedId) {
      setSelectedCellId(nextSelectedId);
    }
  };

  const handleUpdateDimension = (
    target: 'w' | 'h' | 'cell' | 'cell-w' | 'cell-h' | 'handleHeight',
    value: number,
    cellId?: string
  ) => {
    if (target === 'w') {
      handleChangeDimension(value, h);
    } else if (target === 'h') {
      handleChangeDimension(w, value);
    } else if (target === 'handleHeight' && cellId) {
      const clampedVal = Math.max(200, Math.min(h - 100, value));
      pushState(updateNode(rootCell, cellId, { handleHeight: clampedVal }));
      toast.success(`Đã cập nhật cao độ khóa: ${clampedVal} mm`);
    } else if (target === 'cell-h' && cellId) {
      const tryH = resizeCellInParent(rootCell, cellId, value, 'h');
      pushState(tryH);
    } else if ((target === 'cell-w' || target === 'cell') && cellId) {
      const tryW = resizeCellInParent(rootCell, cellId, value, 'w');
      const tryH = resizeCellInParent(rootCell, cellId, value, 'h');
      const changed = JSON.stringify(tryW) !== JSON.stringify(rootCell) ? tryW : (target === 'cell' ? tryH : rootCell);
      pushState(changed);
    }
  };

  const handleUpdateSelectedCell = (updates: Partial<SceneCellNode>) => {
    if (!selectedCellId) return;
    if (updates.sashType) {
      setCurrentSashType(updates.sashType);
      const { updatedRoot, nextSelectedId } = applySashTypeToCluster(rootCell, selectedCellId, updates.sashType);
      pushState(updatedRoot);
      if (nextSelectedId) {
        setSelectedCellId(nextSelectedId);
      }
      return;
    }
    pushState(updateNode(rootCell, selectedCellId, updates));
  };

  const handleSelectMullion = (mullion: MullionInfo) => {
    setSelectedMullion(mullion);
    setIsMullionModalOpen(true);
  };

  const handleSaveMullion = (params: {
    dimension: number;
    profileId?: number;
    cutType?: MullionCutType;
  }) => {
    if (!selectedMullion) return;
    const parentNode = findNode(rootCell, selectedMullion.parentNodeId);
    if (!parentNode || !parentNode.children || parentNode.children.length < 2) return;

    const idx = selectedMullion.mullionIndex;
    const isVert = selectedMullion.direction === 'vertical';
    const child = parentNode.children[idx];
    const nextChild = parentNode.children[idx + 1];

    const oldDim = isVert ? child.w : child.h;
    const newDim = Math.max(100, params.dimension);
    const delta = newDim - oldDim;

    const newChildren = parentNode.children.map((c, i) => {
      if (i === idx) {
        return {
          ...c,
          w: isVert ? newDim : c.w,
          h: isVert ? c.h : newDim,
          mullionProfileId: params.profileId,
          mullionCutType: params.cutType,
        };
      }
      if (i === idx + 1 && nextChild) {
        const oldNextDim = isVert ? nextChild.w : nextChild.h;
        const newNextDim = Math.max(100, oldNextDim - delta);
        return {
          ...c,
          w: isVert ? newNextDim : c.w,
          h: isVert ? c.h : newNextDim,
        };
      }
      return c;
    });

    pushState(updateNode(rootCell, parentNode.id, { children: newChildren }));
    toast.success('Cập nhật thông số đố thành công');
  };

  const handleResizeSplit = ({
    parentNodeId,
    splitIndex,
    direction,
    newDimension,
    isFinal,
  }: ResizeSplitParams) => {
    const parentNode = findNode(rootCell, parentNodeId);
    if (!parentNode || !parentNode.children || parentNode.children.length < splitIndex + 2) return;

    const idx = splitIndex;
    const isVert = direction === 'vertical';
    const child = parentNode.children[idx];
    const nextChild = parentNode.children[idx + 1];

    const oldDim1 = isVert ? child.w : child.h;
    const oldDim2 = isVert ? nextChild.w : nextChild.h;
    const totalDim = oldDim1 + oldDim2;

    const clampedDim1 = Math.max(100, Math.min(totalDim - 100, newDimension));
    const clampedDim2 = totalDim - clampedDim1;

    const updatedChild = rescaleTree(
      child,
      isVert ? clampedDim1 / (oldDim1 || 1) : 1,
      isVert ? 1 : clampedDim1 / (oldDim1 || 1)
    );
    const updatedNextChild = rescaleTree(
      nextChild,
      isVert ? clampedDim2 / (oldDim2 || 1) : 1,
      isVert ? 1 : clampedDim2 / (oldDim2 || 1)
    );

    const newChildren = [...parentNode.children];
    newChildren[idx] = {
      ...updatedChild,
      w: isVert ? clampedDim1 : updatedChild.w,
      h: isVert ? updatedChild.h : clampedDim1,
    };
    newChildren[idx + 1] = {
      ...updatedNextChild,
      w: isVert ? clampedDim2 : updatedNextChild.w,
      h: isVert ? updatedNextChild.h : clampedDim2,
    };

    const updatedRoot = updateNode(rootCell, parentNode.id, { children: newChildren });

    if (isFinal) {
      pushState(updatedRoot);
    } else {
      setRootCell(updatedRoot);
    }
  };

  const handleDeleteMullion = () => {
    if (!selectedMullion) return;
    const parentNode = findNode(rootCell, selectedMullion.parentNodeId);
    if (!parentNode || !parentNode.children || parentNode.children.length === 0) return;

    const idx = selectedMullion.mullionIndex;
    const isVert = selectedMullion.direction === 'vertical';

    if (parentNode.children.length <= 2) {
      const mergedNode: Partial<SceneCellNode> = {
        children: [],
        splitDirection: undefined,
        splitType: undefined,
        sashType: parentNode.children[0]?.sashType || 'fixed',
        paneType: parentNode.children[0]?.paneType || 'glass',
      };
      pushState(updateNode(rootCell, parentNode.id, mergedNode));
    } else {
      const c1 = parentNode.children[idx];
      const c2 = parentNode.children[idx + 1];
      const mergedSpan = (isVert ? c1.w : c1.h) + (isVert ? c2.w : c2.h);

      const mergedChild: SceneCellNode = {
        ...c1,
        w: isVert ? mergedSpan : c1.w,
        h: isVert ? c1.h : mergedSpan,
      };

      const newChildren = [
        ...parentNode.children.slice(0, idx),
        mergedChild,
        ...parentNode.children.slice(idx + 2),
      ];
      pushState(updateNode(rootCell, parentNode.id, { children: newChildren }));
    }

    setSelectedMullion(null);
    setIsMullionModalOpen(false);
    toast.success('Đã xóa thanh đố thành công');
  };

  const handleSaveGrille = (config: GlassGrilleConfig, applyToAllSashes: boolean) => {
    if (!grilleEditingCell) return;
    if (applyToAllSashes) {
      const updateAllLeaves = (node: SceneCellNode): SceneCellNode => {
        if (!node.children || node.children.length === 0) {
          if (node.paneType === 'glass') {
            return { ...node, grilleConfig: { ...config } };
          }
          return node;
        }
        return { ...node, children: node.children.map(updateAllLeaves) };
      };
      pushState(updateAllLeaves(rootCell));
      toast.success('Đã áp dụng mẫu nan đồng cho tất cả các cánh kính');
    } else {
      pushState(updateNode(rootCell, grilleEditingCell.id, { grilleConfig: config }));
      toast.success('Đã cập nhật nan đồng cho ô kính');
    }
    setIsGrilleModalOpen(false);
    setGrilleEditingCell(null);
  };

  // Realtime calculate BOM
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setIsCalculating(true);

    const timer = setTimeout(async () => {
      try {
        const res = await calculateDoor({
          width: w,
          height: h,
          systemConfig: {
            w,
            h,
            frameShape,
            aluminumColor,
            rootCell,
            frameConfig,
            sashConfig,
            seriesId,
            selectedComboIds,
            selectedComboId: selectedComboIds[0] || null,
            selectedAccessories,
          },
        });
        if (isMounted) setCalcData(res);
      } catch (err) {
        console.warn('Calc error', err);
      } finally {
        if (isMounted) setIsCalculating(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, w, h, frameShape, aluminumColor, rootCell, frameConfig, sashConfig, seriesId, selectedComboIds, selectedAccessories]);

  const handleToggleCombo = (comboId: number) => {
    setSelectedComboIds((prev) =>
      prev.includes(comboId) ? prev.filter((id) => id !== comboId) : [...prev, comboId]
    );
  };

  const handleUpdateAccessoryQty = (accessoryId: number, delta: number) => {
    setSelectedAccessories((prev) => {
      const existing = prev.find((a) => a.accessoryId === accessoryId);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return prev.filter((a) => a.accessoryId !== accessoryId);
        }
        return prev.map((a) => (a.accessoryId === accessoryId ? { ...a, quantity: newQty } : a));
      }
      if (delta > 0) {
        return [...prev, { accessoryId, quantity: delta }];
      }
      return prev;
    });
  };

  const handleSetAccessoryQty = (accessoryId: number, qty: number) => {
    setSelectedAccessories((prev) => {
      if (qty <= 0) {
        return prev.filter((a) => a.accessoryId !== accessoryId);
      }
      const existing = prev.find((a) => a.accessoryId === accessoryId);
      if (existing) {
        return prev.map((a) => (a.accessoryId === accessoryId ? { ...a, quantity: qty } : a));
      }
      return [...prev, { accessoryId, quantity: qty }];
    });
  };

  const handleClearAllAccessories = () => {
    setSelectedComboIds([]);
    setSelectedAccessories([]);
  };

  // Save Mutation
  const { mutate: saveMutation, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      let imageB64: string | undefined = undefined;
      try {
        const svgEl = document.getElementById('studio-export-cad-svg') || document.getElementById('door-cad-svg');
        if (svgEl) {
          const clone = svgEl.cloneNode(true) as SVGSVGElement;
          clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          const svgString = new XMLSerializer().serializeToString(clone);
          imageB64 = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
        }
      } catch (err) {
        console.warn('Cannot serialize CAD SVG:', err);
      }

      const payload: DoorCreate = {
        name,
        code,
        type,
        doorSeriesId: seriesId || null,
        imageB64,
        specification: `${w}×${h}mm, ${frameShape}, hệ ID:${seriesId || 'default'}`,
        systemConfig: {
          w,
          h,
          frameShape,
          aluminumColor: (aluminumColor || '').trim(),
          hardwareColor: (hardwareColor || '').trim(),
          rootCell,
          frameConfig,
          sashConfig,
          seriesId,
          selectedComboIds,
          selectedComboId: selectedComboIds[0] || null,
          selectedAccessories,
        },
      };

      if (door?.id) {
        return updateDoor(door.id, { data: payload as DoorUpdate });
      }
      return createDoor({ data: payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doors'] });
      queryClient.invalidateQueries({ queryKey: ['door-templates'] });
      queryClient.invalidateQueries({ queryKey: ['doors-stats'] });
      toast.success(door?.id ? 'Cập nhật thiết kế thành công' : 'Lưu thiết kế thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lưu thiết kế thất bại'),
  });

  const selectedCellNode = selectedCellId ? findNode(rootCell, selectedCellId) : null;
  const parentOfSelected = selectedCellId ? findParentNode(rootCell, selectedCellId) : null;
  const isSelectedInPair =
    parentOfSelected &&
    parentOfSelected.children &&
    parentOfSelected.children.length === 2 &&
    parentOfSelected.splitDirection === 'vertical' &&
    (parentOfSelected.splitType === 'sash_pair' || parentOfSelected.sashType === 'swing_double');
  const effectiveSashType: SashOpenType = isSelectedInPair
    ? (parentOfSelected.sashType || 'swing_double')
    : (selectedCellNode?.sashType || currentSashType);

  return {
    activeMainTab,
    setActiveMainTab,
    w,
    setW,
    h,
    setH,
    name,
    setName,
    code,
    setCode,
    type,
    setType,
    aluminumColor,
    setAluminumColor,
    hardwareColor,
    setHardwareColor,
    frameShape,
    setFrameShape,
    seriesId,
    setSeriesId,
    selectedComboIds,
    selectedAccessories,
    frameConfig,
    setFrameConfig,
    sashConfig,
    setSashConfig,
    activeLeftTab,
    setActiveLeftTab,
    currentSashType,
    selectedCellId,
    setSelectedCellId,
    selectedCellNode,
    effectiveSashType,
    selectedMullion,
    setSelectedMullion,
    isMullionModalOpen,
    setIsMullionModalOpen,
    isGrilleModalOpen,
    setIsGrilleModalOpen,
    grilleEditingCell,
    setGrilleEditingCell,
    rootCell,
    history,
    historyIdx,
    calcData,
    isCalculating,
    availableSeries,
    allAvailableSeries,
    availableProfiles,
    availableBeads,
    availableCombos,
    availableAccessories,
    availableBrands,
    selectedBrandId,
    setSelectedBrandId,
    availableGlasses,
    defaultGlass,
    dynamicAluminumColors,
    handleUndo,
    handleRedo,
    handleReset,
    handleChangeDimension,
    handleSplitMullion,
    handleCoupleFrame,
    handleSelectSashType,
    handleUpdateDimension,
    handleUpdateSelectedCell,
    handleSelectMullion,
    handleSaveMullion,
    handleResizeSplit,
    handleDeleteMullion,
    handleSaveGrille,
    handleToggleCombo,
    handleUpdateAccessoryQty,
    handleSetAccessoryQty,
    handleClearAllAccessories,
    saveMutation,
    isSaving,
    pushState,
  };
}
