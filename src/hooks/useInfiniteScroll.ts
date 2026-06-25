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

    const handleScroll = () => {
      const isEnd =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - threshold;
      if (isEnd && !isFetchingNextPage && hasNextPage) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled, isFetchingNextPage, hasNextPage, fetchNextPage, threshold]);
};
