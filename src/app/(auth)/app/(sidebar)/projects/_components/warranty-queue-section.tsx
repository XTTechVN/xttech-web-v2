'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertTriangle, Building2, CheckCircle2, Clock, ExternalLink, Wrench } from 'lucide-react';
import { Modal } from 'antd';
import toast from 'react-hot-toast';
import { cancelWarrantyVisit, getGlobalWarrantyQueue, startWarrantyVisit } from '@/actions';
import { CompleteVisitModal, Skeleton, WarrantyVisitCard, WarrantyVisitModal } from '@/components';
import { Chip, SearchField, StatGrid } from '@/components-remake';
import { useDebounce } from '@/hooks';
import type { WarrantyQueueQueryParams, WarrantyVisit } from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';

type Quick = 'open' | 'new_claims' | 'in_progress' | 'overdue' | 'chargeable' | 'done';

const FILTERS: { value: Quick; label: string }[] = [
  { value: 'open', label: 'Đang mở' },
  { value: 'new_claims', label: 'Khách báo (QR)' },
  { value: 'in_progress', label: 'Đang xử lý' },
  { value: 'overdue', label: 'Quá hạn' },
  { value: 'chargeable', label: 'Tính phí' },
  { value: 'done', label: 'Đã hoàn thành' },
];

const STATUS: Partial<Record<Quick, WarrantyQueueQueryParams['status']>> = { new_claims: 'scheduled', in_progress: 'in_progress', done: 'done' };

export function WarrantyQueueSection() {
  const [quick, setQuick] = useState<Quick>('open');
  const [search, setSearch] = useState('');
  const keyword = useDebounce(search.trim(), 300);
  const [editing, setEditing] = useState<WarrantyVisit | null>(null);
  const [completing, setCompleting] = useState<WarrantyVisit | null>(null);
  const [video, setVideo] = useState<string | null>(null);

  const params: WarrantyQueueQueryParams = {
    search: keyword || undefined,
    openOnly: quick === 'open' ? true : undefined,
    kind: quick === 'new_claims' ? 'claim' : undefined,
    status: STATUS[quick],
    overdueOnly: quick === 'overdue' ? true : undefined,
    isChargeable: quick === 'chargeable' ? true : undefined,
    limit: 50,
  };

  const queue = useQuery({ queryKey: ['global_warranty_queue', params], queryFn: () => getGlobalWarrantyQueue(params) });

  const refresh = () =>
    ['global_warranty_queue', 'global_warranty_badge', 'staff-tasks', 'staff-tasks-summary'].forEach((k) =>
      queryClient.invalidateQueries({ queryKey: [k] }),
    );

  const start = useMutation({
    mutationFn: (v: WarrantyVisit) => startWarrantyVisit(v.projectId, v.id),
    onSuccess: () => {
      refresh();
      toast.success('Đã bắt đầu thực hiện kiểm tra bảo hành');
    },
    onError: (e) => showErrorToast(e, 'Không bắt đầu được đợt bảo hành'),
  });
  const cancel = useMutation({
    mutationFn: (v: WarrantyVisit) => cancelWarrantyVisit(v.projectId, v.id, 'Hủy theo yêu cầu'),
    onSuccess: () => {
      refresh();
      toast.success('Đã hủy phiếu bảo hành');
    },
    onError: (e) => showErrorToast(e, 'Không hủy được phiếu bảo hành'),
  });

  const s = queue.data?.stats;
  const items = queue.data?.items ?? [];
  const stats = [
    { label: 'Khách gửi (QR)', value: s?.newClaims ?? 0, icon: Wrench },
    { label: 'Đang xử lý', value: s?.inProgressCount ?? 0, icon: Clock },
    { label: 'Quá hạn', value: s?.overdueCount ?? 0, icon: AlertTriangle },
    { label: 'Hoàn thành', value: s?.doneCount ?? 0, icon: CheckCircle2 },
  ];

  return (
    <div className="flex flex-col gap-4">
      <StatGrid items={stats} />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <SearchField value={search} onChange={setSearch} label="Tìm phiếu bảo hành" placeholder="Tìm mã phiếu, khách, SĐT, công trình..." />
          <Link
            href="/app/tasks?sourceType=warranty"
            className="ml-auto flex size-11 flex-none items-center justify-center gap-2 rounded-control border border-slate-200 bg-white text-sm font-medium text-slate-700 transition active:scale-95 active:bg-slate-100 md:h-10 md:w-auto md:px-4 md:hover:bg-slate-50"
          >
            <ExternalLink size={16} />
            <span className="hidden md:inline">Danh sách giao việc</span>
            <span className="sr-only md:hidden">Danh sách giao việc</span>
          </Link>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc phiếu bảo hành">
          {FILTERS.map((f) => (
            <Chip key={f.value} selected={quick === f.value} onClick={() => setQuick(f.value)}>
              {f.label}
            </Chip>
          ))}
        </div>
      </div>

      {queue.isLoading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-block" />
          ))}
        </div>
      ) : queue.isError ? (
        <p className="rounded-block border border-slate-200/80 bg-white py-12 text-center text-sm text-slate-600">
          Không tải được danh sách phiếu bảo hành.
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-block border border-slate-200/80 bg-white py-12 text-center text-sm text-slate-600">
          Không có phiếu bảo hành hay sửa chữa nào khớp bộ lọc.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((visit) => (
            <div key={visit.id} className="flex flex-col gap-1">
              <div className="flex min-w-0 items-center gap-2 text-xs">
                <Building2 size={14} className="flex-none text-slate-500" />
                <span className="flex-none font-medium tabular-nums text-primary">{visit.projectCode}</span>
                <span className="min-w-0 flex-1 truncate text-slate-700">{visit.projectName}</span>
                <Link
                  href={`/app/projects/${visit.projectId}`}
                  className="flex flex-none items-center gap-1 font-medium text-primary md:hover:underline"
                >
                  Mở dự án
                  <ExternalLink size={12} />
                </Link>
              </div>
              <WarrantyVisitCard
                visit={visit}
                onStart={() => start.mutate(visit)}
                onComplete={setCompleting}
                onEdit={setEditing}
                onCancel={() => cancel.mutate(visit)}
                onPreviewVideo={setVideo}
              />
            </div>
          ))}
        </div>
      )}

      {editing && <WarrantyVisitModal projectId={editing.projectId} isOpen visit={editing} onClose={() => setEditing(null)} />}
      {completing && <CompleteVisitModal projectId={completing.projectId} visit={completing} onClose={() => setCompleting(null)} />}

      <Modal open={!!video} onCancel={() => setVideo(null)} footer={null} destroyOnHidden centered width={720} title="Video bảo hành thực tế">
        {video && (
          <video src={video} controls autoPlay className="max-h-[70vh] w-full rounded-control bg-black object-contain">
            Trình duyệt của bạn không hỗ trợ phát video.
          </video>
        )}
      </Modal>
    </div>
  );
}
