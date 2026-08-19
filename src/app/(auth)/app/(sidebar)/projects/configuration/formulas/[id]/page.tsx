'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getFormula } from '@/actions';
import { Loader2, Edit } from 'lucide-react';
import { FORMULA_TYPE_MAP, DOOR_TYPE_MAP } from '@/types';
import { Button } from '@/components';
import { FormulaUpdateModal } from '../_components/modals';

interface FormulaDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function FormulaDetailPage({ params }: FormulaDetailPageProps) {
  const { id } = React.use(params);
  const formulaId = Number(id);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: formula, isLoading, error } = useQuery({
    queryKey: ['formula', formulaId],
    queryFn: () => getFormula(formulaId),
    enabled: !isNaN(formulaId),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-slate-500 text-xs">Đang tải thông tin...</p>
      </div>
    );
  }

  if (error || !formula) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <p className="text-red-500 font-semibold text-sm mb-2">Không tìm thấy thông tin công thức</p>
        <Link href="/app/projects/configuration" className="text-primary text-xs font-semibold hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const formattedUpdatedAt = formula.updatedAt
    ? new Date(formula.updatedAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '—';

  return (
    <div className="w-full flex flex-col gap-5 text-slate-800 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4 mt-2">
          <h1 className="text-2xl font-bold text-slate-900">{formula.name || 'Công thức tính'}</h1>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit size={14} />}
            onClick={() => setIsEditOpen(true)}
            className="h-8 px-3 text-xs font-semibold hover:text-primary hover:border-primary/30 shrink-0"
          >
            Chỉnh sửa
          </Button>
        </div>
        <p className="text-xs text-slate-400">Cập nhật ngày {formattedUpdatedAt}</p>
      </div>

      <hr className="border-slate-200" />

      {/* Main Details */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-x-12 gap-y-4 text-sm mt-1">
          <div>
            <span className="text-xs text-slate-400 block select-none">Mã công thức</span>
            <span className="font-semibold text-slate-800">{formula.code || '—'}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block select-none">Phân loại</span>
            <span className="font-semibold text-slate-800">
              {FORMULA_TYPE_MAP[formula.type] || formula.type}
            </span>
          </div>
          {formula.doorType && (
            <div>
              <span className="text-xs text-slate-400 block select-none">Biên dạng cửa áp dụng</span>
              <span className="font-semibold text-slate-800">
                {DOOR_TYPE_MAP[formula.doorType] || formula.doorType}
              </span>
            </div>
          )}
          <div>
            <span className="text-xs text-slate-400 block select-none">Đơn vị tính</span>
            <span className="font-semibold text-slate-800">{formula.unit || 'md'}</span>
          </div>
        </div>

        {/* Dynamic Formula Specs */}
        <div className="flex flex-col gap-1.5 mt-2">
          <h2 className="text-base font-semibold text-slate-850">1. Thông số tính toán</h2>
          <div className="bg-slate-50 p-4 rounded border border-slate-100 text-sm flex flex-col gap-3">
            {formula.type === 'door_trim' ? (
              <div className="flex flex-col gap-2">
                <div>
                  <span className="text-xs text-slate-400 mr-2">Cộng rộng:</span>
                  <span className="font-semibold text-slate-800">+{formula.widthAdd || 0} mm</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 mr-2">Cộng cao:</span>
                  <span className="font-semibold text-slate-800">+{formula.heightAdd || 0} mm</span>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-xs text-slate-400 mr-2">Tỷ lệ hao hụt:</span>
                <span className="font-semibold text-amber-600">{formula.wastageRate || 0}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Applied Materials */}
        <div className="flex flex-col gap-2 mt-2">
          <h2 className="text-base font-semibold text-slate-850">2. Hệ nhôm áp dụng</h2>
          {formula.materials && formula.materials.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formula.materials.map((m) => (
                <span
                  key={m.id}
                  className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded-md font-medium border border-slate-200"
                >
                  {m.name} ({m.code})
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Chưa áp dụng cho hệ nhôm nào.</p>
          )}
        </div>
      </div>

      <FormulaUpdateModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Sửa thông tin công thức"
        initialData={formula}
      />
    </div>
  );
}
