'use client';

import { useEffect, useRef, useState } from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components';
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

const PAPER_WIDTH_PX = 794; // 210mm ở 96dpi
const PANE_PADDING_PX = 24;

// Tự tính tỉ lệ để trang A4 luôn vừa chiều ngang khung, không cần thanh cuộn ngang
function useAutoScale(isEnabled: boolean) {
  const paneRef = useRef<HTMLDivElement>(null);
  const [autoScale, setAutoScale] = useState(1);

  useEffect(() => {
    const pane = paneRef.current;
    if (!isEnabled || !pane) return;

    const observer = new ResizeObserver(([entry]) =>
      setAutoScale(Math.min(1, (entry.contentRect.width - PANE_PADDING_PX) / PAPER_WIDTH_PX)),
    );
    observer.observe(pane);
    return () => observer.disconnect();
  }, [isEnabled]);

  return { paneRef, autoScale };
}

export function ContractPreview({ source, terms, printTitle, scale }: ContractPreviewProps) {
  const paperRef = useRef<HTMLDivElement>(null);
  const { paneRef, autoScale } = useAutoScale(scale === undefined);

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
        <div className="mx-auto w-fit shadow-lg" style={{ zoom: scale ?? autoScale }}>
          <ContractDocument ref={paperRef} source={source} terms={terms} />
        </div>
      </div>
    </div>
  );
}
