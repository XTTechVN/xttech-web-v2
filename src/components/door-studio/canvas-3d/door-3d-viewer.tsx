'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ColorSwatch, FrameConfig, FrameShape, SashConfig, SceneCellNode } from '../studio-types';
import { ProfileBar } from '@/types/profile';
import { buildDoor3DGeometry, SlidingCycleDirection } from './door-3d-scene-builder';
import { Door3DWebGLEngine } from './door-3d-webgl-engine';
import { Door3DHud } from './door-3d-hud';
import { Vec3 } from './door-3d-math';
import { DEFAULT_DOOR_3D_SETTINGS, Door3DCustomSettings } from './door-3d-types';

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
  const [settings, setSettings] = useState<Door3DCustomSettings>(DEFAULT_DOOR_3D_SETTINGS);

  const handleUpdateSettings = useCallback((patch: Partial<Door3DCustomSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

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

    engine.render({
      width: cw,
      height: ch,
      eye,
      target,
      showEdges,
      roughness: settings.roughness,
      metalness: settings.metalness,
      isAnodize: settings.surfaceType === 'anodize',
      isStudio: settings.displayMode === 'studio',
      floorType: settings.floorType,
      glassRoughness: settings.glassRoughness,
      glassFrost: settings.glassFrost,
    });
  }, [
    showEdges,
    settings.roughness,
    settings.metalness,
    settings.surfaceType,
    settings.displayMode,
    settings.floorType,
    settings.glassRoughness,
    settings.glassFrost,
  ]);

  // Chỉ tính toán lại hình học 3D khi các thông số hình học / kết cấu thay đổi
  const geometrySettings = useMemo(
    () => ({
      frameDepthMm: settings.frameDepthMm,
      sashDepthMm: settings.sashDepthMm,
      glassThicknessMm: settings.glassThicknessMm,
      mullionDepthMm: settings.mullionDepthMm,
      handleDepthMm: settings.handleDepthMm,
      multiplyByZLayers: settings.multiplyByZLayers,
      handleOffsetXMm: settings.handleOffsetXMm,
      handleOffsetYMm: settings.handleOffsetYMm,
      bothSidesHandle: settings.bothSidesHandle,
      handleColorMode: settings.handleColorMode,
      glassColorHex: settings.glassColorHex,
      glassTransparency: settings.glassTransparency,
      displayMode: settings.displayMode,
      surfaceType: settings.surfaceType,
      finishPreset: settings.finishPreset,
      roughness: settings.roughness,
      metalness: settings.metalness,
      glassRoughness: settings.glassRoughness,
      glassFrost: settings.glassFrost,
      floorType: settings.floorType,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      settings.frameDepthMm,
      settings.sashDepthMm,
      settings.glassThicknessMm,
      settings.mullionDepthMm,
      settings.handleDepthMm,
      settings.multiplyByZLayers,
      settings.handleOffsetXMm,
      settings.handleOffsetYMm,
      settings.bothSidesHandle,
      settings.handleColorMode,
      settings.glassColorHex,
      settings.glassTransparency,
      settings.displayMode,
    ]
  );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const collector = buildDoor3DGeometry({
      w,
      h,
      aluminumColor,
      hardwareColor,
      frameShape,
      rootCell,
      frameConfig,
      sashConfig,
      availableProfiles,
      openRatio,
      slidingDirection,
      showWall,
      showOpeningRays,
      customSettings: geometrySettings,
    });
    engine.uploadGeometry(collector);
    renderFrame();
  }, [
    w,
    h,
    aluminumColor,
    hardwareColor,
    frameShape,
    rootCell,
    frameConfig,
    sashConfig,
    availableProfiles,
    openRatio,
    slidingDirection,
    showWall,
    showOpeningRays,
    geometrySettings,
    renderFrame,
  ]);

  // Khi chỉ đổi thông số Shader (Độ nhám, Độ kim loại, Anode, Loại sàn, Độ mờ kính) -> Render tức thì không dựng lại Mesh
  useEffect(() => {
    renderFrame();
  }, [renderFrame]);

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

  // Theo dõi từng ngón/chuột bằng pointerId; mốc (last*) được đồng bộ lại mỗi khi số con trỏ thay đổi
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const gestureRef = useRef({ mode: 'orbit' as 'orbit' | 'pan', lastX: 0, lastY: 0, pinchDist: 0 });

  const resetGestureAnchor = () => {
    const pts = Array.from(pointersRef.current.values());
    const g = gestureRef.current;
    if (pts.length >= 2) {
      g.lastX = (pts[0].x + pts[1].x) / 2;
      g.lastY = (pts[0].y + pts[1].y) / 2;
      g.pinchDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
    } else if (pts.length === 1) {
      g.lastX = pts[0].x;
      g.lastY = pts[0].y;
      g.pinchDist = 0;
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    gestureRef.current.mode = e.pointerType === 'mouse' && (e.button === 2 || e.shiftKey) ? 'pan' : 'orbit';
    resetGestureAnchor();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = Array.from(pointersRef.current.values());
    const g = gestureRef.current;
    const cam = camRef.current;

    if (pts.length >= 2) {
      const cx = (pts[0].x + pts[1].x) / 2;
      const cy = (pts[0].y + pts[1].y) / 2;
      const d = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      if (g.pinchDist > 0 && d > 0) {
        cam.distance = Math.max(0.7, Math.min(12.0, cam.distance * (g.pinchDist / d)));
      }
      const panScale = cam.distance * 0.0012;
      cam.targetX -= (cx - g.lastX) * panScale;
      cam.targetY += (cy - g.lastY) * panScale;
      g.lastX = cx;
      g.lastY = cy;
      g.pinchDist = d;
    } else {
      const dx = e.clientX - g.lastX;
      const dy = e.clientY - g.lastY;
      g.lastX = e.clientX;
      g.lastY = e.clientY;
      if (g.mode === 'orbit') {
        const k = e.pointerType === 'mouse' ? 0.0075 : 0.008;
        cam.yaw -= dx * k;
        cam.pitch = Math.max(-1.35, Math.min(1.42, cam.pitch + dy * k));
      } else {
        const panScale = cam.distance * 0.0012;
        cam.targetX -= dx * panScale;
        cam.targetY += dy * panScale;
      }
    }
    renderFrame();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.delete(e.pointerId);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    resetGestureAnchor();
  };

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
    <div className="relative flex-1 w-full h-full min-h-[300px] sm:min-h-[420px] bg-slate-100 select-none overflow-hidden flex flex-col">
      <Door3DHud
        w={w}
        h={h}
        aluminumColor={aluminumColor}
        hardwareColor={hardwareColor}
        aluminumColors={aluminumColors}
        onSelectAluminumColor={onSelectAluminumColor}
        onSelectHardwareColor={onSelectHardwareColor}
        compactMode={compactMode}
        settings={settings}
        onChangeSettings={handleUpdateSettings}
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full flex-1 touch-none cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};

export default Door3DViewer;
