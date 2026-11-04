'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Wrench,
} from 'lucide-react';
import { Modal as AntdModal } from 'antd';
import toast from 'react-hot-toast';
import { cancelWarrantyVisit, getGlobalWarrantyQueue, startWarrantyVisit } from '@/actions';
import {
  CompleteVisitModal,
  Input,
  Skeleton,
  WarrantyVisitCard,
  WarrantyVisitModal,
} from '@/components';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import type { WarrantyQueueQueryParams, WarrantyVisit } from '@/types';

type QueueQuickFilter = 'open' | 'new_claims' | 'in_progress' | 'overdue' | 'chargeable' | 'done';

const FILTER_TABS: Array<{ id: QueueQuickFilter; label: string }> = [
  { id: 'open', label: 'Tất cả đang mở' },
  { id: 'new_claims', label: 'Khách báo sửa / BH (QR)' },
  { id: 'in_progress', label: 'Đang kiểm tra & xử lý' },
  { id: 'overdue', label: 'Quá hạn' },
  { id: 'chargeable', label: 'Sửa chữa tính phí' },
  { id: 'done', label: 'Đã hoàn thành' },
];

export function WarrantyQueueSection() {
  const [quickFilter, setQuickFilter] = useState<QueueQuickFilter>('open');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<WarrantyVisit | null>(null);
  const [completing, setCompleting] = useState<WarrantyVisit | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const queryParams: WarrantyQueueQueryParams = {
    search: search.trim() || undefined,
    openOnly: quickFilter === 'open' ? true : undefined,
    kind: quickFilter === 'new_claims' ? 'claim' : undefined,
    status:
      quickFilter === 'new_claims'
        ? 'scheduled'
        : quickFilter === 'in_progress'
          ? 'in_progress'
          : quickFilter === 'done'
            ? 'done'
            : undefined,
    overdueOnly: quickFilter === 'overdue' ? true : undefined,
    isChargeable: quickFilter === 'chargeable' ? true : undefined,
    limit: 50,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['global_warranty_queue', queryParams],
    queryFn: () => getGlobalWarrantyQueue(queryParams),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['global_warranty_queue'] });
    void queryClient.invalidateQueries({ queryKey: ['global_warranty_badge'] });
  };

  const start = useMutation({
    mutationFn: (visit: WarrantyVisit) => startWarrantyVisit(visit.projectId, visit.id),
    onSuccess: () => {
      refresh();
      toast.success('Đã bắt đầu thực hiện kiểm tra bảo hành');
    },
    onError: (error) => showErrorToast(error, 'Không bắt đầu được đợt bảo hành'),
  });

  const cancel = useMutation({
    mutationFn: (visit: WarrantyVisit) =>
      cancelWarrantyVisit(visit.projectId, visit.id, 'Hủy theo yêu cầu'),
    onSuccess: () => {
      refresh();
      toast.success('Đã hủy phiếu bảo hành');
    },
    onError: (error) => showErrorToast(error, 'Không hủy được phiếu bảo hành'),
  });

  const stats = data?.stats;
  const items = data?.items || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => setQuickFilter('new_claims')}
          className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition ${
            quickFilter === 'new_claims'
              ? 'border-[#045863] bg-[#045863]/5 ring-1 ring-[#045863]'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-xs font-medium text-slate-500">Yêu cầu khách gửi (QR)</div>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#045863]">
              {stats?.newClaims ?? 0}
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#045863]">
            <Wrench size={20} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setQuickFilter('in_progress')}
          className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition ${
            quickFilter === 'in_progress'
              ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-xs font-medium text-slate-500">Đang kiểm tra & xử lý</div>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-blue-600">
              {stats?.inProgressCount ?? 0}
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Clock size={20} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setQuickFilter('overdue')}
          className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition ${
            quickFilter === 'overdue'
              ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-xs font-medium text-slate-500">Đợt quá hạn</div>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-red-600">
              {stats?.overdueCount ?? 0}
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertTriangle size={20} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setQuickFilter('done')}
          className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition ${
            quickFilter === 'done'
              ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-xs font-medium text-slate-500">Đã hoàn thành</div>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-emerald-600">
              {stats?.doneCount ?? 0}
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
        </button>
      </div>

      <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {FILTER_TABS.map((tab) => {
            const active = quickFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setQuickFilter(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-[#045863] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="relative w-full sm:w-72">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            placeholder="Tìm mã phiếu, tên khách, SĐT, công trình..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            fullWidth
          />
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-xs text-slate-500">
          Không có phiếu bảo hành / sửa chữa nào khớp bộ lọc hiện tại.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((visit) => (
            <div key={visit.id} className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-xl border border-b-0 border-slate-200 bg-slate-50 px-3.5 py-2 text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <Building2 size={14} className="text-[#045863]" />
                  <span className="font-mono text-[#045863]">{visit.projectCode}</span>
                  <span>·</span>
                  <span>{visit.projectName}</span>
                  {visit.projectAddress && (
                    <span className="font-normal text-slate-500">({visit.projectAddress})</span>
                  )}
                </div>
                <Link
                  href={`/app/projects/${visit.projectId}`}
                  className="inline-flex items-center gap-1 font-semibold text-[#045863] hover:underline"
                >
                  <span>Mở dự án</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
              <WarrantyVisitCard
                visit={visit}
                onStart={() => start.mutate(visit)}
                onComplete={setCompleting}
                onEdit={setEditing}
                onCancel={() => cancel.mutate(visit)}
                onPreviewVideo={setPreviewVideoUrl}
              />
            </div>
          ))}
        </div>
      )}

      {editing && (
        <WarrantyVisitModal
          projectId={editing.projectId}
          isOpen={Boolean(editing)}
          visit={editing}
          onClose={() => setEditing(null)}
        />
      )}
      {completing && (
        <CompleteVisitModal
          projectId={completing.projectId}
          visit={completing}
          onClose={() => setCompleting(null)}
        />
      )}

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
