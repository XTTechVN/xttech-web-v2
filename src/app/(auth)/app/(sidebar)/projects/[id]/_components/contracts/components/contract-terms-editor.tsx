'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button, RichTextEditor } from '@/components';
import { CONTRACT_TERMS_PLACEHOLDER, DEFAULT_CONTRACT_TERMS_HTML } from '@/config';
import type { ContractTerms } from '@/types';
import { hasTermsContent, readTermsContent, withTermsContent } from '../utils/contract-terms';

interface ContractTermsEditorProps {
  terms: ContractTerms;
  isReadOnly?: boolean;
  onChange: (terms: ContractTerms) => void;
}

// Soạn cơ chế, điều khoản và chính sách của hợp đồng trong một trình soạn duy nhất
export function ContractTermsEditor({ terms, isReadOnly = false, onChange }: ContractTermsEditorProps) {
  const handleLoadDefault = () => {
    const isConfirmed = !hasTermsContent(terms) || window.confirm('Nội dung hiện tại sẽ bị thay bằng nội dung mặc định. Tiếp tục?');
    if (isConfirmed) onChange(withTermsContent(terms, DEFAULT_CONTRACT_TERMS_HTML));
  };

  return (
    <div className="space-y-2.5">
      {!isReadOnly && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="h-7 text-[11px] px-2" onClick={handleLoadDefault}>
            <RotateCcw size={12} className="mr-1" /> Nạp lại điều khoản mặc định
          </Button>
        </div>
      )}
      <RichTextEditor
        value={readTermsContent(terms)}
        placeholder={CONTRACT_TERMS_PLACEHOLDER}
        isReadOnly={isReadOnly}
        minHeightClass="min-h-72 max-h-[60vh]"
        onChange={(html) => onChange(withTermsContent(terms, html))}
      />
    </div>
  );
}
