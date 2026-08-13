'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getProject, getProjectQuotations } from '@/actions';
import { Heading } from '@/components';
import { 
  ArrowLeft, 
  FolderOpen, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  Clock, 
  Shield,
  Loader2
} from 'lucide-react';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  // Giải nén params bằng React.use() vì params trong Next.js mới là Promise
  const { id } = React.use(params);
  const projectId = Number(id);

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

  const quotations = quotationsData?.items || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-gray-500">Đang tải thông tin dự án...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <div className="p-4 rounded-full bg-red-50 text-red-500 mb-4">
          <FolderOpen size={48} />
        </div>
        <Heading size="h2" className="text-xl font-semibold text-gray-800 mb-2">
          Không tìm thấy dự án
        </Heading>
        <p className="text-gray-500 mb-6 max-w-md">
          {error ? (error as any).message : 'Dự án bạn đang tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.'}
        </p>
        <Link 
          href="/app/projects"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium shadow-sm"
        >
          <ArrowLeft size={16} /> Quay lại danh sách
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
    <div className="flex flex-col gap-6 max-w-6xl mx-auto p-4 md:p-6">
      {/* Header & Back Button */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200">
        <div className="flex flex-col gap-2">
          <Link 
            href="/app/projects"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors w-fit group font-medium"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Quay lại danh sách
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FolderOpen size={24} />
            </div>
            <Heading size="h1" className="text-2xl md:text-3xl font-bold text-gray-900">
              Chi tiết dự án: {project.name}
            </Heading>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Project General Information */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2 pb-3 border-b border-gray-100">
              <FolderOpen size={18} className="text-primary" /> Thông tin chung dự án
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-50 text-gray-400 mt-0.5">
                  <FolderOpen size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tên dự án</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{project.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-50 text-gray-400 mt-0.5">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Địa chỉ dự án</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">{project.address || '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-50 text-gray-400 mt-0.5">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ngày khởi tạo</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-50 text-gray-400 mt-0.5">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ID dự án</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">#{project.id}</p>
                </div>
              </div>
            </div>

            {/* Note Section */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-50 text-gray-400 mt-0.5">
                  <FileText size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ghi chú / Mô tả</p>
                  <div className="text-sm text-gray-700 mt-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100 whitespace-pre-line leading-relaxed">
                    {project.note || 'Không có ghi chú nào cho dự án này.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2 pb-3 border-b border-gray-100">
              <User size={18} className="text-primary" /> Thông tin khách hàng
            </h2>

            {project.customer ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                    {project.customer.name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">{project.customer.name}</h3>
                    <p className="text-xs text-gray-450">Khách hàng liên kết</p>
                  </div>
                </div>

                <div className="space-y-3 mt-2">
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Phone size={15} className="text-gray-400 shrink-0" />
                    <span>{project.customer.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Mail size={15} className="text-gray-400 shrink-0 break-all" />
                    <span>{project.customer.email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <MapPin size={15} className="text-gray-400 shrink-0" />
                    <span>{project.customer.address || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Shield size={15} className="text-gray-400 shrink-0" />
                    <span className="font-mono text-xs">MST/CCCD: {project.customer.identifyCode || '—'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">Không tìm thấy thông tin khách hàng.</div>
            )}
          </div>

          {/* Project Owner / System Creator Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2 pb-3 border-b border-gray-100">
              <Shield size={18} className="text-primary" /> Người phụ trách / Tạo dự án
            </h2>

            {project.user ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                    {(project.user.fullName as string)?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">{project.user.fullName as string}</h3>
                    <p className="text-xs text-gray-455">@{project.user.username as string}</p>
                  </div>
                </div>

                <div className="space-y-3 mt-2">
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Mail size={15} className="text-gray-400 shrink-0 break-all" />
                    <span>{(project.user.email as string) || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Shield size={15} className="text-gray-400 shrink-0" />
                    <span className="font-mono text-xs">Mã nhân viên: {(project.user.identifyCode as string) || '—'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">Không tìm thấy thông tin người phụ trách.</div>
            )}
          </div>
        </div>

        {/* Right Column: Quotations */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow h-full">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-primary" /> Báo giá dự án ({quotations.length})
              </h2>
              <Link href={`/app/quotations?projectId=${projectId}`} className="text-sm font-medium text-primary hover:underline">
                + Tạo báo giá
              </Link>
            </div>
            
            <div className="flex flex-col gap-4">
              {isLoadingQuotations ? (
                <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
              ) : quotations.length > 0 ? (
                quotations.map(quotation => (
                  <Link href={`/app/quotations/${quotation.id}`} key={quotation.id} className="block group">
                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col gap-3 group-hover:border-primary/50 group-hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{quotation.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">Mã BG: {quotation.code || '—'}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          quotation.status === 'Chờ duyệt' || quotation.status?.toLowerCase() === 'pending'
                            ? 'bg-yellow-50 text-yellow-600'
                            : quotation.status === 'Đã duyệt' || quotation.status?.toLowerCase() === 'approved'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {quotation.status === 'pending' ? 'Chờ duyệt' : quotation.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100/60">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar size={14} /> 
                          {new Date(quotation.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-sm font-semibold text-primary">
                          Chiết khấu: {quotation.discountPercentage}%
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-10 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                    <FileText size={20} />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Chưa có báo giá nào</p>
                  <p className="text-xs text-gray-500 mt-1">Dự án này hiện chưa có báo giá nào được tạo.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
