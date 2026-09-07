import React from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps extends React.HtmlHTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, items = [], separator = <ChevronRight size={14} />, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn('flex items-center text-xs text-gray-600 font-medium w-full overflow-x-auto scrollbar-hide', className)}
        {...props}
      >
        <ol className="flex items-center flex-nowrap whitespace-nowrap gap-2"> {/* Sử dụng spacing-xs (8px) */}
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center gap-1"> {/* Sử dụng spacing-xxs (4px) cho icon/text */}
                {/* Separator before item (except first) */}
                {index > 0 && (
                  <span className="text-gray-400 select-none mx-1" aria-hidden="true">
                    {separator}
                  </span>
                )}

                {isLast ? (
                  <span
                    className="text-primary font-semibold truncate max-w-50"
                    aria-current="page"
                  >
                    {item.icon && <span className="inline-flex mr-1 align-text-bottom">{item.icon}</span>}
                    {item.label}
                  </span>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-primary transition-colors flex items-center gap-1 truncate max-w-[150px]"
                  >
                    {item.icon && <span className="inline-flex align-text-bottom">{item.icon}</span>}
                    {item.label}
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 truncate max-w-[150px]">
                    {item.icon && <span className="inline-flex align-text-bottom">{item.icon}</span>}
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  },
);

Breadcrumb.displayName = 'Breadcrumb';

export default Breadcrumb;
export { Breadcrumb };
