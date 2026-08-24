'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getProject, getProjectQuotations, getCustomers, deleteProject, updateQuotation } from '@/actions';
import { Heading, Button } from '@/components';
import { ProjectFormModal, ProjectDeleteModal } from '../_components/modals';
import { QuotationCreateModal } from '../_components/quotation-modals';
import { ProjectInfo, QuotationsList, ProjectSummary, CustomerInfo, OwnerInfo } from './_components';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { 
  FolderOpen, 
  Loader2,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuthStore } from '@/stores';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const router = useRouter();
  const { id } = React.use(params);
  const projectId = Number(id);

  // State modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isQuotationFormOpen, setIsQuotationFormOpen] = useState(false);

  // Queries
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
    enabled: !isNaN(projectId),
  });

  const { data: quotationsData, isLoading: isLoadingQuotations } = useQuery({
    queryKey: ['project_quotations', projectId],
    queryFn: () => getProjectQuotations(projectId),
    enabled: !isNaN(projectId),
  });

  const user = useAuthStore((state) => state.user);

  const { data: customerData } = useQuery({
    queryKey: ['customers', user?.id],
    queryFn: async () => {
      const res = await getCustomers({ limit: 9999 });
      return res.items;
    },
  });

  // Mutation xóa dự án
  const { mutate: deleteProjectMutation, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Xóa dự án thành công');
      setIsDeleteOpen(false);
      router.push('/app/projects');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Mutation duyệt/hủy duyệt báo giá
  const { mutateAsync: changeQuotationStatus } = useMutation({
    mutationFn: ({ quotationId, status }: { quotationId: number; status: 'approved' | 'pending' }) => 
      updateQuotation(quotationId, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project_quotations', projectId] });
      toast.success(variables.status === 'approved' ? 'Duyệt báo giá thành công' : 'Hủy duyệt báo giá thành công');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra');
    },
  });

  const quotations = quotationsData?.items || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Đang tải thông tin dự án...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <div className="p-4 rounded-full bg-red-50 text-red-500 mb-4">
          <FolderOpen size={48} />
        </div>
        <Heading size="h2" className="text-xl font-semibold text-slate-800 mb-2">
          Không tìm thấy dự án
        </Heading>
        <p className="text-slate-500 mb-6 max-w-md text-sm">
          {error ? (error as any).message : 'Dự án bạn đang tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.'}
        </p>
        <Link 
          href="/app/projects"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-semibold shadow-sm text-sm"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const formattedDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <div className="flex flex-col gap-6 text-slate-800">
      {/* Header & Breadcrumb & Action Buttons */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between pb-5 border-b border-slate-200/80">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quản lý dự án</span>
          <Heading size="h1" className="text-primary text-2xl md:text-3xl font-bold mt-0.5">
            {project.name}
          </Heading>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 md:mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<Edit size={16} />}
            onClick={() => setIsFormOpen(true)}
            className="h-9 px-3 text-sm font-semibold hover:text-primary hover:border-primary/30"
          >
            Chỉnh sửa
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<Trash2 size={16} />}
            onClick={() => setIsDeleteOpen(true)}
            className="h-9 px-3 text-sm font-semibold border-red-200 text-red-650 hover:bg-red-50"
          >
            Xóa dự án
          </Button>
        </div>
      </div>

      {/* Main Content Layout (2/3 & 1/3 Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Project Details & Quotations (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ProjectInfo project={project} formattedDate={formattedDate} />
          <QuotationsList 
            projectId={projectId} 
            quotations={quotations} 
            isLoadingQuotations={isLoadingQuotations} 
            onAddClick={() => setIsQuotationFormOpen(true)}
            onStatusChange={async (quotationId, status) => {
              await changeQuotationStatus({ quotationId, status });
            }}
          />
        </div>

        {/* Right Column: Summaries & Client Info (1/3) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <ProjectSummary quotations={quotations} formattedDate={formattedDate} />
          <CustomerInfo customer={project.customer} />
          <OwnerInfo user={project.user} />
        </div>
      </div>

      {/* Form Modal */}
      <ProjectFormModal 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Chỉnh sửa thông tin dự án"
        submitText="Lưu thay đổi"
        customers={customerData}
        initialData={project ? {
          id: project.id,
          name: project.name,
          address: project.address || '',
          note: project.note || '',
          customerId: project.customerId
        } : undefined}
      />

      {/* Delete Modal */}
      <ProjectDeleteModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        projectName={project?.name}
        onConfirm={deleteProjectMutation}
        isPending={isDeleting}
      />

      {/* Quotation Create Modal */}
      <QuotationCreateModal 
        isOpen={isQuotationFormOpen}
        onClose={() => setIsQuotationFormOpen(false)}
        title="Tạo báo giá mới"
        defaultProjectId={projectId}
      />
    </div>
  );
}
