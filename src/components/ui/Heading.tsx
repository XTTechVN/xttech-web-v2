import { cn } from '@/utils/cn';
import { HEADING_FONT_SIZE } from '@/config';

export default function Heading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1 className={cn(`text-[${HEADING_FONT_SIZE}px] font-semibold text-hd-primary`, className)}>
      {children}
    </h1>
  );
}
