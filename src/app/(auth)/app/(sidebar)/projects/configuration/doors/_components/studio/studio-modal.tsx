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
} from './studio-types';
import { DrawTabView } from './panels/draw-tab-view';
import { InfoTabView } from './panels/info-tab-view';
import { ConfigTabView } from './panels/config/config-tab-view';
import { ResultsTabView } from './panels/results-tab-view';
import { AccessoriesTabView } from './panels/accessories-tab-view';
import { MullionInspectorModal } from './panels/mullion-inspector-modal';
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

export const DoorStudioModal: React.FC<DoorStudioModalProps> = ({ isOpen, onClose, door }) => {
  // Navigation Tabs
  const [activeMainTab, setActiveMainTab] = useState<StudioMainTab>('draw');

  // Basic Door State
  const [w, setW] = useState<number>(1400);
  const [h, setH] = useState<number>(1600);
  const [name, setName] = useState<string>('Cửa sổ 2 cánh mở quay Class A65');
  const [code, setCode] = useState<string>('CS_CLA65');
  const [type, setType] = useState<string>('cs');
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
  const [currentSashType, setCurrentSashType] = useState<SashOpenType>('swing_left');
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [selectedMullion, setSelectedMullion] = useState<MullionInfo | null>(null);
  const [isMullionModalOpen, setIsMullionModalOpen] = useState<boolean>(false);

  // Scene Graph Root
  const [rootCell, setRootCell] = useState<SceneCellNode>(() => ({
    id: 'root',
    w: 1400,
    h: 1600,
    sashType: 'swing_double',
    paneType: 'glass',
    splitDirection: 'vertical',
    children: [
      { id: 'cell_0', w: 700, h: 1600, sashType: 'swing_left', paneType: 'glass' },
      { id: 'cell_1', w: 700, h: 1600, sashType: 'swing_right', paneType: 'glass' },
    ],
  }));

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

  // Fetch Accessory Combos
  const { data: combosData } = useQuery({
    queryKey: ['accessory-combos-list'],
    queryFn: () => getAccessoryCombos({ limit: 100 }),
    enabled: isOpen,
  });
  const availableCombos = combosData?.items || [];

  // Initialize or re-hydrate state when editing existing door
  useEffect(() => {
    if (door && isOpen) {
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
    const initRoot: SceneCellNode = {
      id: 'root',
      w,
      h,
      sashType: 'fixed',
      paneType: 'glass',
      children: [],
    };
    pushState(initRoot);
    setSelectedCellId(null);
  };

  const handleChangeDimension = (newW: number, newH: number) => {
    setW(newW);
    setH(newH);
    const updated = {
      ...rootCell,
      w: newW,
      h: newH,
      children: rootCell.children?.map((c) => ({
        ...c,
        w: rootCell.splitDirection === 'vertical' ? Math.round(newW / (rootCell.children?.length || 1)) : newW,
        h: rootCell.splitDirection === 'horizontal' ? Math.round(newH / (rootCell.children?.length || 1)) : newH,
      })),
    };
    pushState(updated);
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
        id: `${parentId}_c${i}_${Math.random().toString(36).slice(2, 6)}`,
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

  const handleSelectSashType = (sashType: SashOpenType) => {
    setCurrentSashType(sashType);
    const targetId = selectedCellId || (rootCell.children?.[0]?.id || 'cell_0');
    const updated = updateNode(rootCell, targetId, { sashType });
    pushState(updated);
  };

  const handleUpdateDimension = (target: 'w' | 'h' | 'cell', value: number, cellId?: string) => {
    if (target === 'w') {
      handleChangeDimension(value, h);
    } else if (target === 'h') {
      handleChangeDimension(w, value);
    } else if (target === 'cell' && cellId) {
      if (rootCell.children && rootCell.children.length === 2) {
        const c0 = rootCell.children[0];
        const c1 = rootCell.children[1];
        if (rootCell.splitDirection === 'horizontal') {
          if (cellId === c0.id) {
            const newH0 = Math.max(100, Math.min(h - 100, value));
            pushState({ ...rootCell, children: [{ ...c0, h: newH0 }, { ...c1, h: h - newH0 }] });
          } else if (cellId === c1.id) {
            const newH1 = Math.max(100, Math.min(h - 100, value));
            pushState({ ...rootCell, children: [{ ...c0, h: h - newH1 }, { ...c1, h: newH1 }] });
          }
        } else if (rootCell.splitDirection === 'vertical') {
          if (cellId === c0.id) {
            const newW0 = Math.max(100, Math.min(w - 100, value));
            pushState({ ...rootCell, children: [{ ...c0, w: newW0 }, { ...c1, w: w - newW0 }] });
          } else if (cellId === c1.id) {
            const newW1 = Math.max(100, Math.min(w - 100, value));
            pushState({ ...rootCell, children: [{ ...c0, w: w - newW1 }, { ...c1, w: newW1 }] });
          }
        }
      } else {
        pushState(updateNode(rootCell, cellId, { w: value }));
      }
    }
  };

  const handleUpdateSelectedCell = (updates: Partial<SceneCellNode>) => {
    if (!selectedCellId) return;
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
      const payload: DoorCreate = {
        name,
        code,
        type,
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
          currentSashType={currentSashType}
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
    </Modal>
  );
};
