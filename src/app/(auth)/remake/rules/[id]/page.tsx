'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { acknowledgeDocument, deleteDocument, getDocumentById, markDocumentAsRead, publishDocument, reviewDocument } from '@/actions';
import { useCan } from '@/hooks';
import {
  APPROVAL_STATUS_MAP,
  DOCUMENT_STATUS_MAP,
  DOCUMENT_TYPE_MAP,
  SHARE_SCOPE_MAP,
  type DocumentItem,
  type PublishDocumentPayload,
} from '@/types';
import { getFileUrl } from '@/utils';
import { Badge } from '../../_components/badge';
import { BTN_DANGER, BTN_LINE, BTN_PRIMARY, messageOf } from '../../_components/form';
import { BackLink } from '../../_components/page-header';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';
import { PublishSheet } from '../_components/publish-sheet';
import { RuleTimeline } from '../_components/rule-timeline';
import { ruleActions } from '../_lib/rule-access';

const day = (s?: string | null) => (s ? new Date(s).toLocaleDateString('vi-VN') : '–');
const size = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);
const H = 'mb-2 text-sm font-semibold';

// Chi tiết văn bản ban hành: thông tin, phạm vi, theo dõi người nhận, lịch sử, và các thao tác theo trạng thái + quyền.
export default function RemakeRuleDetailPage() {
  const id = Number(useParams<{ id: string }>().id);
  const router = useRouter();
  const qc = useQueryClient();
  const { can, me, isReady } = useCan();
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const q = useQuery({ queryKey: ['rules', 'detail', id], queryFn: () => getDocumentById(id), enabled: isReady && can('rule:read') });
  const d: DocumentItem | undefined = q.data;

  useEffect(() => {
    if (d?.isRead === false) markDocumentAsRead(d.id).then(() => qc.invalidateQueries({ queryKey: ['rules'] }));
  }, [d?.id, d?.isRead, qc]);

  const refresh = () => qc.invalidateQueries({ queryKey: ['rules'] });
  const fail = (e: unknown) => toast.error(messageOf(e));
  const ok = (msg: string) => () => {
    toast.success(msg);
    setPublishing(false);
    setNote('');
    refresh();
  };
  const review = useMutation({
    mutationFn: (approved: boolean) =>
      reviewDocument(id, { approvalStatus: approved ? 'approved' : 'rejected', approvalNote: note.trim() || undefined }),
    onError: fail,
  });
  const publish = useMutation({
    mutationFn: (p: PublishDocumentPayload) => publishDocument(id, p),
    onSuccess: ok('Đã ban hành văn bản'),
    onError: fail,
  });
  const ack = useMutation({ mutationFn: () => acknowledgeDocument(id), onSuccess: ok('Đã xác nhận đã đọc và hiểu'), onError: fail });
  const remove = useMutation({
    mutationFn: () => deleteDocument(id),
    onSuccess: () => {
      toast.success('Đã chuyển vào thùng rác');
      refresh();
      router.push('/remake/rules');
    },
    onError: fail,
  });

  if (!isReady) return <ListSkeleton />;
  if (!can('rule:read')) return <EmptyState title="Bạn chưa có quyền xem văn bản ban hành" description="Liên hệ quản trị viên để được cấp quyền." />;

  const a =
    d &&
    ruleActions(d, {
      userId: me?.user.id ?? '',
      isPublisher: can('document:publish'),
      canApprove: can('document:approve'),
      canDelete: can('document:delete'),
    });
  const v = d?.currentVersion ?? d?.versions?.find((x) => x.isCurrent);
  const url = getFileUrl(v?.downloadUrl ?? v?.fileUrl ?? v?.filePath);
  const stats = d?.recipientStats;
  const busy = review.isPending || publish.isPending || ack.isPending || remove.isPending;

  const decide = async (approved: boolean, thenPublish = false) => {
    if (!approved && !note.trim()) return setNoteError('Nhập lý do từ chối');
    setNoteError('');
    try {
      await review.mutateAsync(approved);
      toast.success(approved ? 'Đã phê duyệt văn bản' : 'Đã từ chối, văn bản trả về bản nháp');
      refresh();
      setNote('');
      if (approved && thenPublish) setPublishing(true);
    } catch {
      // lỗi đã báo ở onError
    }
  };

  const rows: [string, string][] = d
    ? [
        ['Mã', d.code],
        ['Người soạn', d.createdBy?.fullName ?? '–'],
        ['Người duyệt', d.approver?.fullName ?? '–'],
        ['Phòng ban ban hành', d.issuingDepartment?.name ?? '–'],
        ['Hiệu lực', `${day(d.effectiveDate)} → ${day(d.expirationDate)}`],
        ['Ngày tạo', day(d.createdAt)],
      ]
    : [];

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/remake/rules" label="Văn bản ban hành" />
      {q.isLoading && <ListSkeleton />}
      {q.isError && (
        <ErrorState title="Không tải được văn bản" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => q.refetch()} />
      )}
      {d && a && (
        <div className="flex flex-col gap-5">
          <header>
            <h1 className="font-heading text-lg font-semibold [overflow-wrap:anywhere] md:text-xl">{d.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="primary">{DOCUMENT_TYPE_MAP[d.documentType]?.label ?? d.documentType}</Badge>
              <Badge>{DOCUMENT_STATUS_MAP[d.status]?.label ?? d.status}</Badge>
              {d.approvalStatus !== d.status && <Badge tone="warning">{APPROVAL_STATUS_MAP[d.approvalStatus]?.label ?? d.approvalStatus}</Badge>}
              {d.requiresAcknowledgement && <Badge tone="success">Cần xác nhận đã đọc</Badge>}
            </div>
            {d.summary && <p className="mt-3 text-sm text-rm-muted [overflow-wrap:anywhere]">{d.summary}</p>}
          </header>

          {d.supersedesDoc && (
            <p className="flex items-start gap-2 rounded-rm bg-rm-warning-soft p-3 text-sm text-rm-warning">
              <RefreshCw size={16} className="mt-0.5 flex-none" aria-hidden="true" />
              <span className="min-w-0 [overflow-wrap:anywhere]">
                Thay thế văn bản [{d.supersedesDoc.code}] {d.supersedesDoc.title}
              </span>
            </p>
          )}
          {d.supersededByDoc && (
            <p className="rounded-rm bg-rm-bg p-3 text-sm text-rm-muted [overflow-wrap:anywhere]">
              Đã bị thay thế bởi [{d.supersededByDoc.code}] {d.supersededByDoc.title}
            </p>
          )}

          {v && url && (
            <a href={url} target="_blank" rel="noreferrer" className={`${BTN_PRIMARY} min-w-0`}>
              <Download size={18} aria-hidden="true" />
              <span className="min-w-0 truncate">
                Mở {v.fileName} ({size(v.fileSize)})
              </span>
            </a>
          )}

          <section aria-label="Thông tin">
            <dl className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface text-sm">
              {rows.map(([k, val]) => (
                <div key={k} className="flex justify-between gap-3 px-3 py-2">
                  <dt className="flex-none text-rm-muted">{k}</dt>
                  <dd className="min-w-0 truncate text-right">{val}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-label="Phạm vi áp dụng">
            <h2 className={H}>Phạm vi áp dụng</h2>
            <div className="flex flex-col gap-2 rounded-rm-xl border border-rm-edge bg-rm-surface p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="primary">{SHARE_SCOPE_MAP[d.shareScope] ?? d.shareScope}</Badge>
                {d.shareScope === 'all' && <span className="text-rm-muted">Toàn thể nhân viên trong công ty</span>}
              </div>
              {d.shareScope === 'department' && (
                <ul className="flex flex-wrap gap-2">
                  {(d.recipientDepartments ?? []).length === 0 && <li className="text-rm-muted">Chưa chọn phòng ban</li>}
                  {d.recipientDepartments?.map((x) => (
                    <li key={x.id}>
                      <Badge>{x.name}</Badge>
                    </li>
                  ))}
                </ul>
              )}
              {d.shareScope === 'user' && (
                <ul className="flex flex-wrap gap-2">
                  {(d.recipients ?? []).length === 0 && <li className="text-rm-muted">Chưa chọn người nhận</li>}
                  {d.recipients?.map((r, i) => (
                    <li key={r.id ?? i}>
                      <Badge>{r.user?.fullName || r.fullName || 'Nhân viên'}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {stats && d.status !== 'draft' && (
            <section aria-label="Theo dõi người nhận">
              <h2 className={H}>Theo dõi người nhận</h2>
              <p className="rounded-rm-xl border border-rm-edge bg-rm-surface p-3 text-sm">
                Đã đọc <strong className="text-rm-success">{stats.readCount}</strong>/{stats.totalRecipients} · Chưa đọc{' '}
                <strong className="text-rm-warning">{stats.unreadCount ?? stats.totalRecipients - stats.readCount}</strong>
              </p>
            </section>
          )}

          {a.canReview && (
            <section aria-label="Phê duyệt" className="flex flex-col gap-3 rounded-rm-xl border border-rm-edge bg-rm-surface p-3">
              <h2 className="text-sm font-semibold">Phê duyệt văn bản</h2>
              <label htmlFor="rv-note" className="sr-only">
                Ghi chú phê duyệt
              </label>
              <textarea
                id="rv-note"
                rows={3}
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  setNoteError('');
                }}
                placeholder="Ghi chú (bắt buộc khi từ chối)"
                aria-invalid={!!noteError}
                className="w-full rounded-rm border border-rm-line bg-rm-surface p-3 text-base outline-none focus-visible:border-rm-primary md:text-sm"
              />
              {noteError && (
                <p role="alert" className="text-sm text-rm-danger">
                  {noteError}
                </p>
              )}
              <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
                <button type="button" disabled={busy} onClick={() => decide(false)} className={BTN_DANGER}>
                  Từ chối
                </button>
                <button type="button" disabled={busy} onClick={() => decide(true)} className={BTN_PRIMARY}>
                  Phê duyệt
                </button>
              </div>
              {a.canPublish && (
                <button type="button" disabled={busy} onClick={() => decide(true, true)} className={`${BTN_LINE} w-full`}>
                  Phê duyệt và ban hành
                </button>
              )}
            </section>
          )}

          <div className="flex flex-col gap-2">
            {a.canAcknowledge && d.isAcknowledged !== true && (
              <button type="button" disabled={busy} onClick={() => ack.mutate()} className={`${BTN_PRIMARY} w-full`}>
                Tôi đã đọc và hiểu
              </button>
            )}
            {a.canPublish && !a.canReview && (
              <button type="button" disabled={busy} onClick={() => setPublishing(true)} className={`${BTN_PRIMARY} w-full`}>
                Ban hành
              </button>
            )}
            {a.canReplace && (
              <button type="button" disabled={busy} onClick={() => router.push(`/remake/rules/new?replace=${d.id}`)} className={`${BTN_LINE} w-full`}>
                <RefreshCw size={18} aria-hidden="true" />
                Soạn văn bản thay thế
              </button>
            )}
            {a.canEdit && (
              <button type="button" disabled={busy} onClick={() => router.push(`/remake/rules/${d.id}/edit`)} className={`${BTN_LINE} w-full`}>
                <Pencil size={18} aria-hidden="true" />
                Sửa dự thảo
              </button>
            )}
            {a.canDelete && (
              <button
                type="button"
                disabled={busy}
                onClick={() => window.confirm('Chuyển văn bản vào thùng rác?') && remove.mutate()}
                className={`${BTN_DANGER} w-full`}
              >
                <Trash2 size={18} aria-hidden="true" />
                Xoá văn bản
              </button>
            )}
          </div>

          <section aria-label="Lịch sử">
            <h2 className={H}>Lịch sử</h2>
            <RuleTimeline id={d.id} />
          </section>

          <PublishSheet
            key={publishing ? `p-${d.id}` : 'none'}
            doc={publishing ? d : null}
            busy={publish.isPending}
            onClose={() => setPublishing(false)}
            onConfirm={(p) => publish.mutate(p)}
          />
        </div>
      )}
    </div>
  );
}
