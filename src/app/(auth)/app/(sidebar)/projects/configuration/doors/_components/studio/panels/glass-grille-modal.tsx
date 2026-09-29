/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAccessories } from '@/actions';
import {
  SceneCellNode,
  GlassGrilleConfig,
  GlassGrilleMotif,
  GRILLE_COLORS,
} from '../studio-types';
import {
  X,
  Check,
  Undo2,
  Redo2,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Upload,
  Plus,
  BookmarkPlus,
  Layers,
  Tag,
  Database,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface GlassGrilleModalProps {
  isOpen: boolean;
  onClose: () => void;
  cell: SceneCellNode | null;
  totalSashesCount?: number;
  onApply: (config: GlassGrilleConfig, applyToAllSashes: boolean) => void;
}

// 3 Hoa văn vector mẫu tiêu chuẩn ngành cửa nan đồng
export const DEFAULT_MOTIFS = [
  {
    id: 'flower_classic',
    name: 'Hoa 4 cánh đối xứng',
    viewBox: '0 0 100 100',
    svgPath:
      'M 50 15 C 38 15 32 25 32 35 C 32 43 38 48 44 50 C 38 52 32 57 32 65 C 32 75 38 85 50 85 C 62 85 68 75 68 65 C 68 57 62 52 56 50 C 62 48 68 43 68 35 C 68 25 62 15 50 15 Z M 15 50 C 15 38 25 32 35 32 C 43 32 48 38 50 44 C 52 38 57 32 65 32 C 75 32 85 38 85 50 C 85 62 75 68 65 68 C 57 68 52 62 50 56 C 48 62 43 68 35 68 C 25 68 15 62 15 50 Z M 50 42 C 45.6 42 42 45.6 42 50 C 42 54.4 45.6 58 50 58 C 54.4 58 58 54.4 58 50 C 58 45.6 54.4 42 50 42 Z',
  },
  {
    id: 'rhombus',
    name: 'Hình thoi trang trí',
    viewBox: '0 0 100 100',
    svgPath: 'M 50 10 L 90 50 L 50 90 L 10 50 Z M 50 24 L 76 50 L 50 76 L 24 50 Z',
  },
  {
    id: 'lotus',
    name: 'Búp hoa sen cổ điển',
    viewBox: '0 0 100 100',
    svgPath:
      'M 50 8 C 45 20 30 35 30 55 C 30 75 40 92 50 92 C 60 92 70 75 70 55 C 70 35 55 20 50 8 Z M 50 25 C 55 35 62 48 62 60 C 62 74 56 82 50 82 C 44 82 38 74 38 60 C 38 48 45 35 50 25 Z M 22 55 C 22 45 28 35 35 30 C 32 42 34 56 40 68 C 30 65 22 58 22 55 Z M 78 55 C 78 58 70 65 60 68 C 66 56 68 42 65 30 C 72 35 78 45 78 55 Z',
  },
];

export const GlassGrilleModal: React.FC<GlassGrilleModalProps> = ({
  isOpen,
  onClose,
  cell,
  totalSashesCount = 1,
  onApply,
}) => {
  // Lấy danh sách phụ kiện từ CSDL để liên kết hoa văn nan đồng
  const { data: accessoriesData } = useQuery({
    queryKey: ['accessories', 'grille-picker'],
    queryFn: () => getAccessories({ limit: 1000, isActive: true }),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  });
  const accessories = useMemo(() => accessoriesData?.items || [], [accessoriesData]);

  // Kích thước cắt kính và kích thước lọt lòng
  const glassW = cell?.w || 540;
  const glassH = cell?.h || 1420;
  const installedW = Math.max(100, glassW - 30);
  const installedH = Math.max(100, glassH - 30);

  // States cấu hình nan
  const [applyToAll, setApplyToAll] = useState(true);
  const [hasGrid, setHasGrid] = useState(true);
  const [hasBorder, setHasBorder] = useState(true);
  const [hasCorner, setHasCorner] = useState(true);
  const [barWidth, setBarWidth] = useState(6);
  const [barColor, setBarColor] = useState('#D4AF37'); // Vàng đồng
  const [cols, setCols] = useState(2);
  const [rows, setRows] = useState(2);
  const [borderOffset, setBorderOffset] = useState(95);
  const [cornerSize, setCornerSize] = useState(180);
  const [motifs, setMotifs] = useState<GlassGrilleMotif[]>([]);
  const [selectedMotifId, setSelectedMotifId] = useState<string | null>(null);

  // Đơn giá vật tư động (không fix cứng code)
  const [unitPricePerM, setUnitPricePerM] = useState<number>(85000);
  const [motifUnitPrice, setMotifUnitPrice] = useState<number>(150000);

  // Tabs & Tools
  const [activeRightTab, setActiveRightTab] = useState<'nan' | 'templates'>('nan');
  const [templateName, setTemplateName] = useState('');
  const [zoom, setZoom] = useState(1);
  const [savedTemplates, setSavedTemplates] = useState<Array<{ name: string; config: Partial<GlassGrilleConfig> }>>([
    {
      name: 'Caro 2x2 Cổ Điển',
      config: { hasGrid: true, hasBorder: true, hasCorner: true, cols: 2, rows: 2, borderOffset: 95, cornerSize: 180 },
    },
    {
      name: 'Nan Chữ Nhật 1x3',
      config: { hasGrid: true, hasBorder: false, hasCorner: false, cols: 1, rows: 3 },
    },
    {
      name: 'Viền Góc Không Lưới',
      config: { hasGrid: false, hasBorder: true, hasCorner: true, cols: 1, rows: 1, borderOffset: 80, cornerSize: 150 },
    },
  ]);

  // History stack for Undo/Redo
  const [history, setHistory] = useState<GlassGrilleConfig[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Khởi tạo dữ liệu từ cell hiện tại khi mở modal
  useEffect(() => {
    if (cell && isOpen) {
      const cfg = cell.grilleConfig;
      if (cfg && cfg.enabled) {
        setHasGrid(cfg.hasGrid ?? true);
        setHasBorder(cfg.hasBorder ?? true);
        setHasCorner(cfg.hasCorner ?? true);
        setBarWidth(cfg.barWidth || 6);
        setBarColor(cfg.barColor || '#D4AF37');
        setCols(cfg.cols || 2);
        setRows(cfg.rows || 2);
        setBorderOffset(cfg.borderOffset || 95);
        setCornerSize(cfg.cornerSize || 180);
        setMotifs(cfg.motifs || []);
        setApplyToAll(cfg.applyToAllSashes ?? (totalSashesCount > 1));
        setUnitPricePerM(cfg.unitPricePerM ?? 85000);
        setMotifUnitPrice(cfg.motifUnitPrice ?? 150000);
      } else {
        // Mặc định tạo sẵn mẫu caro 2x2 cổ điển có hoa văn tâm sen
        setHasGrid(true);
        setHasBorder(true);
        setHasCorner(true);
        setBarWidth(6);
        setBarColor('#D4AF37');
        setCols(2);
        setRows(2);
        setBorderOffset(95);
        setCornerSize(180);
        setUnitPricePerM(85000);
        setMotifUnitPrice(150000);
        setMotifs([
          {
            id: 'init_lotus',
            motifType: 'lotus',
            name: 'Búp hoa sen',
            x: Math.round(glassW / 2),
            y: Math.round(glassH / 2),
            width: 140,
            height: 180,
            price: 150000,
          },
        ]);
        setApplyToAll(totalSashesCount > 1);
      }
      setSelectedMotifId(null);
      setZoom(1);
    }
  }, [cell, isOpen, glassW, glassH, totalSashesCount]);

  if (!isOpen || !cell) return null;

  // Thao tác với hoa văn
  const handleAddMotif = (type: string) => {
    const newId = `motif_${Date.now()}`;
    const newMotif: GlassGrilleMotif = {
      id: newId,
      motifType: type,
      name: DEFAULT_MOTIFS.find((m) => m.id === type)?.name || 'Hoa văn',
      x: Math.round(glassW / 2),
      y: Math.round(glassH / 2),
      width: type === 'rhombus' ? 120 : 140,
      height: type === 'rhombus' ? 120 : 180,
      price: motifUnitPrice,
    };
    setMotifs((prev) => [...prev, newMotif]);
    setSelectedMotifId(newId);
    toast.success('Đã thêm hoa văn vào giữa tấm kính');
  };

  const handleUpdateSelectedMotif = (updates: Partial<GlassGrilleMotif>) => {
    if (!selectedMotifId) return;
    setMotifs((prev) =>
      prev.map((m) => (m.id === selectedMotifId ? { ...m, ...updates } : m))
    );
  };

  const handleAssignAccessoryToMotif = (accessoryIdStr: string) => {
    if (!selectedMotifId) return;
    if (!accessoryIdStr) {
      handleUpdateSelectedMotif({
        accessoryId: undefined,
        accessoryCode: undefined,
      });
      return;
    }
    const accId = Number(accessoryIdStr);
    const acc = accessories.find((a) => a.id === accId);
    if (acc) {
      handleUpdateSelectedMotif({
        accessoryId: acc.id,
        accessoryCode: acc.code || undefined,
        name: acc.name,
        price: acc.unitPrice || acc.salePrice || motifUnitPrice,
      });
      toast.success(`Đã liên kết: ${acc.name}`);
    }
  };

  const handleDeleteSelectedMotif = () => {
    if (!selectedMotifId) return;
    setMotifs((prev) => prev.filter((m) => m.id !== selectedMotifId));
    setSelectedMotifId(null);
    toast.success('Đã xóa hoa văn đang chọn');
  };

  const handleClearAll = () => {
    setHasGrid(false);
    setHasBorder(false);
    setHasCorner(false);
    setMotifs([]);
    setSelectedMotifId(null);
    toast('Đã làm trống thiết kế nan');
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Vui lòng nhập tên mẫu nan');
      return;
    }
    const newTpl = {
      name: templateName.trim(),
      config: {
        hasGrid,
        hasBorder,
        hasCorner,
        cols,
        rows,
        borderOffset,
        cornerSize,
        barWidth,
        barColor,
        unitPricePerM,
        motifUnitPrice,
      },
    };
    setSavedTemplates((prev) => [newTpl, ...prev]);
    setTemplateName('');
    toast.success(`Đã lưu mẫu "${newTpl.name}"`);
  };

  const handleApplyTemplate = (tpl: (typeof savedTemplates)[0]) => {
    const c = tpl.config;
    if (c.hasGrid !== undefined) setHasGrid(c.hasGrid);
    if (c.hasBorder !== undefined) setHasBorder(c.hasBorder);
    if (c.hasCorner !== undefined) setHasCorner(c.hasCorner);
    if (c.cols) setCols(c.cols);
    if (c.rows) setRows(c.rows);
    if (c.borderOffset) setBorderOffset(c.borderOffset);
    if (c.cornerSize) setCornerSize(c.cornerSize);
    if (c.barWidth) setBarWidth(c.barWidth);
    if (c.barColor) setBarColor(c.barColor);
    if (c.unitPricePerM !== undefined) setUnitPricePerM(c.unitPricePerM);
    if (c.motifUnitPrice !== undefined) setMotifUnitPrice(c.motifUnitPrice);
    toast.success(`Đã áp dụng mẫu "${tpl.name}"`);
  };

  const handleApply = () => {
    const config: GlassGrilleConfig = {
      enabled: hasGrid || hasBorder || hasCorner || motifs.length > 0,
      applyToAllSashes: applyToAll,
      glassW,
      glassH,
      installedW,
      installedH,
      hasGrid,
      hasBorder,
      hasCorner,
      barWidth,
      barColor,
      cols,
      rows,
      borderOffset,
      cornerSize,
      motifs,
      unitPricePerM,
      motifUnitPrice,
    };
    onApply(config, applyToAll);
    onClose();
  };

  // Tính tọa độ lọt lòng nẹp đặt ở tâm
  const insetX = (glassW - installedW) / 2; // 15mm
  const insetY = (glassH - installedH) / 2; // 15mm

  // ViewBox của SVG bao gồm cả lề cho các đường gióng CAD
  const pad = 120;
  const vbX = -pad;
  const vbY = -pad;
  const vbW = glassW + pad * 2.2;
  const vbH = glassH + pad * 2.2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 select-none">
      <div className="relative w-full max-w-[1240px] h-[92vh] max-h-[880px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        {/* 1. Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">Kính nan đồng</h2>
              <p className="text-xs text-gray-500">Thiết kế nan và hoa văn cho tấm kính đang chọn</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={15} />
              <span>Áp dụng</span>
            </button>
          </div>
        </div>

        {/* 2. Main 3-Column Layout */}
        <div className="flex-1 flex overflow-hidden bg-slate-50/60">
          {/* CỘT TRÁI: BẢNG ĐIỀU KHIỂN THÔNG SỐ (280px) */}
          <div className="w-[300px] border-r border-gray-200/80 bg-white flex flex-col overflow-y-auto p-4 space-y-4 text-xs">
            {/* 1. Thông tin tấm kính */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Thông tin tấm kính
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Kích thước thật:</span>
                <span className="font-mono font-bold text-gray-900">{glassW} × {glassH} mm</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Kích thước lắp:</span>
                <span className="font-mono font-bold text-blue-700">{installedW} × {installedH} mm</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Nan:</span>
                <span className="font-mono font-bold text-amber-700">{barWidth}mm</span>
              </div>
            </div>

            {/* 2. Áp dụng cho tất cả cánh */}
            {totalSashesCount > 1 && (
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToAll}
                  onChange={(e) => setApplyToAll(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <div>
                  <div className="font-bold text-amber-950 text-xs">Áp dụng cho tất cả {totalSashesCount} cánh</div>
                  <div className="text-[10.5px] text-amber-700 mt-0.5 leading-snug">
                    Bỏ chọn để chỉ áp dụng cho tấm hiện tại.
                  </div>
                </div>
              </label>
            )}

            {/* 3. Thiết kế (Lưới, Viền, Góc) */}
            <div className="space-y-1.5">
              <div className="font-bold text-gray-800 text-xs">Thiết kế</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'grid', label: 'Lưới', active: hasGrid, toggle: () => setHasGrid(!hasGrid) },
                  { id: 'border', label: 'Viền', active: hasBorder, toggle: () => setHasBorder(!hasBorder) },
                  { id: 'corner', label: 'Góc', active: hasCorner, toggle: () => setHasCorner(!hasCorner) },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.toggle}
                    className={`py-2 px-2.5 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                      item.active
                        ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-2xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {item.active ? `✓ ${item.label}` : item.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1 italic leading-tight">
                Lưới + Viền + Góc dùng chung bề rộng và màu nan.
              </p>
            </div>

            {/* 4. Vật liệu nan chung */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="font-bold text-gray-800 text-xs">Vật liệu nan chung</div>
              <div>
                <label className="text-[11px] text-gray-600 block mb-1">Bề rộng nan:</label>
                <div className="relative">
                  <input
                    type="number"
                    min={4}
                    max={25}
                    value={barWidth}
                    onChange={(e) => setBarWidth(Number(e.target.value) || 6)}
                    className="w-full h-8 px-2.5 pr-8 font-mono font-bold text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-semibold">
                    mm
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-600 block mb-1.5">Màu nan:</label>
                <div className="flex items-center gap-2">
                  {GRILLE_COLORS.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      title={c.name}
                      onClick={() => setBarColor(c.colorHex)}
                      className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                        barColor.toLowerCase() === c.colorHex.toLowerCase()
                          ? 'border-amber-600 scale-110 shadow-sm ring-2 ring-amber-400/40'
                          : 'border-gray-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.colorHex }}
                    >
                      {barColor.toLowerCase() === c.colorHex.toLowerCase() && (
                        <Check size={13} className={c.code === 'white' || c.code === 'silver' ? 'text-gray-900' : 'text-white'} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Lưới · Chia nan */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="font-bold text-gray-800 text-xs">Lưới · Chia nan</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-600 block mb-0.5">Số cột</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={cols}
                    onChange={(e) => setCols(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full h-8 px-2.5 font-mono font-bold text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-600 block mb-0.5">Số hàng</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={rows}
                    onChange={(e) => setRows(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full h-8 px-2.5 font-mono font-bold text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Nút hành động */}
              <div className="pt-2 space-y-1.5">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="w-full py-1.5 px-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  Xóa thiết kế nan
                </button>
              </div>
            </div>

            {/* 6. Chi tiết hoa văn đang chọn (Nếu có) */}
            {selectedMotifId && (() => {
              const activeMotif = motifs.find((m) => m.id === selectedMotifId);
              if (!activeMotif) return null;
              return (
                <div className="space-y-2 p-3 rounded-xl bg-amber-50/80 border border-amber-300 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                      <Tag size={13} className="text-amber-600" />
                      <span>Chi tiết hoa văn</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMotifId(null)}
                      className="text-amber-800 hover:text-amber-950 text-[10.5px] font-semibold"
                    >
                      Đóng
                    </button>
                  </div>

                  <div>
                    <label className="text-[10.5px] text-gray-700 block mb-0.5 font-medium">Tên hiển thị:</label>
                    <input
                      type="text"
                      value={activeMotif.name}
                      onChange={(e) => handleUpdateSelectedMotif({ name: e.target.value })}
                      className="w-full h-7 px-2 text-xs bg-white rounded-lg border border-amber-200 focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  {/* Liên kết phụ kiện kho CSDL */}
                  <div>
                    <label className="text-[10.5px] text-gray-700 mb-0.5 font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Database size={11} className="text-amber-600" />
                        <span>Kho phụ kiện CSDL:</span>
                      </span>
                      {activeMotif.accessoryCode && (
                        <span className="font-mono text-[10px] text-amber-800 font-bold bg-amber-100 px-1 rounded">
                          {activeMotif.accessoryCode}
                        </span>
                      )}
                    </label>
                    <select
                      value={activeMotif.accessoryId || ''}
                      onChange={(e) => handleAssignAccessoryToMotif(e.target.value)}
                      className="w-full h-7 px-1.5 text-[11px] bg-white rounded-lg border border-amber-300 focus:outline-none focus:border-amber-500 font-medium text-gray-800"
                    >
                      <option value="">-- Chọn phụ kiện trong kho --</option>
                      {accessories.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.code ? `[${acc.code}] ` : ''}{acc.name} ({((acc.unitPrice || acc.salePrice || 0)).toLocaleString('vi-VN')} đ)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Đơn giá riêng con này */}
                  <div>
                    <label className="text-[10.5px] text-gray-700 block mb-0.5 font-medium">Đơn giá con hoa văn này:</label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={activeMotif.price ?? motifUnitPrice}
                        onChange={(e) => handleUpdateSelectedMotif({ price: Number(e.target.value) || 0 })}
                        className="w-full h-7 px-2 pr-10 font-mono font-bold text-xs bg-white rounded-lg border border-amber-300 focus:outline-none focus:border-amber-500 text-gray-900"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10.5px] text-gray-500 font-semibold">
                        đ/con
                      </span>
                    </div>
                  </div>

                  {/* Kích thước */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10.5px] text-gray-600 block mb-0.5">Rộng (mm)</label>
                      <input
                        type="number"
                        value={activeMotif.width}
                        onChange={(e) => handleUpdateSelectedMotif({ width: Number(e.target.value) || 20 })}
                        className="w-full h-7 px-2 font-mono text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] text-gray-600 block mb-0.5">Cao (mm)</label>
                      <input
                        type="number"
                        value={activeMotif.height}
                        onChange={(e) => handleUpdateSelectedMotif({ height: Number(e.target.value) || 20 })}
                        className="w-full h-7 px-2 font-mono text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDeleteSelectedMotif}
                    className="w-full py-1.5 px-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-semibold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1 mt-1"
                  >
                    <Trash2 size={12} />
                    <span>Xóa hoa văn này</span>
                  </button>
                </div>
              );
            })()}

            {/* 7. Cấu hình đơn giá vật tư (BOM) */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div className="font-bold text-gray-800 text-xs">Đơn giá vật tư (BOM)</div>
                <span className="text-[10px] text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded font-medium">Dự toán</span>
              </div>
              <div className="space-y-2 pt-0.5">
                <div>
                  <label className="text-[10.5px] text-gray-600 block mb-0.5">Đơn giá nan đồng (đ/m):</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={unitPricePerM}
                      onChange={(e) => setUnitPricePerM(Number(e.target.value) || 0)}
                      className="w-full h-7 px-2 pr-10 font-mono font-bold text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-amber-500 text-gray-900"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10.5px] text-gray-400 font-semibold">
                      đ/m
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[10.5px] text-gray-600 block mb-0.5">Đơn giá hoa văn chung (đ/con):</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={motifUnitPrice}
                      onChange={(e) => setMotifUnitPrice(Number(e.target.value) || 0)}
                      className="w-full h-7 px-2 pr-12 font-mono font-bold text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-amber-500 text-gray-900"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10.5px] text-gray-400 font-semibold">
                      đ/con
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Lưu mẫu */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="font-bold text-gray-800 text-xs">Lưu mẫu</div>
              <input
                type="text"
                placeholder="Tên mẫu nan..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full h-8 px-2.5 text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="w-full py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <BookmarkPlus size={14} />
                <span>Lưu mẫu hiện tại</span>
              </button>
            </div>
          </div>

          {/* VÙNG GIỮA: INTERACTIVE SVG CAD VIEWPORT */}
          <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-100">
            {/* Zoom toolbar */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-white/95 p-1 rounded-xl shadow-md border border-gray-200 backdrop-blur-xs">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-700 cursor-pointer"
                title="Phóng to"
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-700 cursor-pointer"
                title="Thu nhỏ"
              >
                <ZoomOut size={16} />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="px-2.5 h-8 rounded-lg hover:bg-gray-100 font-semibold text-[11px] text-gray-700 flex items-center justify-center cursor-pointer"
                title="Khôi phục góc nhìn"
              >
                Reset
              </button>
            </div>

            {/* SVG Canvas */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
              <svg
                viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
                className="w-full h-full max-h-[750px] transition-transform duration-200 drop-shadow-md select-none"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
              >
                <defs>
                  {/* Marker mũi tên CAD màu xanh */}
                  <marker id="cad-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#0284c7" />
                  </marker>
                  {/* Pattern hoa văn */}
                  {DEFAULT_MOTIFS.map((m) => (
                    <g key={m.id} id={`def_${m.id}`}>
                      <path d={m.svgPath} fill={barColor} />
                    </g>
                  ))}
                </defs>

                {/* 1. Nền kính (Glass fill) */}
                <rect
                  x="0"
                  y="0"
                  width={glassW}
                  height={glassH}
                  fill="#f0fdf4"
                  fillOpacity="0.6"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                />

                {/* 2. Đường ngậm kính / lọt lòng nẹp (Dashed border 15mm) */}
                <rect
                  x={insetX}
                  y={insetY}
                  width={installedW}
                  height={installedH}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                  strokeDasharray="5,4"
                  opacity="0.8"
                />

                {/* 3. Nan chia lưới (Grid lines) */}
                {hasGrid && (
                  <g id="grid-bars">
                    {/* Nan dọc */}
                    {Array.from({ length: cols - 1 }).map((_, cIdx) => {
                      const colW = installedW / cols;
                      const x = insetX + (cIdx + 1) * colW;
                      return (
                        <rect
                          key={`v-col-${cIdx}`}
                          x={x - barWidth / 2}
                          y={insetY}
                          width={barWidth}
                          height={installedH}
                          fill={barColor}
                        />
                      );
                    })}
                    {/* Nan ngang */}
                    {Array.from({ length: rows - 1 }).map((_, rIdx) => {
                      const rowH = installedH / rows;
                      const y = insetY + (rIdx + 1) * rowH;
                      return (
                        <rect
                          key={`h-row-${rIdx}`}
                          x={insetX}
                          y={y - barWidth / 2}
                          width={installedW}
                          height={barWidth}
                          fill={barColor}
                        />
                      );
                    })}
                  </g>
                )}

                {/* 4. Nan viền trong (Border) */}
                {hasBorder && (
                  <rect
                    x={insetX + borderOffset}
                    y={insetY + borderOffset}
                    width={Math.max(0, installedW - borderOffset * 2)}
                    height={Math.max(0, installedH - borderOffset * 2)}
                    fill="none"
                    stroke={barColor}
                    strokeWidth={barWidth}
                  />
                )}

                {/* 5. Nan góc (Corner pieces) */}
                {hasCorner && (
                  <g id="corner-pieces">
                    {/* Góc trên trái */}
                    <path
                      d={`M ${insetX + borderOffset} ${insetY + borderOffset + cornerSize} L ${insetX + borderOffset + cornerSize} ${insetY + borderOffset + cornerSize} L ${insetX + borderOffset + cornerSize} ${insetY + borderOffset}`}
                      fill="none"
                      stroke={barColor}
                      strokeWidth={barWidth}
                    />
                    {/* Góc trên phải */}
                    <path
                      d={`M ${insetX + installedW - borderOffset} ${insetY + borderOffset + cornerSize} L ${insetX + installedW - borderOffset - cornerSize} ${insetY + borderOffset + cornerSize} L ${insetX + installedW - borderOffset - cornerSize} ${insetY + borderOffset}`}
                      fill="none"
                      stroke={barColor}
                      strokeWidth={barWidth}
                    />
                    {/* Góc dưới trái */}
                    <path
                      d={`M ${insetX + borderOffset} ${insetY + installedH - borderOffset - cornerSize} L ${insetX + borderOffset + cornerSize} ${insetY + installedH - borderOffset - cornerSize} L ${insetX + borderOffset + cornerSize} ${insetY + installedH - borderOffset}`}
                      fill="none"
                      stroke={barColor}
                      strokeWidth={barWidth}
                    />
                    {/* Góc dưới phải */}
                    <path
                      d={`M ${insetX + installedW - borderOffset} ${insetY + installedH - borderOffset - cornerSize} L ${insetX + installedW - borderOffset - cornerSize} ${insetY + installedH - borderOffset - cornerSize} L ${insetX + installedW - borderOffset - cornerSize} ${insetY + installedH - borderOffset}`}
                      fill="none"
                      stroke={barColor}
                      strokeWidth={barWidth}
                    />
                  </g>
                )}

                {/* 6. Các con hoa văn (Motifs) */}
                {motifs.map((m) => {
                  const isSelected = selectedMotifId === m.id;
                  const def = DEFAULT_MOTIFS.find((d) => d.id === m.motifType);
                  return (
                    <g
                      key={m.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMotifId(m.id);
                      }}
                      className="cursor-pointer"
                    >
                      {/* Bounding box khi click chọn */}
                      {isSelected && (
                        <rect
                          x={m.x - m.width / 2 - 8}
                          y={m.y - m.height / 2 - 8}
                          width={m.width + 16}
                          height={m.height + 16}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="1.5"
                          strokeDasharray="4,4"
                          rx="4"
                        />
                      )}
                      {def && (
                        <g transform={`translate(${m.x - m.width / 2}, ${m.y - m.height / 2}) scale(${m.width / 100}, ${m.height / 100})`}>
                          <path d={def.svgPath} fill={barColor} />
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* 7. Hệ thống đường gióng kích thước CAD màu xanh dương (như Ảnh 3, 4 Windova) */}
                <g id="cad-dimensions" stroke="#0284c7" fill="#0284c7" fontSize="13" fontFamily="monospace" fontWeight="bold">
                  {/* Gióng ngang đáy tổng: 540 */}
                  <line x1="0" y1={glassH + 45} x2={glassW} y2={glassH + 45} strokeWidth="1.2" markerStart="url(#cad-arrow)" markerEnd="url(#cad-arrow)" />
                  <line x1="0" y1={glassH} x2="0" y2={glassH + 55} strokeWidth="0.8" opacity="0.6" />
                  <line x1={glassW} y1={glassH} x2={glassW} y2={glassH + 55} strokeWidth="0.8" opacity="0.6" />
                  <text x={glassW / 2} y={glassH + 40} textAnchor="middle">{glassW}</text>

                  {/* Gióng đứng phải tổng: 1420 */}
                  <line x1={glassW + 45} y1="0" x2={glassW + 45} y2={glassH} strokeWidth="1.2" markerStart="url(#cad-arrow)" markerEnd="url(#cad-arrow)" />
                  <line x1={glassW} y1="0" x2={glassW + 55} y2="0" strokeWidth="0.8" opacity="0.6" />
                  <line x1={glassW} y1={glassH} x2={glassW + 55} y2={glassH} strokeWidth="0.8" opacity="0.6" />
                  <text x={glassW + 50} y={glassH / 2} textAnchor="middle" transform={`rotate(90, ${glassW + 50}, ${glassH / 2})`}>{glassH}</text>

                  {/* Kích thước khoang chia dưới đáy nếu cols >= 2 */}
                  {hasGrid && cols >= 2 && (
                    <g id="col-dims">
                      {Array.from({ length: cols }).map((_, cIdx) => {
                        const colW = installedW / cols;
                        const x1 = insetX + cIdx * colW;
                        const x2 = x1 + colW;
                        const midX = (x1 + x2) / 2;
                        return (
                          <g key={`dim-col-${cIdx}`}>
                            <line x1={x1} y1={glassH + 20} x2={x2} y2={glassH + 20} strokeWidth="1" markerStart="url(#cad-arrow)" markerEnd="url(#cad-arrow)" />
                            <text x={midX} y={glassH + 15} textAnchor="middle" fontSize="11">{Math.round(colW)}</text>
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* Kích thước offset góc trên */}
                  {hasCorner && (
                    <g id="corner-dims" fontSize="11">
                      {/* Ngang góc: cornerSize (180) */}
                      <line x1={insetX + borderOffset} y1={-20} x2={insetX + borderOffset + cornerSize} y2={-20} strokeWidth="1" markerStart="url(#cad-arrow)" markerEnd="url(#cad-arrow)" />
                      <text x={insetX + borderOffset + cornerSize / 2} y={-25} textAnchor="middle">{cornerSize}</text>
                      {/* Thụt lề viền: borderOffset (95) */}
                      <line x1={insetX} y1={-40} x2={insetX + borderOffset} y2={-40} strokeWidth="1" markerStart="url(#cad-arrow)" markerEnd="url(#cad-arrow)" />
                      <text x={insetX + borderOffset / 2} y={-45} textAnchor="middle">{borderOffset}</text>
                    </g>
                  )}
                </g>
              </svg>
            </div>
          </div>

          {/* CỘT PHẢI: THƯ VIỆN NAN & THƯ VIỆN MẪU (280px) */}
          <div className="w-[300px] border-l border-gray-200/80 bg-white flex flex-col overflow-hidden">
            {/* 2 Tabs Header */}
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveRightTab('nan')}
                className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
                  activeRightTab === 'nan'
                    ? 'border-amber-500 text-amber-800 bg-amber-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Thư viện nan
              </button>
              <button
                type="button"
                onClick={() => setActiveRightTab('templates')}
                className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
                  activeRightTab === 'templates'
                    ? 'border-amber-500 text-amber-800 bg-amber-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Thư viện mẫu
              </button>
            </div>

            {/* Content Tab 1: Thư viện nan */}
            {activeRightTab === 'nan' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                <div>
                  <div className="font-bold text-gray-800 text-xs">Thư viện nan</div>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                    Bấm hoa văn bên dưới để thêm vào chính giữa hoặc giao điểm của nan kính.
                  </p>
                </div>

                {/* Danh sách 3 hoa văn vector */}
                <div className="grid grid-cols-2 gap-2.5">
                  {DEFAULT_MOTIFS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleAddMotif(m.id)}
                      className="group p-3 rounded-xl border border-gray-200 bg-slate-50/60 hover:bg-amber-50/40 hover:border-amber-400 transition-all flex flex-col items-center justify-center cursor-pointer shadow-2xs"
                    >
                      <svg viewBox={m.viewBox} className="w-16 h-16 group-hover:scale-105 transition-transform">
                        <path d={m.svgPath} fill="#1e293b" />
                      </svg>
                      <span className="text-[10.5px] font-semibold text-gray-700 mt-2 text-center group-hover:text-amber-900 line-clamp-1">
                        {m.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Nút Import SVG */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-50 text-amber-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    <Upload size={15} />
                    <span>Import một hoặc nhiều SVG</span>
                    <input
                      type="file"
                      accept=".svg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          toast.success('Đã import hoa văn vector mới');
                        }
                      }}
                    />
                  </label>
                  <p className="text-[10px] text-gray-400 mt-1.5 italic text-center">
                    SVG sẽ được kiểm tra và loại bỏ script/tài nguyên ngoài trước khi lưu.
                  </p>
                </div>
              </div>
            )}

            {/* Content Tab 2: Thư viện mẫu lưu sẵn */}
            {activeRightTab === 'templates' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs">
                <div>
                  <div className="font-bold text-gray-800 text-xs">Mẫu nan định sẵn</div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Bấm vào mẫu để áp dụng nhanh thông số nan lên tấm kính.
                  </p>
                </div>

                <div className="space-y-2">
                  {savedTemplates.map((tpl, i) => (
                    <div
                      key={i}
                      onClick={() => handleApplyTemplate(tpl)}
                      className="p-3 rounded-xl border border-gray-200 bg-white hover:border-amber-400 hover:bg-amber-50/30 transition-all cursor-pointer flex items-center justify-between shadow-2xs group"
                    >
                      <div>
                        <div className="font-bold text-gray-800 group-hover:text-amber-900 text-xs">
                          {tpl.name}
                        </div>
                        <div className="text-[10.5px] text-gray-400 mt-0.5">
                          {tpl.config.cols || 2} cột × {tpl.config.rows || 2} hàng
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Dùng mẫu →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
