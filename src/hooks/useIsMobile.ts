import { useMediaQuery } from './useMediaQuery';

export function useIsMobile() {
  const matches = useMediaQuery({ breakpoint: '1024px' });
  return matches;
}
