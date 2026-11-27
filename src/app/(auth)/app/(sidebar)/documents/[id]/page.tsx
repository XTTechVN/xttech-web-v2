'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Download, ExternalLink, Paperclip } from 'lucide-react';
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
import { Button, ConfirmDelete, TabState, Tag } from '@/components-remake';
import { Textarea } from '@/components';
import { AccessDenied } from '@/components/access-denied';
import { showErrorToast } from '@/utils';
import { FileViewer } from '../_components/file-viewer';

const day = (s?: string | null) => (s ? new Date(s).toLocaleDateString('vi-VN') : '–');
const size = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);

// Xem trước và chi tiết tài liệu: nội dung tệp, thông tin, phiên bản, người nhận đã đọc, và các thao tác theo quyền.
export default function DocumentPage() {
  const id = Number(useParams<{ id: string }>().id);
  const router = useRouter();
  const qc = useQueryClient();
  const { can, me, isReady } = useCan();
  const [verFile, setVerFile] = useState<File | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
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
  const fail = (e: unknown) => showErrorToast(e, 'Có lỗi xảy ra');
  const flow = useMutation({
    mutationFn: (step: 'submit' | 'approve' | 'reject' | 'publish') => {
      if (step === 'submit') return submitDocument(id);
      if (step === 'publish') return publishDocument(id);
      return reviewDocument(id, {
        approvalStatus: step === 'approve' ? 'approved' : 'rejected',
        approvalNote: step === 'reject' ? rejecting?.trim() : undefined,
      });
    },
    onSuccess: (_, s) => {
      toast.success({ submit: 'Đã trình duyệt', approve: 'Đã duyệt', reject: 'Đã từ chối', publish: 'Đã ban hành' }[s]);
      setRejecting(null);
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
      router.push('/app/documents');
    },
    onError: fail,
  });

  if (!isReady) return null;
  if (!can('document:read')) return <AccessDenied />;

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
    <div className="mx-auto max-w-4xl p-4 font-body md:p-6 [&_h1]:font-heading [&_h2]:font-heading">
      <Link href="/app/documents" className="mb-3 inline-flex min-h-11 items-center gap-1.5 text-sm text-slate-500 md:hover:text-slate-900">
        <ArrowLeft size={16} aria-hidden="true" /> Tài liệu
      </Link>
      <TabState loading={q.isLoading} error={q.isError} onRetry={() => q.refetch()} empty={!d} emptyText="Không tìm thấy tài liệu.">
      {d && (
        <div className="flex flex-col gap-5">
          <header>
            <h1 className="font-heading text-lg font-semibold [overflow-wrap:anywhere] md:text-xl">{d.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Tag tone="violet">{DOCUMENT_TYPE_MAP[d.documentType]?.label ?? d.documentType}</Tag>
              <Tag>{DOCUMENT_STATUS_MAP[d.status]?.label ?? d.status}</Tag>
              {d.approvalStatus !== d.status && <Tag tone="amber">{APPROVAL_STATUS_MAP[d.approvalStatus]?.label ?? d.approvalStatus}</Tag>}
            </div>
            {d.summary && <p className="mt-3 text-sm text-slate-500 [overflow-wrap:anywhere]">{d.summary}</p>}
          </header>

          {v && url ? (
            <section aria-label="Nội dung tệp" className="overflow-hidden rounded-block border border-slate-200/80 bg-white">
              <div className="flex items-center gap-1 border-b border-slate-200 pl-3">
                <p className="min-w-0 flex-1 truncate text-sm">
                  {v.fileName} · {size(v.fileSize)}
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Mở trong tab mới"
                  className="flex size-11 items-center justify-center text-slate-500 active:bg-slate-50"
                >
                  <ExternalLink size={18} />
                </a>
                <a href={url} download aria-label="Tải xuống" className="flex size-11 items-center justify-center text-primary active:bg-slate-50">
                  <Download size={18} />
                </a>
              </div>
              <FileViewer key={v.id} url={url} fileName={v.fileName} mimeType={v.mimeType} />
            </section>
          ) : (
            <p className="rounded-block border border-slate-200/80 bg-white p-4 text-sm text-slate-500">Tài liệu chưa có tệp đính kèm.</p>
          )}

          <dl className="divide-y divide-slate-200 rounded-block border border-slate-200/80 bg-white text-sm">
            {rows.map(([k, val]) => (
              <div key={k} className="flex justify-between gap-3 px-3 py-2">
                <dt className="flex-none text-slate-500">{k}</dt>
                <dd className="min-w-0 truncate text-right">{val}</dd>
              </div>
            ))}
          </dl>

          {stats && (isCreator || can('document:update')) && (
            <section aria-label="Người nhận">
              <h2 className="mb-2 text-sm font-semibold">Người nhận</h2>
              <p className="rounded-block border border-slate-200/80 bg-white p-3 text-sm">
                Đã đọc <strong className="text-green-600">{stats.readCount}</strong>/{stats.totalRecipients} · Chưa đọc{' '}
                <strong className="text-amber-700">{stats.unreadCount}</strong>
              </p>
              {(d.recipients?.length ?? 0) > 0 && (
                <ul className="mt-2 divide-y divide-slate-200 rounded-block border border-slate-200/80 bg-white">
                  {d.recipients!.map((r, i) => (
                    <li key={r.id ?? i} className="flex min-h-12 items-center gap-3 px-3">
                      <span className="min-w-0 flex-1 truncate text-sm">{r.user?.fullName || r.fullName || 'Nhân viên'}</span>
                      <Tag tone={r.isRead ? 'green' : 'slate'}>{r.isRead ? 'Đã đọc' : 'Chưa đọc'}</Tag>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {(d.versions?.length ?? 0) > 0 && (
            <section aria-label="Phiên bản">
              <h2 className="mb-2 text-sm font-semibold">Phiên bản</h2>
              <ul className="divide-y divide-slate-200 rounded-block border border-slate-200/80 bg-white text-sm">
                {d.versions!.map((x) => (
                  <li key={x.id} className="flex items-center gap-2 px-3 py-2">
                    <span className="min-w-0 flex-1 truncate">
                      v{x.versionNumber} · {x.fileName}
                    </span>
                    <span className="flex-none text-xs text-slate-500">{x.isCurrent ? 'Hiện hành' : day(x.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(isCreator || can('document:update')) && (
            <div className="flex flex-col gap-2">
              <label htmlFor="dv-file" className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-primary">
                <Paperclip size={16} className="flex-none" aria-hidden="true" />
                <span className="min-w-0 truncate">{verFile ? verFile.name : 'Tải lên phiên bản mới'}</span>
              </label>
              <input id="dv-file" type="file" className="sr-only" onChange={(e) => setVerFile(e.target.files?.[0] ?? null)} />
              {verFile && (
                <Button variant="outline" loading={version.isPending} onClick={() => version.mutate()}>
                  Lưu phiên bản
                </Button>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            {(d.approvalStatus === 'draft' || d.approvalStatus === 'rejected') && (isCreator || can('document:submit')) && (
              <Button disabled={busy} onClick={() => flow.mutate('submit')}>
                Trình duyệt
              </Button>
            )}
            {d.approvalStatus === 'pending' && (d.approverId === me?.user.id || can('document:approve')) && (
              <>
                {rejecting !== null && (
                  <Textarea rows={2} fullWidth value={rejecting} onChange={(e) => setRejecting(e.target.value)} placeholder="Lý do từ chối" />
                )}
                <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
                  {rejecting === null ? (
                    <Button variant="outline" disabled={busy} onClick={() => setRejecting('')}>
                      Từ chối
                    </Button>
                  ) : (
                    <Button variant="danger" disabled={busy || !rejecting.trim()} onClick={() => flow.mutate('reject')}>
                      Gửi từ chối
                    </Button>
                  )}
                  <Button disabled={busy} onClick={() => flow.mutate('approve')}>
                    Duyệt
                  </Button>
                </div>
              </>
            )}
            {d.approvalStatus === 'approved' && d.status !== 'published' && can('document:publish') && (
              <Button disabled={busy} onClick={() => flow.mutate('publish')}>
                Ban hành
              </Button>
            )}
            {d.canAcknowledge && d.isAcknowledged !== true && (
              <Button disabled={busy} onClick={() => ack.mutate()}>
                Tôi đã đọc và hiểu
              </Button>
            )}
            {d.isOwner !== false && can('document:delete') && (
              <Button variant="danger" disabled={busy} onClick={() => setDeleting(true)}>
                Xóa tài liệu
              </Button>
            )}
          </div>
        </div>
      )}
      </TabState>
      <ConfirmDelete isOpen={deleting} title="Xóa tài liệu" pending={remove.isPending} onClose={() => setDeleting(false)} onConfirm={() => remove.mutate()}>
        Chuyển <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{d?.title}</strong> vào thùng rác? Có thể khôi phục từ thùng rác.
      </ConfirmDelete>
    </div>
  );
}
