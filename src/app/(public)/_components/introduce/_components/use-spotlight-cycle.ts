import { useEffect, useState } from 'react';

export const INTRODUCE_EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Tự động xoay vòng index nổi bật theo chu kỳ, tạm dừng khi người dùng rê chuột vào. */
export function useSpotlightCycle(length: number, intervalMs = 3000) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPaused, length, intervalMs]);

  return {
    activeIdx,
    setActiveIdx,
    pauseProps: {
      onMouseEnter: () => setIsPaused(true),
      onMouseLeave: () => setIsPaused(false),
    },
  };
}
