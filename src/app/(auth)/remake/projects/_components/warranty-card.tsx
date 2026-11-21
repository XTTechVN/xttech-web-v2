'use client';

import { WARRANTY_ISSUE_TAG_MAP, WARRANTY_VISIT_STATUS_MAP } from '@/config';
import type { EvidenceMediaItem, WarrantyVisit } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Badge, toneOf } from '../../_components/badge';
import { BTN_LINE, BTN_PRIMARY } from '../../_components/form';
import { isVideo, mediaUrl } from './evidence-uploader';

const day = (s?: string | null) => (s ? new Date(s).toLocaleDateString('vi-VN') : '–');

function Gallery({ items, onVideo }: { items: EvidenceMediaItem[]; onVideo: (url: string) => void }) {
  if (!items?.length) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((m, i) => (
        <li key={`${m.url}-${i}`}>
          {isVideo(m) ? (
            <button
              type="button"
              onClick={() => onVideo(mediaUrl(m.url))}
              className="flex size-16 items-center justify-center rounded-rm border border-rm-line bg-rm-bg text-xs"
            >
              Video
            </button>
          ) : (
            <a href={mediaUrl(m.url)} target="_blank" rel="noreferrer">
              <img src={mediaUrl(m.url)} alt={m.name ?? 'Ảnh bảo hành'} className="size-16 rounded-rm border border-rm-line object-cover" />
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

interface Props {
  v: WarrantyVisit;
  /** có quyền warranty:update — hiện các nút xử lý */
  manage: boolean;
  onStart: () => void;
  onComplete: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onVideo: (url: string) => void;
}

// Thẻ một đợt bảo hành: giai đoạn 1 (khách báo) và giai đoạn 2 (biên bản kiểm tra, xử lý), nút thao tác khi còn mở.
export function WarrantyCard({ v, manage, onStart, onComplete, onEdit, onCancel, onVideo }: Props) {
  const st = WARRANTY_VISIT_STATUS_MAP[v.status];
  const open = v.status === 'scheduled' || v.status === 'in_progress';
  const done = v.diagnosisNote || v.damagedParts.length || v.repairActions || v.replacedParts.length || v.resultNote || v.photos.length;
  return (
    <li className="rounded-rm-xl border border-rm-edge bg-rm-surface px-rm-gutter py-3 text-sm">
      <p className="flex flex-wrap items-center gap-2">
        <span className="min-w-0 font-medium [overflow-wrap:anywhere]">{v.title}</span>
        <Badge tone={toneOf(st?.variant)}>{st?.label ?? v.status}</Badge>
        {v.kind === 'claim' && <Badge tone="primary">Khách yêu cầu</Badge>}
        {v.isOverdue && <Badge tone="danger">Quá hạn</Badge>}
        {!v.isInScope && <Badge tone="warning">Ngoài phạm vi BH</Badge>}
        {v.isChargeable && <Badge tone="warning">Thu phí {formatCurrency(v.feeAmount)}</Badge>}
      </p>
      <p className="text-xs text-rm-muted">
        {v.code} · hẹn {day(v.scheduledDate)}
        {v.actualDate && ` · thực hiện ${day(v.actualDate)}`} · {v.assigneeName || 'chưa phân công'}
      </p>
      {(v.requesterName || v.requesterPhone) && (
        <p className="text-xs text-rm-muted">
          Khách báo: {v.requesterName}
          {v.requesterPhone && (
            <>
              {' · '}
              <a href={`tel:${v.requesterPhone}`} className="text-rm-primary">
                {v.requesterPhone}
              </a>
            </>
          )}
        </p>
      )}
      {v.positions.length > 0 && (
        <p className="mt-1 flex flex-wrap gap-1.5">
          {v.positions.map((p) => (
            <span key={p.id} className="rounded-rm-sm bg-rm-bg px-1.5 py-0.5 text-xs">
              {p.code}
              {p.floorName ? ` · ${p.floorName}` : ''}
            </span>
          ))}
        </p>
      )}
      {(v.issueTags.length > 0 || v.issueDescription || v.customerPhotos.length > 0) && (
        <div className="mt-2 flex flex-col gap-1.5 border-t border-rm-line pt-2">
          <p className="text-xs font-medium text-rm-muted">Khách báo</p>
          {v.issueTags.length > 0 && (
            <p className="flex flex-wrap gap-1.5">
              {v.issueTags.map((t) => (
                <Badge key={t}>{WARRANTY_ISSUE_TAG_MAP[t] ?? t}</Badge>
              ))}
            </p>
          )}
          {v.issueDescription && <p className="[overflow-wrap:anywhere]">{v.issueDescription}</p>}
          <Gallery items={v.customerPhotos} onVideo={onVideo} />
        </div>
      )}
      {done ? (
        <div className="mt-2 flex flex-col gap-1 border-t border-rm-line pt-2">
          <p className="text-xs font-medium text-rm-success">Biên bản kiểm tra và xử lý</p>
          {v.diagnosisNote && (
            <p className="[overflow-wrap:anywhere]">
              <b>Chẩn đoán:</b> {v.diagnosisNote}
            </p>
          )}
          {v.damagedParts.length > 0 && (
            <p>
              <b>Bộ phận hỏng:</b> {v.damagedParts.join(', ')}
            </p>
          )}
          {v.repairActions && (
            <p className="[overflow-wrap:anywhere]">
              <b>Xử lý:</b> {v.repairActions}
            </p>
          )}
          {v.replacedParts.length > 0 && (
            <p>
              <b>Đã thay:</b> {v.replacedParts.join(', ')}
            </p>
          )}
          {v.resultNote && (
            <p className="[overflow-wrap:anywhere]">
              <b>Kết quả:</b> {v.resultNote}
            </p>
          )}
          {v.scopeNote && <p className="text-rm-muted [overflow-wrap:anywhere]">{v.scopeNote}</p>}
          <Gallery items={v.photos} onVideo={onVideo} />
        </div>
      ) : null}
      {manage && open && (
        <div className="mt-2 flex flex-wrap gap-2">
          {v.status === 'scheduled' && (
            <button type="button" onClick={onStart} className={`${BTN_LINE} flex-none px-3`}>
              Bắt đầu kiểm tra
            </button>
          )}
          <button type="button" onClick={onComplete} className={`${BTN_PRIMARY} flex-none px-3`}>
            Kiểm tra và hoàn thành
          </button>
          <button type="button" onClick={onEdit} className={`${BTN_LINE} flex-none px-3`}>
            Sửa lịch
          </button>
          <button type="button" onClick={onCancel} className="h-rm-tap flex-none px-2 text-sm text-rm-danger md:h-rm-control">
            Huỷ
          </button>
        </div>
      )}
    </li>
  );
}
