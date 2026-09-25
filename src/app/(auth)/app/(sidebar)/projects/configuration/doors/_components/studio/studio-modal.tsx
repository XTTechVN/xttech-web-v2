/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components';
import { Door, DoorCreate, DoorUpdate, DoorCalculateResponse } from '@/types';
import {
  calculateDoor,
  createDoor,
  updateDoor,
  getDoorSeriesList,
  getProfileBars,
  getAccessoryCombos,
  getGlasses,
  getBrandColors,
} from '@/actions';
import {
  FrameShape,
  SashOpenType,
  SceneCellNode,
  StudioMainTab,
  FrameConfig,
  SashConfig,
  DEFAULT_FRAME_CONFIG,
  DEFAULT_SASH_CONFIG,
  MullionInfo,
  MullionCutType,
  ColorSwatch,
  ALUMINUM_PALETTE,
} from './studio-types';
import { DrawTabView } from './panels/draw-tab-view';
import { InfoTabView } from './panels/info-tab-view';
import { ConfigTabView } from './panels/config/config-tab-view';
import { ResultsTabView } from './panels/results-tab-view';
import { AccessoriesTabView } from './panels/accessories-tab-view';
import { MullionInspectorModal } from './panels/mullion-inspector-modal';
import { DoorCadRenderer } from './cad-engine/door-cad-renderer';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import {
  Save,
  Loader2,
  FileText,
  PenTool,
  Sliders,
  BarChart3,
  Wrench,
} from 'lucide-react';

interface DoorStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  door?: Door | null;
}

const updateNode = (root: SceneCellNode, id: string, updates: Partial<SceneCellNode>): SceneCellNode => {
  if (root.id === id) return { ...root, ...updates };
  if (root.children) {
    return { ...root, children: root.children.map((c) => updateNode(c, id, updates)) };
  }
  return root;
};

const findNode = (root: SceneCellNode, id: string): SceneCellNode | null => {
  if (root.id === id) return root;
  if (root.children) {
    for (const c of root.children) {
      const f = findNode(c, id);
      if (f) return f;
    }
  }
  return null;
};

const findParentNode = (root: SceneCellNode, id: string): SceneCellNode | null => {
  if (root.children) {
    if (root.children.some((c) => c.id === id)) return root;
    for (const c of root.children) {
      const p = findParentNode(c, id);
      if (p) return p;
    }
  }
  return null;
};

const createDefaultRootCell = (width = 1400, height = 1600): SceneCellNode => ({
  id: 'root',
  w: width,
  h: height,
  sashType: 'fixed',
  paneType: 'glass',
  children: [],
});

export const DoorStudioModal: React.FC<DoorStudioModalProps> = ({ isOpen, onClose, door }) => {
  // Navigation Tabs
  const [activeMainTab, setActiveMainTab] = useState<StudioMainTab>('draw');

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
  const [selectedComboId, setSelectedComboId] = useState<number | null>(null);

  // Flexible Configurations (Frame & Sash)
  const [frameConfig, setFrameConfig] = useState<FrameConfig>(DEFAULT_FRAME_CONFIG);
  const [sashConfig, setSashConfig] = useState<SashConfig>(DEFAULT_SASH_CONFIG);

  // Drawing View State
  const [activeLeftTab, setActiveLeftTab] = useState<'frame' | 'sash'>('sash');
  const [currentSashType, setCurrentSashType] = useState<SashOpenType>('fixed');
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [selectedMullion, setSelectedMullion] = useState<MullionInfo | null>(null);
  const [isMullionModalOpen, setIsMullionModalOpen] = useState<boolean>(false);

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
    queryFn: () => getDoorSeriesList({ limit: 100 }),
    enabled: isOpen,
  });
  const availableSeries = seriesData?.items || [];

  // Fetch Profile Bars (filtered by seriesId)
  const { data: profilesData } = useQuery({
    queryKey: ['profile-bars', seriesId],
    queryFn: () => getProfileBars({ seriesId: seriesId || undefined, limit: 300 }),
    enabled: isOpen,
  });
  const availableProfiles = profilesData?.items || [];

  const availableBeads = React.useMemo(() => {
    return availableProfiles.filter(
      (p) => p.barType?.toUpperCase() === 'BEAD' || (p as any).category === 'bead'
    );
  }, [availableProfiles]);

  // Fetch Accessory Combos
  const { data: combosData } = useQuery({
    queryKey: ['accessory-combos-list'],
    queryFn: () => getAccessoryCombos({ limit: 100 }),
    enabled: isOpen,
  });
  const availableCombos = combosData?.items || [];

  // Fetch Glasses (for CellInspector dropdown)
  const { data: glassesData } = useQuery({
    queryKey: ['glasses-list'],
    queryFn: () => getGlasses({ limit: 200, isActive: true }),
    enabled: isOpen,
  });
  const availableGlasses = glassesData?.items || [];

  const defaultGlass = React.useMemo(() => {
    return availableGlasses.find((g) => g.isDefault) || availableGlasses[0] || null;
  }, [availableGlasses]);

  // Lấy brandId từ hệ nhôm (DoorSeries) đang chọn
  const selectedSeries = availableSeries.find((s) => s.id === seriesId);
  const brandId = selectedSeries?.brandId;

  // Fetch danh sách màu thực tế của Hãng từ Database
  const { data: brandColorsData } = useQuery({
    queryKey: ['brand-colors', brandId],
    queryFn: () => getBrandColors({ brandId, limit: 100, isActive: true }),
    enabled: isOpen && !!brandId,
  });
  const availableBrandColors = brandColorsData?.items || [];

  // Bảng màu nhôm động: nếu hãng có cấu hình màu thì dùng của hãng, fallback về palette mặc định
  const dynamicAluminumColors: ColorSwatch[] =
    availableBrandColors.length > 0
      ? availableBrandColors.map((bc) => ({
          code: bc.code,
          name: bc.name,
          colorHex: bc.colorHex,
        }))
      : ALUMINUM_PALETTE;

  // Khi danh sách màu của hãng load hoặc khi user đổi hệ nhôm (hãng khác):
  // Nếu màu hiện tại không thuộc bảng màu của hãng, tự động chọn màu mặc định của hãng đó
  useEffect(() => {
    if (availableBrandColors.length > 0) {
      const exists = availableBrandColors.some(
        (c) => c.colorHex.toLowerCase() === aluminumColor.toLowerCase()
      );
      if (!exists) {
        const defaultColor =
          availableBrandColors.find((c) => c.isDefault) || availableBrandColors[0];
        if (defaultColor) {
          setAluminumColor(defaultColor.colorHex);
        }
      }
    }
  }, [availableBrandColors, aluminumColor]);

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
      if (sc.aluminumColor) setAluminumColor(sc.aluminumColor);
      if (sc.hardwareColor) setHardwareColor(sc.hardwareColor);
      if (sc.seriesId) setSeriesId(sc.seriesId);
      if (sc.selectedComboId) setSelectedComboId(sc.selectedComboId);
      if (sc.frameConfig) {
        setFrameConfig({
          ...DEFAULT_FRAME_CONFIG,
          ...sc.frameConfig,
          leftEdge: { ...DEFAULT_FRAME_CONFIG.leftEdge, ...(sc.frameConfig.leftEdge || {}) },
          topEdge: { ...DEFAULT_FRAME_CONFIG.topEdge, ...(sc.frameConfig.topEdge || {}) },
          rightEdge: { ...DEFAULT_FRAME_CONFIG.rightEdge, ...(sc.frameConfig.rightEdge || {}) },
          bottomEdge: { ...DEFAULT_FRAME_CONFIG.bottomEdge, ...(sc.frameConfig.bottomEdge || {}) },
        });
      }
      if (sc.sashConfig) {
        setSashConfig({
          ...DEFAULT_SASH_CONFIG,
          ...sc.sashConfig,
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
      // Khi thêm cửa mới (door === null / undefined): RESET TOÀN BỘ VỀ MẶC ĐỊNH
      const defaultW = 1400;
      const defaultH = 1600;
      const initialRoot = createDefaultRootCell(defaultW, defaultH);

      setName('Vách kính cố định');
      setCode('');
      setType('ck');
      setW(defaultW);
      setH(defaultH);
      setFrameShape('rect');
      setAluminumColor('#955F20');
      setHardwareColor('#1E293B');
      setSeriesId(1);
      setSelectedComboId(null);
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
  }, [door, isOpen]);

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

  const rescaleTree = (node: SceneCellNode, scaleX: number, scaleY: number): SceneCellNode => ({
    ...node,
    w: Math.round(node.w * scaleX),
    h: Math.round(node.h * scaleY),
    children: node.children?.map((c) => rescaleTree(c, scaleX, scaleY)),
  });

  const handleChangeDimension = (newW: number, newH: number) => {
    const scaleX = newW / (w || 1);
    const scaleY = newH / (h || 1);
    setW(newW);
    setH(newH);
    pushState(rescaleTree(rootCell, scaleX, scaleY));
  };

  const createSplitChildren = (
    parentId: string,
    totalW: number,
    totalH: number,
    count: number,
    direction: 'vertical' | 'horizontal',
    defaultSashType: SashOpenType = 'fixed'
  ): SceneCellNode[] => {
    const isVert = direction === 'vertical';
    const span = isVert ? totalW : totalH;
    const basePart = Math.floor(span / count);
    let accumulated = 0;

    return Array.from({ length: count }, (_, i) => {
      const isLast = i === count - 1;
      const currentSpan = isLast ? span - accumulated : basePart;
      accumulated += currentSpan;

      return {
        id: `${parentId}_c${i}_${crypto.randomUUID().slice(0, 8)}`,
        w: isVert ? currentSpan : totalW,
        h: isVert ? totalH : currentSpan,
        sashType: defaultSashType,
        paneType: 'glass',
      };
    });
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

  // Đồng bộ kiểu cánh cho cụm cửa hoặc chuyển đổi giữa cửa 2 cánh và cửa 1 cánh / vách cố định
  const applySashTypeToCluster = (
    root: SceneCellNode,
    targetId: string,
    newSashType: SashOpenType
  ): { updatedRoot: SceneCellNode; nextSelectedId?: string } => {
    const targetNode = findNode(root, targetId);
    if (!targetNode) return { updatedRoot: root };

    const parentNode = findParentNode(root, targetId);

    // Nhận diện cụm cánh đôi (sash pair):
    const isParentPair =
      parentNode &&
      parentNode.children &&
      parentNode.children.length === 2 &&
      parentNode.splitDirection === 'vertical' &&
      (parentNode.splitType === 'sash_pair' ||
        parentNode.sashType === 'swing_double' ||
        (parentNode.children.some((c) => c.sashType === 'swing_left') &&
          parentNode.children.some((c) => c.sashType === 'swing_right')));

    const isTargetPair =
      targetNode.children &&
      targetNode.children.length === 2 &&
      targetNode.splitDirection === 'vertical' &&
      (targetNode.splitType === 'sash_pair' ||
        targetNode.sashType === 'swing_double' ||
        (targetNode.children.some((c) => c.sashType === 'swing_left') &&
          targetNode.children.some((c) => c.sashType === 'swing_right')));

    const pairContainer = isParentPair ? parentNode : isTargetPair ? targetNode : null;

    // TRƯỜNG HỢP 1: Khoang đang là Cụm 2 cánh (pairContainer)
    if (pairContainer && pairContainer.children && pairContainer.children.length === 2) {
      const c0 = pairContainer.children[0];
      const c1 = pairContainer.children[1];

      // 1.1: Giữ nguyên là Cửa 2 cánh mở quay
      if (newSashType === 'swing_double') {
        const updatedChildren: SceneCellNode[] = [
          {
            ...c0,
            sashType: 'swing_left',
            hasLock: false,
          },
          {
            ...c1,
            sashType: 'swing_right',
            hasLock: true,
            handleHeight: Math.round(c1.h / 2),
            handleType: c1.handleType ?? 'lever',
          },
        ];
        return {
          updatedRoot: updateNode(root, pairContainer.id, {
            sashType: 'swing_double',
            splitDirection: 'vertical',
            splitType: 'sash_pair',
            children: updatedChildren,
          }),
          nextSelectedId: targetId === c0.id ? c0.id : c1.id,
        };
      }

      // 1.2: TẤT CẢ các kiểu cánh đơn (sliding, swing_left, swing_right, awning, tilt, tilt_down, tilt_turn) hoặc Vách cố định (fixed)
      // -> Hợp nhất cụm 2 cánh thành 1 cánh/ô duy nhất toàn khoang
      const sashHasHandle = ['swing_left', 'swing_right', 'tilt_turn', 'awning', 'tilt', 'tilt_down', 'sliding'].includes(newSashType);
      const activePaneType = targetNode.paneType || c0.paneType || 'glass';
      const activeGlassName = targetNode.glassName || c0.glassName;
      const activeGlassThickness = targetNode.glassThickness || c0.glassThickness;

      const mergedNode: SceneCellNode = {
        ...pairContainer,
        sashType: newSashType,
        splitDirection: undefined,
        splitType: undefined,
        children: [],
        paneType: activePaneType,
        glassName: activeGlassName,
        glassThickness: activeGlassThickness,
        hasLock: sashHasHandle,
        handleHeight: sashHasHandle ? Math.round(pairContainer.h / 2) : undefined,
        handleType: sashHasHandle ? (targetNode.handleType || c1.handleType || 'lever') : undefined,
      };

      return {
        updatedRoot: updateNode(root, pairContainer.id, mergedNode),
        nextSelectedId: pairContainer.id,
      };
    }

    // TRƯỜNG HỢP 2: Khoang đang là Ô đơn lẻ (chưa chia hoặc đã hợp nhất)
    if (!pairContainer && (!targetNode.children || targetNode.children.length === 0)) {
      // 2.1: Chuyển từ ô đơn lẻ sang Cửa 2 cánh mở quay
      if (newSashType === 'swing_double') {
        const halfW = Math.round(targetNode.w / 2);
        const newChildren: SceneCellNode[] = [
          {
            id: `${targetNode.id}_c0_${crypto.randomUUID().slice(0, 8)}`,
            w: halfW,
            h: targetNode.h,
            sashType: 'swing_left',
            paneType: targetNode.paneType || 'glass',
            glassName: targetNode.glassName,
            glassThickness: targetNode.glassThickness,
            hasLock: false,
          },
          {
            id: `${targetNode.id}_c1_${crypto.randomUUID().slice(0, 8)}`,
            w: targetNode.w - halfW,
            h: targetNode.h,
            sashType: 'swing_right',
            paneType: targetNode.paneType || 'glass',
            glassName: targetNode.glassName,
            glassThickness: targetNode.glassThickness,
            hasLock: true,
            handleHeight: Math.round(targetNode.h / 2),
            handleType: targetNode.handleType || 'lever',
          },
        ];
        return {
          updatedRoot: updateNode(root, targetNode.id, {
            sashType: newSashType,
            splitDirection: 'vertical',
            splitType: 'sash_pair',
            children: newChildren,
          }),
          nextSelectedId: newChildren[1].id,
        };
      }

      // 2.2: Chuyển đổi giữa các kiểu cánh đơn / vách cố định cho ô đơn lẻ (bao gồm sliding)
      const sashHasHandle = ['swing_left', 'swing_right', 'tilt_turn', 'awning', 'tilt', 'tilt_down', 'sliding'].includes(newSashType);
      const updates: Partial<SceneCellNode> = {
        sashType: newSashType,
        hasLock: sashHasHandle,
        handleHeight: sashHasHandle ? Math.round(targetNode.h / 2) : undefined,
        handleType: sashHasHandle ? (targetNode.handleType ?? 'lever') : undefined,
      };
      return {
        updatedRoot: updateNode(root, targetId, updates),
        nextSelectedId: targetId,
      };
    }

    return { updatedRoot: root, nextSelectedId: targetId };
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

  // Tổng quát: resize 1 cell bất kỳ trong cây, bù lại cho sibling kế tiếp
  const resizeCellInParent = (
    root: SceneCellNode,
    cellId: string,
    newValue: number,
    axis: 'w' | 'h'
  ): SceneCellNode => {
    if (!root.children || root.children.length === 0) return root;

    const childIdx = root.children.findIndex((c) => c.id === cellId);
    const isMatchingAxis =
      (axis === 'w' && root.splitDirection === 'vertical') ||
      (axis === 'h' && root.splitDirection === 'horizontal');

    if (childIdx >= 0 && isMatchingAxis) {
      const siblingIdx = childIdx + 1 < root.children.length ? childIdx + 1 : childIdx - 1;
      const oldVal = axis === 'w' ? root.children[childIdx].w : root.children[childIdx].h;
      const sibOld = axis === 'w' ? root.children[siblingIdx].w : root.children[siblingIdx].h;
      const maxAllowed = oldVal + (sibOld - 100);
      const clamped = Math.max(100, Math.min(maxAllowed, newValue));
      const delta = clamped - oldVal;

      const newChildren = root.children.map((c, i) => {
        if (i === childIdx) return { ...c, [axis]: clamped };
        if (i === siblingIdx) {
          return { ...c, [axis]: Math.max(100, sibOld - delta) };
        }
        return c;
      });
      return { ...root, children: newChildren };
    }

    // Không tìm thấy ở cấp này, đệ quy xuống sâu hơn
    return { ...root, children: root.children.map((c) => resizeCellInParent(c, cellId, newValue, axis)) };
  };

  const handleUpdateDimension = (target: 'w' | 'h' | 'cell' | 'handleHeight', value: number, cellId?: string) => {
    if (target === 'w') {
      handleChangeDimension(value, h);
    } else if (target === 'h') {
      handleChangeDimension(w, value);
    } else if (target === 'handleHeight' && cellId) {
      const clampedVal = Math.max(200, Math.min(h - 100, value));
      pushState(updateNode(rootCell, cellId, { handleHeight: clampedVal }));
      toast.success(`Đã cập nhật cao độ khóa: ${clampedVal} mm`);
    } else if (target === 'cell' && cellId) {
      // Xác định axis dựa trên splitDirection của parent chứa cell
      const tryW = resizeCellInParent(rootCell, cellId, value, 'w');
      const tryH = resizeCellInParent(rootCell, cellId, value, 'h');
      // Dùng kết quả của axis nào thực sự thay đổi
      const changed = JSON.stringify(tryW) !== JSON.stringify(rootCell) ? tryW : tryH;
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

  const handleDeleteMullion = () => {
    if (!selectedMullion) return;
    const parentNode = findNode(rootCell, selectedMullion.parentNodeId);
    if (!parentNode || !parentNode.children || parentNode.children.length === 0) return;

    const idx = selectedMullion.mullionIndex;
    const isVert = selectedMullion.direction === 'vertical';

    // If parent only had 2 children, merging them resets parent to a single leaf cell
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
      // Merge child[idx] and child[idx + 1]
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
  }, [isOpen, w, h, frameShape, aluminumColor, rootCell, frameConfig, sashConfig, seriesId]);

  // Save Mutation
  const { mutate: saveMutation, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      // 1. Tự động trích xuất vector SVG bản vẽ cửa để làm thumbnail
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
          aluminumColor,
          hardwareColor,
          rootCell,
          frameConfig,
          sashConfig,
          seriesId,
          selectedComboId,
        },
      };

      if (door?.id) {
        return updateDoor(door.id, { data: payload as DoorUpdate });
      }
      return createDoor({ data: payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doors'] });
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

  const NAV_TABS = [
    { id: 'info' as const, label: 'Thông tin', icon: FileText },
    { id: 'draw' as const, label: 'Vẽ cửa', icon: PenTool },
    { id: 'config' as const, label: 'Cấu hình', icon: Sliders },
    { id: 'bom' as const, label: 'Kết quả', icon: BarChart3 },
    { id: 'accessories' as const, label: 'Phụ kiện', icon: Wrench },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between w-full pr-8">
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            {NAV_TABS.map((t) => {
              const Icon = t.icon;
              const isActive = activeMainTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveMainTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-700/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon size={14} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
          <div className="text-xs font-semibold text-slate-500 font-mono hidden md:block">
            {name} ({w}×{h}mm)
          </div>
        </div>
      }
      size="full"
      footer={
        <div className="flex items-center justify-between w-full px-2 py-1">
          <div className="text-xs text-gray-500">Bản vẽ CAD vector và bảng bóc tách tự động cập nhật</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => saveMutation()}
              disabled={isSaving}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>Lưu thiết kế</span>
            </button>
          </div>
        </div>
      }
    >
      {activeMainTab === 'info' && (
        <div className="h-[80vh] -m-4 overflow-y-auto">
          <InfoTabView
            name={name}
            code={code}
            type={type}
            seriesId={seriesId}
            specification={`${w}×${h}mm, ${frameShape}`}
            w={w}
            h={h}
            glassPrice={350000}
            aluminumColor={aluminumColor}
            hardwareColor={hardwareColor}
            doorSeriesList={availableSeries}
            aluminumColors={dynamicAluminumColors}
            onChangeField={(field, val) => {
              if (field === 'w') setW(val);
              else if (field === 'h') setH(val);
              else if (field === 'name') setName(val);
              else if (field === 'code') setCode(val);
              else if (field === 'type') setType(val);
              else if (field === 'aluminumColor') setAluminumColor(val);
              else if (field === 'hardwareColor') setHardwareColor(val);
              else if (field === 'seriesId') setSeriesId(val);
            }}
          />
        </div>
      )}

      {activeMainTab === 'draw' && (
        <DrawTabView
          w={w}
          h={h}
          aluminumColor={aluminumColor}
          hardwareColor={hardwareColor}
          frameShape={frameShape}
          frameConfig={frameConfig}
          sashConfig={sashConfig}
          rootCell={rootCell}
          selectedCellId={selectedCellId}
          selectedCellNode={selectedCellNode}
          selectedMullionId={selectedMullion?.id}
          onSelectMullion={handleSelectMullion}
          activeLeftTab={activeLeftTab}
          currentSashType={effectiveSashType}
          historyIdx={historyIdx}
          historyLength={history.length}
          calcData={calcData}
          isCalculating={isCalculating}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onReset={handleReset}
          onChangeDimension={handleChangeDimension}
          onSelectAluminumColor={setAluminumColor}
          onSelectHardwareColor={setHardwareColor}
          onSelectFrameShape={setFrameShape}
          onSelectSashType={handleSelectSashType}
          onSplitMullion={handleSplitMullion}
          onCoupleFrame={handleCoupleFrame}
          onChangeTab={setActiveLeftTab}
          onSelectCell={setSelectedCellId}
          onUpdateDimension={handleUpdateDimension}
          onUpdateSelectedCell={handleUpdateSelectedCell}
          onSplitSelectedCell={(dir) => handleSplitMullion(2, dir)}
          onMergeSelectedCell={() => {
            if (!selectedCellId) return;
            pushState(updateNode(rootCell, selectedCellId, { children: [] }));
          }}
          availableGlasses={availableGlasses}
          availableBeads={availableBeads}
          defaultGlass={defaultGlass}
          aluminumColors={dynamicAluminumColors}
        />
      )}

      {activeMainTab === 'config' && (
        <div className="h-[80vh] -m-4 overflow-y-auto">
          <ConfigTabView
            frameConfig={frameConfig}
            sashConfig={sashConfig}
            onChangeFrameConfig={(updates) => setFrameConfig((prev) => ({ ...prev, ...updates }))}
            onChangeSashConfig={(updates) => setSashConfig((prev) => ({ ...prev, ...updates }))}
            profiles={availableProfiles}
          />
        </div>
      )}

      {activeMainTab === 'bom' && (
        <div className="h-[80vh] -m-4 overflow-y-auto">
          <ResultsTabView
            calcData={calcData}
            isCalculating={isCalculating}
            w={w}
            h={h}
            rootCell={rootCell}
            frameConfig={frameConfig}
            sashConfig={sashConfig}
            seriesId={seriesId}
            onNavigateTab={setActiveMainTab}
          />
        </div>
      )}

      {activeMainTab === 'accessories' && (
        <div className="h-[80vh] -m-4 overflow-y-auto">
          <AccessoriesTabView
            combos={availableCombos}
            selectedComboId={selectedComboId}
            onSelectCombo={setSelectedComboId}
            hardwareColor={hardwareColor}
            onChangeHardwareColor={setHardwareColor}
          />
        </div>
      )}

      <MullionInspectorModal
        isOpen={isMullionModalOpen}
        onClose={() => {
          setIsMullionModalOpen(false);
          setSelectedMullion(null);
        }}
        mullion={selectedMullion}
        profileBars={availableProfiles}
        onSave={handleSaveMullion}
        onDeleteMullion={handleDeleteMullion}
      />

      {/* Hidden CAD Renderer for clean SVG Thumbnail Export */}
      <div className="sr-only pointer-events-none absolute -top-[9999px] -left-[9999px] w-[400px] h-[400px] opacity-0" aria-hidden="true">
        <DoorCadRenderer
          id="studio-export-cad-svg"
          hideDimensions={true}
          w={w}
          h={h}
          aluminumColor={aluminumColor}
          hardwareColor={hardwareColor}
          frameShape={frameShape}
          rootCell={rootCell}
          frameConfig={frameConfig}
          sashConfig={sashConfig}
          selectedCellId={null}
          onSelectCell={() => {}}
        />
      </div>
    </Modal>
  );
};
