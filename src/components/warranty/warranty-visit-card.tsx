'use client';

import React from 'react';
import { CalendarClock, CheckCircle2, Phone, Play, User } from 'lucide-react';
import { Image as AntdImage } from 'antd';
import { Badge } from '../badge';
import { Button } from '../button';
import { BASE_MINIO_URL, WARRANTY_ISSUE_TAG_MAP, WARRANTY_VISIT_STATUS_MAP } from '@/config';
import type { EvidenceMediaItem, WarrantyVisit } from '@/types';

const formatDate = (value?: string | null): string =>
  value ? new Date(value).toLocaleDateString('vi-VN') : '—';

const formatVnd = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const mediaUrl = (url: string): string =>
  url.startsWith('http') ? url : `${BASE_MINIO_URL}/${url.replace(/^\//, '')}`;

const isVideoUrl = (url: string, type?: string): boolean => {
  if (type === 'video') return true;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.avi') ||
    cleanUrl.endsWith('.mkv')
  );
};

function MediaGallery({
  items,
  onPreviewVideo,
}: {
  items: EvidenceMediaItem[];
  onPreviewVideo: (url: string) => void;
}) {
  if (!items || items.length === 0) return null;
  return (
    <AntdImage.PreviewGroup>
      <div className="flex flex-wrap gap-2">
        {items.map((photo, pIdx) => {
          const url = mediaUrl(photo.url);
          const isVideo = isVideoUrl(photo.url, photo.type);
          if (isVideo) {
            return (
              <div
                key={photo.url || pIdx}
                onClick={() => onPreviewVideo(url)}
                className="group relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-900 text-white transition hover:border-primary"
                title={photo.name || 'Xem video bảo hành'}
              >
                <video
                  src={url}
                  preload="metadata"
                  className="h-full w-full object-cover opacity-70"
                />
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
                alt={photo.name || 'Ảnh bảo hành'}
                width={64}
                height={64}
                className="!h-full !w-full object-cover"
              />
            </div>
          );
        })}
      </div>
    </AntdImage.PreviewGroup>
  );
}

interface WarrantyVisitCardProps {
  visit: WarrantyVisit;
  onStart: (visitId: number) => void;
  onComplete: (visit: WarrantyVisit) => void;
  onEdit: (visit: WarrantyVisit) => void;
  onCancel: (visitId: number) => void;
  onPreviewVideo: (url: string) => void;
}

export function WarrantyVisitCard({
  visit,
  onStart,
  onComplete,
  onEdit,
  onCancel,
  onPreviewVideo,
}: WarrantyVisitCardProps) {
  const status = WARRANTY_VISIT_STATUS_MAP[visit.status];
  const isOpen = visit.status === 'scheduled' || visit.status === 'in_progress';

  return (
    <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3.5 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-[#045863]">{visit.code}</span>
          <span className="text-sm font-semibold text-slate-900">{visit.title}</span>
          <Badge variant={status.variant}>{status.label}</Badge>
          {visit.kind === 'claim' && <Badge variant="primary">Khách yêu cầu</Badge>}
          {visit.isOverdue && <Badge variant="danger">Quá hạn</Badge>}
          {!visit.isInScope && <Badge variant="warning">Ngoài phạm vi BH</Badge>}
          {visit.isChargeable && (
            <Badge variant="warning">
              Thu phí: {formatVnd(visit.feeAmount)}
            </Badge>
          )}
        </div>
        {isOpen && (
          <div className="flex flex-wrap gap-1.5">
            {visit.status === 'scheduled' && (
              <Button size="xs" variant="outline" onClick={() => onStart(visit.id)}>
                Bắt đầu KT
              </Button>
            )}
            <Button size="xs" onClick={() => onComplete(visit)}>
              Kiểm tra & Hoàn thành
            </Button>
            <Button size="xs" variant="outline" onClick={() => onEdit(visit)}>
              Sửa lịch
            </Button>
            <Button size="xs" variant="ghost" onClick={() => onCancel(visit.id)}>
              Hủy
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1 font-mono tabular-nums">
          <CalendarClock size={11} /> Hẹn: {formatDate(visit.scheduledDate)}
          {visit.actualDate ? ` · Thực hiện: ${formatDate(visit.actualDate)}` : ''}
        </span>
        <span>Phụ trách: {visit.assigneeName || 'Chưa phân công'}</span>
        {visit.requesterName && (
          <span className="flex items-center gap-1 text-slate-700">
            <User size={11} /> Khách báo: <b>{visit.requesterName}</b>
          </span>
        )}
        {visit.requesterPhone && (
          <span className="flex items-center gap-1 font-mono tabular-nums text-slate-700">
            <Phone size={11} /> {visit.requesterPhone}
          </span>
        )}
      </div>

      {visit.positions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visit.positions.map((pos) => (
            <span
              key={pos.id}
              className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700"
            >
              {pos.code} · {pos.name || pos.doorName}
              {pos.floorName ? ` (${pos.floorName})` : ''}
            </span>
          ))}
        </div>
      )}

      {(visit.issueTags.length > 0 || visit.issueDescription || visit.customerPhotos.length > 0) && (
        <div className="space-y-1.5 border-t border-slate-100 pt-2">
          <div className="font-semibold text-slate-700">Giai đoạn 1 — Thông tin khách báo:</div>
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
          {visit.issueDescription && <p className="text-slate-600">{visit.issueDescription}</p>}
          <MediaGallery items={visit.customerPhotos} onPreviewVideo={onPreviewVideo} />
        </div>
      )}

      {(visit.diagnosisNote ||
        visit.damagedParts.length > 0 ||
        visit.repairActions ||
        visit.replacedParts.length > 0 ||
        visit.resultNote ||
        visit.photos.length > 0) && (
        <div className="space-y-1.5 border-t border-slate-100 pt-2">
          <div className="flex items-center gap-1 font-semibold text-emerald-700">
            <CheckCircle2 size={13} />
            <span>Giai đoạn 2 — Biên bản kiểm tra & xử lý kỹ thuật:</span>
          </div>
          {visit.diagnosisNote && (
            <p className="text-slate-700">
              <b>Chẩn đoán hư hỏng:</b> {visit.diagnosisNote}
            </p>
          )}
          {visit.damagedParts.length > 0 && (
            <p className="text-slate-700">
              <b>Bộ phận hỏng:</b> {visit.damagedParts.join(', ')}
            </p>
          )}
          {visit.repairActions && (
            <p className="text-slate-700">
              <b>Biện pháp xử lý:</b> {visit.repairActions}
            </p>
          )}
          {visit.replacedParts.length > 0 && (
            <p className="text-slate-700">
              <b>Vật tư thay thế:</b> {visit.replacedParts.join(', ')}
            </p>
          )}
          {visit.resultNote && (
            <p className="text-emerald-700">
              <b>Kết quả nghiệm thu:</b> {visit.resultNote}
            </p>
          )}
          <MediaGallery items={visit.photos} onPreviewVideo={onPreviewVideo} />
        </div>
      )}
    </div>
  );
}
