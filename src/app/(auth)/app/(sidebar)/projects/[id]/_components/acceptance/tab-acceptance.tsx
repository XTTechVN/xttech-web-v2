'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, ClipboardCheck, Link2, PenLine, Play, Plus, XCircle } from 'lucide-react';
import { Image as AntdImage, Modal as AntdModal } from 'antd';
import toast from 'react-hot-toast';
import {
  cancelProjectAcceptance,
  getProjectAcceptances,
  getProjectPositions,
  sendAcceptanceSigningLink,
} from '@/actions';
import { Badge, Button, Skeleton } from '@/components';
import { BASE_MINIO_URL } from '@/config';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import type { AcceptanceStatus, ProjectAcceptance } from '@/types';
import { AcceptanceFormModal } from './modals/acceptance-form-modal';
import { CustomerSignModal } from './modals/customer-sign-modal';

const STATUS_MAP: Record<AcceptanceStatus, { label: string; variant: 'warning' | 'success' | 'danger' }> = {
  awaiting_customer: { label: 'Chờ khách ký', variant: 'warning' },
  signed: { label: 'Đã đủ chữ ký 2 bên', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'danger' },
};

const mediaUrl = (url: string): string =>
  url.startsWith('http') ? url : `${BASE_MINIO_URL}/${url.replace(/^\//, '')}`;

const isVideoUrl = (url: string, type?: string): boolean => {
  if (type === 'video') return true;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.avi');
};

interface TabAcceptanceProps {
  projectId: number;
}

export function TabAcceptance({ projectId }: TabAcceptanceProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [signing, setSigning] = useState<ProjectAcceptance | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const { data: acceptances = [], isLoading } = useQuery({
    queryKey: ['project_acceptances', projectId],
    queryFn: () => getProjectAcceptances(projectId),
  });

  const { data: installedData } = useQuery({
    queryKey: ['project_positions', projectId, 'installed'],
    queryFn: () => getProjectPositions(projectId, { status: 'installed', limit: 200 }),
  });

  const pendingPositionIds = new Set(
    acceptances.filter((a) => a.status === 'awaiting_customer').flatMap((a) => a.positionIds),
  );
  const installedPositions = (installedData?.items ?? []).filter((p) => !pendingPositionIds.has(p.id));

  const sendLink = useMutation({
    mutationFn: (acceptanceId: number) => sendAcceptanceSigningLink(projectId, acceptanceId),
    onSuccess: async (result) => {
      await navigator.clipboard?.writeText(result.signingUrl).catch(() => undefined);
      toast.success(
        result.emailSent
          ? 'Đã gửi email link ký cho khách (đã sao chép link)'
          : 'Đã tạo link ký và sao chép — chưa gửi được email (thiếu email khách)',
      );
    },
    onError: (error) => showErrorToast(error, 'Không tạo được link ký'),
  });

  const cancel = useMutation({
    mutationFn: (acceptanceId: number) => cancelProjectAcceptance(projectId, acceptanceId),
    onSuccess: () => {
      [
        'project_acceptances',
        'progress_matrix',
        'project_positions',
        'project',
        'project_overview',
        'project_warranty',
      ].forEach((key) => queryClient.invalidateQueries({ queryKey: [key, projectId] }));
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Đã hủy biên bản nghiệm thu');
    },
    onError: (error) => showErrorToast(error, 'Không hủy được biên bản'),
  });

  if (isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
            <ClipboardCheck size={16} className="text-primary" /> Nghiệm thu bàn giao
          </div>
          <p className="text-[11px] text-slate-500">
            Biên bản cần ảnh thực tế + chữ ký số của đại diện công ty và khách hàng. Các cửa đánh dấu &ldquo;Không
            đạt&rdquo; sẽ giữ trạng thái Đã lắp đặt để lập biên bản nghiệm thu lại vào đợt sau.
          </p>
        </div>
        <Button
          size="sm"
          leftIcon={<Plus size={14} />}
          disabled={installedPositions.length === 0}
          onClick={() => setIsFormOpen(true)}
        >
          Lập biên bản ({installedPositions.length} cửa chờ nghiệm thu)
        </Button>
      </div>

      {acceptances.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center text-xs text-slate-400">
          Chưa có biên bản nghiệm thu nào.
        </div>
      )}

      {acceptances.map((acceptance) => {
        const status = STATUS_MAP[acceptance.status];
        const items = acceptance.items && acceptance.items.length > 0 ? acceptance.items : [];
        const passedCount = items.filter((it) => it.result === 'passed').length;
        const failedCount = items.filter((it) => it.result === 'failed').length;

        return (
          <div key={acceptance.id} className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-800">{acceptance.code}</span>
                <Badge variant={status.variant}>{status.label}</Badge>
                {items.length > 0 && (
                  <>
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                      {passedCount} Đạt
                    </span>
                    {failedCount > 0 && (
                      <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 border border-red-200">
                        {failedCount} Không đạt
                      </span>
                    )}
                  </>
                )}
                <span className="text-[11px] text-slate-400">
                  {new Date(acceptance.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              {acceptance.status === 'awaiting_customer' && (
                <div className="flex flex-wrap gap-1.5">
                  <Button size="xs" leftIcon={<PenLine size={12} />} onClick={() => setSigning(acceptance)}>
                    Khách ký tại chỗ
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    leftIcon={<Link2 size={12} />}
                    loading={sendLink.isPending && sendLink.variables === acceptance.id}
                    onClick={() => sendLink.mutate(acceptance.id)}
                  >
                    Gửi / sao chép link ký
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    leftIcon={<XCircle size={12} />}
                    onClick={() => cancel.mutate(acceptance.id)}
                  >
                    Hủy
                  </Button>
                </div>
              )}
            </div>

            {items.length > 0 ? (
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {items.map((item) => {
                  const isPassed = item.result === 'passed';
                  return (
                    <div
                      key={item.positionId}
                      className={`flex items-start justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs ${
                        isPassed
                          ? 'border-emerald-200/70 bg-emerald-50/20'
                          : 'border-red-200 bg-red-50/40'
                      }`}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          {isPassed ? (
                            <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
                          ) : (
                            <XCircle size={13} className="shrink-0 text-red-600" />
                          )}
                          <span className="font-bold text-slate-800">{item.positionCode}</span>
                          {item.doorName && <span className="truncate text-slate-500">· {item.doorName}</span>}
                        </div>
                        {item.note && (
                          <p className={`pl-5 text-[11px] ${isPassed ? 'text-slate-600' : 'font-medium text-red-700'}`}>
                            Ghi chú: {item.note}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {isPassed ? 'Đạt' : 'Không đạt'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                {acceptance.positionCodes.length} bộ cửa: {acceptance.positionCodes.join(', ')}
              </p>
            )}

            {acceptance.note && <p className="text-xs italic text-slate-500">Ghi chú biên bản: {acceptance.note}</p>}

            <AntdImage.PreviewGroup>
              <div className="flex flex-wrap gap-2">
                {acceptance.photos.map((photo, pIdx) => {
                  const url = mediaUrl(photo.url);
                  const isVideo = isVideoUrl(photo.url, photo.type);

                  if (isVideo) {
                    return (
                      <div
                        key={photo.url || pIdx}
                        onClick={() => setPreviewVideoUrl(url)}
                        className="group relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-900 text-white transition hover:border-primary"
                        title={photo.name ?? 'Xem video nghiệm thu'}
                      >
                        <video src={url} className="h-full w-full object-cover opacity-70" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10">
                          <Play size={18} className="fill-white text-white drop-shadow" />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={photo.url || pIdx}
                      className="h-16 w-16 overflow-hidden rounded-md border border-slate-200 [&_.ant-image]:h-full [&_.ant-image]:w-full"
                    >
                      <AntdImage
                        src={url}
                        alt={photo.name ?? 'Ảnh nghiệm thu'}
                        width={64}
                        height={64}
                        className="!h-full !w-full object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            </AntdImage.PreviewGroup>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(['company', 'customer'] as const).map((party) => {
                const signature = acceptance.signatures.find((s) => s.party === party);
                return (
                  <div key={party} className="rounded-md border border-slate-200 p-2 text-center">
                    {signature ? (
                      <>
                        <img src={signature.signatureImage} alt={signature.signerName} className="mx-auto h-12 object-contain" />
                        <div className="text-[11px] font-semibold text-slate-800">{signature.signerName}</div>
                        <div className="text-[10px] text-slate-400">
                          {party === 'company' ? 'Đại diện công ty' : 'Khách hàng'} ·{' '}
                          {new Date(signature.signedAt).toLocaleDateString('vi-VN')}
                        </div>
                      </>
                    ) : (
                      <div className="py-4 text-[11px] text-slate-400">
                        {party === 'company' ? 'Công ty' : 'Khách hàng'}: chưa ký
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <AcceptanceFormModal
        projectId={projectId}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        installedPositions={installedPositions}
      />
      <CustomerSignModal projectId={projectId} acceptance={signing} onClose={() => setSigning(null)} />

      <AntdModal
        open={Boolean(previewVideoUrl)}
        onCancel={() => setPreviewVideoUrl(null)}
        footer={null}
        destroyOnHidden
        centered
        width={720}
        title="Video nghiệm thu thực tế"
      >
        {previewVideoUrl && (
          <video
            key={previewVideoUrl}
            src={previewVideoUrl}
            controls
            autoPlay
            className="max-h-[75vh] w-full rounded-lg bg-black"
          />
        )}
      </AntdModal>
    </div>
  );
}
