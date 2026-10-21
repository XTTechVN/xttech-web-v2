'use client';

import { useRef } from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components';
import { useFitPaperScale } from '@/hooks/use-fit-paper-scale';
import type { ContractTerms } from '@/types';
import { CONTRACT_DOCUMENT_CSS } from '../utils/contract-document-style';
import { printContractHtml } from '../utils/contract-print';
import type { ContractDocumentSource } from '../utils/contract-values';
import { ContractDocument } from './contract-document';

interface ContractPreviewProps {
  source: ContractDocumentSource;
  terms?: ContractTerms | null;
  printTitle: string;
  // Tỉ lệ thu nhỏ trang A4; bỏ trống thì tự co theo bề rộng khung xem trước
  scale?: number;
}

export function ContractPreview({ source, terms, printTitle, scale }: ContractPreviewProps) {
  const paperRef = useRef<HTMLDivElement>(null);
  const { paneRef, fitScale } = useFitPaperScale(scale === undefined);

  const handlePrint = () => {
    if (!paperRef.current) return;
    void printContractHtml(paperRef.current.outerHTML, printTitle);
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">Xem trước hợp đồng (A4)</span>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer size={14} className="mr-1.5" /> In hợp đồng
        </Button>
      </div>
      <div ref={paneRef} className="flex-1 min-h-0 overflow-auto no-scrollbar rounded-lg bg-slate-200 p-3">
        <style>{CONTRACT_DOCUMENT_CSS}</style>
        <div className="mx-auto w-fit shadow-lg" style={{ zoom: scale ?? fitScale }}>
          <ContractDocument ref={paperRef} source={source} terms={terms} />
        </div>
      </div>
    </div>
  );
}
