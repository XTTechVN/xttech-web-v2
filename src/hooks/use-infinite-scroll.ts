import { useEffect } from 'react';

interface UseInfiniteScrollProps {
  enabled: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  threshold?: number;
}

export const useInfiniteScroll = ({
  enabled,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  threshold = 50,
}: UseInfiniteScrollProps) => {
  useEffect(() => {
    if (!enabled) return;

    const handleScroll = (event: Event) => {
      const target = event.target;
      if (target === document) {
        const docEl = document.documentElement;
        const isEnd =
          window.innerHeight + window.scrollY >= docEl.scrollHeight - threshold;
        if (isEnd && !isFetchingNextPage && hasNextPage) {
          fetchNextPage();
        }
      } else if (target instanceof HTMLElement) {
        const isEnd =
          target.scrollTop + target.clientHeight >= target.scrollHeight - threshold;
        if (isEnd && !isFetchingNextPage && hasNextPage) {
          fetchNextPage();
        }
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [enabled, isFetchingNextPage, hasNextPage, fetchNextPage, threshold]);
};
