'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import {
  ArrowLeft, Save, Trash2, Tag, ZoomIn, ZoomOut,
  RotateCcw, CheckCircle, MousePointer, Square,
} from 'lucide-react';
import type { LabelImage, LabelClass, LabelAnnotation } from '@/types/shared/label';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Box {
  uid: string;          // temp local id
  classId: number;
  className: string;
  x: number;           // normalised 0-1 (YOLO center format)
  y: number;
  w: number;
  h: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4',
];
const classColor = (classId: number) => COLORS[classId % COLORS.length];

function annToBox(ann: LabelAnnotation): Box {
  return {
    uid: ann.id,
    classId: ann.classId,
    className: ann.className,
    x: ann.xCenter,
    y: ann.yCenter,
    w: ann.width,
    h: ann.height,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LabelCanvas({ imageId }: { imageId: string }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // ── State ─────────────────────────────────────────────────────────────────

  const [boxes, setBoxes] = useState<Box[]>([]);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number>(0);
  const [tool, setTool] = useState<'select' | 'draw'>('draw');
  const [zoom, setZoom] = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);

  // drawing
  const drawing = useRef(false);
  const startPt = useRef({ x: 0, y: 0 });
  const curPt = useRef({ x: 0, y: 0 });

  // ── API: load image ───────────────────────────────────────────────────────

  const { data: image, isLoading: imgLoading } = useQuery<LabelImage>({
    queryKey: ['label-image', imageId],
    queryFn: () => api.get(`/api/v1/label/images/${imageId}`).then(r => r.data),
  });

  const { data: classes = [], refetch: refetchClasses } = useQuery<LabelClass[]>({
    queryKey: ['label-classes-active'],
    queryFn: () => api.get('/api/v1/label/classes/active').then(r => r.data),
  });

  // ── Add class inline ──
  const [addingClass, setAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const createClassMutation = useMutation({
    mutationFn: () => {
      const classId = classes.length; // auto increment
      return api.post('/api/v1/label/classes', {
        class_id: classId,
        name: newClassName.trim(),
        is_active: true,
      });
    },
    onSuccess: () => {
      refetchClasses();
      setNewClassName('');
      setAddingClass(false);
      toast.success('Thêm class thành công');
    },
    onError: () => toast.error('Thêm class thất bại'),
  });

  const deleteClassMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/label/classes/${id}`),
    onSuccess: () => {
      refetchClasses();
      toast.success('Xóa class thành công');
    },
    onError: () => toast.error('Xóa class thất bại'),
  });

  // ── Init boxes from API ───────────────────────────────────────────────────

  useEffect(() => {
    if (image?.annotations) {
      setBoxes(image.annotations.map(annToBox));
    }
  }, [image]);

  // ── Load image into canvas ────────────────────────────────────────────────

  useEffect(() => {
    if (!image?.imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = image.imageUrl;
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
    };
  }, [image?.imageUrl]);

  // ── Render canvas ─────────────────────────────────────────────────────────

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw all boxes
    boxes.forEach((box) => {
      const cx = box.x * canvas.width;
      const cy = box.y * canvas.height;
      const bw = box.w * canvas.width;
      const bh = box.h * canvas.height;
      const x = cx - bw / 2;
      const y = cy - bh / 2;

      const color = classColor(box.classId);
      const isSelected = box.uid === selectedUid;

      ctx.strokeStyle = color;
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(x, y, bw, bh);

      // Fill semi-transparent
      ctx.fillStyle = color + '22';
      ctx.fillRect(x, y, bw, bh);

      // Label background
      const label = `${box.classId}: ${box.className}`;
      ctx.font = 'bold 12px Inter, sans-serif';
      const tw = ctx.measureText(label).width + 8;
      ctx.fillStyle = color;
      ctx.fillRect(x, y - 18, tw, 18);
      ctx.fillStyle = '#fff';
      ctx.fillText(label, x + 4, y - 4);

      // Selected indicator
      if (isSelected) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x - 1, y - 1, bw + 2, bh + 2);
        ctx.setLineDash([]);
      }
    });

    // Draw in-progress box
    if (drawing.current) {
      const x = Math.min(startPt.current.x, curPt.current.x);
      const y = Math.min(startPt.current.y, curPt.current.y);
      const w = Math.abs(curPt.current.x - startPt.current.x);
      const h = Math.abs(curPt.current.y - startPt.current.y);
      const color = classColor(selectedClassId);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = color + '22';
      ctx.fillRect(x, y, w, h);
      ctx.setLineDash([]);
    }
  }, [boxes, selectedUid, selectedClassId]);

  // Redraw khi boxes / selection / class đổi
  useEffect(() => {
    if (imgLoaded) render();
  }, [imgLoaded, render]);

  // ── Canvas size — based on image natural dimensions × zoom ──────────────
  //   Canvas internal px = img natural size × zoom (capped 1400px wide)
  //   CSS max-w-full shrinks display if needed; toCanvasXY handles scaling.

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;

    const MAX_W = 1400;
    const scale = Math.min(MAX_W / img.naturalWidth, 1) * zoom;
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    render();
  }, [imgLoaded, zoom]); // ← KHÔNG đưa render vào deps, chỉ resize khi zoom/ảnh đổi

  // ── Canvas → normalised coords ────────────────────────────────────────────

  const toCanvasXY = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const toNorm = (px: number, py: number, pw: number, ph: number): Omit<Box, 'uid' | 'classId' | 'className'> => {
    const cw = canvasRef.current!.width;
    const ch = canvasRef.current!.height;
    return {
      x: (px + pw / 2) / cw,
      y: (py + ph / 2) / ch,
      w: pw / cw,
      h: ph / ch,
    };
  };

  // ── Mouse events ─────────────────────────────────────────────────────────

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = toCanvasXY(e);

    if (tool === 'select') {
      // Find clicked box
      const canvas = canvasRef.current!;
      const hit = [...boxes].reverse().find((box) => {
        const cx = box.x * canvas.width;
        const cy = box.y * canvas.height;
        const bw = box.w * canvas.width;
        const bh = box.h * canvas.height;
        return (
          x >= cx - bw / 2 && x <= cx + bw / 2 &&
          y >= cy - bh / 2 && y <= cy + bh / 2
        );
      });
      setSelectedUid(hit?.uid ?? null);
      render();
      return;
    }

    // draw mode
    drawing.current = true;
    startPt.current = { x, y };
    curPt.current = { x, y };
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    curPt.current = toCanvasXY(e);
    render();
  };

  const onMouseUp = () => {
    if (!drawing.current) return;
    drawing.current = false;

    const x = Math.min(startPt.current.x, curPt.current.x);
    const y = Math.min(startPt.current.y, curPt.current.y);
    const w = Math.abs(curPt.current.x - startPt.current.x);
    const h = Math.abs(curPt.current.y - startPt.current.y);

    if (w < 8 || h < 8) { render(); return; } // bỏ box quá nhỏ

    const selectedClass = classes.find(c => c.classId === selectedClassId);
    const norm = toNorm(x, y, w, h);
    const newBox: Box = {
      uid: `new_${Date.now()}`,
      classId: selectedClassId,
      className: selectedClass?.name ?? 'unknown',
      ...norm,
    };
    setBoxes(prev => [...prev, newBox]);
    setSelectedUid(newBox.uid);
    render();
  };

  // ── Delete selected box ───────────────────────────────────────────────────

  const deleteSelected = () => {
    if (!selectedUid) return;
    setBoxes(prev => prev.filter(b => b.uid !== selectedUid));
    setSelectedUid(null);
  };

  // Keyboard shortcut Delete / Backspace
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedUid) {
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedUid]); // eslint-disable-line

  // ── Update class of selected box ──────────────────────────────────────────

  const updateSelectedClass = (classId: number, className: string) => {
    if (!selectedUid) return;
    setBoxes(prev =>
      prev.map(b => b.uid === selectedUid ? { ...b, classId, className } : b)
    );
  };

  // ── Save ─────────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: () =>
      api.put(`/api/v1/label/images/${imageId}/annotations`, {
        annotations: boxes.map(b => ({
          class_id: b.classId,
          class_name: b.className,
          x_center: b.x,
          y_center: b.y,
          width: b.w,
          height: b.h,
        })),
      }),
    onSuccess: () => {
      toast.success('Đã lưu annotations!');
    },
    onError: () => toast.error('Lưu thất bại'),
  });

  // ── Render ────────────────────────────────────────────────────────────────

  const selectedBox = boxes.find(b => b.uid === selectedUid);

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-gray-50">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => router.back()}>
            Quay lại
          </Button>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <Tag size={14} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
              {image?.note ?? image?.id?.slice(0, 8) ?? 'Loading...'}
            </span>
            {image?.isLabeled && (
              <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                <CheckCircle size={10} /> Đã label
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tool toggles */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setTool('select')}
              title="Chọn (S)"
              className={`p-1.5 rounded-md transition-colors ${tool === 'select' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <MousePointer size={15} />
            </button>
            <button
              onClick={() => setTool('draw')}
              title="Vẽ box (D)"
              className={`p-1.5 rounded-md transition-colors ${tool === 'draw' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Square size={15} />
            </button>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-white transition-colors">
              <ZoomOut size={15} />
            </button>
            <span className="text-xs font-mono text-gray-600 w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-white transition-colors">
              <ZoomIn size={15} />
            </button>
          </div>

          <Button variant="outline" size="sm" icon={<RotateCcw size={14} />} onClick={() => { setBoxes([]); setSelectedUid(null); }}>
            Xóa tất cả
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Save size={14} />}
            isLoading={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            Lưu ({boxes.length} box)
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Canvas area ── */}
        <div className="flex-1 overflow-auto p-4 flex justify-center items-start">
          {imgLoading && (
            <div className="flex items-center justify-center w-full h-64 text-gray-400">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          )}
          {imgLoaded && (
            <canvas
              ref={canvasRef}
              className="rounded-xl shadow-lg border border-gray-200 max-w-full"
              style={{ cursor: tool === 'draw' ? 'crosshair' : 'default' }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            />
          )}
        </div>

        {/* ── Right panel ── */}
        <div className="w-64 bg-white border-l border-gray-200 flex flex-col shrink-0">

          {/* Class selector */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Loại đối tượng</p>
            {classes.length === 0 && !addingClass ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">Chưa có class nào.</p>
                <button
                  onClick={() => setAddingClass(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-blue-300 text-blue-600 text-xs font-medium hover:bg-blue-50 transition-colors"
                >
                  + Thêm class
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {classes.map(cls => (
                  <button
                    key={cls.id}
                    onClick={() => {
                      setSelectedClassId(cls.classId);
                      if (selectedUid) updateSelectedClass(cls.classId, cls.name);
                    }}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedClassId === cls.classId
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    style={selectedClassId === cls.classId ? { backgroundColor: classColor(cls.classId) } : {}}
                  >
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: classColor(cls.classId) }} />
                    <span className="truncate flex-1 text-left">{cls.name}</span>
                    <span className="text-[10px] opacity-60">#{cls.classId}</span>
                    <span
                      role="button"
                      title="Xóa class"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Xóa class "${cls.name}"?`)) deleteClassMutation.mutate(cls.id);
                      }}
                      className={`opacity-0 group-hover:opacity-100 ml-1 p-0.5 rounded hover:bg-red-100 transition-all ${
                        selectedClassId === cls.classId ? 'text-white/70 hover:text-red-300' : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Trash2 size={11} />
                    </span>
                  </button>
                ))}
                {/* Add more class button */}
                {addingClass ? (
                  <div className="mt-1 flex flex-col gap-1.5">
                    <input
                      autoFocus
                      className="w-full text-xs px-2 py-1.5 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Tên class, VD: person"
                      value={newClassName}
                      onChange={e => setNewClassName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newClassName.trim()) createClassMutation.mutate();
                        if (e.key === 'Escape') { setAddingClass(false); setNewClassName(''); }
                      }}
                    />
                    <div className="flex gap-1">
                      <button
                        disabled={!newClassName.trim() || createClassMutation.isPending}
                        onClick={() => createClassMutation.mutate()}
                        className="flex-1 text-xs px-2 py-1 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {createClassMutation.isPending ? '...' : 'Lưu'}
                      </button>
                      <button
                        onClick={() => { setAddingClass(false); setNewClassName(''); }}
                        className="text-xs px-2 py-1 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        Huỷ
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingClass(true)}
                    className="mt-1 w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-dashed border-gray-200 text-gray-400 text-xs hover:border-blue-300 hover:text-blue-500 transition-colors"
                  >
                    + Thêm class
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Annotation list */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Danh sách box ({boxes.length})
              </p>
              {boxes.length === 0 ? (
                <p className="text-xs text-gray-400">Chưa có box nào. Vẽ bằng cách kéo chuột trên ảnh.</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {boxes.map((box, i) => (
                    <div
                      key={box.uid}
                      onClick={() => setSelectedUid(box.uid)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        selectedUid === box.uid ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: classColor(box.classId) }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{box.className}</p>
                        <p className="text-[10px] text-gray-400">Box #{i + 1}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setBoxes(prev => prev.filter(b => b.uid !== box.uid)); if (selectedUid === box.uid) setSelectedUid(null); }}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected box info */}
          {selectedBox && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Box đang chọn</p>
              <div className="text-xs space-y-1 text-gray-600 font-mono">
                <div className="flex justify-between"><span>cx:</span><span>{selectedBox.x.toFixed(4)}</span></div>
                <div className="flex justify-between"><span>cy:</span><span>{selectedBox.y.toFixed(4)}</span></div>
                <div className="flex justify-between"><span>w:</span><span>{selectedBox.w.toFixed(4)}</span></div>
                <div className="flex justify-between"><span>h:</span><span>{selectedBox.h.toFixed(4)}</span></div>
              </div>
              <button
                onClick={deleteSelected}
                className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 size={12} /> Xóa box này (Del)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
