'use client';

import getPaginationButtons from '@/utils/pagination';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  hideRowPerPage?: boolean;
  hidePagination?: boolean;
}

export function TablePagination({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  hideRowPerPage = false,
  hidePagination = false,
}: TablePaginationProps) {
  const buttons = getPaginationButtons(currentPage, totalPages);

  if (totalPages <= 0) return null;
  if (hideRowPerPage && hidePagination) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full text-sm select-none">
      {/* Left side: Rows per page selector */}
      {!hideRowPerPage && (
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="appearance-none border border-gray-300 rounded-lg px-4 h-[36px] pr-8 bg-white text-gray-500 font-medium hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 cursor-pointer text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-500">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          <span className="text-gray-500 font-medium text-sm">Bản ghi trên trang</span>
        </div>
      )}

      {!hidePagination && (
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-1 order-1 sm:order-2">
          {/* First page button */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={`hidden md:flex w-9 h-9 items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition ${
              currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* Prev page button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`w-9 h-9 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition ${
              currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Page numbers */}
          {buttons.map((button, index) => {
            const isCurrent = button === currentPage.toString();
            const isEllipsis = button === '...';

            return (
              <button
                key={index}
                disabled={isEllipsis}
                onClick={() => onPageChange(Number(button))}
                className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-semibold transition ${
                  isCurrent
                    ? 'bg-bk-primary text-white border border-bk-primary'
                    : isEllipsis
                      ? 'text-bk-primary/40 cursor-default'
                      : 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer'
                }`}
              >
                {button}
              </button>
            );
          })}

          {/* Next page button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`w-9 h-9 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition ${
              currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Last page button */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`hidden md:flex w-9 h-9 items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition ${
              currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
