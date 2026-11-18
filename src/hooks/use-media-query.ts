/**
 * @param breakpoint - Breakpoint sử dụng trong Media Query.
 * @returns Trạng thái của Media Query - khi render ở server là undefined.
 */

import * as React from 'react';

export function useMediaQuery({ breakpoint }: { breakpoint: `${string}px` }): boolean | undefined {
  const query = `(max-width: ${breakpoint})`;
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );
  return React.useSyncExternalStore<boolean | undefined>(
    subscribe,
    () => window.matchMedia(query).matches,
    () => undefined,
  );
}
