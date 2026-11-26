'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertTriangle, ExternalLink, Plus, ShieldCheck } from 'lucide-react';
import { Modal as AntdModal } from 'antd';
import toast from 'react-hot-toast';
import { cancelWarrantyVisit, getProjectWarranty, startWarrantyVisit } from '@/actions';
import {
  Badge,
  Button,
  CompleteVisitModal,
  Skeleton,
  WarrantyVisitCard,
  WarrantyVisitModal,
} from '@/components';
import { WARRANTY_STATE_MAP } from '@/config';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import type { WarrantyVisit } from '@/types';

const formatDate = (value?: string | null): string =>
  value ? new Date(value).toLocaleDateString('vi-VN') : '—';

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
    void queryClient.invalidateQueries({ queryKey: ['project_warranty', projectId] });
    void queryClient.invalidateQueries({ queryKey: ['project_overview', projectId] });
    void queryClient.invalidateQueries({ queryKey: ['staff-tasks'] });
    void queryClient.invalidateQueries({ queryKey: ['staff-tasks-summary'] });
  };

  const start = useMutation({
    mutationFn: (visitId: number) => startWarrantyVisit(projectId, visitId),
    onSuccess: () => {
      refresh();
      toast.success('Đã bắt đầu thực hiện kiểm tra bảo hành');
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

  const state = WARRANTY_STATE_MAP[summary.state];
  const isStarted = summary.state !== 'not_started';

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            <span className="text-sm font-bold text-slate-800">
              Bảo hành {summary.warrantyMonths} tháng
            </span>
            <Badge variant={state.variant}>{state.label}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/app/tasks?sourceType=warranty"
              className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              <span>Danh sách giao việc</span>
              <ExternalLink size={12} />
            </Link>
            <Button
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => {
                setEditing(null);
                setIsFormOpen(true);
              }}
            >
              Tạo yêu cầu bảo hành
            </Button>
          </div>
        </div>

        {isStarted && (
          <>
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              <div>
                <div className="text-slate-400">Bắt đầu</div>
                <b className="font-mono tabular-nums text-slate-800">
                  {formatDate(summary.startDate)}
                </b>
              </div>
              <div>
                <div className="text-slate-400">Hết hạn</div>
                <b className="font-mono tabular-nums text-slate-800">
                  {formatDate(summary.endDate)}
                </b>
              </div>
              <div>
                <div className="text-slate-400">Còn lại</div>
                <b className="font-mono tabular-nums text-slate-800">
                  {summary.daysRemaining ?? 0} ngày
                </b>
              </div>
              <div>
                <div className="text-slate-400">Đợt đã xong</div>
                <b className="font-mono tabular-nums text-slate-800">
                  {summary.doneVisits}/{summary.totalVisits}
                </b>
              </div>
            </div>

            <div>
              <div className="mb-0.5 flex justify-between text-[11px] text-slate-500">
                <span>Thời gian bảo hành đã trôi qua</span>
                <span className="font-mono tabular-nums">{summary.elapsedPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-slate-400"
                  style={{ width: `${summary.elapsedPercent}%` }}
                />
              </div>
            </div>

            {summary.overdueVisits > 0 && (
              <div className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
                <AlertTriangle size={13} /> {summary.overdueVisits} đợt bảo hành đã quá hạn chưa
                thực hiện.
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-2.5">
        {summary.visits.map((visit) => (
          <WarrantyVisitCard
            key={visit.id}
            visit={visit}
            onStart={(id) => start.mutate(id)}
            onComplete={setCompleting}
            onEdit={(v) => {
              setEditing(v);
              setIsFormOpen(true);
            }}
            onCancel={(id) => cancel.mutate(id)}
            onPreviewVideo={setPreviewVideoUrl}
          />
        ))}
        {summary.visits.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-xs text-slate-400">
            Chưa có phiếu yêu cầu bảo hành / sửa chữa nào.
          </div>
        )}
      </div>

      <WarrantyVisitModal
        projectId={projectId}
        isOpen={isFormOpen}
        visit={editing}
        onClose={() => setIsFormOpen(false)}
      />
      <CompleteVisitModal
        projectId={projectId}
        visit={completing}
        onClose={() => setCompleting(null)}
      />

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
