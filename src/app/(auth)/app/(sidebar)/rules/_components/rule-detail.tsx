'use client';

import { useState } from 'react';
import { Eye, FilePen, Megaphone, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { Textarea } from '@/components';
import { Button, DrawerSection, InfoRow, Tag } from '@/components-remake';
import { DocumentWorkflowStepper } from '@/components/documents/workflow-stepper';
import { SHARE_SCOPE_MAP, type DocumentItem } from '@/types';
import { formatBytes } from '@/utils';
import { cn } from '@/utils/cn';
import { getRuleActions, type RuleActionContext } from '../_utils/rule-permissions';
import { formatRuleDate } from './rule-badges';
import { RuleApprovalTimeline } from './rule-approval-timeline';
import { RuleRecipientTracking, RuleScopeSection } from './rule-recipient-tracking';
import { StatusTag, TypeTag } from './rule-list';

export interface RuleHandlers {
  onPreview: (d: DocumentItem) => void;
  onEdit: (d: DocumentItem) => void;
  onDelete: (d: DocumentItem) => void;
  onReplace: (d: DocumentItem) => void;
  onPublish: (d: DocumentItem) => void;
  onAcknowledge: (d: DocumentItem) => void;
  onReview: (d: DocumentItem, approved: boolean, note?: string, thenPublish?: boolean) => void;
}

interface Props {
  doc: DocumentItem;
  context: RuleActionContext;
  busy: boolean;
  handlers: RuleHandlers;
}

const BLOCK = 'rounded-block border border-slate-200 bg-white p-4';
const LINK_NOTE = 'text-sm text-slate-600 [overflow-wrap:anywhere]';
const NOTE = 'rounded-control border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 [overflow-wrap:anywhere]';

function ReviewBox({
  doc,
  canPublish,
  busy,
  onReview,
}: {
  doc: DocumentItem;
  canPublish: boolean;
  busy: boolean;
  onReview: RuleHandlers['onReview'];
}) {
  const [note, setNote] = useState('');
  const trimmed = note.trim();
  return (
    <DrawerSection title="Thẩm định">
      <Textarea rows={2} fullWidth value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ý kiến thẩm định (bắt buộc khi từ chối)" />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="danger" disabled={busy || !trimmed} onClick={() => onReview(doc, false, trimmed)}>
          Từ chối
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => onReview(doc, true, trimmed || undefined)}>
          Duyệt
        </Button>
        {canPublish && (
          <Button loading={busy} onClick={() => onReview(doc, true, trimmed || undefined, true)}>
            Duyệt và ban hành
          </Button>
        )}
      </div>
    </DrawerSection>
  );
}

// Chi tiết văn bản (trang riêng): nội dung dài bên trái, thông tin và thao tác bên phải
export function RuleDetail({ doc, context, busy, handlers }: Props) {
  const a = getRuleActions(doc, context);
  const version = doc.currentVersion;
  // Số người đã đọc và lịch sử xử lý là dữ liệu quản lý: chỉ quản trị, người soạn và người phê duyệt xem
  const isOwner = [doc.createdById, doc.approverId].some((id) => id != null && String(id) === String(context.currentUserId));
  const canTrack = context.isManager || isOwner;
  const issued = ['published', 'superseded', 'expired'].includes(doc.status);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-4">
        <section className={BLOCK}>
          <p className="flex flex-wrap items-center gap-1.5">
            <Tag tone="blue">{doc.code || '–'}</Tag>
            <TypeTag type={doc.documentType} />
            <StatusTag status={doc.status} />
          </p>
          {doc.summary && !(doc.supersedesDoc && doc.summary.includes(doc.supersedesDoc.code)) && <p className="mt-2 text-sm text-slate-600 [overflow-wrap:anywhere]">{doc.summary}</p>}
          <div className="mt-3 flex flex-col gap-1.5 empty:hidden">
            {doc.status === 'draft' && doc.approvalNote && (
              <p className={NOTE}>
                <strong className="font-semibold text-red-700">Bị từ chối:</strong> {doc.approvalNote}
              </p>
            )}
            {doc.status === 'pending' && doc.createdById === context.currentUserId && (
              <p className={NOTE}>Đang chờ {doc.approver?.fullName || 'người phê duyệt'} xem xét. Người soạn không thể tự phê duyệt.</p>
            )}
            {doc.supersedesDoc && (
              <p className={LINK_NOTE}>
                Thay thế <span className="text-slate-900">[{doc.supersedesDoc.code}]</span> {doc.supersedesDoc.title}
              </p>
            )}
            {doc.supersededByDoc && (
              <p className={LINK_NOTE}>
                Đã bị thay thế bởi <span className="text-slate-900">[{doc.supersededByDoc.code}]</span> {doc.supersededByDoc.title}
              </p>
            )}
          </div>
        </section>

        <DocumentWorkflowStepper status={doc.status} approvalStatus={doc.approvalStatus} />

        <section className={BLOCK}>
          <RuleScopeSection doc={doc} />
          {issued && canTrack && <RuleRecipientTracking doc={doc} />}
        </section>

        {canTrack && (
          <section className={BLOCK}>
            <DrawerSection title="Lịch sử xử lý">
              <RuleApprovalTimeline documentId={doc.id} isEnabled scopeNote={SHARE_SCOPE_MAP[doc.shareScope]} />
            </DrawerSection>
          </section>
        )}
      </div>

      <aside className="max-lg:contents lg:sticky lg:top-4 lg:flex lg:flex-col lg:gap-4">
        <div className="flex flex-col gap-4 max-lg:order-first">
          <section className={cn(BLOCK, 'flex flex-col gap-2')}>
            <Button variant="outline" icon={<Eye size={16} />} onClick={() => handlers.onPreview(doc)}>
              Xem văn bản
            </Button>
            {a.canPublish && !a.canReview && (
              <Button icon={<Megaphone size={16} />} disabled={busy} onClick={() => handlers.onPublish(doc)}>
                Ban hành
              </Button>
            )}
            {a.canAcknowledge && (
              <Button icon={<ShieldCheck size={16} />} loading={busy} onClick={() => handlers.onAcknowledge(doc)}>
                Đã đọc và hiểu
              </Button>
            )}
            {a.canEdit && (
              <Button variant="outline" icon={<FilePen size={16} />} onClick={() => handlers.onEdit(doc)}>
                Sửa
              </Button>
            )}
            {a.canReplace && (
              <Button variant="outline" icon={<RefreshCw size={16} />} onClick={() => handlers.onReplace(doc)}>
                Soạn văn bản thay thế
              </Button>
            )}
            {a.canDelete && (
              <Button variant="outline" className="border-red-200 text-red-700 md:hover:bg-red-50" icon={<Trash2 size={16} />} onClick={() => handlers.onDelete(doc)}>
                Xóa
              </Button>
            )}
          </section>

          {a.canReview && (
            <section className={BLOCK}>
              <ReviewBox doc={doc} canPublish={a.canPublish} busy={busy} onReview={handlers.onReview} />
            </section>
          )}
        </div>

        <section className={BLOCK}>
          <DrawerSection title="Thông tin">
            <InfoRow label="Người soạn">{doc.createdBy?.fullName || '–'}</InfoRow>
            <InfoRow label="Người phê duyệt">{doc.approver?.fullName || '–'}</InfoRow>
            <InfoRow label="Hiệu lực từ">{doc.effectiveDate ? formatRuleDate(doc.effectiveDate) : '–'}</InfoRow>
            {doc.expirationDate && <InfoRow label="Hết hiệu lực">{formatRuleDate(doc.expirationDate)}</InfoRow>}
            <InfoRow label="Tệp">{version ? `${version.fileName} (${formatBytes(version.fileSize)})` : '–'}</InfoRow>
          </DrawerSection>
        </section>

        {doc.requiresAcknowledgement && (
          <p className="flex items-center gap-1.5 text-sm text-amber-700">
            <ShieldCheck size={16} className="flex-none" /> Người nhận phải xác nhận “đã đọc và hiểu”.
          </p>
        )}
      </aside>
    </div>
  );
}
