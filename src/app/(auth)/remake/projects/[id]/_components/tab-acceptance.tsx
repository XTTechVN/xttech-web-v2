'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cancelProjectAcceptance, getProjectAcceptances, getProjectPositions, sendAcceptanceSigningLink } from '@/actions';
import { useCan } from '@/hooks';
import type { AcceptanceStatus, ProjectAcceptance } from '@/types';
import { Badge, type Tone } from '../../../_components/badge';
import { BTN_LINE, BTN_PRIMARY } from '../../../_components/form';
import { Sheet } from '../../../_components/sheet';
import { EmptyState, ErrorState, ListSkeleton } from '../../../_components/state-views';
import { isVideo, mediaUrl } from '../../_components/evidence-uploader';
import { AcceptanceFormSheet, CustomerSignSheet } from './acceptance-sheets';
import { useAct } from './use-act';

const ST: Record<AcceptanceStatus, { label: string; tone: Tone }> = {
  awaiting_customer: { label: 'Chờ khách ký', tone: 'warning' },
  signed: { label: 'Đã đủ chữ ký 2 bên', tone: 'success' },
  cancelled: { label: 'Đã huỷ', tone: 'neutral' },
};

// Tab Nghiệm thu: lập biên bản (đánh giá từng cửa, ảnh, chữ ký), khách ký tại chỗ hoặc qua link, huỷ. Nút nào cũng xét quyền acceptance:*.
export function TabAcceptance({ projectId }: { projectId: number }) {
  const { can } = useCan();
  const [form, setForm] = useState(false);
  const [signing, setSigning] = useState<ProjectAcceptance | null>(null);
  const [video, setVideo] = useState('');
  const q = useQuery({ queryKey: ['project', projectId, 'acceptances'], queryFn: () => getProjectAcceptances(projectId) });
  const installed = useQuery({
    queryKey: ['project', projectId, 'positions', 'installed'],
    queryFn: () => getProjectPositions(projectId, { status: 'installed', limit: 200 }),
  });
  const send = useAct(
    projectId,
    async (id: number) => {
      const r = await sendAcceptanceSigningLink(projectId, id);
      await navigator.clipboard?.writeText(r.signingUrl).catch(() => undefined);
      return r;
    },
    'Đã tạo link ký và sao chép',
  );
  const cancel = useAct(projectId, (id: number) => cancelProjectAcceptance(projectId, id), 'Đã huỷ biên bản');

  if (q.isLoading) return <ListSkeleton />;
  if (q.isError)
    return <ErrorState title="Không tải được nghiệm thu" description="Thử lại sau." actionLabel="Thử lại" onAction={() => q.refetch()} />;
  const items = q.data ?? [];
  const pending = new Set(items.filter((a) => a.status === 'awaiting_customer').flatMap((a) => a.positionIds));
  const ready = (installed.data?.items ?? []).filter((p) => !pending.has(p.id));

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <p className="min-w-0 flex-1 text-sm text-rm-muted">
          Cần ảnh thực tế và chữ ký hai bên. Cửa “Không đạt” giữ trạng thái đã lắp để nghiệm thu lại.
        </p>
        {can('acceptance:create') && (
          <button type="button" disabled={ready.length === 0} onClick={() => setForm(true)} className={`${BTN_PRIMARY} flex-none px-4`}>
            Lập biên bản ({ready.length})
          </button>
        )}
      </div>
      {items.length === 0 && <EmptyState title="Chưa có biên bản nghiệm thu" description="Biên bản được lập khi cửa đã lắp đặt xong." />}
      <ul className="flex flex-col gap-3">
        {items.map((a) => {
          const its = a.items ?? [];
          const failed = its.filter((i) => i.result === 'failed').length;
          return (
            <li key={a.id} className="rounded-rm-xl border border-rm-edge bg-rm-surface px-rm-gutter py-3">
              <p className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{a.code}</span>
                <Badge tone={ST[a.status].tone}>{ST[a.status].label}</Badge>
                {its.length > 0 && <Badge tone="success">{its.length - failed} đạt</Badge>}
                {failed > 0 && <Badge tone="danger">{failed} không đạt</Badge>}
              </p>
              <p className="text-xs text-rm-muted">{new Date(a.createdAt).toLocaleString('vi-VN')}</p>
              {its.length > 0 ? (
                <ul className="mt-2 divide-y divide-rm-line rounded-rm border border-rm-line">
                  {its.map((i) => (
                    <li key={i.positionId} className="flex items-center gap-2 px-3 py-1.5 text-sm">
                      <span className="min-w-0 flex-1 truncate">
                        {i.positionCode}
                        {i.doorName && <span className="text-rm-muted"> · {i.doorName}</span>}
                        {i.note && <span className="block text-xs text-rm-danger">{i.note}</span>}
                      </span>
                      <Badge tone={i.result === 'passed' ? 'success' : 'danger'}>{i.result === 'passed' ? 'Đạt' : 'Không đạt'}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm">
                  {a.positionCodes.length} bộ cửa: {a.positionCodes.join(', ')}
                </p>
              )}
              {a.note && <p className="mt-1 text-sm text-rm-muted [overflow-wrap:anywhere]">Ghi chú: {a.note}</p>}
              {a.photos.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {a.photos.map((p, i) => (
                    <li key={`${p.url}-${i}`}>
                      {isVideo(p) ? (
                        <button
                          type="button"
                          onClick={() => setVideo(mediaUrl(p.url))}
                          className="flex size-16 items-center justify-center rounded-rm border border-rm-line bg-rm-bg text-xs"
                        >
                          Video
                        </button>
                      ) : (
                        <a href={mediaUrl(p.url)} target="_blank" rel="noreferrer">
                          <img
                            src={mediaUrl(p.url)}
                            alt={p.name ?? 'Ảnh nghiệm thu'}
                            className="size-16 rounded-rm border border-rm-line object-cover"
                          />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {a.status === 'awaiting_customer' && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {can('acceptance:sign') && (
                    <button type="button" onClick={() => setSigning(a)} className={`${BTN_PRIMARY} flex-none px-3`}>
                      Khách ký tại chỗ
                    </button>
                  )}
                  {can('acceptance:send') && (
                    <button type="button" disabled={send.isPending} onClick={() => send.mutate(a.id)} className={`${BTN_LINE} flex-none px-3`}>
                      Gửi / chép link ký
                    </button>
                  )}
                  {can('acceptance:cancel') && (
                    <button
                      type="button"
                      disabled={cancel.isPending}
                      onClick={() => window.confirm('Huỷ biên bản nghiệm thu?') && cancel.mutate(a.id)}
                      className="h-rm-tap flex-none px-2 text-sm text-rm-danger md:h-rm-control"
                    >
                      Huỷ
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <AcceptanceFormSheet
        key={form ? 'af-open' : 'af-idle'}
        projectId={projectId}
        open={form}
        onClose={() => setForm(false)}
        positions={ready}
        canSign={can('acceptance:sign')}
        canSend={can('acceptance:send')}
      />
      <CustomerSignSheet key={signing ? `cs-${signing.id}` : 'cs-idle'} projectId={projectId} a={signing} onClose={() => setSigning(null)} />
      <Sheet open={!!video} onClose={() => setVideo('')} title="Video nghiệm thu">
        {video && <video src={video} controls autoPlay className="max-h-[70dvh] w-full bg-black" />}
      </Sheet>
    </>
  );
}
