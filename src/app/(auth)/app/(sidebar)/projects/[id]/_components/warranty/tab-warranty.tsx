'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertTriangle, CalendarClock, Play, Plus, ShieldCheck } from 'lucide-react';
import { Image as AntdImage, Modal as AntdModal } from 'antd';
import toast from 'react-hot-toast';
import { cancelWarrantyVisit, getProjectWarranty, startWarrantyVisit } from '@/actions';
import { Badge, Button, Skeleton } from '@/components';
import { BASE_MINIO_URL } from '@/config';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import type { WarrantyState, WarrantyVisit, WarrantyVisitStatus } from '@/types';
import { CompleteVisitModal } from './modals/complete-visit-modal';
import { WarrantyVisitModal } from './modals/warranty-visit-modal';

const STATE_MAP: Record<WarrantyState, { label: string; variant: 'default' | 'success' | 'danger' }> = {
  not_started: { label: 'Chưa bắt đầu (chờ nghiệm thu 100% cửa)', variant: 'default' },
  active: { label: 'Đang trong thời gian bảo hành', variant: 'success' },
  expired: { label: 'Đã hết hạn bảo hành', variant: 'danger' },
};

const VISIT_STATUS_MAP: Record<WarrantyVisitStatus, { label: string; variant: 'info' | 'warning' | 'success' | 'danger' }> = {
  scheduled: { label: 'Đã lên lịch', variant: 'info' },
  in_progress: { label: 'Đang thực hiện', variant: 'warning' },
  done: { label: 'Hoàn thành', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'danger' },
};

const formatDate = (value?: string | null): string => (value ? new Date(value).toLocaleDateString('vi-VN') : '—');
const formatVnd = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const mediaUrl = (url: string): string =>
  url.startsWith('http') ? url : `${BASE_MINIO_URL}/${url.replace(/^\//, '')}`;

const isVideoUrl = (url: string, type?: string): boolean => {
  if (type === 'video') return true;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.avi');
};

interface TabWarrantyProps {
  projectId: number;
}

export function TabWarranty({ projectId }: TabWarrantyProps) {
  const [editing, setEditing] = useState<WarrantyVisit | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [completing, setCompleting] = useState<WarrantyVisit | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['project_warranty', projectId],
    queryFn: () => getProjectWarranty(projectId),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['project_warranty', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project_overview', projectId] });
  };

  const start = useMutation({
    mutationFn: (visitId: number) => startWarrantyVisit(projectId, visitId),
    onSuccess: () => {
      refresh();
      toast.success('Đã bắt đầu thực hiện bảo hành');
    },
    onError: (error) => showErrorToast(error, 'Không bắt đầu được đợt bảo hành'),
  });

  const cancel = useMutation({
    mutationFn: (visitId: number) => cancelWarrantyVisit(projectId, visitId, 'Hủy theo yêu cầu'),
    onSuccess: () => {
      refresh();
      toast.success('Đã hủy đợt bảo hành');
    },
    onError: (error) => showErrorToast(error, 'Không hủy được đợt bảo hành'),
  });

  if (isLoading || !summary) return <Skeleton className="h-48 w-full rounded-xl" />;

  const state = STATE_MAP[summary.state];
  const isStarted = summary.state !== 'not_started';

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            <span className="text-sm font-bold text-slate-800">Bảo hành {summary.warrantyMonths} tháng</span>
            <Badge variant={state.variant}>{state.label}</Badge>
          </div>
          <Button
            size="sm"
            leftIcon={<Plus size={14} />}
            disabled={!isStarted}
            onClick={() => {
              setEditing(null);
              setIsFormOpen(true);
            }}
          >
            Tạo yêu cầu bảo hành
          </Button>
        </div>

        {isStarted && (
          <>
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              <div>
                <div className="text-slate-400">Bắt đầu</div>
                <b className="text-slate-800">{formatDate(summary.startDate)}</b>
              </div>
              <div>
                <div className="text-slate-400">Hết hạn</div>
                <b className="text-slate-800">{formatDate(summary.endDate)}</b>
              </div>
              <div>
                <div className="text-slate-400">Còn lại</div>
                <b className="text-slate-800">{summary.daysRemaining ?? 0} ngày</b>
              </div>
              <div>
                <div className="text-slate-400">Đợt đã xong</div>
                <b className="text-slate-800">
                  {summary.doneVisits}/{summary.totalVisits}
                </b>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <div className="mb-0.5 flex justify-between text-[11px] text-slate-500">
                  <span>Thời gian bảo hành đã trôi qua</span>
                  <span>{summary.elapsedPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-slate-400" style={{ width: `${summary.elapsedPercent}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-0.5 flex justify-between text-[11px] text-slate-500">
                  <span>Tiến độ các đợt bảo hành</span>
                  <span>{summary.progressPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${summary.progressPercent}%` }} />
                </div>
              </div>
            </div>

            {summary.overdueVisits > 0 && (
              <div className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
                <AlertTriangle size={13} /> {summary.overdueVisits} đợt bảo hành đã quá hạn chưa thực hiện.
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-2">
        {summary.visits.map((visit) => {
          const status = VISIT_STATUS_MAP[visit.status];
          const isOpen = visit.status === 'scheduled' || visit.status === 'in_progress';
          return (
            <div key={visit.id} className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700">{visit.code}</span>
                  <span className="text-sm font-semibold text-slate-800">{visit.title}</span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                  {visit.kind === 'claim' && <Badge variant="primary">Theo yêu cầu</Badge>}
                  {visit.isOverdue && <Badge variant="danger">Quá hạn</Badge>}
                  {!visit.isInScope && <Badge variant="warning">Ngoài phạm vi</Badge>}
                  {visit.isChargeable && <Badge variant="warning">Tính phí {formatVnd(visit.feeAmount)}</Badge>}
                </div>
                {isOpen && (
                  <div className="flex gap-1.5">
                    {visit.status === 'scheduled' && (
                      <Button size="xs" variant="outline" onClick={() => start.mutate(visit.id)}>
                        Bắt đầu
                      </Button>
                    )}
                    <Button size="xs" onClick={() => setCompleting(visit)}>
                      Hoàn thành
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        setEditing(visit);
                        setIsFormOpen(true);
                      }}
                    >
                      Sửa
                    </Button>
                    <Button size="xs" variant="ghost" onClick={() => cancel.mutate(visit.id)}>
                      Hủy
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <CalendarClock size={11} /> Hẹn: {formatDate(visit.scheduledDate)}
                  {visit.actualDate ? ` · Thực hiện: ${formatDate(visit.actualDate)}` : ''}
                </span>
                <span>Phụ trách: {visit.assigneeName ?? 'Chưa phân công'}</span>
                {visit.monthMark && <span>Mốc tháng {visit.monthMark}</span>}
              </div>

              {visit.issueDescription && <p className="text-xs text-slate-600">Sự cố: {visit.issueDescription}</p>}
              {visit.resultNote && <p className="text-xs text-emerald-700">Kết quả: {visit.resultNote}</p>}
              {visit.photos.length > 0 && (
                <AntdImage.PreviewGroup>
                  <div className="flex flex-wrap gap-2">
                    {visit.photos.map((photo, pIdx) => {
                      const url = mediaUrl(photo.url);
                      const isVideo = isVideoUrl(photo.url, photo.type);

                      if (isVideo) {
                        return (
                          <div
                            key={photo.url || pIdx}
                            onClick={() => setPreviewVideoUrl(url)}
                            className="group relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-900 text-white transition hover:border-primary"
                            title={photo.name ?? 'Xem video bảo hành'}
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
                            alt={photo.name ?? 'Ảnh bảo hành'}
                            width={64}
                            height={64}
                            className="!h-full !w-full object-cover"
                          />
                        </div>
                      );
                    })}
                  </div>
                </AntdImage.PreviewGroup>
              )}
            </div>
          );
        })}
        {summary.visits.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center text-xs text-slate-400">
            Lịch bảo hành sẽ tự động được tạo khi dự án hoàn thành nghiệm thu.
          </div>
        )}
      </div>

      <WarrantyVisitModal
        projectId={projectId}
        isOpen={isFormOpen}
        visit={editing}
        onClose={() => setIsFormOpen(false)}
      />
      <CompleteVisitModal projectId={projectId} visit={completing} onClose={() => setCompleting(null)} />

      <AntdModal
        open={Boolean(previewVideoUrl)}
        onCancel={() => setPreviewVideoUrl(null)}
        footer={null}
        destroyOnHidden
        centered
        width={720}
        title="Video bảo hành thực tế"
      >
        {previewVideoUrl && (
          <div className="flex justify-center p-2">
            <video
              src={previewVideoUrl}
              controls
              autoPlay
              className="max-h-[70vh] w-full rounded-lg bg-black object-contain shadow"
            >
              Trình duyệt của bạn không hỗ trợ phát thẻ video.
            </video>
          </div>
        )}
      </AntdModal>
    </div>
  );
}
