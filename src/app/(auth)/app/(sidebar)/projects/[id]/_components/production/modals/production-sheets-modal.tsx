'use client';

import React, { useRef, useState } from 'react';
import { FileText, Printer, X } from 'lucide-react';
import { Button } from '@/components';
import type { ProductionOrder, ProductionSheet } from '@/types';
import { ProductionSheetCard } from '../components/production-sheet-card';
import { useProductionSheets } from '../hooks';

interface ProductionSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  order: ProductionOrder | null;
}

export function ProductionSheetsModal({
  isOpen,
  onClose,
  projectId,
  order,
}: ProductionSheetsModalProps) {
  const [selectedPositionId, setSelectedPositionId] = useState<number | 'all'>('all');
  const printAreaRef = useRef<HTMLDivElement>(null);

  const { sheets, isLoading, isError } = useProductionSheets(
    projectId,
    isOpen && order ? order.id : null,
  );

  const handlePrint = () => {
    window.print();
  };

  const displayedSheets: ProductionSheet[] =
    selectedPositionId === 'all'
      ? sheets
      : sheets.filter((s) => s.positionId === selectedPositionId);

  if (!isOpen || !order) return null;

  return (
    <div className="production-sheets-modal-root fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-xs">
      <header className="no-print sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText size={18} />
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <span>Thẻ sản xuất &amp; lắp ráp cửa</span>
              <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                {order.code}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {order.name} · {sheets.length} bộ cửa trong đợt
            </p>
          </div>
        </div>

        <div className="hidden max-w-xl items-center gap-1.5 overflow-x-auto rounded-lg bg-slate-100 p-1 md:flex">
          <button
            type="button"
            onClick={() => setSelectedPositionId('all')}
            className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              selectedPositionId === 'all'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({sheets.length})
          </button>
          {sheets.map((s, idx) => (
            <button
              key={s.positionId}
              type="button"
              onClick={() => setSelectedPositionId(s.positionId)}
              className={`cursor-pointer whitespace-nowrap rounded-md px-2.5 py-1 font-mono text-xs font-semibold transition-all ${
                selectedPositionId === s.positionId
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {String(idx + 1).padStart(2, '0')}. {s.positionCode}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Printer size={15} />}
            onClick={handlePrint}
            className="h-8 text-xs font-semibold"
          >
            In Thẻ A4 ({displayedSheets.length})
          </Button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng modal"
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="production-sheets-scroll-area flex-1 overflow-y-auto bg-slate-100/80 p-4 md:p-8 print:overflow-visible print:bg-white print:p-0">
        {isLoading ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-xs">Đang tải thẻ sản xuất và bản vẽ kỹ thuật...</p>
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-xs text-red-500">
            Không thể tải dữ liệu thẻ sản xuất. Vui lòng thử lại.
          </div>
        ) : displayedSheets.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">
            Chưa có bộ cửa nào trong lệnh sản xuất này.
          </div>
        ) : (
          <div
            id="sheets-print-container"
            ref={printAreaRef}
            className="sheets-print-container mx-auto space-y-8 print:space-y-0"
          >
            {displayedSheets.map((sheet, index) => (
              <div key={sheet.positionId} className="print-page-break">
                <ProductionSheetCard sheet={sheet} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          html,
          body {
            background: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print,
          header,
          nav,
          aside {
            display: none !important;
          }
          body > * {
            visibility: hidden !important;
          }
          .production-sheets-modal-root,
          .production-sheets-modal-root * {
            visibility: visible !important;
          }
          .production-sheets-modal-root {
            position: static !important;
            inset: auto !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
            height: auto !important;
            min-height: auto !important;
          }
          .production-sheets-scroll-area {
            position: static !important;
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #sheets-print-container {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-page-break {
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-page-break:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}

