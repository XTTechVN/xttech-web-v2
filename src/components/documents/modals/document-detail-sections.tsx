'use client';

import React from 'react';
import {
  Building2, Calendar, Clock, Eye, EyeOff, Folder, Globe, ShieldCheck, User, Users,
} from 'lucide-react';
import type { DocumentItem } from '@/types';
import { DOCUMENT_TYPE_MAP, DOCUMENT_STATUS_MAP, APPROVAL_STATUS_MAP, SHARE_SCOPE_MAP } from '@/types';
import { formatBytes } from '@/utils';
import dayjs from 'dayjs';

interface DocumentDetailBodyProps {
  doc: DocumentItem;
  targetDoc: DocumentItem;
  canManageDoc: boolean;
  approvalStatus: string;
  approverDisplayName: string | null;
  resolvedDepartments: { id: number; name: string; code?: string }[];
  resolvedUsers: any[];
  onPreview?: (doc: DocumentItem) => void;
  onShare?: (doc: DocumentItem) => void;
  onEdit?: (doc: DocumentItem) => void;
  onDelete?: (doc: DocumentItem) => void;
}

export const DocumentDetailBody: React.FC<DocumentDetailBodyProps> = ({
  doc,
  targetDoc,
  canManageDoc,
  approvalStatus,
  approverDisplayName,
  resolvedDepartments,
  resolvedUsers,
}) => {
  const docTypeInfo = DOCUMENT_TYPE_MAP[doc.documentType] || {
    label: doc.documentType || 'Văn bản',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
  };
  const statusInfo = DOCUMENT_STATUS_MAP[doc.status] || {
    label: doc.status || 'Bản nháp',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  const approvalInfo = APPROVAL_STATUS_MAP[approvalStatus as keyof typeof APPROVAL_STATUS_MAP] || {
    label: approvalStatus || 'Soạn thảo',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="space-y-3.5 text-xs">
      {/* Khối 1: Thông tin tiêu đề và badges */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-slate-50 via-white to-slate-50 border border-slate-200 shadow-2xs space-y-2.5">
        {/* Hàng 1: Danh sách nhãn trạng thái */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 rounded-md border ${docTypeInfo.badgeClass}`}>
            {docTypeInfo.label}
          </span>
          {doc.code && (
            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
              Số: {doc.code}
            </span>
          )}
          <span className={`text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 rounded border ${statusInfo.badgeClass}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Hàng 2: Tên tài liệu */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug break-words">
          {doc.title}
        </h3>
      </div>

      {/* Khối 2: Thông tin chung (đặt trước Đối tượng nhận văn bản như ảnh 2) */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs divide-y divide-slate-100 space-y-0">
        <div className="flex items-center justify-between py-2.5 text-xs first:pt-0 last:pb-0">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <Folder size={15} className="text-slate-400 shrink-0" />
            <span>Thư mục</span>
          </div>
          <span className="font-semibold text-slate-800 text-right truncate max-w-[60%]">
            {doc.category?.name || 'Thư mục gốc'}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 text-xs first:pt-0 last:pb-0">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <User size={15} className="text-slate-400 shrink-0" />
            <span>Người tạo</span>
          </div>
          <span className="font-semibold text-slate-800 text-right truncate max-w-[60%]">
            {doc.createdBy?.fullName || 'CBNV'}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 text-xs first:pt-0 last:pb-0">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <Clock size={15} className="text-slate-400 shrink-0" />
            <span>Ngày tạo</span>
          </div>
          <span className="font-semibold text-slate-800 text-right">
            {dayjs(doc.createdAt).format('HH:mm - DD/MM/YYYY')}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 text-xs first:pt-0 last:pb-0">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <ShieldCheck size={15} className="text-slate-400 shrink-0" />
            <span>Trạng thái duyệt</span>
          </div>
          <span className={`font-semibold px-2.5 py-0.5 rounded text-[11px] ${approvalInfo.badgeClass}`}>
            {approvalInfo.label}
          </span>
        </div>

        {approverDisplayName && (
          <div className="flex items-center justify-between py-2.5 text-xs first:pt-0 last:pb-0">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <User size={15} className="text-slate-400 shrink-0" />
              <span>Người duyệt</span>
            </div>
            <span className="font-semibold text-slate-800 text-right truncate max-w-[60%]">
              {approverDisplayName}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between py-2.5 text-xs first:pt-0 last:pb-0">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <Calendar size={15} className="text-slate-400 shrink-0" />
            <span>Phạm vi chia sẻ</span>
          </div>
          <span className="font-semibold text-slate-800 text-right">
            {SHARE_SCOPE_MAP[doc.shareScope] || doc.shareScope || 'Cá nhân'}
          </span>
        </div>
      </div>

      {/* Khối 3: Đối tượng nhận văn bản (đặt sau Thông tin chung) */}
      {canManageDoc && (
        <div className="space-y-3 p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
              <Users size={15} className="text-primary" />
              <span>Đối tượng nhận văn bản</span>
            </span>
            {targetDoc.shareScope === 'all' ? (
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 flex items-center gap-1">
                <Globe size={12} className="text-primary" />
                Toàn thể công ty
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 font-medium">
                {resolvedDepartments.length} phòng ban • {resolvedUsers.length} cá nhân
              </span>
            )}
          </div>

          {targetDoc.shareScope === 'all' && (
            <div className="p-3 rounded-xl border border-dashed border-primary/20 bg-primary/5">
              <p className="text-[11px] text-primary italic">
                Văn bản được phát hành công khai cho toàn bộ nhân sự trong công ty.
              </p>
            </div>
          )}

          {resolvedDepartments.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Building2 size={13} className="text-sky-600" />
                <span>Phòng ban nhận ({resolvedDepartments.length}):</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {resolvedDepartments.map((dept) => (
                  <span
                    key={dept.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200/80 text-[11px] font-medium"
                  >
                    <Building2 size={12} className="text-sky-600" />
                    <span>{dept.name}</span>
                    {dept.code && <span className="text-[10px] text-sky-600">[{dept.code}]</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {resolvedUsers.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <User size={13} className="text-primary" />
                <span>Cá nhân đích danh ({resolvedUsers.length}):</span>
              </span>
              <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 border border-slate-200/80 rounded-xl bg-slate-50/50">
                {resolvedUsers.map((u) => (
                  <div key={u.id} className="p-2 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 uppercase">
                        {(u.fullName || 'U').charAt(0)}
                      </div>
                      <div className="min-w-0 truncate">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-medium text-slate-800 truncate block">{u.fullName}</span>
                          {u.code && (
                            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[10px] rounded font-mono font-medium border border-slate-200 shrink-0">
                              {u.code}
                            </span>
                          )}
                        </div>
                        {(u.departmentName || u.email) && (
                          <span className="text-[10px] text-slate-500 truncate block">
                            {[u.email, u.departmentName].filter(Boolean).join(' • ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {u.isRead ? (
                        <span
                          title={u.readAt ? `Đã đọc lúc ${dayjs(u.readAt).format('HH:mm DD/MM')}` : 'Đã đọc'}
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
                        >
                          <Eye size={11} />
                          <span>Đã đọc</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          <EyeOff size={11} />
                          <span>Chưa đọc</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {targetDoc.shareScope !== 'all' && resolvedDepartments.length === 0 && resolvedUsers.length === 0 && (
            <div className="p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
              <p className="text-[11px] text-slate-500 italic">
                Chưa có cá nhân hay phòng ban nào được chỉ định nhận văn bản này.
              </p>
            </div>
          )}
        </div>
      )}

      {doc.summary && (
        <div className="space-y-1">
          <span className="font-semibold text-slate-700">Trích yếu nội dung:</span>
          <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">{doc.summary}</p>
        </div>
      )}

      {(doc.effectiveDate || doc.expirationDate) && (
        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
          {doc.effectiveDate && (
            <div><span>Hiệu lực từ: </span><span className="font-semibold text-slate-800">{dayjs(doc.effectiveDate).format('DD/MM/YYYY')}</span></div>
          )}
          {doc.expirationDate && (
            <div><span>Hết hạn: </span><span className="font-semibold text-slate-800">{dayjs(doc.expirationDate).format('DD/MM/YYYY')}</span></div>
          )}
        </div>
      )}

      {doc.versions && doc.versions.length > 1 && (
        <div className="space-y-2 pt-2">
          <h4 className="font-semibold text-slate-800 text-xs">Lịch sử các phiên bản</h4>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {doc.versions.map((ver) => (
              <div key={ver.id} className="p-2.5 flex items-center justify-between bg-white text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold font-mono text-primary">v{ver.versionNumber}</span>
                  <span className="text-slate-700 truncate max-w-[200px]">{ver.fileName}</span>
                  {ver.isCurrent && <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">Hiện hành</span>}
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <span>{formatBytes(ver.fileSize)}</span>
                  <span>{dayjs(ver.createdAt).format('DD/MM/YYYY')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
