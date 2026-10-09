'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getProject, getProjectQuotations, getCustomers, deleteProject, updateQuotation } from '@/actions';
import { Heading, Button, Tabs, type TabItem } from '@/components';
import { ProjectFormModal, ProjectDeleteModal } from '../_components/modals';
import { QuotationCreateModal } from '../_components/quotation-modals';
import {
  ProjectInfo,
  QuotationsList,
  ProjectSummary,
  CustomerInfo,
  OwnerInfo,
  ProjectActivities,
  ProjectFloorsPositions,
  ProjectQuotationsPricing,
  ProjectContractsLedger,
  ProjectProductionProgress,
} from './_components';


import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { 
  FolderOpen, 
  Loader2,
  Edit,
  Trash2,
  Layers,
  FileText,
  CheckCircle2,
  Calculator,
} from 'lucide-react';



interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const router = useRouter();
  const { id } = React.use(params);
  const projectId = Number(id);

  // State modals & tabs
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isQuotationFormOpen, setIsQuotationFormOpen] = useState(false);

  // Lấy chi tiết dự án
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
    enabled: !!projectId,
  });

  // Lấy danh sách báo giá của dự án
  const { data: quotationsData, isLoading: isLoadingQuotations } = useQuery({
    queryKey: ['project_quotations', projectId],
    queryFn: () => getProjectQuotations(projectId),
    enabled: !!projectId,
  });

  // Lấy danh sách khách hàng (cho modal sửa)
  const { data: customerData } = useQuery({
    queryKey: ['customers'],
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
      showErrorToast(error, 'Xóa dự án thất bại');
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
      showErrorToast(error, 'Có lỗi xảy ra');
    },
  });

  const quotations = quotationsData?.items || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 p-6 text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Đang tải thông tin dự án...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 p-6 text-center">
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

  const projectTabs: TabItem[] = [
    { value: 'overview', label: 'Tổng quan & Nhật ký', icon: <FolderOpen size={15} /> },
    { value: 'positions', label: 'Tầng & Vị trí cửa', icon: <Layers size={15} /> },
    { value: 'quotations', label: 'Báo giá & Pricing', icon: <Calculator size={15} /> },
    { value: 'contracts', label: 'Hợp đồng & Sổ cái', icon: <FileText size={15} /> },
    { value: 'production', label: 'Lệnh sản xuất & KCS', icon: <CheckCircle2 size={15} /> },
  ];

  return (
    <div className="p-4 flex flex-col gap-6 text-slate-800">
      {/* Header: Badge Tabs thay cho Tên Dự Án to & Action Buttons */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200/80">
        {/* Tag Badge Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {projectTabs.map((tab) => {
            const isActive = tab.value === activeTab;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer select-none border ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<Edit size={14} />}
            onClick={() => setIsFormOpen(true)}
            className="h-8 px-2.5 text-xs font-semibold hover:text-primary hover:border-primary/30"
          >
            Chỉnh sửa
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<Trash2 size={14} />}
            onClick={() => setIsDeleteOpen(true)}
            className="h-8 px-2.5 text-xs font-semibold border-red-200 text-red-650 hover:bg-red-50"
          >
            Xóa dự án
          </Button>
        </div>
      </div>

      {/* Tab 1: Tổng quan & Nhật ký (Module 001) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <ProjectInfo project={project} formattedDate={formattedDate} />
            <ProjectActivities projectId={projectId} />
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
            <ProjectSummary quotations={quotations} formattedDate={formattedDate} />
            <CustomerInfo customer={project.customer} />
            <OwnerInfo user={project.user} />
          </div>
        </div>
      )}

      {/* Tab 2: Tầng & Vị trí cửa & Đo đạc ô chờ (Module 002) */}
      {activeTab === 'positions' && (
        <ProjectFloorsPositions projectId={projectId} />
      )}

      {/* Tab 3: Báo giá & Pricing Engine (Module 003) */}
      {activeTab === 'quotations' && (
        <ProjectQuotationsPricing projectId={projectId} />
      )}

      {/* Tab 4: Hợp đồng & Sổ cái (Module 004) */}
      {activeTab === 'contracts' && (
        <ProjectContractsLedger projectId={projectId} quotations={quotations} />
      )}


      {/* Tab 5: Lệnh sản xuất & KCS */}
      {activeTab === 'production' && (
        <ProjectProductionProgress projectId={projectId} />
      )}




      {/* Form Modal */}
      <ProjectFormModal 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Chỉnh sửa thông tin dự án"
        submitText="Lưu thay đổi"
        initialData={project || undefined}
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
