import React from 'react';
import { cn } from '@/utils/cn';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
  size?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as, size = 'h2', children, ...props }, ref) => {
    const Component = as || size;

    const sizes = {
      h1: 'text-3xl font-bold tracking-tight text-gray-900',
      h2: 'text-2xl font-semibold tracking-tight text-gray-900',
      h3: 'text-lg font-medium tracking-tight text-gray-900',
      h4: 'text-base font-medium text-gray-900',
      h5: 'text-sm font-semibold text-gray-900',
      h6: 'text-xs font-semibold text-gray-900',
    };

    return (
      <Component
        ref={ref as any}
        className={cn(sizes[size], className)}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Heading.displayName = 'Heading';

export default Heading;
export { Heading };
