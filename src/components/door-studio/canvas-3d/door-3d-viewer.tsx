'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ColorSwatch, FrameConfig, FrameShape, SashConfig, SceneCellNode } from '../studio-types';
import { ProfileBar } from '@/types/profile';
import { buildDoor3DGeometry, SlidingCycleDirection } from './door-3d-scene-builder';
import { Door3DWebGLEngine } from './door-3d-webgl-engine';
import { Door3DHud } from './door-3d-hud';
import { Vec3 } from './door-3d-math';

export interface Door3DViewerProps {
  w: number;
  h: number;
  aluminumColor: string;
  hardwareColor: string;
  frameShape: FrameShape;
  rootCell: SceneCellNode;
  frameConfig?: FrameConfig;
  sashConfig?: SashConfig;
  availableProfiles?: ProfileBar[];
  aluminumColors?: ColorSwatch[];
  onSelectAluminumColor?: (color: string) => void;
  onSelectHardwareColor?: (color: string) => void;
  compactMode?: boolean;
}

interface CameraState {
  yaw: number;
  pitch: number;
  distance: number;
  targetX: number;
  targetY: number;
}

function checkHasSlidingSash(node: SceneCellNode): boolean {
  const st = String(node.sashType || '');
  if (
    st === 'sliding' ||
    st.includes('lua') ||
    st === '2-chieu' ||
    st === 'canh-truot' ||
    node.sashZIndex !== undefined
  ) {
    return true;
  }
  if (node.children && node.children.length > 0) {
    return node.children.some((child) => checkHasSlidingSash(child));
  }
  return false;
}

export const Door3DViewer: React.FC<Door3DViewerProps> = ({
  w, h, aluminumColor, hardwareColor, frameShape, rootCell, frameConfig, sashConfig,
  availableProfiles, aluminumColors, onSelectAluminumColor, onSelectHardwareColor, compactMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Door3DWebGLEngine | null>(null);

  const defaultDist = Math.max(2.2, (Math.max(w || 1200, h || 1500) * 0.001) * 1.65);
  const camRef = useRef<CameraState>({ yaw: -0.42, pitch: 0.16, distance: defaultDist, targetX: 0, targetY: 0 });

  const [openRatio, setOpenRatio] = useState<number>(0.35);
  const [slidingDirection, setSlidingDirection] = useState<SlidingCycleDirection>('right_to_left');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [showWall, setShowWall] = useState<boolean>(false);
  const [showEdges, setShowEdges] = useState<boolean>(true);
  const [showOpeningRays, setShowOpeningRays] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<string>('iso_left');

  const hasSlidingSash = useMemo(
    () =>
      Boolean(sashConfig?.family?.toLowerCase().includes('lùa')) ||
      checkHasSlidingSash(rootCell),
    [rootCell, sashConfig?.family]
  );

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const cw = Math.max(1, Math.round(rect.width * dpr));
    const ch = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }

    const { yaw, pitch, distance, targetX, targetY } = camRef.current;
    const cosP = Math.cos(pitch);
    const eye: Vec3 = [
      targetX + distance * cosP * Math.sin(yaw),
      targetY + distance * Math.sin(pitch),
      distance * cosP * Math.cos(yaw),
    ];
    const target: Vec3 = [targetX, targetY, 0];

    engine.render({ width: cw, height: ch, eye, target, showEdges });
  }, [showEdges]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      engineRef.current = new Door3DWebGLEngine(canvas);
    } catch {
      return;
    }
    const ro = new ResizeObserver(() => renderFrame());
    ro.observe(canvas);
    return () => {
      ro.disconnect();
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, [renderFrame]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const collector = buildDoor3DGeometry({
      w, h, aluminumColor, hardwareColor, frameShape, rootCell, frameConfig, sashConfig,
      availableProfiles, openRatio, slidingDirection, showWall, showOpeningRays,
    });
    engine.uploadGeometry(collector);
    renderFrame();
  }, [
    w, h, aluminumColor, hardwareColor, frameShape, rootCell, frameConfig, sashConfig,
    availableProfiles, openRatio, slidingDirection, showWall, showOpeningRays, renderFrame,
  ]);

  // Diễn hoạt tự động: với hệ cửa lùa sẽ tự động chạy đủ 2 chu trình (Phải -> Trái rồi Trái -> Phải)
  useEffect(() => {
    if (!isAutoPlaying) return;
    let rafId = 0;
    let dir = 1;
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      setOpenRatio((prev) => {
        let next = prev + dir * dt * 0.48;
        if (next >= 1) {
          next = 1;
          dir = -1;
        } else if (next <= 0) {
          next = 0;
          dir = 1;
          if (hasSlidingSash) {
            setSlidingDirection((cur) => (cur === 'right_to_left' ? 'left_to_right' : 'right_to_left'));
          }
        }
        return Number(next.toFixed(3));
      });
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isAutoPlaying, hasSlidingSash]);

  const dragRef = useRef({ isDown: false, mode: 'orbit' as 'orbit' | 'pan', lastX: 0, lastY: 0, pinchDist: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.09 : 0.91;
      camRef.current.distance = Math.max(0.7, Math.min(12.0, camRef.current.distance * factor));
      renderFrame();
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [renderFrame]);

  const applyCameraPreset = (presetId: string) => {
    setActivePreset(presetId);
    const dist = Math.max(2.2, (Math.max(w || 1200, h || 1500) * 0.001) * 1.65);
    const presets: Record<string, CameraState> = {
      front: { yaw: 0, pitch: 0.03, distance: dist, targetX: 0, targetY: 0 },
      iso_left: { yaw: -0.45, pitch: 0.18, distance: dist, targetX: 0, targetY: 0 },
      iso_right: { yaw: 0.45, pitch: 0.18, distance: dist, targetX: 0, targetY: 0 },
      back: { yaw: Math.PI - 0.25, pitch: 0.14, distance: dist, targetX: 0, targetY: 0 },
      top: { yaw: 0, pitch: 1.28, distance: dist * 0.95, targetX: 0, targetY: 0 },
    };
    if (presets[presetId]) camRef.current = presets[presetId];
    renderFrame();
  };

  return (
    <div className="relative flex-1 w-full h-full min-h-[420px] bg-slate-100 select-none overflow-hidden flex flex-col">
      <Door3DHud
        w={w}
        h={h}
        aluminumColor={aluminumColor}
        hardwareColor={hardwareColor}
        aluminumColors={aluminumColors}
        onSelectAluminumColor={onSelectAluminumColor}
        onSelectHardwareColor={onSelectHardwareColor}
        compactMode={compactMode}
        activePreset={activePreset}
        onSelectPreset={applyCameraPreset}
        openRatio={openRatio}
        onChangeOpenRatio={(val) => {
          setIsAutoPlaying(false);
          setOpenRatio(val);
        }}
        isAutoPlaying={isAutoPlaying}
        onToggleAutoPlay={() => setIsAutoPlaying((p) => !p)}
        hasSlidingSash={hasSlidingSash}
        slidingDirection={slidingDirection}
        onChangeSlidingDirection={(dir) => {
          setSlidingDirection(dir);
          if (openRatio < 0.05) setOpenRatio(0.65);
        }}
        showWall={showWall}
        onToggleWall={() => setShowWall((v) => !v)}
        showEdges={showEdges}
        onToggleEdges={() => setShowEdges((v) => !v)}
        showOpeningRays={showOpeningRays}
        onToggleOpeningRays={() => setShowOpeningRays((v) => !v)}
        onZoomIn={() => {
          camRef.current.distance = Math.max(0.7, camRef.current.distance * 0.85);
          renderFrame();
        }}
        onZoomOut={() => {
          camRef.current.distance = Math.min(12.0, camRef.current.distance * 1.18);
          renderFrame();
        }}
        onResetCamera={() => applyCameraPreset('iso_left')}
      />

      <canvas
        ref={canvasRef}
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={(e) => {
          dragRef.current = { isDown: true, mode: e.button === 2 || e.shiftKey ? 'pan' : 'orbit', lastX: e.clientX, lastY: e.clientY, pinchDist: 0 };
        }}
        onMouseMove={(e) => {
          if (!dragRef.current.isDown) return;
          const dx = e.clientX - dragRef.current.lastX;
          const dy = e.clientY - dragRef.current.lastY;
          dragRef.current.lastX = e.clientX;
          dragRef.current.lastY = e.clientY;
          if (dragRef.current.mode === 'orbit') {
            camRef.current.yaw -= dx * 0.0075;
            camRef.current.pitch = Math.max(-1.35, Math.min(1.42, camRef.current.pitch + dy * 0.0075));
          } else {
            const panScale = camRef.current.distance * 0.0012;
            camRef.current.targetX -= dx * panScale;
            camRef.current.targetY += dy * panScale;
          }
          renderFrame();
        }}
        onMouseUp={() => { dragRef.current.isDown = false; }}
        onMouseLeave={() => { dragRef.current.isDown = false; }}
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            dragRef.current = { isDown: true, mode: 'orbit', lastX: e.touches[0].clientX, lastY: e.touches[0].clientY, pinchDist: 0 };
          } else if (e.touches.length === 2) {
            dragRef.current.pinchDist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 1 && dragRef.current.isDown) {
            const dx = e.touches[0].clientX - dragRef.current.lastX;
            const dy = e.touches[0].clientY - dragRef.current.lastY;
            dragRef.current.lastX = e.touches[0].clientX;
            dragRef.current.lastY = e.touches[0].clientY;
            camRef.current.yaw -= dx * 0.008;
            camRef.current.pitch = Math.max(-1.35, Math.min(1.42, camRef.current.pitch + dy * 0.008));
            renderFrame();
          } else if (e.touches.length === 2 && dragRef.current.pinchDist > 0) {
            const d = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
            const ratio = dragRef.current.pinchDist / Math.max(10, d);
            dragRef.current.pinchDist = d;
            camRef.current.distance = Math.max(0.7, Math.min(12.0, camRef.current.distance * ratio));
            renderFrame();
          }
        }}
        onTouchEnd={() => { dragRef.current.isDown = false; }}
        className="w-full h-full flex-1 cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};

export default Door3DViewer;
