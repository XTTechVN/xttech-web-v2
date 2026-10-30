'use client';

import { useEffect, useRef, useState } from 'react';

const A4_WIDTH_PX = 794; // 210mm ở 96dpi
const PANE_PADDING_PX = 24;

// Tự tính tỉ lệ để trang A4 luôn vừa chiều ngang khung xem trước, không cần thanh cuộn ngang
export function useFitPaperScale(isEnabled = true, paperWidthPx = A4_WIDTH_PX) {
  const paneRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);

  useEffect(() => {
    const pane = paneRef.current;
    if (!isEnabled || !pane) return;

    const observer = new ResizeObserver(([entry]) =>
      setFitScale(Math.min(1, (entry.contentRect.width - PANE_PADDING_PX) / paperWidthPx)),
    );
    observer.observe(pane);
    return () => observer.disconnect();
  }, [isEnabled, paperWidthPx]);

  return { paneRef, fitScale };
}
