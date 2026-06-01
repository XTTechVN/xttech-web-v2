import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  path?: string;
  label: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showBackButton?: boolean;
}

export default function Breadcrumb({ items, showBackButton = true }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const hasPath = !!item.path;

        return (
          <div key={index} className="flex items-center gap-2">
            {hasPath && !isLast ? (
              <Link
                href={item.path!}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors cursor-pointer"
              >
                <span>{item.label}</span>
                <ChevronRight size={12} />
              </Link>
            ) : (
              <span className="text-sm font-semibold text-primary">{item.label}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
