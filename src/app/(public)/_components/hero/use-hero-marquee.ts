'use client';

import { useCallback, useEffect, useRef } from 'react';

/** Tốc độ trượt mặc định (px/giây). */
const DEFAULT_SPEED_PX_PER_SEC = 40;
/** Quãng kéo tối thiểu (px) để coi là thao tác kéo, không phải click. */
const DRAG_CLICK_THRESHOLD_PX = 6;

/**
 * Băng chuyền thước phim: tự trượt sang trái liên tục, dừng khi hover chuột,
 * cho phép kéo trái/phải bằng chuột hoặc cảm ứng. Track phải chứa danh sách đã nhân đôi
 * (độ rộng 1 dải = scrollWidth / 2) để vòng lặp liền mạch.
 */
export function useHeroMarquee(
  speedPxPerSec: number = DEFAULT_SPEED_PX_PER_SEC,
  isPaused: boolean = false
) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const steppingRef = useRef(false);
  const stepRafRef = useRef(0);
  const dragRef = useRef<{
    active: boolean;
    moved: boolean;
    startX: number;
    startY: number;
    startOffset: number;
    lockedAxis: 'x' | 'y' | null;
  }>({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    startOffset: 0,
    lockedAxis: null,
  });

  const applyOffset = useCallback((raw: number) => {
    const track = trackRef.current;
    if (!track) return;
    const stripWidth = track.scrollWidth / 2;
    let next = raw;
    if (stripWidth > 0) {
      // Quấn vòng trong khoảng [-stripWidth, 0]
      next = ((next % stripWidth) - stripWidth) % stripWidth;
    }
    offsetRef.current = next;
    track.style.transform = `translate3d(${next}px, 0, 0)`;
  }, []);

  const step = useCallback((direction: -1 | 1, distancePx: number = 380) => {
    const track = trackRef.current;
    if (!track) return;
    if (stepRafRef.current) cancelAnimationFrame(stepRafRef.current);
    steppingRef.current = true;
    const targetOffset = offsetRef.current - direction * distancePx;
    const startOffset = offsetRef.current;
    const startTime = performance.now();
    const duration = 300;
    const animateStep = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      applyOffset(startOffset + (targetOffset - startOffset) * ease);
      if (progress < 1) {
        stepRafRef.current = requestAnimationFrame(animateStep);
      } else {
        steppingRef.current = false;
        stepRafRef.current = 0;
      }
    };
    stepRafRef.current = requestAnimationFrame(animateStep);
  }, [applyOffset]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduceMotion && !pausedRef.current && !dragRef.current.active && !steppingRef.current && !isPaused) {
        applyOffset(offsetRef.current - speedPxPerSec * dt);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      if (stepRafRef.current) cancelAnimationFrame(stepRafRef.current);
    };
  }, [applyOffset, speedPxPerSec, isPaused]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Cảm ứng dùng riêng touch handlers để tránh trình duyệt mobile hủy sự kiện bởi pointercancel
    if (e.pointerType === 'touch') return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      startOffset: offsetRef.current,
      lockedAxis: null,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const drag = dragRef.current;
    if (!drag.active) return;
    const dx = e.clientX - drag.startX;
    if (!drag.moved && Math.abs(dx) > DRAG_CLICK_THRESHOLD_PX) {
      drag.moved = true;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    if (drag.moved) applyOffset(drag.startOffset + dx);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    dragRef.current = {
      active: true,
      moved: false,
      startX: touch.clientX,
      startY: touch.clientY,
      startOffset: offsetRef.current,
      lockedAxis: null,
    };
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const touch = e.touches[0];
    if (!drag.active || !touch) return;

    const dx = touch.clientX - drag.startX;
    const dy = touch.clientY - drag.startY;

    if (!drag.lockedAxis && (Math.abs(dx) > DRAG_CLICK_THRESHOLD_PX || Math.abs(dy) > DRAG_CLICK_THRESHOLD_PX)) {
      drag.lockedAxis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
    }

    if (drag.lockedAxis === 'x') {
      drag.moved = true;
      applyOffset(drag.startOffset + dx);
    }
  };

  const onTouchEnd = () => {
    dragRef.current.active = false;
    dragRef.current.lockedAxis = null;
  };

  // Hỗ trợ Shift + lăn chuột hoặc vuốt ngang 2 ngón trên touchpad laptop
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const horizontalDelta =
      Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
    if (horizontalDelta === 0) return;
    e.preventDefault();
    applyOffset(offsetRef.current - horizontalDelta);
  };

  const onPointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') pausedRef.current = true;
  };

  const onPointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') pausedRef.current = false;
    endDrag(e);
  };

  // Chặn click vào link khi vừa kéo xong
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.moved = false;
    }
  };

  return {
    trackRef,
    step,
    viewportHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onPointerEnter,
      onPointerLeave,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel: onTouchEnd,
      onWheel,
      onClickCapture,
      onDragStart: (e: React.DragEvent<HTMLDivElement>) => e.preventDefault(),
    },
  };
}

