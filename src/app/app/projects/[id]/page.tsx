'use client';

// Components
import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import ModalConfirm from '@/components/modal/ModalConfirm';
import ModalWrapper from '@/components/modal/ModalWrapper';
import ZoneTable from './_components/ZoneTable';
import ZoneModal, { ZoneFormData } from './_components/ZoneModal';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ProjectDetail from './_components/ProjectDetail';
import ProjectUsersList from './_components/ProjectUsersList';
import ProjectUsersModal from './_components/ProjectUsersModal';
import {
  PlusIcon,
  ArrowLeft,
  MapPin,
  ClipboardList,
  Layers,
  ExternalLink,
  Info,
  Pencil,
} from 'lucide-react';
import ProjectModal, { ProjectFormData } from '../_components/ProjectModal';

// Hooks
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import { useParams, useRouter } from 'next/navigation';

// Utils
import api from '@/utils/api';
import toast from 'react-hot-toast';

// Types
import { Project } from '@/types/shared/project';
import { Zone } from '@/types/shared/zone';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [defaultValues, setDefaultValues] = useState<Zone | undefined>(undefined);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);

  const handleEditProject = async (data: ProjectFormData) => {
    setIsSubmittingProject(true);
    try {
      await api.put(`/api/v1/projects/${projectId}`, data);
      toast.success('Cập nhật dự án thành công');
      setIsProjectModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Cập nhật dự án thất bại';
      toast.error(msg);
    } finally {
      setIsSubmittingProject(false);
    }
  };

  // Fetch thông tin chi tiết dự án
  const {
    data: project,
    isLoading: isProjectLoading,
    error: projectError,
  } = useQuery<Project>({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/api/v1/projects/${projectId}`).then((res) => res.data),
    enabled: !!projectId,
  });

  const handleAddZone = async (data: ZoneFormData) => {
    setIsLoading(true);
    try {
      await api.post('/api/v1/zones', data);
      toast.success('Thêm phân khu thành công');
      setIsLoading(false);
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['zones', projectId] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Thêm phân khu thất bại';
      toast.error(msg);
      setIsLoading(false);
    }
  };

  const handleEditZone = async (data: ZoneFormData) => {
    setIsLoading(true);
    try {
      await api.patch(`/api/v1/zones/${selectedZoneId}`, data);
      toast.success('Cập nhật phân khu thành công');
      setIsModalOpen(false);
      setIsEdit(false);
      queryClient.invalidateQueries({ queryKey: ['zones', projectId] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Cập nhật phân khu thất bại';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteZone = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/api/v1/zones/${id}`);
      toast.success('Xóa phân khu thành công');
      queryClient.invalidateQueries({ queryKey: ['zones', projectId] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Xóa phân khu thất bại';
      toast.error(msg);
    } finally {
      setIsLoading(false);
      setIsModalConfirmOpen(false);
    }
  };

  if (isProjectLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        <span className="ml-3 text-sm font-medium">Đang tải thông tin dự án...</span>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 space-y-3">
          <p className="text-red-600 font-semibold">Lỗi tải thông tin dự án</p>
          <p className="text-xs">
            {(projectError as any)?.message ||
              'Dự án không tồn tại hoặc bạn không có quyền truy cập.'}
          </p>
          <Button
            size="sm"
            onClick={() => router.push('/app/projects')}
            icon={<ArrowLeft size={16} />}
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Back button & Breadcrumb */}
      <Breadcrumb
        items={[{ path: '/app/projects', label: 'Danh sách dự án' }, { label: project.name }]}
      />

      {/* Detail Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <Heading>Thông tin chi tiết dự án</Heading>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsProjectModalOpen(true);
              }}
              icon={<Pencil size={16} />}
            >
              Chỉnh sửa
            </Button>
          </div>
          <ProjectDetail project={project} />
        </div>
        <div className="border-t lg:border-t-0 lg:border-l border-gray-150 pt-6 lg:pt-0 lg:pl-6 flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-4">
            <Heading>Nhân sự được cấp quyền</Heading>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsUsersModalOpen(true);
              }}
              icon={<PlusIcon size={16} />}
            >
              Thêm nhân sự
            </Button>
          </div>
          <ProjectUsersList projectId={projectId} />
        </div>
      </div>

      {/* Zones Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Heading>Danh sách phân khu</Heading>

          <div className="flex items-center gap-2 w-full md:w-fit">
            <Search
              size="sm"
              className="w-full md:w-72"
              placeholder="Tìm kiếm phân khu..."
              onChange={(val) => setSearchVal(val)}
            />
            <Button
              size="sm"
              onClick={() => {
                setDefaultValues(undefined);
                setIsEdit(false);
                setIsModalOpen(true);
              }}
              icon={<PlusIcon size={16} />}
            >
              Thêm phân khu
            </Button>
          </div>
        </div>

        {/* Zones Table */}
        <ZoneTable
          projectId={projectId}
          searchQuery={searchVal}
          onDelete={(id) => {
            setSelectedZoneId(id);
            setIsModalConfirmOpen(true);
          }}
          onEdit={(zone: Zone) => {
            setDefaultValues(zone);
            setSelectedZoneId(zone.id);
            setIsEdit(true);
            setIsModalOpen(true);
          }}
        />
      </div>

      {/* Modals */}
      <>
        {/* Edit Project Modal */}
        <ModalWrapper isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)}>
          <ProjectModal
            isLoading={isSubmittingProject}
            onClose={() => setIsProjectModalOpen(false)}
            onSave={handleEditProject}
            defaultValues={project}
          />
        </ModalWrapper>

        {/* Manage Users for Project Modal */}
        <ModalWrapper isOpen={isUsersModalOpen} onClose={() => setIsUsersModalOpen(false)}>
          <ProjectUsersModal projectId={projectId} onClose={() => setIsUsersModalOpen(false)} />
        </ModalWrapper>

        {/* Add/Edit Zone Modal */}
        <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ZoneModal
            isLoading={isLoading}
            onClose={() => setIsModalOpen(false)}
            onSave={isEdit ? handleEditZone : handleAddZone}
            projectId={projectId}
            defaultValues={isEdit ? defaultValues : undefined}
          />
        </ModalWrapper>

        {/* Delete Confirmation Modal */}
        <ModalWrapper isOpen={isModalConfirmOpen} onClose={() => setIsModalConfirmOpen(false)}>
          <ModalConfirm
            title="Xóa Phân Khu"
            description="Bạn có chắc chắn muốn xóa phân khu này khỏi dự án? Mọi camera và cảnh báo sự kiện gán với phân khu này sẽ bị ảnh hưởng. Thao tác này không thể hoàn tác."
            isLoading={isLoading}
            onCancel={() => setIsModalConfirmOpen(false)}
            onConfirm={() => handleDeleteZone(selectedZoneId)}
          />
        </ModalWrapper>
      </>
    </div>
  );
}
