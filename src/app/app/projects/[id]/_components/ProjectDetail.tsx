'use client';

import { Project } from '@/types/shared/project';

interface ProjectDetailProps {
  project: Project;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  return (
    <div className="divide-y divide-gray-100 px-4 text-gray-600">
      <div className="flex flex-col py-3 md:flex-row md:items-center">
        <span className="text-sm font-semibold w-48 shrink-0">Tên dự án</span>
        <span className="text-sm font-medium">{project.name}</span>
      </div>
      <div className="flex flex-col py-3 md:flex-row md:items-center">
        <span className="text-sm font-semibold w-48 shrink-0">Mã dự án</span>
        <span className="text-sm font-medium">{project.code || 'DA-UNKNOWN'}</span>
      </div>
      <div className="flex flex-col py-3 md:flex-row md:items-center">
        <span className="text-sm font-semibold w-48 shrink-0">Trạng thái</span>
        <span className="text-sm font-medium">{project.status}</span>
      </div>
      <div className="flex flex-col py-3 md:flex-row md:items-center">
        <span className="text-sm font-semibold w-48 shrink-0">Địa chỉ</span>
        <span className="text-sm font-medium">{project.address || 'Chưa cập nhật địa chỉ'}</span>
      </div>
      <div className="flex flex-col py-3 md:flex-row md:items-start">
        <span className="text-sm font-semibold w-48 shrink-0">Mô tả dự án</span>
        <span className="text-sm flex-1 whitespace-pre-wrap">
          {project.description || 'Không có mô tả chi tiết'}
        </span>
      </div>
    </div>
  );
}
