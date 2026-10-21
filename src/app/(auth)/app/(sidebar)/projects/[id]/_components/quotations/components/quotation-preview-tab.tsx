'use client';

import { useRef } from 'react';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { Button, Skeleton } from '@/components';
import { useFitPaperScale } from '@/hooks/use-fit-paper-scale';
import type { QuotationAccessoryMode } from '@/types';
import { printHtmlDocument } from '@/utils';
import { useQuotationSheet } from '../hooks/use-quotation-sheet';
import { QUOTATION_DOCUMENT_CSS, QUOTATION_PRINT_CSS } from '../utils/quotation-document-style';
import { QuotationDocument } from './quotation-document';

interface QuotationPreviewTabProps {
  projectId: number;
  quotationId: number;
  initialMode: QuotationAccessoryMode;
}

const MODE_OPTIONS: { value: QuotationAccessoryMode; label: string }[] = [
  { value: 'combined', label: 'Gộp phụ kiện' },
  { value: 'separated', label: 'Phụ kiện rời' },
];

export function QuotationPreviewTab({ projectId, quotationId, initialMode }: QuotationPreviewTabProps) {
  const paperRef = useRef<HTMLDivElement>(null);
  const { paneRef, fitScale } = useFitPaperScale();
  const { sheet, isLoading, accessoryMode, setAccessoryMode, exportExcel, isExporting } =
    useQuotationSheet(projectId, quotationId, initialMode);

  if (isLoading || !sheet) return <Skeleton className="h-96 w-full" />;

  // Chỉ xuất / in khi báo giá còn hiệu lực
  const isActionBlocked = sheet.isOutdated;
  const handlePrint = () => {
    if (!paperRef.current) return;
    void printHtmlDocument(
      paperRef.current.outerHTML,
      `Bao-gia-${sheet.quotationCode}`,
      `${QUOTATION_DOCUMENT_CSS}${QUOTATION_PRINT_CSS}`,
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-lg border border-slate-200/60 p-3 shadow-xs">
        <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50">
          {MODE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              size="xs"
              variant={accessoryMode === option.value ? 'primary' : 'ghost'}
              onClick={() => setAccessoryMode(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {isActionBlocked && (
            <span className="text-xs text-amber-600">
              Báo giá đã cũ so với dữ liệu cửa, hãy đồng bộ để xuất / in
            </span>
          )}
          <Button
            size="xs"
            variant="outline"
            leftIcon={<FileSpreadsheet size={14} />}
            loading={isExporting}
            disabled={isActionBlocked}
            onClick={() => exportExcel(`${sheet.quotationCode}.xlsx`)}
          >
            Xuất Excel
          </Button>
          <Button
            size="xs"
            leftIcon={<Printer size={14} />}
            disabled={isActionBlocked}
            onClick={handlePrint}
          >
            In / PDF
          </Button>
        </div>
      </div>

      <div ref={paneRef} className="overflow-auto no-scrollbar rounded-lg bg-slate-200 p-3">
        <style>{QUOTATION_DOCUMENT_CSS}</style>
        <div className="mx-auto w-fit shadow-lg" style={{ zoom: fitScale }}>
          <QuotationDocument ref={paperRef} sheet={sheet} />
        </div>
      </div>
    </div>
  );
}
