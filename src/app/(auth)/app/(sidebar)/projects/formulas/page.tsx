'use client';

import React, { useState } from 'react';
import { Heading, StatsCard } from '@/components';
import Table from './_components/table';
import { Columns, Eye, EyeOff, LayoutGrid, Calculator } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getFormulas, deleteFormula } from '@/actions';
import type { Formula } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { FormulaCreateModal, FormulaUpdateModal, FormulaDeleteModal } from './_components/modals';

const Page = () => {
  const { data: formulasData } = useQuery({
    queryKey: ['formulas'],
    queryFn: async () => {
      const res = await getFormulas({ limit: 9999 });
      return res.items;
    },
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formulaToDelete, setFormulaToDelete] = useState<Formula | null>(null);

  const { mutate: deleteFormulaMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteFormula(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulas'] });
      toast.success('Xóa công thức thành công');
      setIsDeleteOpen(false);
      setFormulaToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi khi xóa công thức');
    },
  });

  const totalFormulas = formulasData?.length || 0;
  const phaoFormulas = formulasData?.filter((f) => f.type === 'door_trim').length || 0;
  const vomTronFormulas = formulasData?.filter((f) => f.type === 'circle').length || 0;
  const vomSemicircleFormulas = formulasData?.filter((f) => f.type === 'semicircle').length || 0;

  const stats = [
    {
      title: 'Tổng số công thức',
      value: totalFormulas,
      icon: <Calculator className="w-5 h-5 text-blue-500" />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Công thức phào',
      value: phaoFormulas,
      icon: <LayoutGrid className="w-5 h-5 text-amber-500" />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Công thức cả đường tròn',
      value: vomTronFormulas,
      icon: <Eye className="w-5 h-5 text-emerald-500" />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Công thức nửa đường tròn',
      value: vomSemicircleFormulas,
      icon: <Columns className="w-5 h-5 text-purple-500" />,
      trend: 0,
      trendDirection: 'up' as const,
    },
  ];

  const handleOpenCreateModal = () => {
    setSelectedFormula(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (formula: Formula) => {
    setSelectedFormula(formula);
    setIsFormOpen(true);
  };

  const handleOpenDeleteModal = (formula: Formula) => {
    setFormulaToDelete(formula);
    setIsDeleteOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 text-black">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendDirection={stat.trendDirection}
          />
        ))}
      </div>

      <Table
        onEditClick={handleOpenEditModal}
        onDeleteClick={handleOpenDeleteModal}
        onAddClick={handleOpenCreateModal}
      />

      {/* Modal Zone */}
      <FormulaCreateModal
        isOpen={isFormOpen && !selectedFormula}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedFormula(null);
        }}
        title="Thêm công thức mới"
        submitText="Xác nhận tạo"
      />

      <FormulaUpdateModal
        isOpen={isFormOpen && !!selectedFormula}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedFormula(null);
        }}
        title="Sửa công thức tính"
        submitText="Xác nhận lưu"
        initialData={selectedFormula || undefined}
      />

      <FormulaDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setFormulaToDelete(null);
        }}
        formulaName={formulaToDelete?.name || formulaToDelete?.code || undefined}
        onConfirm={() => {
          if (formulaToDelete) deleteFormulaMutation(formulaToDelete.id);
        }}
        isPending={isDeleting}
      />
    </div>
  );
};

export default Page;
