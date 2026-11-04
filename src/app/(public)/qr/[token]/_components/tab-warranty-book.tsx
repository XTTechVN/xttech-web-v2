'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  PlayCircle,
  UserCheck,
  Wrench,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { startWarrantyVisit } from '@/actions';
import { Badge, Button, Modal, Skeleton } from '@/components';
import { WARRANTY_ISSUE_TAG_MAP, WARRANTY_VISIT_STATUS_MAP } from '@/config';
import { showErrorToast } from '@/utils';
import type { WarrantySummary, WarrantyVisit } from '@/types';
import { formatDateVi, formatVnd } from './qr-helpers';
import { QrMediaStrip } from './qr-media-uploader';
import { QrTechInspectModal } from './qr-tech-inspect-modal';

interface TabWarrantyBookProps {
  token: string;
  projectId: number;
  summary: WarrantySummary | undefined;
  isLoading: boolean;
  isLoggedIn: boolean;
  onRefresh: () => void;
  onRequestNewClaim: () => void;
}

export function TabWarrantyBook({
  token,
  projectId,
  summary,
  isLoading,
  isLoggedIn,
  onRefresh,
  onRequestNewClaim,
}: TabWarrantyBookProps) {
  const [inspectingVisit, setInspectingVisit] = useState<WarrantyVisit | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const startMutation = useMutation({
    mutationFn: (visitId: number) => startWarrantyVisit(projectId, visitId),
    onSuccess: () => {
      toast.success('Đã bắt đầu kiểm tra kỹ thuật');
      onRefresh();
    },
    onError: (err) => showErrorToast(err, 'Không bắt đầu được phiếu bảo hành'),
  });

  if (isLoading || !summary) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-2xl" />
      </div>
    );
  }

  const activeVisits = summary.visits.filter((v) => v.status !== 'cancelled');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
      {/* CỘT TRÁI (4/12 trên Máy tính): Thống kê tổng quan & nút tạo yêu cầu */}
      <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-3.5">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
          <div className="grid grid-cols-3 divide-x divide-slate-100 text-center">
            <div>
              <div className="text-[10px] uppercase text-slate-400">Tổng đợt BH</div>
              <div className="mt-0.5 font-mono text-base font-bold tabular-nums text-slate-900">
                {summary.totalVisits}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-400">Hoàn thành</div>
              <div className="mt-0.5 font-mono text-base font-bold tabular-nums text-emerald-600">
                {summary.doneVisits}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-400">Đang xử lý</div>
              <div className="mt-0.5 font-mono text-base font-bold tabular-nums text-amber-600">
                {summary.upcomingVisits + summary.overdueVisits}
              </div>
            </div>
          </div>

          <Button
            size="sm"
            fullWidth
            leftIcon={<Wrench size={14} />}
            onClick={onRequestNewClaim}
            className="hidden lg:inline-flex min-h-[42px]"
          >
            Tạo yêu cầu bảo hành / sửa chữa
          </Button>
        </section>
      </div>

      {/* CỘT PHẢI (8/12 trên Máy tính): Danh sách phiếu bảo hành & sửa chữa */}
      <div className="lg:col-span-8 space-y-3">
        {activeVisits.map((visit) => {
          const statusBadge = WARRANTY_VISIT_STATUS_MAP[visit.status];
          const isOpen = visit.status === 'scheduled' || visit.status === 'in_progress';
          const stepIndex =
            visit.status === 'done' ? 3 : visit.status === 'in_progress' ? 2 : 1;
          const hasPhase1 =
            visit.issueTags.length > 0 ||
            Boolean(visit.issueDescription) ||
            visit.customerPhotos.length > 0;
          const hasPhase2 = Boolean(
            visit.diagnosisNote ||
              visit.damagedParts.length > 0 ||
              visit.repairActions ||
              visit.replacedParts.length > 0 ||
              visit.resultNote ||
              visit.photos.length > 0,
          );

          return (
            <article
              key={visit.id}
              className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 lg:p-5 text-xs"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono font-bold text-[#045863]">{visit.code}</span>
                    <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                    {visit.kind === 'claim' ? (
                      <Badge variant="primary">Yêu cầu khách hàng</Badge>
                    ) : (
                      <Badge variant="default">Định kỳ</Badge>
                    )}
                    {visit.isChargeable && (
                      <Badge variant="warning">Phí: {formatVnd(visit.feeAmount)}</Badge>
                    )}
                  </div>
                  <h4 className="mt-1 text-sm font-bold text-slate-900">{visit.title}</h4>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-[10px] font-semibold">
                {[
                  { idx: 1, label: '1. Đã tiếp nhận' },
                  { idx: 2, label: '2. Kiểm tra & Xử lý' },
                  { idx: 3, label: '3. Hoàn thành' },
                ].map((step) => (
                  <div
                    key={step.idx}
                    className={`rounded-lg px-2 py-1.5 text-center ${
                      stepIndex >= step.idx
                        ? 'bg-[#045863]/10 text-[#045863]'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step.label}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-mono tabular-nums">
                  <CalendarClock size={12} /> Hẹn: {formatDateVi(visit.scheduledDate)}
                  {visit.actualDate ? ` · Xong: ${formatDateVi(visit.actualDate)}` : ''}
                </span>
                <span className="flex items-center gap-1">
                  <UserCheck size={12} /> Kỹ thuật: {visit.assigneeName || 'Đang điều phối'}
                </span>
              </div>

              {visit.positions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {visit.positions.map((pos) => (
                    <span
                      key={pos.id}
                      className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700"
                    >
                      {pos.code} · {pos.name || pos.doorName}
                    </span>
                  ))}
                </div>
              )}

              {(hasPhase1 || hasPhase2) && (
                <div
                  className={
                    hasPhase1 && hasPhase2
                      ? 'grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-100 pt-2.5'
                      : 'space-y-2.5 border-t border-slate-100 pt-2.5'
                  }
                >
                  {hasPhase1 && (
                    <div className="space-y-1.5 rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-700">
                        Thông tin khách hàng báo:
                      </div>
                      {visit.issueTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {visit.issueTags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800"
                            >
                              {WARRANTY_ISSUE_TAG_MAP[tag] || tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {visit.issueDescription && (
                        <p className="text-slate-600">{visit.issueDescription}</p>
                      )}
                      <QrMediaStrip
                        items={visit.customerPhotos}
                        onPlayVideo={setPreviewVideoUrl}
                      />
                    </div>
                  )}

                  {hasPhase2 && (
                    <div className="space-y-1.5 rounded-xl bg-emerald-50/40 p-3 border border-emerald-100">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 size={13} />
                        <span>Biên bản kiểm tra & xử lý của Kỹ thuật viên:</span>
                      </div>
                      {visit.diagnosisNote && (
                        <p className="text-slate-700">
                          <b>Chẩn đoán:</b> {visit.diagnosisNote}
                        </p>
                      )}
                      {visit.damagedParts.length > 0 && (
                        <p className="text-slate-700">
                          <b>Bộ phận hỏng:</b> {visit.damagedParts.join(', ')}
                        </p>
                      )}
                      {visit.repairActions && (
                        <p className="text-slate-700">
                          <b>Xử lý:</b> {visit.repairActions}
                        </p>
                      )}
                      {visit.replacedParts.length > 0 && (
                        <p className="text-slate-700">
                          <b>Thay thế:</b> {visit.replacedParts.join(', ')}
                        </p>
                      )}
                      {visit.resultNote && (
                        <p className="text-emerald-700">
                          <b>Kết quả nghiệm thu:</b> {visit.resultNote}
                        </p>
                      )}
                      <QrMediaStrip items={visit.photos} onPlayVideo={setPreviewVideoUrl} />
                    </div>
                  )}
                </div>
              )}

              {isLoggedIn && isOpen && (
                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  {visit.status === 'scheduled' && (
                    <Button
                      size="sm"
                      variant="outline"
                      loading={startMutation.isPending}
                      leftIcon={<PlayCircle size={14} />}
                      onClick={() => startMutation.mutate(visit.id)}
                      className="min-h-[44px]"
                    >
                      Bắt đầu kiểm tra
                    </Button>
                  )}
                  <Button
                    size="sm"
                    leftIcon={<ClipboardCheck size={14} />}
                    onClick={() => setInspectingVisit(visit)}
                    className="min-h-[44px]"
                  >
                    Cập nhật biên bản / Hoàn thành
                  </Button>
                </div>
              )}
            </article>
          );
        })}

        {activeVisits.length === 0 && (
          <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-xs text-slate-500">
              Công trình chưa có phiếu yêu cầu bảo hành hoặc lịch bảo hành định kỳ nào.
            </p>
            <Button
              size="sm"
              leftIcon={<Wrench size={14} />}
              onClick={onRequestNewClaim}
              className="min-h-[44px]"
            >
              Tạo yêu cầu bảo hành / sửa chữa
            </Button>
          </div>
        )}
      </div>

      <QrTechInspectModal
        token={token}
        projectId={projectId}
        visit={inspectingVisit}
        onClose={() => setInspectingVisit(null)}
        onSuccess={onRefresh}
      />

      <Modal
        isOpen={Boolean(previewVideoUrl)}
        onClose={() => setPreviewVideoUrl(null)}
        title="Video thực tế"
        className="max-w-lg w-full"
      >
        {previewVideoUrl && (
          <video
            src={previewVideoUrl}
            controls
            autoPlay
            className="max-h-[70vh] w-full rounded-xl bg-black object-contain"
          />
        )}
      </Modal>
    </div>
  );
}
