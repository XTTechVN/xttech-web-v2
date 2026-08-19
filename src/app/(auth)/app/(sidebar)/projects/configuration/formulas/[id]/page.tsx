'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getFormula, getMaterialsByFormula, assignMaterialsToFormula, unassignMaterialsFromFormula } from '@/actions';
import { Loader2, Edit, Plus } from 'lucide-react';
import { FORMULA_TYPE_MAP, DOOR_TYPE_MAP, formatMaterialUnit } from '@/types';
import { Button } from '@/components';
import { FormulaUpdateModal } from '../_components/modals';
import { AssignFormulaMaterialsModal } from '../_components/relation-modals';
import { toast } from 'react-hot-toast';

interface FormulaDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function FormulaDetailPage({ params }: FormulaDetailPageProps) {
  const { id } = React.use(params);
  const formulaId = Number(id);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);
  const [isSavingMaterials, setIsSavingMaterials] = useState(false);

  // 1. Fetch Formula Info
  const {
    data: formula,
    isLoading: isLoadingFormula,
    error,
  } = useQuery({
    queryKey: ['formula', formulaId],
    queryFn: () => getFormula(formulaId),
    enabled: !isNaN(formulaId),
  });

  // 2. Fetch Active Materials
  const {
    data: activeMaterials,
    isLoading: isLoadingMaterials,
    refetch: refetchMaterials,
  } = useQuery({
    queryKey: ['formula-materials', formulaId],
    queryFn: () => getMaterialsByFormula(formulaId, { limit: 9999 }),
    enabled: !isNaN(formulaId),
  });

  // Save Materials relations
  const handleSaveMaterials = async (selectedIds: number[]) => {
    if (!activeMaterials) return;
    setIsSavingMaterials(true);
    try {
      const initialIds = activeMaterials.items.map((m) => m.id);
      const toAssign = selectedIds.filter((id) => !initialIds.includes(id));
      const toRevoke = initialIds.filter((id) => !selectedIds.includes(id));

      if (toAssign.length > 0) {
        await assignMaterialsToFormula(formulaId, { material_ids: toAssign });
      }
      if (toRevoke.length > 0) {
        await unassignMaterialsFromFormula(formulaId, { material_ids: toRevoke });
      }
      toast.success('Cập nhật liên kết hệ nhôm thành công');
      refetchMaterials();
    } catch (err) {
      toast.error('Lỗi khi lưu liên kết hệ nhôm');
    } finally {
      setIsSavingMaterials(false);
    }
  };

  if (isLoadingFormula) {
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

  const activeMaterialIds = activeMaterials?.items.map((m) => m.id) || [];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-800 pb-12">
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

      <hr className="border-slate-100" />

      {/* Khối 1: Thông tin chung */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-2 text-sm">
        <span className="text-xs text-primary font-semibold select-none">Thông tin sản phẩm</span>
        <div className="flex flex-col gap-3.5 text-slate-650 mt-0.5">
          <div>
            <span className="font-semibold text-slate-500">Mã công thức: </span>
            <span className="text-slate-800 font-medium">{formula.code || '—'}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Phân loại: </span>
            <span className="text-slate-800 font-medium">
              {FORMULA_TYPE_MAP[formula.type] || formula.type}
            </span>
          </div>
          {formula.doorType && (
            <div>
              <span className="font-semibold text-slate-500">Biên dạng cửa áp dụng: </span>
              <span className="text-slate-800 font-medium">
                {DOOR_TYPE_MAP[formula.doorType] || formula.doorType}
              </span>
            </div>
          )}
          <div>
            <span className="font-semibold text-slate-500">Đơn vị tính: </span>
            <span className="text-slate-800 font-medium">{formula.unit || 'md'}</span>
          </div>

          <div className="flex flex-col gap-2.5 mt-1 border-t border-slate-100 pt-3">
            <span className="font-semibold text-slate-500">Thông số tính toán:</span>
            {formula.type === 'door_trim' ? (
              <div className="flex flex-col gap-2 text-slate-800 font-medium pl-1">
                <div>
                  <span className="text-slate-500 font-medium mr-2">Cộng rộng:</span>
                  <span>+{formula.widthAdd || 0} mm</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium mr-2">Cộng cao:</span>
                  <span>+{formula.heightAdd || 0} mm</span>
                </div>
              </div>
            ) : (
              <div className="pl-1 text-slate-800 font-medium">
                <span className="text-slate-500 font-medium mr-2">Tỷ lệ hao hụt:</span>
                <span className="text-amber-600">{formula.wastageRate || 0}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Khối 2: Hệ nhôm áp dụng */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-5 mt-2">
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-slate-900">Hệ nhôm áp dụng công thức</h2>
            <p className="text-xs text-slate-400">Danh sách các hệ nhôm đang liên kết với công thức này</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsMaterialsModalOpen(true)}
            className="h-8 text-xs font-semibold hover:text-primary hover:border-primary/20"
          >
            Cấu hình liên kết
          </Button>
        </div>

        {isLoadingMaterials ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : activeMaterials?.items && activeMaterials.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeMaterials.items.map((material) => (
              <div key={material.id} className="flex flex-col gap-1 p-4 rounded-xl border border-slate-100 bg-slate-50/40">
                <span className="font-semibold text-sm text-slate-800 leading-snug">{material.name}</span>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {material.code && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                      {material.code}
                    </span>
                  )}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                    ĐVT: {formatMaterialUnit(material.unit)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-xs text-slate-400 italic">Chưa có liên kết với hệ nhôm nào</p>
          </div>
        )}
      </div>

      <FormulaUpdateModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Sửa thông tin công thức"
        initialData={formula}
      />

      <AssignFormulaMaterialsModal
        isOpen={isMaterialsModalOpen}
        onClose={() => setIsMaterialsModalOpen(false)}
        activeMaterialIds={activeMaterialIds}
        onSave={handleSaveMaterials}
        isSaving={isSavingMaterials}
      />
    </div>
  );
}
