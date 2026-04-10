import getPaginationButtons from '@/utils/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TablePaginationProps {
  total: number;
  offset: number;
  limit: number;
  next?: boolean;
  onChange: (offset: number) => void;
  className?: string;
}

const TablePagination = ({
  total,
  offset,
  limit,
  next,
  onChange,
  className,
}: TablePaginationProps) => {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const buttons = getPaginationButtons(currentPage, totalPages);

  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <p className="text-sm font-semibold text-gray-500">Tổng {total} kết quả</p>

      {/* Left arrow button */}
      <button
        onClick={() => onChange(Math.max(0, offset - limit))}
        disabled={currentPage === 1}
        className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-md hover:bg-gray-100 text-sm ${
          currentPage === 1 ? 'text-gray-500 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {buttons.map((button, index) => {
        const isCurrent = button === currentPage.toString();
        const isEllipsis = button === '...';

        return (
          <button
            className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-md hover:bg-gray-100 text-sm font-semibold ${
              isCurrent ? 'text-primary border-primary bg-primary/5' : 'text-gray-500'
            } ${isEllipsis ? 'text-gray-500 cursor-not-allowed' : 'cursor-pointer'}`}
            key={index}
            disabled={isEllipsis}
            onClick={() => {
              if (!isEllipsis && !isCurrent) {
                onChange((Number(button) - 1) * limit);
              }
            }}
          >
            {button}
          </button>
        );
      })}

      {/* Right arrow button */}
      <button
        onClick={() => onChange(offset + limit)}
        disabled={currentPage === totalPages || (!next && currentPage === totalPages)}
        className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-md hover:bg-gray-100 text-sm ${
          currentPage === totalPages ? 'text-gray-500 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TablePagination;
