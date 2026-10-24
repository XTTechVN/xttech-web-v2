'use client';

import React from 'react';
import {
  Building2, Calendar, Clock, Edit3, Eye, EyeOff, Folder, Globe, Share2, ShieldCheck, Trash2, User, Users,
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
  onPreview,
  onShare,
  onEdit,
  onDelete,
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
    <div className="space-y-4 text-xs">
      <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-slate-50 via-white to-slate-50 border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
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

          <div className="flex items-center gap-1.5 shrink-0">
            {onPreview && (
              <button
                type="button"
                onClick={() => onPreview(doc)}
                className="inline-flex items-center justify-center w-7.5 h-7.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                title="Xem trước tài liệu"
              >
                <Eye size={13} className="text-primary" />
              </button>
            )}
            {onShare && (
              <button
                type="button"
                onClick={() => onShare(doc)}
                className="inline-flex items-center justify-center w-7.5 h-7.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                title="Chia sẻ văn bản"
              >
                <Share2 size={13} />
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(doc)}
                className="inline-flex items-center justify-center w-7.5 h-7.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary transition-colors shadow-2xs cursor-pointer"
                title="Chỉnh sửa văn bản"
              >
                <Edit3 size={13} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(doc)}
                className="inline-flex items-center justify-center w-7.5 h-7.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors shadow-2xs cursor-pointer"
                title="Xóa văn bản"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">{doc.title}</h3>
      </div>

      {canManageDoc && (
        <div className="space-y-2.5 p-3.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
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
            <p className="text-[11px] text-slate-500 italic">
              Văn bản được phát hành công khai cho toàn bộ nhân sự trong công ty.
            </p>
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
            <p className="text-[11px] text-slate-400 italic">
              Chưa có cá nhân hay phòng ban nào được chỉ định nhận văn bản này.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-white border border-slate-200/80">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-600">
            <Folder size={14} className="text-slate-500 shrink-0" />
            <span>Thư mục:</span>
            <span className="font-semibold text-slate-800">{doc.category?.name || 'Thư mục gốc'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <User size={14} className="text-slate-500 shrink-0" />
            <span>Người tạo:</span>
            <span className="font-semibold text-slate-800">{doc.createdBy?.fullName || 'CBNV'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Clock size={14} className="text-slate-500 shrink-0" />
            <span>Ngày tạo:</span>
            <span className="font-semibold text-slate-800">{dayjs(doc.createdAt).format('HH:mm - DD/MM/YYYY')}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck size={14} className="text-slate-500 shrink-0" />
            <span>Trạng thái duyệt:</span>
            <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${approvalInfo.badgeClass}`}>
              {approvalInfo.label}
            </span>
          </div>
          {approverDisplayName && (
            <div className="flex items-center gap-2 text-slate-600">
              <User size={14} className="text-slate-500 shrink-0" />
              <span>Người duyệt:</span>
              <span className="font-semibold text-slate-800">{approverDisplayName}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar size={14} className="text-slate-500 shrink-0" />
            <span>Phạm vi chia sẻ:</span>
            <span className="font-semibold text-slate-800">
              {SHARE_SCOPE_MAP[doc.shareScope] || doc.shareScope || 'Cá nhân'}
            </span>
          </div>
        </div>
      </div>

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
