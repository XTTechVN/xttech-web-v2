'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Eraser, Maximize2, Minimize2, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SignaturePadProps {
  /** Nhận data URL PNG của chữ ký, hoặc null khi chưa ký / đã xóa */
  onChange: (dataUrl: string | null) => void;
  label?: string;
  height?: number;
  className?: string;
  /** Cho phép nút phóng to toàn màn hình / modal lớn (mặc định bật) */
  allowExpand?: boolean;
}

/** Ô ký tay trên canvas (chuột / cảm ứng / bút) trả về ảnh chữ ký PNG dạng data URL. */
export function SignaturePad({
  onChange,
  label,
  height = 160,
  className,
  allowExpand = true,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const isModalDrawingRef = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isModalEmpty, setIsModalEmpty] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const currentDataUrlRef = useRef<string | null>(null);

  const getContext = useCallback((canvas: HTMLCanvasElement | null) => {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return null;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    return ctx;
  }, []);

  // Đồng bộ kích thước canvas inline theo khung chứa để nét vẽ không bị méo
  const syncInlineCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return;
    canvas.width = rect.width * ratio;
    canvas.height = height * ratio;
    const ctx = canvas.getContext('2d');
    ctx?.scale(ratio, ratio);

    // Nếu đã có nét vẽ thì vẽ lại từ dataUrl
    if (currentDataUrlRef.current) {
      const img = new Image();
      img.onload = () => {
        ctx?.drawImage(img, 0, 0, rect.width, height);
      };
      img.src = currentDataUrlRef.current;
    }
  }, [height]);

  useEffect(() => {
    syncInlineCanvas();
    window.addEventListener('resize', syncInlineCanvas);
    return () => window.removeEventListener('resize', syncInlineCanvas);
  }, [syncInlineCanvas]);

  // Đồng bộ kích thước modal canvas khi mở modal phóng to
  useEffect(() => {
    if (!isExpanded) return;
    const timer = setTimeout(() => {
      const canvas = modalCanvasRef.current;
      if (!canvas) return;
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const ctx = canvas.getContext('2d');
      ctx?.scale(ratio, ratio);

      if (currentDataUrlRef.current) {
        setIsModalEmpty(false);
        const img = new Image();
        img.onload = () => {
          ctx?.drawImage(img, 0, 0, rect.width, rect.height);
        };
        img.src = currentDataUrlRef.current;
      } else {
        setIsModalEmpty(true);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [isExpanded]);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  // Xử lý vẽ trên inline canvas
  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = getContext(canvasRef.current);
    if (!ctx) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    const { x, y } = pointFromEvent(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.01, y + 0.01);
    ctx.stroke();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const ctx = getContext(canvasRef.current);
    if (!ctx) return;
    const { x, y } = pointFromEvent(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const finishStroke = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    setIsEmpty(false);
    const dataUrl = canvasRef.current?.toDataURL('image/png') ?? null;
    currentDataUrlRef.current = dataUrl;
    onChange(dataUrl);
  };

  const handleClearInline = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    setIsEmpty(true);
    currentDataUrlRef.current = null;
    onChange(null);
  };

  // Xử lý vẽ trên modal canvas
  const handleModalPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = getContext(modalCanvasRef.current);
    if (!ctx) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    isModalDrawingRef.current = true;
    const { x, y } = pointFromEvent(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.01, y + 0.01);
    ctx.stroke();
  };

  const handleModalPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isModalDrawingRef.current) return;
    const ctx = getContext(modalCanvasRef.current);
    if (!ctx) return;
    const { x, y } = pointFromEvent(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const finishModalStroke = () => {
    if (!isModalDrawingRef.current) return;
    isModalDrawingRef.current = false;
    setIsModalEmpty(false);
  };

  const handleClearModal = () => {
    const canvas = modalCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    setIsModalEmpty(true);
  };

  // Xác nhận chữ ký từ modal và lưu vào inline canvas
  const handleApplyModalSignature = () => {
    const modalCanvas = modalCanvasRef.current;
    if (!modalCanvas) return;
    if (isModalEmpty) {
      handleClearInline();
      setIsExpanded(false);
      return;
    }

    const dataUrl = modalCanvas.toDataURL('image/png');
    currentDataUrlRef.current = dataUrl;
    setIsEmpty(false);
    onChange(dataUrl);

    // Vẽ lại lên inline canvas
    const inlineCanvas = canvasRef.current;
    if (inlineCanvas) {
      const rect = inlineCanvas.getBoundingClientRect();
      const ctx = inlineCanvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, inlineCanvas.width, inlineCanvas.height);
        ctx.restore();
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, height);
        };
        img.src = dataUrl;
      }
    }
    setIsExpanded(false);
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <div className="text-xs font-semibold text-slate-700">{label}</div>}
      <div className="relative rounded-lg border border-dashed border-slate-300 bg-white shadow-xs">
        <canvas
          ref={canvasRef}
          style={{ height, touchAction: 'none' }}
          className="block w-full cursor-crosshair rounded-lg"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerLeave={finishStroke}
          onPointerCancel={finishStroke}
        />
        {isEmpty && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-300">
            Ký vào đây
          </span>
        )}

        {/* Nút thao tác góc trên bên phải */}
        <div className="absolute right-1.5 top-1.5 flex items-center gap-1.5">
          {allowExpand && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-white/95 px-2 py-1 text-[11px] font-medium text-slate-600 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 active:scale-95 sm:text-xs"
              title="Phóng to ô ký để ký dễ hơn trên điện thoại"
            >
              <Maximize2 size={12} className="text-primary" />
              <span>Phóng to</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleClearInline}
            className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-white/95 px-1.5 py-1 text-[11px] font-medium text-slate-500 shadow-xs transition hover:bg-slate-50 hover:text-slate-800 active:scale-95"
          >
            <Eraser size={12} />
            <span>Xóa</span>
          </button>
        </div>
      </div>

      {/* Modal / Dialog phóng to ô ký */}
      {isExpanded && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs transition-opacity sm:items-center sm:justify-center sm:p-4">
          <div
            className="relative flex h-[72vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl animate-in slide-in-from-bottom duration-200 sm:h-[65vh] sm:max-w-xl sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
          >
            {/* Header modal */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 sm:text-base">Ký tên điện tử</h3>
                <p className="text-[11px] text-slate-500">
                  Dùng ngón tay hoặc bút cảm ứng ký vào ô bên dưới
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Canvas phóng to toàn bộ chiều cao còn lại (~2/3 màn hình) */}
            <div className="relative flex-1 p-3">
              <div className="relative h-full w-full rounded-xl border-2 border-dashed border-teal-300 bg-slate-50/50">
                <canvas
                  ref={modalCanvasRef}
                  style={{ touchAction: 'none' }}
                  className="block h-full w-full cursor-crosshair rounded-xl bg-transparent"
                  onPointerDown={handleModalPointerDown}
                  onPointerMove={handleModalPointerMove}
                  onPointerUp={finishModalStroke}
                  onPointerLeave={finishModalStroke}
                  onPointerCancel={finishModalStroke}
                />
                {isModalEmpty && (
                  <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                    <span className="text-base font-medium">Ký vào đây</span>
                    <span className="mt-1 text-xs">Vùng ký rộng rãi giúp nét vẽ rõ ràng</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleClearModal}
                  className="absolute right-3 top-3 flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-xs hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                >
                  <Eraser size={14} /> Xóa làm lại
                </button>
              </div>
            </div>

            {/* Footer hành động */}
            <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 bg-slate-50/80 px-4 py-3 sm:rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleApplyModalSignature}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90 active:scale-95"
              >
                <Check size={15} /> Hoàn tất chữ ký
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
