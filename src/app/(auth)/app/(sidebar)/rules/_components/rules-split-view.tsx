'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { DocumentItem } from '@/types';
import { DOCUMENT_TYPE_MAP, DOCUMENT_STATUS_MAP } from '@/types';
import { formatBytes, getFileVisualInfo } from '../../documents/_utils/doc-helpers';
import { getFileUrl } from '@/utils/string';
import dayjs from 'dayjs';
import {
  FileText,
  User,
  ShieldCheck,
  Eye,
  Download,
  Share2,
  Edit3,
  Trash2,
  Clock,
  Building2,
  FileCheck2,
  Sparkles,
  ChevronRight,
  Info,
  CalendarDays,
} from 'lucide-react';
import { Button } from '@/components';

// ============================================================================
// 1. SUBCOMPONENT: RuleListItem (Tối ưu memo hóa để tránh re-render danh sách)
// ============================================================================
interface RuleListItemProps {
  doc: DocumentItem;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onView: (doc: DocumentItem) => void;
  onEdit?: (doc: DocumentItem) => void;
  onDelete?: (doc: DocumentItem) => void;
}

const RuleListItem = React.memo<RuleListItemProps>(({ doc, isSelected, onSelect, onView, onEdit, onDelete }) => {
  const itemType = DOCUMENT_TYPE_MAP[doc.documentType] || {
    label: doc.documentType || 'Văn bản',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const itemDate = useMemo(() => {
    return doc.effectiveDate
      ? dayjs(doc.effectiveDate).format('DD/MM/YYYY')
      : dayjs(doc.createdAt).format('DD/MM/YYYY');
  }, [doc.effectiveDate, doc.createdAt]);

  const authorName = doc.approver?.fullName || doc.createdBy?.fullName || 'Ban Giám Đốc';

  const handleClick = useCallback(() => {
    // Trên mobile (< 1024px), ấn vào card mở thẳng modal chi tiết
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onView(doc);
    } else {
      onSelect(doc.id);
    }
  }, [doc, onSelect, onView]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`group p-3 rounded-lg cursor-pointer transition-all border outline-none select-none ${
        isSelected
          ? 'bg-primary/5 border-primary/40 shadow-xs ring-1 ring-primary/20'
          : 'bg-white hover:bg-slate-50/90 border-transparent hover:border-slate-200 focus-visible:border-slate-300'
      }`}
    >
      {/* Dòng 1: Tag phân loại & Số hiệu & Ngày */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5 flex-wrap">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${itemType.badgeClass}`}
          >
            {itemType.label}
          </span>

          {doc.code && (
            <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              {doc.code}
            </span>
          )}
        </div>

        <span className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
          <Clock size={11} />
          {itemDate}
        </span>
      </div>

      {/* Dòng 2: Tiêu đề văn bản */}
      <h4
        className={`text-xs sm:text-sm font-semibold line-clamp-2 leading-snug transition-colors ${
          isSelected ? 'text-primary font-bold' : 'text-slate-800 group-hover:text-slate-900'
        }`}
      >
        {doc.title}
      </h4>

      {/* Dòng 3: Người ký & Các nút thao tác nhanh (Sửa, Xóa, Chi tiết) */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100/80 gap-2">
        <span className="truncate min-w-0 flex items-center gap-1">
          <User size={12} className="text-slate-400 shrink-0" />
          <span className="truncate">{authorName}</span>
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(doc);
              }}
              className="p-1 rounded hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors cursor-pointer"
              title="Chỉnh sửa văn bản"
            >
              <Edit3 size={13} />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(doc);
              }}
              className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Xóa văn bản"
            >
              <Trash2 size={13} />
            </button>
          )}

          <ChevronRight
            size={13}
            className={`transition-transform shrink-0 ml-1 ${
              isSelected
                ? 'text-primary translate-x-0.5'
                : 'text-slate-300 group-hover:text-slate-400'
            }`}
          />
        </div>
      </div>
    </div>
  );
});

RuleListItem.displayName = 'RuleListItem';

// ============================================================================
// 2. SUBCOMPONENT: RuleDetailReader (Trình đọc nội dung công văn cột phải)
// ============================================================================
interface RuleDetailReaderProps {
  activeDoc: DocumentItem;
  onPreview: (doc: DocumentItem) => void;
  onView: (doc: DocumentItem) => void;
  onEdit: (doc: DocumentItem) => void;
  onShare: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
}

const RuleDetailReader: React.FC<RuleDetailReaderProps> = ({
  activeDoc,
  onPreview,
  onView,
  onEdit,
  onShare,
  onDelete,
}) => {
  const currentVersion = activeDoc.currentVersion;
  const fileName = currentVersion?.fileName || activeDoc.title;
  const visualInfo = useMemo(() => getFileVisualInfo(fileName || ''), [fileName]);
  const downloadUrl = currentVersion?.fileUrl ? getFileUrl(currentVersion.fileUrl) : '#';

  const typeInfo = useMemo(() => {
    return (
      DOCUMENT_TYPE_MAP[activeDoc.documentType] || {
        label: activeDoc.documentType || 'Văn bản',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      }
    );
  }, [activeDoc.documentType]);

  const docStatus = useMemo(() => {
    return (
      DOCUMENT_STATUS_MAP[activeDoc.status] || {
        label: activeDoc.status || 'Đang hiệu lực',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      }
    );
  }, [activeDoc.status]);

  const effectiveDateStr = useMemo(() => {
    return activeDoc.effectiveDate ? dayjs(activeDoc.effectiveDate).format('DD/MM/YYYY') : null;
  }, [activeDoc.effectiveDate]);

  const expirationDateStr = useMemo(() => {
    return activeDoc.expirationDate ? dayjs(activeDoc.expirationDate).format('DD/MM/YYYY') : null;
  }, [activeDoc.expirationDate]);

  const createdDateStr = useMemo(() => {
    return dayjs(activeDoc.createdAt).format('DD/MM/YYYY');
  }, [activeDoc.createdAt]);

  const updatedDateStr = useMemo(() => {
    return dayjs(activeDoc.updatedAt || activeDoc.createdAt).format('HH:mm DD/MM/YYYY');
  }, [activeDoc.updatedAt, activeDoc.createdAt]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      {/* 1. Header văn bản chính thức */}
      <div className="p-5 sm:p-6 border-b border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-white">
        {/* Tiêu ngữ doanh nghiệp */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/60 gap-3">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <Sparkles size={14} />
              <span>Công ty Cổ phần Công nghệ XTTECH</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Hệ thống văn bản chỉ đạo & thông báo điều hành nội bộ
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>{docStatus.label}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Ngày ban hành: {createdDateStr}
            </p>
          </div>
        </div>

        {/* Số hiệu & Tiêu đề lớn */}
        <div className="mt-4">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${typeInfo.badgeClass}`}
            >
              {typeInfo.label}
            </span>

            {activeDoc.code && (
              <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                Số: {activeDoc.code}
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
            {activeDoc.title}
          </h2>
        </div>

        {/* Thanh thao tác chính */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-200/60 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onPreview(activeDoc)}
              leftIcon={<Eye size={14} />}
              className="h-8.5 text-xs font-semibold px-3 shadow-2xs cursor-pointer"
            >
              Đọc toàn màn hình
            </Button>

            {downloadUrl !== '#' && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-8.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs"
              >
                <Download size={14} />
                <span>Tải về tệp gốc</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onView(activeDoc)}
              className="inline-flex items-center gap-1 h-8.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs transition-colors shadow-2xs cursor-pointer"
              title="Xem chi tiết & lịch sử phiên bản"
            >
              <Info size={14} />
              <span className="hidden sm:inline">Chi tiết</span>
            </button>

            <button
              type="button"
              onClick={() => onShare(activeDoc)}
              className="inline-flex items-center justify-center w-8.5 h-8.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer"
              title="Chia sẻ văn bản"
            >
              <Share2 size={14} />
            </button>

            <button
              type="button"
              onClick={() => onEdit(activeDoc)}
              className="inline-flex items-center justify-center w-8.5 h-8.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer"
              title="Chỉnh sửa văn bản"
            >
              <Edit3 size={14} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(activeDoc)}
              className="inline-flex items-center justify-center w-8.5 h-8.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 transition-colors shadow-2xs cursor-pointer"
              title="Xóa văn bản"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Thẻ thông tin hành chính & Trích yếu */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* Bảng thông tin hành chính */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Người ký duyệt:</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <User size={13} className="text-slate-500" />
              <span>
                {activeDoc.approver?.fullName || activeDoc.createdBy?.fullName || 'Ban Giám Đốc'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Ngày có hiệu lực:</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <CalendarDays size={13} className="text-slate-500" />
              <span>{effectiveDateStr || 'Ngay khi ban hành'}</span>
            </div>
          </div>

          {expirationDateStr && (
            <div>
              <span className="text-slate-400 block mb-0.5">Ngày hết hiệu lực:</span>
              <span className="font-semibold text-slate-800">{expirationDateStr}</span>
            </div>
          )}

          <div>
            <span className="text-slate-400 block mb-0.5">Phạm vi áp dụng:</span>
            <span className="font-semibold text-slate-800">Toàn thể cán bộ nhân viên</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Phiên bản hiện hành:</span>
            <span className="font-semibold text-slate-800">
              v{currentVersion?.versionNumber || '1.0'}
            </span>
          </div>
        </div>

        {/* Hộp Trích yếu / Tóm tắt nội dung */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <FileText size={14} className="text-primary" />
            <span>Trích yếu nội dung văn bản</span>
          </h4>
          <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            {activeDoc.summary || (
              <span className="italic text-slate-500">
                Văn bản ban hành chính thức của Công ty Cổ phần Công nghệ XTTECH. Mọi cán bộ nhân
                viên trong phạm vi áp dụng có trách nhiệm thi hành nghiêm túc quy định này kể từ ngày
                có hiệu lực.
              </span>
            )}
          </div>
        </div>

        {/* Khung tệp đính kèm văn bản gốc */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <FileCheck2 size={14} className="text-primary" />
            <span>Tệp đính kèm văn bản</span>
          </h4>

          <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/80 transition-colors shadow-2xs gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                {visualInfo.icon}
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs sm:text-sm font-semibold text-slate-800 truncate"
                  title={fileName}
                >
                  {fileName}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {currentVersion?.fileSize ? formatBytes(currentVersion.fileSize) : 'Tài liệu số'} •
                  Cập nhật lúc {updatedDateStr}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onPreview(activeDoc)}
                leftIcon={<Eye size={13} />}
                className="h-8 text-xs font-medium px-2.5 cursor-pointer"
              >
                Đọc trực tiếp
              </Button>

              {downloadUrl !== '#' && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs transition-colors shadow-2xs"
                  title="Tải về tệp"
                >
                  <Download size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. MAIN COMPONENT: RulesSplitView
// ============================================================================
export interface RulesSplitViewProps {
  documents: DocumentItem[];
  onPreview: (doc: DocumentItem) => void;
  onView: (doc: DocumentItem) => void;
  onEdit: (doc: DocumentItem) => void;
  onShare: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
}

export const RulesSplitView: React.FC<RulesSplitViewProps> = ({
  documents,
  onPreview,
  onView,
  onEdit,
  onShare,
  onDelete,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);

  // Tối ưu React State: Derive activeDoc an toàn không cần qua useEffect set state thừa
  const activeDoc = useMemo(() => {
    if (!documents || documents.length === 0) return null;
    return documents.find((d) => d.id === selectedDocId) ?? documents[0];
  }, [documents, selectedDocId]);

  const handleSelectDoc = useCallback((id: number) => {
    setSelectedDocId(id);
  }, []);

  if (!documents || documents.length === 0) return null;

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 h-auto lg:h-[calc(100vh-230px)] lg:min-h-[550px] pb-4">
      {/* ========================================================
          CỘT TRÁI (3/12 TRÊN DESKTOP, FULL WIDTH TRÊN MOBILE)
          ======================================================== */}
      <div className="w-full lg:col-span-3 flex flex-col bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden min-h-0 h-auto lg:h-full">
        {/* Header danh sách bên trái */}
        <div className="p-3.5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <h3 className="text-xs font-bold text-slate-800">Danh sách công văn & thông báo</h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
            {documents.length} văn bản
          </span>
        </div>

        {/* Danh sách cuộn độc lập trên desktop, tự nhiên trên mobile */}
        <div className="flex-1 lg:overflow-y-auto divide-y divide-slate-100 p-2 space-y-1.5 custom-scrollbar">
          {documents.map((doc) => (
            <RuleListItem
              key={doc.id}
              doc={doc}
              isSelected={activeDoc?.id === doc.id}
              onSelect={handleSelectDoc}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>

      {/* ========================================================
          CỘT PHẢI (9/12): CHỈ HIỂN THỊ TRÊN DESKTOP (lg:flex), ẨN TRÊN MOBILE
          ======================================================== */}
      <div className="hidden lg:flex lg:col-span-9 flex-col bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden min-h-0 h-full">
        {activeDoc ? (
          <RuleDetailReader
            activeDoc={activeDoc}
            onPreview={onPreview}
            onView={onView}
            onEdit={onEdit}
            onShare={onShare}
            onDelete={onDelete}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <FileText size={48} className="mb-2 text-slate-300 stroke-1" />
            <p className="text-sm font-medium">Chọn một văn bản bên trái để xem nội dung</p>
          </div>
        )}
      </div>
    </div>
  );
};
