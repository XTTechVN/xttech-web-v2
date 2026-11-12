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
export function useHeroMarquee(speedPxPerSec: number = DEFAULT_SPEED_PX_PER_SEC) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const dragRef = useRef({ active: false, moved: false, startX: 0, startOffset: 0 });

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

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduceMotion && !pausedRef.current && !dragRef.current.active) {
        applyOffset(offsetRef.current - speedPxPerSec * dt);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [applyOffset, speedPxPerSec]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragRef.current = { active: true, moved: false, startX: e.clientX, startOffset: offsetRef.current };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
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
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
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
    viewportHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onPointerEnter,
      onPointerLeave,
      onClickCapture,
      onDragStart: (e: React.DragEvent<HTMLDivElement>) => e.preventDefault(),
    },
  };
}

