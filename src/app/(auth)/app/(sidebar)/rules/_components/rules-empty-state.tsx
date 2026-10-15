'use client';

import React from 'react';
import { Button } from '@/components';
import { BookOpen, Upload } from 'lucide-react';

interface RulesEmptyStateProps {
  onCreateDocument?: () => void;
}

export const RulesEmptyState: React.FC<RulesEmptyStateProps> = ({ onCreateDocument }) => {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center bg-white border border-dashed border-slate-300 rounded-3xl p-8 max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-4">
        <BookOpen size={32} />
      </div>
      <h3 className="text-sm font-bold text-slate-800 mb-1">
        Chưa có văn bản quy chế hoặc quy định nào
      </h3>
      <p className="text-xs text-slate-500 max-w-xs mb-4">
        Các văn bản quy chế, chính sách, quy trình và định mức của doanh nghiệp sẽ được quản lý tập trung tại đây.
      </p>
      {onCreateDocument && (
        <Button
          variant="primary"
          size="sm"
          onClick={onCreateDocument}
          leftIcon={<Upload size={14} />}
        >
          Tải lên quy chế mới
        </Button>
      )}
    </div>
  );
};
