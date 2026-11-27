import { useEffect, useState } from 'react';

// Giữ phần tử trong DOM đủ lâu để chạy hiệu ứng đóng, và giữ nội dung cuối để khung không trống trong lúc đó
export function usePresence<T>(isOpen: boolean, value: T, exitMs: number) {
  const [mounted, setMounted] = useState(isOpen);
  const [snap, setSnap] = useState(value);

  if (isOpen && !mounted) setMounted(true);
  if (isOpen && snap !== value) setSnap(value);
  const closing = mounted && !isOpen;

  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(() => setMounted(false), exitMs);
    return () => clearTimeout(t);
  }, [closing, exitMs]);

  return { mounted, closing, view: isOpen ? value : snap };
}
