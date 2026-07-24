/**
 * @param breakpoint - Breakpoint sử dụng trong Media Query.
 * @returns Trạng thái của Media Query - lần đầu sẽ là undefined.
 */

import * as React from 'react';

export function useMediaQuery({ breakpoint }: { breakpoint: `${string}px` }): boolean | undefined {
  const [matches, setMatches] = React.useState<boolean | undefined>(undefined);

  React.useLayoutEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpoint})`);

    const onChange = () => {
      setMatches(query.matches);
    };
    query.addEventListener('change', onChange);
    setMatches(query.matches);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return matches;
}
