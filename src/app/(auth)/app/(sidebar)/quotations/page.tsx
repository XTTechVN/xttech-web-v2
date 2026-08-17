'use client';

import React, { useState } from 'react';
import { Heading, StatsCard } from '@/components';
import Table from './_components/table';
import { FileSpreadsheet, Eye, ClipboardCheck, Ban } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { deleteQuotation, getProjects } from '@/actions';
import api from '@/utils/api';
import type { Quotation } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { QuotationCreateModal, QuotationUpdateModal, QuotationDeleteModal } from './_components/modals';

const Page = () => {
  const { data: quotationData } = useQuery({
    queryKey: ['quotations'],
    queryFn: async (): Promise<Quotation[]> => {
      const res = await api.get('/api/v1/quotations', { params: { limit: 9999 } });
      return res.data.items || [];
    },
  });

  const { data: projectData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await getProjects({ limit: 9999 });
      return res.items;
    },
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(null);

  const { mutate: deleteQuotationMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Xóa báo giá thành công');
      setIsDeleteOpen(false);
      setQuotationToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const totalQuotations = quotationData?.length || 0;
  const pendingQuotations = quotationData?.filter((q) => q.status === 'pending').length || 0;
  const approvedQuotations = quotationData?.filter((q) => q.status === 'approved').length || 0;
  const rejectedQuotations = quotationData?.filter((q) => q.status === 'rejected').length || 0;

  const stats = [
    {
      title: 'Tổng số báo giá',
      value: totalQuotations,
      icon: <FileSpreadsheet />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Chờ phê duyệt',
      value: pendingQuotations,
      icon: <Eye />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Đã duyệt',
      value: approvedQuotations,
      icon: <ClipboardCheck />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Từ chối',
      value: rejectedQuotations,
      icon: <Ban />,
      trend: 0,
      trendDirection: 'up' as const,
    },
  ];

  const handleOpenCreateModal = () => {
    setSelectedQuotation(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setIsFormOpen(true);
  };

  const handleOpenDeleteModal = (quotation: Quotation) => {
    setQuotationToDelete(quotation);
    setIsDeleteOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Heading size="h1" className="text-primary text-2xl md:text-4xl">
          Quản lý báo giá dự án
        </Heading>
        <Heading size="h3" className="text-gray-500 text-sm md:text-lg">
          Lập, theo dõi phê duyệt báo giá thi công nhôm kính
        </Heading>
      </div>
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
        projects={projectData} 
      />

      {/* Modal Zone */}
      <QuotationCreateModal
        isOpen={isFormOpen && !selectedQuotation}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedQuotation(null);
        }}
        title="Tạo báo giá mới"
        submitText="Xác nhận tạo"
        projects={projectData}
      />

      <QuotationUpdateModal
        isOpen={isFormOpen && !!selectedQuotation}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedQuotation(null);
        }}
        title="Sửa thông tin báo giá"
        submitText="Xác nhận lưu"
        initialData={
          selectedQuotation
            ? {
                id: selectedQuotation.id,
                title: selectedQuotation.title,
                code: selectedQuotation.code,
                discountPercentage: selectedQuotation.discountPercentage,
                status: selectedQuotation.status,
                projectId: selectedQuotation.projectId,
                reviewBy: selectedQuotation.reviewBy,
              }
            : undefined
        }
        projects={projectData}
      />

      <QuotationDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setQuotationToDelete(null);
        }}
        quotationTitle={quotationToDelete?.title}
        onConfirm={() => {
          if (quotationToDelete) deleteQuotationMutation(quotationToDelete.id);
        }}
        isPending={isDeleting}
      />
    </div>
  );
};

export default Page;
