'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Eye, FilePen, Megaphone, RefreshCw, ShieldCheck, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { Modal, Button } from '@/components';
import { getDocumentById } from '@/actions/document';
import type { DocumentItem } from '@/types';
import { SHARE_SCOPE_MAP } from '@/types';
import { formatBytes } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-helpers';
import { getRuleActions, type RuleActionContext } from '../_utils/rule-permissions';
import { RULES_QUERY_KEYS } from '../_utils/rules-constants';
import { RuleStatusBadge, RuleTypeBadge, formatRuleDate } from './rule-badges';
import { RuleApprovalTimeline } from './rule-approval-timeline';
import { RuleRecipientTracking } from './rule-recipient-tracking';

export interface RuleDetailHandlers {
  onPreview: (doc: DocumentItem) => void;
  onEdit: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
  onReplace?: (doc: DocumentItem) => void;
  onApprove: (doc: DocumentItem, note?: string) => void;
  onReject: (doc: DocumentItem, note?: string) => void;
  onPublish: (doc: DocumentItem) => void;
  onAcknowledge: (doc: DocumentItem) => void;
}

interface RuleDetailModalProps {
  isOpen: boolean;
  document: DocumentItem | null;
  context: RuleActionContext;
  isBusy: boolean;
  handlers: RuleDetailHandlers;
  onClose: () => void;
}

const InfoItem: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
    <p className="text-xs font-medium text-slate-700 truncate">{value || '—'}</p>
  </div>
);

// Khối phạm vi áp dụng hiển thị khi văn bản chưa ban hành chính thức
const RuleScopeSection: React.FC<{ doc: DocumentItem }> = ({ doc }) => {
  const scopeLabel = SHARE_SCOPE_MAP[doc.shareScope] || doc.shareScope || 'Toàn công ty';

  return (
    <section>
      <h3 className="text-xs font-bold text-slate-700 mb-2">Phạm vi áp dụng</h3>
      <div className="flex flex-col gap-2 text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            {scopeLabel}
          </span>
          {doc.shareScope === 'all' && (
            <span className="text-slate-500">Áp dụng cho toàn thể cán bộ nhân viên trong công ty</span>
          )}
        </div>

        {doc.shareScope === 'department' && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-200/60">
            <span className="text-slate-500 font-medium">Phòng ban áp dụng:</span>
            {doc.recipientDepartments && doc.recipientDepartments.length > 0 ? (
              doc.recipientDepartments.map((dept) => (
                <span
                  key={dept.id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  {dept.name}
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic">Đang cập nhật phòng ban cụ thể</span>
            )}
          </div>
        )}

        {doc.shareScope === 'user' && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-200/60">
            <span className="text-slate-500 font-medium">Cá nhân áp dụng ({doc.recipients?.length || 0}):</span>
            {doc.recipients && doc.recipients.length > 0 ? (
              doc.recipients.map((r, idx) => (
                <span
                  key={r.id || idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  <span>👤</span>
                  <span>{r.user?.fullName || r.fullName || 'Nhân viên'}</span>
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic">Chưa có cá nhân nào được chỉ định</span>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export const RuleDetailModal: React.FC<RuleDetailModalProps> = ({
  isOpen,
  document: listDoc,
  context,
  isBusy,
  handlers,
  onClose,
}) => {
  const [approvalNote, setApprovalNote] = useState('');

  // Reset ghi chú duyệt khi mở văn bản khác
  useEffect(() => {
    if (isOpen) setApprovalNote('');
  }, [isOpen, listDoc?.id]);

  const { data: detail } = useQuery({
    queryKey: RULES_QUERY_KEYS.detail(listDoc?.id),
    queryFn: () => getDocumentById(listDoc!.id),
    enabled: isOpen && Boolean(listDoc),
  });

  if (!listDoc) return null;

  // Ưu tiên dữ liệu chi tiết (có recipients/versions), tạm dùng dữ liệu dòng danh sách khi đang tải
  const doc: DocumentItem = { ...listDoc, ...detail };
  const actions = getRuleActions(doc, context);
  const isIssued = ['published', 'superseded', 'expired'].includes(doc.status);
  const isReturnedDraft = doc.status === 'draft' && Boolean(doc.approvalNote);
  const isCreator = Boolean(context.currentUserId && doc.createdById === context.currentUserId);
  const version = doc.currentVersion;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" className="m-2 max-w-3xl w-full" title="Chi tiết cơ chế">
      <div className="flex flex-col gap-5 text-xs max-h-[70vh] overflow-y-auto pr-1">
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-slate-400">{doc.code}</span>
            <RuleTypeBadge type={doc.documentType} />
            <RuleStatusBadge doc={doc} />
          </div>
          <h2 className="text-base font-bold text-slate-800 leading-snug">{doc.title}</h2>
          {doc.summary && <p className="text-slate-600 leading-relaxed">{doc.summary}</p>}
        </header>

        {isReturnedDraft && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
            <strong>Bị từ chối:</strong> {doc.approvalNote}
          </div>
        )}

        {/* Thông báo trạng thái cho người soạn khi văn bản đang chờ duyệt */}
        {doc.status === 'pending' && isCreator && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800">
            <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Đang chờ phê duyệt:</span> Văn bản đang chờ{' '}
              <strong>{doc.approver?.fullName || 'Người phê duyệt'}</strong> xem xét và phê duyệt. Theo quy định, người soạn thảo không thể tự phê duyệt văn bản của chính mình.
            </div>
          </div>
        )}

        {doc.supersedesDoc && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
            <RefreshCw size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-800">Văn bản này thay thế cho:</span>{' '}
              <span className="font-mono font-bold text-amber-700">[{doc.supersedesDoc.code}]</span> {doc.supersedesDoc.title}
            </div>
          </div>
        )}

        {doc.supersededByDoc && (
          <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-100 p-3 text-xs text-slate-700">
            <RefreshCw size={16} className="text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Đã bị thay thế bởi:</span>{' '}
              <span className="font-mono font-bold text-slate-800">[{doc.supersededByDoc.code}]</span> {doc.supersededByDoc.title}
            </div>
          </div>
        )}

        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <InfoItem label="Người soạn" value={doc.createdBy?.fullName} />
          <InfoItem label="Người phê duyệt" value={doc.approver?.fullName} />
          <InfoItem label="Phạm vi" value={SHARE_SCOPE_MAP[doc.shareScope] || doc.shareScope || 'Toàn công ty'} />
          <InfoItem label="Có hiệu lực từ" value={doc.effectiveDate ? formatRuleDate(doc.effectiveDate) : undefined} />
          <InfoItem label="Hết hiệu lực" value={doc.expirationDate ? formatRuleDate(doc.expirationDate) : undefined} />
          <InfoItem
            label="Tệp"
            value={version ? `${version.fileName} (${formatBytes(version.fileSize)})` : undefined}
          />
        </section>

        {doc.requiresAcknowledgement && (
          <p className="flex items-center gap-1.5 text-amber-700">
            <ShieldCheck size={14} /> Văn bản yêu cầu người nhận xác nhận “đã đọc và hiểu”.
          </p>
        )}

        {doc.supersededByDoc && (
          <p className="text-slate-600">
            Đã bị thay thế bởi: <strong>{doc.supersededByDoc.code}</strong> — {doc.supersededByDoc.title}
          </p>
        )}
        {(doc.supersedesDocs?.length ?? 0) > 0 && (
          <p className="text-slate-600">
            Thay thế: {doc.supersedesDocs!.map((old) => `${old.code} — ${old.title}`).join('; ')}
          </p>
        )}

        {/* Khối phạm vi áp dụng (hiển thị rõ toàn công ty, phòng ban nào, hoặc cá nhân nào) */}
        <RuleScopeSection doc={doc} />

        {/* Khối theo dõi đọc của người nhận khi đã ban hành */}
        {isIssued && <RuleRecipientTracking doc={doc} />}

        {/* Khung Thẩm định & Phê duyệt trực quan cho Người duyệt */}
        {actions.canReview && (
          <section className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Thẩm định &amp; Phê duyệt cơ chế</h4>
                <p className="text-[11px] text-slate-500">
                  Bạn có thẩm quyền xem xét văn bản này. Vui lòng nhập ý kiến thẩm định và đưa ra quyết định.
                </p>
              </div>
            </div>

            <div>
              <textarea
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="Nhập ý kiến thẩm định, lý do phê duyệt hoặc từ chối (bắt buộc khi từ chối)..."
                rows={2}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2.5 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                id="rule-review-reject-btn"
                variant="outline"
                size="sm"
                leftIcon={<ThumbsDown size={14} className="text-rose-600" />}
                disabled={isBusy}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                onClick={() => handlers.onReject(doc, approvalNote.trim() || undefined)}
              >
                Từ chối duyệt
              </Button>
              <Button
                id="rule-review-approve-btn"
                size="sm"
                leftIcon={<ThumbsUp size={14} />}
                loading={isBusy}
                disabled={isBusy}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handlers.onApprove(doc, approvalNote.trim() || undefined)}
              >
                Đồng ý phê duyệt
              </Button>
            </div>
          </section>
        )}

        <section>
          <h3 className="text-xs font-bold text-slate-700 mb-3">Lịch sử xử lý</h3>
          <RuleApprovalTimeline documentId={doc.id} isEnabled={isOpen} />
        </section>
      </div>

      <div className="flex flex-wrap gap-2 justify-end w-full mt-4 pt-3 border-t border-slate-100">
        {actions.canDelete && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 size={14} className="text-rose-600" />}
            disabled={isBusy}
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => handlers.onDelete(doc)}
          >
            Xóa văn bản
          </Button>
        )}
        {actions.canEdit && (
          <Button id="rule-action-edit" variant="outline" size="sm" leftIcon={<FilePen size={14} />} disabled={isBusy} onClick={() => handlers.onEdit(doc)}>
            Sửa &amp; gửi duyệt
          </Button>
        )}
        {actions.canPublish && (
          <Button id="rule-action-publish" size="sm" leftIcon={<Megaphone size={14} />} disabled={isBusy} onClick={() => handlers.onPublish(doc)}>
            Ban hành
          </Button>
        )}
        {actions.canReplace && handlers.onReplace && (
          <Button
            id="rule-action-replace"
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={14} className="text-amber-600" />}
            disabled={isBusy}
            className="text-amber-700 border-amber-300 hover:bg-amber-50"
            onClick={() => handlers.onReplace!(doc)}
          >
            Soạn cơ chế thay thế
          </Button>
        )}
        {actions.canAcknowledge && (
          <Button id="rule-action-acknowledge" size="sm" leftIcon={<ShieldCheck size={14} />} loading={isBusy} disabled={isBusy} onClick={() => handlers.onAcknowledge(doc)}>
            Đã đọc và hiểu
          </Button>
        )}
        <Button id="rule-action-preview" variant="outline" size="sm" leftIcon={<Eye size={14} />} onClick={() => handlers.onPreview(doc)}>
          Xem văn bản
        </Button>
      </div>
    </Modal>
  );
};
