'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FolderOpen, CheckCircle2, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { StatsCard } from '@/components';
import { getCustomers, getProjectStats, deleteProject } from '@/actions';
import { usePermission } from '@/hooks';
import type { Project } from '@/types';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import { Table, ProjectFormModal, ProjectDeleteModal } from './_components';

const Page = () => {
  const router = useRouter();
  const { user, isSaleOnly } = usePermission();
  const scopedUserId = isSaleOnly && user?.id ? user.id : undefined;

  // Lấy tổng số khách hàng nhẹ (limit = 1 chỉ đọc meta.total)
  const { data: customerMeta } = useQuery({
    queryKey: ['customers', 'total-count'],
    queryFn: async () => {
      const res = await getCustomers({ limit: 1 });
      return res.meta?.total ?? 0;
    },
    staleTime: 60_000,
  });

  // Lấy thống kê dự án nhẹ từ endpoint агреgate /projects/stats
  const { data: projectsStatsData } = useQuery({
    queryKey: ['projects', 'stats-summary', scopedUserId],
    queryFn: () => getProjectStats({ userId: scopedUserId }),
    staleTime: 30_000,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const { mutate: deleteProjectMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Xóa dự án thành công');
      setIsDeleteOpen(false);
      setProjectToDelete(null);
    },
    onError: (error) => {
      showErrorToast(error, 'Xóa dự án thất bại');
    },
  });

  const projectStats = useMemo(
    () => [
      {
        title: 'Tổng số dự án',
        value: projectsStatsData?.total ?? 0,
        icon: <FolderOpen />,
        trend: 0,
        trendDirection: 'up' as const,
      },
      {
        title: 'Đang thực hiện',
        value: projectsStatsData?.inProgress ?? 0,
        icon: <Clock />,
        trend: 0,
        trendDirection: 'up' as const,
      },
      {
        title: 'Hoàn thành',
        value: projectsStatsData?.completed ?? 0,
        icon: <CheckCircle2 />,
        trend: 0,
        trendDirection: 'up' as const,
      },
      {
        title: 'Khách hàng',
        value: customerMeta ?? 0,
        icon: <Users />,
        trend: 0,
        trendDirection: 'up' as const,
      },
    ],
    [projectsStatsData, customerMeta],
  );

  const handleOpenCreateModal = useCallback(() => {
    setSelectedProject(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  }, []);

  const handleOpenDeleteModal = useCallback((project: Project) => {
    setProjectToDelete(project);
    setIsDeleteOpen(true);
  }, []);

  const handleViewProject = useCallback(
    (project: Project) => {
      router.push(`/app/projects/${project.id}`);
    },
    [router],
  );

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {projectStats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendDirection={stat.trendDirection}
          />
        ))}
      </div>

      <Table
        onViewClick={handleViewProject}
        onEditClick={handleOpenEditModal}
        onDeleteClick={handleOpenDeleteModal}
        onAddClick={handleOpenCreateModal}
      />

      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProject(null);
        }}
        title={selectedProject ? 'Sửa dự án' : 'Thêm dự án mới'}
        submitText={selectedProject ? 'Xác nhận lưu' : 'Xác nhận tạo'}
        initialData={selectedProject || undefined}
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
