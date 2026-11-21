'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, ExternalLink, Paperclip } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  acknowledgeDocument,
  createDocumentVersion,
  deleteDocument,
  getDocumentById,
  markDocumentAsRead,
  publishDocument,
  reviewDocument,
  submitDocument,
} from '@/actions';
import { useCan } from '@/hooks';
import { APPROVAL_STATUS_MAP, DOCUMENT_STATUS_MAP, DOCUMENT_TYPE_MAP, SHARE_SCOPE_MAP } from '@/types';
import { getFileUrl } from '@/utils';
import { Badge } from '../../_components/badge';
import { BTN_DANGER, BTN_LINE, BTN_PRIMARY, messageOf } from '../../_components/form';
import { BackLink } from '../../_components/page-header';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';
import { FileViewer } from '../_components/file-viewer';

const day = (s?: string | null) => (s ? new Date(s).toLocaleDateString('vi-VN') : '–');
const size = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);

// Xem trước và chi tiết tài liệu: nội dung tệp, thông tin, phiên bản, người nhận đã đọc, và các thao tác theo quyền.
export default function RemakeDocumentPage() {
  const id = Number(useParams<{ id: string }>().id);
  const router = useRouter();
  const qc = useQueryClient();
  const { can, me, isReady } = useCan();
  const [verFile, setVerFile] = useState<File | null>(null);
  const q = useQuery({ queryKey: ['document', id], queryFn: () => getDocumentById(id), enabled: isReady && can('document:read') });
  const d = q.data;

  useEffect(() => {
    if (d?.isRead === false) markDocumentAsRead(d.id).then(() => qc.invalidateQueries({ queryKey: ['documents'] }));
  }, [d?.id, d?.isRead, qc]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['document', id] });
    qc.invalidateQueries({ queryKey: ['documents'] });
    qc.invalidateQueries({ queryKey: ['rules'] });
  };
  const fail = (e: unknown) => toast.error(messageOf(e));
  const flow = useMutation({
    mutationFn: (step: 'submit' | 'approve' | 'reject' | 'publish') => {
      if (step === 'submit') return submitDocument(id);
      if (step === 'publish') return publishDocument(id);
      return reviewDocument(id, {
        approvalStatus: step === 'approve' ? 'approved' : 'rejected',
        approvalNote: step === 'reject' ? (window.prompt('Lý do từ chối?') ?? '') : undefined,
      });
    },
    onSuccess: (_, s) => {
      toast.success({ submit: 'Đã trình duyệt', approve: 'Đã duyệt', reject: 'Đã từ chối', publish: 'Đã ban hành' }[s]);
      refresh();
    },
    onError: fail,
  });
  const version = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('file', verFile!);
      return createDocumentVersion(id, fd);
    },
    onSuccess: () => {
      setVerFile(null);
      toast.success('Đã tải lên phiên bản mới');
      refresh();
    },
    onError: fail,
  });
  const ack = useMutation({
    mutationFn: () => acknowledgeDocument(id),
    onSuccess: () => {
      toast.success('Đã xác nhận đã đọc và hiểu');
      refresh();
    },
    onError: fail,
  });
  const remove = useMutation({
    mutationFn: () => deleteDocument(id),
    onSuccess: () => {
      toast.success('Đã chuyển vào thùng rác');
      refresh();
      router.push('/remake/documents');
    },
    onError: fail,
  });

  if (!isReady) return <ListSkeleton />;
  if (!can('document:read')) return <EmptyState title="Bạn chưa có quyền xem tài liệu" description="Liên hệ quản trị viên để được cấp quyền." />;

  const v = d?.currentVersion ?? d?.versions?.find((x) => x.isCurrent);
  const url = getFileUrl(v?.downloadUrl ?? v?.fileUrl ?? v?.filePath);
  const isCreator = !!d && d.createdById === me?.user.id;
  const busy = flow.isPending || ack.isPending || remove.isPending;
  const stats = d?.recipientStats;
  const rows: [string, string][] = d
    ? [
        ['Mã', d.code],
        ['Thư mục', d.category?.name ?? 'Thư mục gốc'],
        ['Phạm vi', SHARE_SCOPE_MAP[d.shareScope] ?? d.shareScope],
        ['Người tạo', d.createdBy?.fullName ?? '–'],
        ['Hiệu lực', `${day(d.effectiveDate)} → ${day(d.expirationDate)}`],
        ['Ngày tạo', day(d.createdAt)],
      ]
    : [];

  return (
    <div className="mx-auto max-w-4xl">
      <BackLink href="/remake/documents" label="Tài liệu" />
      {q.isLoading && <ListSkeleton />}
      {q.isError && (
        <ErrorState title="Không tải được tài liệu" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => q.refetch()} />
      )}
      {d && (
        <div className="flex flex-col gap-5">
          <header>
            <h1 className="font-heading text-lg font-semibold [overflow-wrap:anywhere] md:text-xl">{d.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="primary">{DOCUMENT_TYPE_MAP[d.documentType]?.label ?? d.documentType}</Badge>
              <Badge>{DOCUMENT_STATUS_MAP[d.status]?.label ?? d.status}</Badge>
              {d.approvalStatus !== d.status && <Badge tone="warning">{APPROVAL_STATUS_MAP[d.approvalStatus]?.label ?? d.approvalStatus}</Badge>}
            </div>
            {d.summary && <p className="mt-3 text-sm text-rm-muted [overflow-wrap:anywhere]">{d.summary}</p>}
          </header>

          {v && url ? (
            <section aria-label="Nội dung tệp" className="overflow-hidden rounded-rm-xl border border-rm-edge bg-rm-surface">
              <div className="flex items-center gap-1 border-b border-rm-line pl-3">
                <p className="min-w-0 flex-1 truncate text-sm">
                  {v.fileName} · {size(v.fileSize)}
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Mở trong tab mới"
                  className="flex size-11 items-center justify-center text-rm-muted active:bg-rm-bg"
                >
                  <ExternalLink size={18} />
                </a>
                <a href={url} download aria-label="Tải xuống" className="flex size-11 items-center justify-center text-rm-primary active:bg-rm-bg">
                  <Download size={18} />
                </a>
              </div>
              <FileViewer key={v.id} url={url} fileName={v.fileName} mimeType={v.mimeType} />
            </section>
          ) : (
            <p className="rounded-rm-xl border border-rm-edge bg-rm-surface p-4 text-sm text-rm-muted">Tài liệu chưa có tệp đính kèm.</p>
          )}

          <dl className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface text-sm">
            {rows.map(([k, val]) => (
              <div key={k} className="flex justify-between gap-3 px-3 py-2">
                <dt className="flex-none text-rm-muted">{k}</dt>
                <dd className="min-w-0 truncate text-right">{val}</dd>
              </div>
            ))}
          </dl>

          {stats && (isCreator || can('document:update')) && (
            <section aria-label="Người nhận">
              <h2 className="mb-2 text-sm font-semibold">Người nhận</h2>
              <p className="rounded-rm-xl border border-rm-edge bg-rm-surface p-3 text-sm">
                Đã đọc <strong className="text-rm-success">{stats.readCount}</strong>/{stats.totalRecipients} · Chưa đọc{' '}
                <strong className="text-rm-warning">{stats.unreadCount}</strong>
              </p>
              {(d.recipients?.length ?? 0) > 0 && (
                <ul className="mt-2 divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface">
                  {d.recipients!.map((r, i) => (
                    <li key={r.id ?? i} className="flex min-h-rm-row items-center gap-3 px-3">
                      <span className="min-w-0 flex-1 truncate text-sm">{r.user?.fullName || r.fullName || 'Nhân viên'}</span>
                      <Badge tone={r.isRead ? 'success' : 'neutral'}>{r.isRead ? 'Đã đọc' : 'Chưa đọc'}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {(d.versions?.length ?? 0) > 0 && (
            <section aria-label="Phiên bản">
              <h2 className="mb-2 text-sm font-semibold">Phiên bản</h2>
              <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface text-sm">
                {d.versions!.map((x) => (
                  <li key={x.id} className="flex items-center gap-2 px-3 py-2">
                    <span className="min-w-0 flex-1 truncate">
                      v{x.versionNumber} · {x.fileName}
                    </span>
                    <span className="flex-none text-xs text-rm-muted">{x.isCurrent ? 'Hiện hành' : day(x.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(isCreator || can('document:update')) && (
            <div className="flex flex-col gap-2">
              <label htmlFor="dv-file" className="flex min-h-rm-tap cursor-pointer items-center gap-2 text-sm text-rm-primary">
                <Paperclip size={16} className="flex-none" aria-hidden="true" />
                <span className="min-w-0 truncate">{verFile ? verFile.name : 'Tải lên phiên bản mới'}</span>
              </label>
              <input id="dv-file" type="file" className="sr-only" onChange={(e) => setVerFile(e.target.files?.[0] ?? null)} />
              {verFile && (
                <button type="button" disabled={version.isPending} onClick={() => version.mutate()} className={BTN_LINE}>
                  {version.isPending ? 'Đang tải…' : 'Lưu phiên bản'}
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            {(d.approvalStatus === 'draft' || d.approvalStatus === 'rejected') && (isCreator || can('document:submit')) && (
              <button type="button" disabled={busy} onClick={() => flow.mutate('submit')} className={`${BTN_PRIMARY} w-full`}>
                Trình duyệt
              </button>
            )}
            {d.approvalStatus === 'pending' && (d.approverId === me?.user.id || can('document:approve')) && (
              <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
                <button type="button" disabled={busy} onClick={() => flow.mutate('reject')} className={BTN_LINE}>
                  Từ chối
                </button>
                <button type="button" disabled={busy} onClick={() => flow.mutate('approve')} className={BTN_PRIMARY}>
                  Duyệt
                </button>
              </div>
            )}
            {d.approvalStatus === 'approved' && d.status !== 'published' && can('document:publish') && (
              <button type="button" disabled={busy} onClick={() => flow.mutate('publish')} className={`${BTN_PRIMARY} w-full`}>
                Ban hành
              </button>
            )}
            {d.canAcknowledge && d.isAcknowledged !== true && (
              <button type="button" disabled={busy} onClick={() => ack.mutate()} className={`${BTN_PRIMARY} w-full`}>
                Tôi đã đọc và hiểu
              </button>
            )}
            {d.isOwner !== false && can('document:delete') && (
              <button
                type="button"
                disabled={busy}
                onClick={() => window.confirm('Chuyển tài liệu vào thùng rác?') && remove.mutate()}
                className={`${BTN_DANGER} w-full`}
              >
                Xoá tài liệu
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
