'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Loader2, ExternalLink, Calendar } from 'lucide-react';
import type { Quotation } from '@/types';

interface QuotationsListProps {
  projectId: number;
  quotations: Quotation[];
  isLoadingQuotations: boolean;
  onAddClick: () => void;
  onStatusChange?: (quotationId: number, status: 'approved' | 'pending') => Promise<void> | void;
}

export function QuotationsList({ projectId, quotations, isLoadingQuotations, onAddClick, onStatusChange }: QuotationsListProps) {
  const [updatingId, setUpdatingId] = React.useState<number | null>(null);

  const handleStatusChange = async (quotationId: number, newStatus: 'approved' | 'pending') => {
    if (!onStatusChange) return;
    setUpdatingId(quotationId);
    try {
      await onStatusChange(quotationId, newStatus);
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh sách báo giá ({quotations.length})</h2>
        <button 
          onClick={onAddClick}
          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5 cursor-pointer bg-transparent border-0 p-0"
        >
          <Plus size={14} /> Tạo báo giá
        </button>
      </div>
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs">
        {isLoadingQuotations ? (
          <div className="py-4 flex justify-center"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
        ) : quotations.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {quotations.map((quotation, index) => (
              <div 
                key={quotation.id} 
                className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${index === 0 ? 'pt-0' : ''} ${index === quotations.length - 1 ? 'pb-0' : ''}`}
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 flex-1 w-full">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mã báo giá</span>
                    <span className="text-sm font-semibold text-slate-800 mt-0.5 block">{quotation.code || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tên báo giá</span>
                    <Link 
                      href={`/app/projects/${projectId}/quotations/${quotation.id}`}
                      className="text-sm font-bold text-slate-800 hover:text-primary transition-colors mt-0.5 block truncate max-w-[140px] sm:max-w-[180px]"
                    >
                      {quotation.title}
                    </Link>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ngày tạo</span>
                    <span className="text-sm text-slate-600 mt-0.5 block">{new Date(quotation.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chiết khấu</span>
                    <span className="text-sm font-bold text-primary mt-0.5 block">{quotation.discountPercentage}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto pt-3.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    quotation.status === 'Chờ duyệt' || quotation.status?.toLowerCase() === 'pending'
                      ? 'bg-orange-50 text-orange-600 border-orange-100'
                      : quotation.status === 'Đã duyệt' || quotation.status?.toLowerCase() === 'approved'
                      ? 'bg-green-50 text-green-600 border-green-100'
                      : 'bg-slate-50 text-slate-600 border-slate-100'
                  }`}>
                    {quotation.status === 'pending' || quotation.status === 'Chờ duyệt' ? 'Chờ duyệt' : quotation.status === 'approved' || quotation.status === 'Đã duyệt' ? 'Đã duyệt' : quotation.status}
                  </span>

                  <div className="flex items-center gap-2">
                    {onStatusChange && (
                      <button
                        onClick={() => handleStatusChange(quotation.id, (quotation.status === 'approved' || quotation.status === 'Đã duyệt') ? 'pending' : 'approved')}
                        disabled={updatingId !== null}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition-all cursor-pointer flex items-center justify-center gap-1 min-w-[75px] ${
                          (quotation.status === 'approved' || quotation.status === 'Đã duyệt')
                            ? 'text-red-650 hover:text-red-700 bg-red-50 hover:bg-red-100 border-red-100 hover:border-red-200'
                            : 'text-primary hover:text-primary/90 bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/30'
                        }`}
                      >
                        {updatingId === quotation.id ? (
                          <Loader2 size={12} className="animate-spin text-current" />
                        ) : (
                          (quotation.status === 'approved' || quotation.status === 'Đã duyệt') ? 'Hủy duyệt' : 'Duyệt'
                        )}
                      </button>
                    )}
                    
                    <Link 
                      href={`/app/projects/${projectId}/quotations/${quotation.id}`}
                      className="p-1.5 rounded-md text-slate-400 hover:text-primary hover:bg-slate-50 transition-all border border-slate-150 sm:border-0"
                    >
                      <ExternalLink size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">
            Chưa có báo giá nào được tạo cho dự án này.
          </div>
        )}
      </div>
    </div>
  );
}
