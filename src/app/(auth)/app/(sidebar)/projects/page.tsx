'use client';

import { Heading, StatsCard } from '@/components';

// Các thành phần dùng riêng cho dự án
import Table from './_components/table';
import { ProjectFormModal, ProjectDeleteModal } from './_components/modals';

// Icons thư viện lucide-react
import { FolderOpen, CheckCircle2, Clock, Users } from 'lucide-react';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getCustomers, deleteProject } from '@/actions';
import type { Project } from '@/types';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { useAuthStore } from '@/stores';

const Page = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // Lấy danh sách khách hàng
  const { data: customerData } = useQuery({
    queryKey: ['customers', user?.id],
    queryFn: async () => {
      const hasFullViewRole = user?.roles?.some((role) => ['admin', 'super', 'hr'].includes(role.code || ''));
      const staffId = !hasFullViewRole && user ? user.id : undefined;
      const res = await getCustomers({ limit: 9999, staffId });
      return res.items;
    },
  });

  // State quản lý các modal tập trung
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Mutation xóa dự án
  const { mutate: deleteProjectMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Xóa dự án thành công');
      setIsDeleteOpen(false);
      setProjectToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const totalProjects = 0;
  const totalCustomers = customerData?.length || 0;

  const projectStats = [
    {
      title: 'Tổng số dự án',
      value: totalProjects,
      icon: <FolderOpen />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Đang thực hiện',
      value: totalProjects,
      icon: <Clock />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Hoàn thành',
      value: 0,
      icon: <CheckCircle2 />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Khách hàng',
      value: totalCustomers,
      icon: <Users />,
      trend: 0,
      trendDirection: 'up' as const,
    },
  ];

  const handleOpenCreateModal = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleOpenDeleteModal = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteOpen(true);
  };

  const handleViewProject = (project: Project) => {
    router.push(`/app/projects/${project.id}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {projectStats.map((stat, index) => (
          <StatsCard key={index} title={stat.title} value={stat.value} icon={stat.icon} trend={stat.trend} trendDirection={stat.trendDirection} />
        ))}
      </div>
      <Table
        customers={customerData}
        onViewClick={handleViewProject}
        onEditClick={handleOpenEditModal}
        onDeleteClick={handleOpenDeleteModal}
        onAddClick={handleOpenCreateModal}
      />

      {/* Modal Zone */}
      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProject(null);
        }}
        title={selectedProject ? 'Sửa dự án' : 'Thêm dự án mới'}
        submitText={selectedProject ? 'Xác nhận lưu' : 'Xác nhận tạo'}
        initialData={
          selectedProject
            ? {
                id: selectedProject.id,
                name: selectedProject.name,
                customerId: selectedProject.customerId,
                address: selectedProject.address,
                note: selectedProject.note,
              }
            : undefined
        }
        customers={customerData}
      />

      <ProjectDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setProjectToDelete(null);
        }}
        projectName={projectToDelete?.name}
        onConfirm={() => {
          if (projectToDelete) deleteProjectMutation(projectToDelete.id);
        }}
        isPending={isDeleting}
      />
    </div>
  );
};

export default Page;
