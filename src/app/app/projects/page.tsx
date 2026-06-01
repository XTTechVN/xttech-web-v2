'use client';

// Components
import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import ModalConfirm from '@/components/modal/ModalConfirm';
import ModalWrapper from '@/components/modal/ModalWrapper';
import ProjectTable from './_components/ProjectTable';
import ProjectModal, { ProjectFormData } from './_components/ProjectModal';
import { PlusIcon } from 'lucide-react';

// Hooks
import { useState } from 'react';
import queryClient from '@/utils/query';

// Utils
import api from '@/utils/api';
import toast from 'react-hot-toast';

// Types
import { Project } from '@/types/shared/project';

export default function ProjectsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [defaultValues, setDefaultValues] = useState<Project | undefined>(undefined);

  const handleAddProject = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      await api.post('/api/v1/projects', data);
      toast.success('Thêm dự án thành công');
      setIsLoading(false);
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Thêm dự án thất bại';
      toast.error(msg);
      setIsLoading(false);
    }
  };

  const handleEditProject = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      await api.put(`/api/v1/projects/${selectedProjectId}`, data);
      toast.success('Cập nhật dự án thành công');
      setIsModalOpen(false);
      setIsEdit(false);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Cập nhật dự án thất bại';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/api/v1/projects/${id}`);
      toast.success('Xóa dự án thành công');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Xóa dự án thất bại';
      toast.error(msg);
    } finally {
      setIsLoading(false);
      setIsModalConfirmOpen(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Heading */}
      <div className="flex flex-col gap-1">
        <Heading>Quản lý dự án</Heading>
        <SubHeading>Danh sách các công trường/dự án thi công camera giám sát AI và phân vùng khu vực</SubHeading>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-fit">
          <Search
            size="sm"
            className="w-full md:w-96"
            placeholder="Tìm kiếm dự án..."
            onChange={(val) => setSearchVal(val)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-fit">
          <Button
            size="sm"
            onClick={() => {
              setDefaultValues(undefined);
              setIsEdit(false);
              setIsModalOpen(true);
            }}
            icon={<PlusIcon size={16} />}
          >
            Thêm dự án
          </Button>
        </div>
      </div>

      {/* Table */}
      <ProjectTable
        searchQuery={searchVal}
        onDelete={(id) => {
          setSelectedProjectId(id);
          setIsModalConfirmOpen(true);
        }}
        onEdit={(project: Project) => {
          setDefaultValues(project);
          setSelectedProjectId(project.id);
          setIsEdit(true);
          setIsModalOpen(true);
        }}
      />

      {/* Modals */}
      <>
        {/* Add/Edit Project Info Modal */}
        <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ProjectModal
            isLoading={isLoading}
            onClose={() => setIsModalOpen(false)}
            onSave={isEdit ? handleEditProject : handleAddProject}
            defaultValues={isEdit ? defaultValues : undefined}
          />
        </ModalWrapper>

        {/* Delete Confirmation Modal */}
        <ModalWrapper isOpen={isModalConfirmOpen} onClose={() => setIsModalConfirmOpen(false)}>
          <ModalConfirm
            title="Xóa Dự Án"
            description="Bạn có chắc chắn muốn xóa dự án này? Toàn bộ các phân khu, camera và dữ liệu liên quan có thể bị ảnh hưởng. Thao tác này không thể hoàn tác."
            isLoading={isLoading}
            onCancel={() => setIsModalConfirmOpen(false)}
            onConfirm={() => handleDeleteProject(selectedProjectId)}
          />
        </ModalWrapper>
      </>
    </div>
  );
}
