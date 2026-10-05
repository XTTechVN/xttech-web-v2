'use client';

import React from 'react';
import { Glass, ProfileBar } from '@/types';
import { SceneCellNode, PaneType, BeadType, BeadJointType, FrameShape, FrameConfig, ArchConfig } from '../studio-types';
import { ShieldCheck, Grid, Sparkles, Layers, SlidersHorizontal, Check, Lock, Square } from 'lucide-react';

interface CellInspectorProps {
  selectedCell: SceneCellNode | null;
  onUpdateCell: (updates: Partial<SceneCellNode>) => void;
  onSplitCell: (direction: 'vertical' | 'horizontal') => void;
  onMergeCell: () => void;
  onDeselect: () => void;
  availableGlasses?: Glass[];
  availableBeads?: ProfileBar[];
  defaultGlass?: Glass | null;
  onUpdateDimension?: (target: 'cell', value: number, cellId: string) => void;
  onOpenGrilleModal?: (cell: SceneCellNode) => void;
  frameShape?: FrameShape;
  frameConfig?: FrameConfig;
  doorW?: number;
  onChangeFrameConfig?: (updates: Partial<FrameConfig>) => void;
}

const GLASS_OPTIONS = [
  'Kính dán an toàn 6.38mm',
  'Kính dán an toàn 8.38mm',
  'Kính dán an toàn 10.38mm',
  'Kính cường lực 8mm',
  'Kính cường lực 10mm',
  'Kính cường lực 12mm',
  'Kính hộp cách âm 5-9-5mm',
];

export const CellInspector: React.FC<CellInspectorProps> = ({
  selectedCell,
  onUpdateCell,
  onSplitCell,
  onMergeCell,
  onDeselect,
  availableGlasses,
  availableBeads,
  defaultGlass,
  onUpdateDimension,
  onOpenGrilleModal,
  frameShape,
  frameConfig,
  doorW,
  onChangeFrameConfig,
}) => {
  const [localW, setLocalW] = React.useState<number>(selectedCell?.w ?? 0);
  const [localH, setLocalH] = React.useState<number>(selectedCell?.h ?? 0);

  React.useEffect(() => {
    if (selectedCell) {
      setLocalW(selectedCell.w);
      setLocalH(selectedCell.h);
    }
  }, [selectedCell?.id, selectedCell?.w, selectedCell?.h]);

  const handleApplyW = () => {
    if (onUpdateDimension && selectedCell && localW > 0 && localW !== selectedCell.w) {
      onUpdateDimension('cell', localW, selectedCell.id);
    }
  };

  const handleApplyH = () => {
    if (onUpdateDimension && selectedCell && localH > 0 && localH !== selectedCell.h) {
      onUpdateDimension('cell', localH, selectedCell.id);
    }
  };

  const isArchShape = Boolean(
    frameShape &&
    frameShape !== 'rect' &&
    (frameShape.startsWith('arch_') || frameShape.startsWith('round_') || frameShape === 'circle' || frameShape === 'ellipse' || frameShape === 'quad_circle')
  );

  const renderArchConfigCard = () => {
    if (!isArchShape || !frameConfig || !onChangeFrameConfig) return null;
    const archCfg: ArchConfig = frameConfig.archConfig || {
      radiusMm: undefined,
      isCutAtApex: false,
      bendingClampingMm: 400,
    };
    const defaultR = Math.round((doorW || 1600) / 2);
    const currentR = archCfg.radiusMm ?? defaultR;

    const handleUpdateArch = (updates: Partial<ArchConfig>) => {
      onChangeFrameConfig({
        archConfig: {
          ...archCfg,
          ...updates,
        },
      });
    };

    return (
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs pb-1 border-b border-slate-100">
          <span className="text-sm">📐</span>
          <span>Cấu hình vòm / góc</span>
        </div>

        {/* 1. Bán kính R */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-700">Bán kính R (mm)</label>
            <input
              type="number"
              value={currentR}
              onChange={(e) => handleUpdateArch({ radiusMm: Number(e.target.value) || undefined })}
              className="w-24 h-7 px-2 text-right font-mono font-bold text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            />
          </div>
          <div className="text-[10px] text-slate-400 text-right">Tự động tính theo W / 2</div>
        </div>

        <div className="border-t border-slate-100 pt-2 space-y-1">
          {/* 2. Cắt vòm tại đỉnh */}
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={archCfg.isCutAtApex ?? false}
              onChange={(e) => handleUpdateArch({ isCutAtApex: e.target.checked })}
              className="mt-0.5 w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
            />
            <div>
              <div className="text-xs font-semibold text-slate-800">Cắt vòm tại đỉnh</div>
              <div className="text-[10.5px] text-slate-400 leading-tight mt-0.5">
                Chia thanh vòm và nẹp vòm thành hai phần trái, phải
              </div>
            </div>
          </label>
        </div>

        {/* 3. Kẹp phôi */}
        <div className="border-t border-slate-100 pt-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-700">Kẹp phôi (mm)</label>
            <input
              type="number"
              value={archCfg.bendingClampingMm ?? 400}
              onChange={(e) => handleUpdateArch({ bendingClampingMm: Number(e.target.value) || 0 })}
              className="w-24 h-7 px-2 text-right font-mono font-bold text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            />
          </div>
          <div className="text-[10px] text-slate-400 leading-tight space-y-0.5">
            <div>Phần chiều dài cây nhôm không sử dụng được khi uốn</div>
            <div>Chiều dài uốn tối đa = chiều dài cây nhôm của hãng – kẹp phôi</div>
          </div>
        </div>
      </div>
    );
  };

  // Ưu tiên dùng data từ DB, fallback về hardcode khi chưa fetch xong
  const glassOptions =
    availableGlasses && availableGlasses.length > 0
      ? availableGlasses.map((g) => ({ key: String(g.id), label: g.name }))
      : GLASS_OPTIONS.map((name, idx) => ({ key: `fallback-${idx}`, label: name }));

  if (!selectedCell) {
    return (
      <div className="flex flex-col h-full overflow-y-auto space-y-3.5 p-3.5 text-xs select-none bg-slate-50/50">
        {/* Banner chọn ô để thao tác */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center gap-2 text-slate-600 font-semibold">
          <span className="text-base">👉</span>
          <span className="text-xs">Chọn ô để thao tác</span>
        </div>

        {/* Card Kính nan đồng */}
        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-2xs space-y-2">
          <div className="font-bold text-amber-950 text-xs">Kính nan đồng</div>
          <p className="text-[11px] text-amber-900/80 leading-relaxed">
            Chọn một ô kính trên bản vẽ để thiết kế nan đồng.
          </p>
          <button
            type="button"
            disabled
            className="w-full py-2 px-3 rounded-xl bg-amber-400/50 text-white font-bold text-xs cursor-not-allowed opacity-70"
          >
            Thiết kế
          </button>
        </div>

        {/* Card Cấu hình vòm / góc */}
        {renderArchConfigCard()}
      </div>
    );
  }

  const paneOptions: Array<{ id: PaneType; label: string; icon: string }> = [
    { id: 'glass', label: 'Kính', icon: '🪟' },
    { id: 'screen', label: 'Lưới muỗi', icon: '🦟' },
    { id: 'louver', label: 'Nan chớp', icon: '📑' },
    { id: 'panel', label: 'Panel nhôm', icon: '⬛' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-3.5 p-3.5 text-xs select-none bg-white">
      {/* 1. Header Box */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs">
          <Sparkles size={14} className="text-amber-500" />
          <span>Tùy chọn ô kính</span>
        </div>
        <button
          type="button"
          onClick={onDeselect}
          className="text-[11px] text-blue-600 hover:underline cursor-pointer"
        >
          Đóng ô
        </button>
      </div>

      {/* 2. Cell Dimensions */}
      <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2">
        <div className="flex items-center justify-between text-blue-700 font-medium">
          <span>Kích thước ô cánh:</span>
          <span className="font-mono font-bold text-blue-900 text-xs">
            {selectedCell.w} × {selectedCell.h} mm
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <div>
            <label className="text-[10px] text-blue-600 font-semibold block mb-0.5">Rộng W (mm)</label>
            <input
              type="number"
              value={localW}
              onChange={(e) => setLocalW(Number(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyW();
              }}
              onBlur={handleApplyW}
              className="w-full h-7 px-2 font-mono font-bold text-xs rounded-lg border border-blue-200 bg-white text-blue-950 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-blue-600 font-semibold block mb-0.5">Cao H (mm)</label>
            <input
              type="number"
              value={localH}
              onChange={(e) => setLocalH(Number(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyH();
              }}
              onBlur={handleApplyH}
              className="w-full h-7 px-2 font-mono font-bold text-xs rounded-lg border border-blue-200 bg-white text-blue-950 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Kiểu mở riêng ô này */}
      <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-1 text-gray-700 font-semibold text-xs mb-1">
          <span>🚪 Kiểu mở riêng ô này</span>
        </div>
        <select
          value={selectedCell.sashType || 'fixed'}
          onChange={(e) => {
            const newSashType = e.target.value as any;
            const sashHasHandle = ['swing_left', 'swing_right', 'tilt_turn', 'awning', 'tilt', 'tilt_down', 'sliding'].includes(newSashType);
            const updates: Record<string, unknown> = { sashType: newSashType };
            if (sashHasHandle) {
              updates.hasLock = true;
              updates.handleHeight = Math.round(selectedCell.h / 2);
              updates.handleType = selectedCell.handleType ?? 'lever';
            } else if (!sashHasHandle) {
              updates.hasLock = false;
            }
            onUpdateCell(updates as any);
          }}
          className="w-full h-8 px-2.5 text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 font-medium"
        >
          <option value="fixed">Vách kính cố định (Fix)</option>
          <option value="swing_left">Cánh mở quay trái</option>
          <option value="swing_right">Cánh mở quay phải</option>
          <option value="awning">Cánh mở hất</option>
          <option value="tilt">Cánh mở lật</option>
          <option value="tilt_turn">Cánh mở quay & lật</option>
          <option value="sliding">Cánh trượt lùa</option>
        </select>
      </div>

      {/* 3.1. Cấu hình Khóa & Cao độ tay nắm */}
      {selectedCell.sashType && selectedCell.sashType !== 'fixed' && (
        <div className="space-y-2 p-2.5 rounded-xl bg-orange-50/70 border border-orange-200/80">
          {(() => {
            const isLockActive = selectedCell.hasLock ?? ['swing_left', 'swing_right', 'tilt_turn', 'awning', 'tilt', 'tilt_down'].includes(selectedCell.sashType || '');
            return (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-gray-800 font-semibold text-xs">
                    <Lock size={13} className="text-orange-600" />
                    <span>Khóa & Phụ kiện</span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={isLockActive}
                      onChange={(e) => onUpdateCell({ hasLock: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <span>Lắp khóa</span>
                  </label>
                </div>

                {isLockActive && (
            <div className="space-y-2 pt-1">
              <div>
                <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
                  <span>Cao độ tim khóa:</span>
                  <span className="font-mono font-bold text-orange-700">
                    {selectedCell.handleHeight ?? Math.round(selectedCell.h / 2)} mm
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={selectedCell.handleHeight ?? Math.round(selectedCell.h / 2)}
                    onChange={(e) => onUpdateCell({ handleHeight: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 pr-8 font-mono font-bold text-xs bg-white rounded-lg border border-orange-300 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-900"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-400">
                    mm
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-600 font-medium block mb-1">Kiểu tay nắm</label>
                <select
                  value={selectedCell.handleType || 'lever'}
                  onChange={(e) => onUpdateCell({ handleType: e.target.value as any })}
                  className="w-full h-8 px-2 text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-orange-500 font-medium text-slate-800"
                >
                  <option value="lever">Tay nắm gạt cửa đi (Lever handle)</option>
                  <option value="multipoint">Tay gạt đa điểm (Cửa sổ)</option>
                  <option value="pull">Tay nắm kéo chữ D</option>
                  <option value="crescent">Khóa bán nguyệt</option>
                </select>
              </div>
            </div>
          )}
        </>
      );
    })()}
  </div>
)}

      {/* 4. Loại vật liệu tấm (Pane Type) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1 text-gray-700 font-semibold text-xs">
          <Layers size={13} className="text-primary" />
          <span>Loại vật liệu tấm</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {paneOptions.map((opt) => {
            const isSelected = selectedCell.paneType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateCell({ paneType: opt.id })}
                className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 font-semibold text-blue-800 shadow-2xs'
                    : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="text-base">{opt.icon}</span>
                <span className="text-xs">{opt.label}</span>
                {isSelected && <Check size={13} className="ml-auto text-blue-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Kính (khi chọn Pane = Glass) */}
      {selectedCell.paneType === 'glass' && (
        <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-gray-800 font-bold text-xs">
            <span className="text-base">🪟</span>
            <span>Kính</span>
          </div>

          <div>
            <label className="text-[11px] text-gray-600 font-medium block mb-1">Loại kính cho ô này:</label>
            <select
              value={selectedCell.glassName || ''}
              onChange={(e) => onUpdateCell({ glassName: e.target.value || undefined })}
              className="w-full h-8 px-2.5 text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 font-medium text-slate-800"
            >
              <option value="">— Dùng kính mặc định —</option>
              {glassOptions.map(({ key, label }) => (
                <option key={key} value={label}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-500 italic mt-1.5">
              Mặc định: {defaultGlass?.name || 'Kính hộp trắng 5-6-5mm cường lực'}
            </p>
          </div>

          <div className="pt-1.5 border-t border-slate-200/60">
            <div className="text-[11px] text-gray-700 font-semibold mb-0.5">Chia kính</div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
              <span>Số tấm chia đều:</span>
            </div>
            <input
              type="number"
              min={1}
              max={10}
              value={selectedCell.glassSplitCount || 1}
              onChange={(e) => onUpdateCell({ glassSplitCount: Math.max(1, Number(e.target.value)) })}
              className="w-full h-8 px-2.5 font-mono font-bold text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 text-slate-800"
              placeholder="1"
            />
          </div>
        </div>
      )}

      {/* 5. Tùy chỉnh nẹp (Custom Edge Beads) */}
      <div className="space-y-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <div>
          <div className="flex items-center gap-1.5 text-gray-800 font-bold text-xs">
            <span className="text-base">🔲</span>
            <span>Tùy chỉnh nẹp</span>
          </div>
          <p className="text-[10.5px] text-gray-500 mt-0.5">Chọn nẹp cho cạnh cần thay</p>
        </div>

        {/* Nẹp ngang */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-700">Nẹp ngang</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-gray-500 font-semibold block mb-0.5">Dưới</span>
              <select
                value={selectedCell.customBeads?.bottom || ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  onUpdateCell({
                    customBeads: { ...selectedCell.customBeads, bottom: val },
                  });
                }}
                className="w-full h-7 px-1.5 text-[11px] bg-white rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
              >
                <option value="">— Mặc định —</option>
                {availableBeads?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-semibold block mb-0.5">Trên</span>
              <select
                value={selectedCell.customBeads?.top || ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  onUpdateCell({
                    customBeads: { ...selectedCell.customBeads, top: val },
                  });
                }}
                className="w-full h-7 px-1.5 text-[11px] bg-white rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
              >
                <option value="">— Mặc định —</option>
                {availableBeads?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Nẹp đứng */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-700">Nẹp đứng</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-gray-500 font-semibold block mb-0.5">Trái</span>
              <select
                value={selectedCell.customBeads?.left || ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  onUpdateCell({
                    customBeads: { ...selectedCell.customBeads, left: val },
                  });
                }}
                className="w-full h-7 px-1.5 text-[11px] bg-white rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
              >
                <option value="">— Mặc định —</option>
                {availableBeads?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-semibold block mb-0.5">Phải</span>
              <select
                value={selectedCell.customBeads?.right || ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  onUpdateCell({
                    customBeads: { ...selectedCell.customBeads, right: val },
                  });
                }}
                className="w-full h-7 px-1.5 text-[11px] bg-white rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
              >
                <option value="">— Mặc định —</option>
                {availableBeads?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Góc cắt ngàm nẹp */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
          <span className="text-[11px] text-gray-500">Góc cắt ngàm nẹp:</span>
          <div className="flex items-center gap-1">
            {[
              { id: '90', label: 'Cắt 90°' },
              { id: '45', label: 'Cắt 45°' },
            ].map((joint) => {
              const isSelected = (selectedCell.beadJoint || '90') === joint.id;
              return (
                <button
                  key={joint.id}
                  type="button"
                  onClick={() => onUpdateCell({ beadJoint: joint.id as BeadJointType })}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {joint.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5.1. Kính nan đồng */}
      {selectedCell.paneType === 'glass' && (
        <div className="space-y-2.5 p-3 rounded-xl bg-amber-50/60 border border-amber-200/80">
          <div>
            <div className="font-bold text-amber-950 text-xs flex items-center justify-between">
              <span>Kính nan đồng</span>
              {selectedCell.grilleConfig?.enabled && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                  {selectedCell.grilleConfig.cols}x{selectedCell.grilleConfig.rows}
                </span>
              )}
            </div>
            <p className="text-[10.5px] text-amber-800/80 mt-0.5 leading-snug">
              Thiết kế nan và hoa văn cho tấm kính đang chọn.
            </p>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => onOpenGrilleModal?.(selectedCell)}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Sparkles size={14} />
              <span>Thiết kế</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedCell.grilleConfig) {
                  onUpdateCell({
                    grilleConfig: {
                      ...selectedCell.grilleConfig,
                      borderOffset: 95,
                      cornerSize: 180,
                    },
                  });
                }
              }}
              className="w-full py-1.5 px-3 rounded-xl bg-amber-100/70 hover:bg-amber-200/60 text-amber-900 border border-amber-300/70 font-semibold text-xs transition-colors cursor-pointer"
            >
              Căn tim nan
            </button>
          </div>
        </div>
      )}

      {/* 6. Thao tác chia đố trong ô này */}
      <div className="space-y-2 pt-1 border-t border-gray-100">
        <div className="text-gray-700 font-semibold text-xs">Chia đố riêng ô này</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSplitCell('vertical')}
            className="py-1.5 px-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 text-[11px] cursor-pointer"
          >
            | Chia dọc làm 2
          </button>
          <button
            type="button"
            onClick={() => onSplitCell('horizontal')}
            className="py-1.5 px-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 text-[11px] cursor-pointer"
          >
            — Chia ngang làm 2
          </button>
        </div>
        {selectedCell.children && selectedCell.children.length > 0 && (
          <button
            type="button"
            onClick={onMergeCell}
            className="w-full py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 font-semibold text-[11px] hover:bg-red-100 transition-colors cursor-pointer"
          >
            Gộp ô (Xóa đố con)
          </button>
        )}
      </div>

      {/* 7. Cấu hình vòm / góc */}
      {renderArchConfigCard()}
    </div>
  );
};
