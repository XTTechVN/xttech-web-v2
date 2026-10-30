'use client';

import React, { use, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Camera, CheckCircle2, Loader2, QrCode, Ruler, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { advanceDoorByQr, getPositionQrView, uploadProgressEvidence } from '@/actions';
import { Badge, Button, Textarea } from '@/components';
import { BASE_MINIO_URL, DOOR_STATUS_MAP } from '@/config';
import { useAuthStore } from '@/stores';
import type { EvidenceMediaItem, PositionQrView, ProgressStepCode } from '@/types';

const mediaUrl = (url: string): string =>
  url.startsWith('http') ? url : `${BASE_MINIO_URL}/${url.replace(/^\//, '')}`;

const getErrorMessage = (error: unknown): string =>
  axios.isAxiosError(error)
    ? (error.response?.data?.details?.message ?? 'Không thể xử lý yêu cầu')
    : 'Không thể xử lý yêu cầu';

const ACTION_LABEL: Partial<Record<ProgressStepCode, string>> = {
  factory_done: 'Báo đã sản xuất xong',
  delivering: 'Xuất xưởng - đang vận chuyển',
  delivered: 'Báo đã giao đến công trình',
  installing: 'Bắt đầu lắp đặt',
  installed: 'Báo đã lắp đặt xong',
};

const INSTALL_STEP_VALUES: ProgressStepCode[] = ['factory_done', 'delivering', 'delivered', 'installing', 'installed'];

/** Trang công khai khi quét QR dán trên bộ cửa; nhân viên đăng nhập có thể báo tiến độ ngay tại đây. */
export default function QrPositionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const isLoggedIn = Boolean(useAuthStore((state) => state.accessToken));
  const [view, setView] = useState<PositionQrView | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<ProgressStepCode | null>(null);
  const [note, setNote] = useState('');
  const [evidence, setEvidence] = useState<EvidenceMediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () =>
    getPositionQrView(token)
      .then(setView)
      .catch((error) => setErrorMessage(getErrorMessage(error)));

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || !view) return;
    setIsUploading(true);
    try {
      const results = await Promise.all(
        Array.from(files).map((file) => uploadProgressEvidence(view.projectId, file)),
      );
      setEvidence((prev) => [...prev, ...results.map((r) => ({ url: r.url, name: r.name, type: r.type }))]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedStep) return;
    setIsSubmitting(true);
    try {
      await advanceDoorByQr(token, {
        targetStep: selectedStep,
        note: note.trim() || undefined,
        evidenceMedia: evidence,
      });
      toast.success('Đã cập nhật tiến độ');
      setSelectedStep(null);
      setNote('');
      setEvidence([]);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (errorMessage) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
        <ShieldAlert className="text-amber-500" size={40} />
        <p className="text-sm text-slate-600">{errorMessage}</p>
      </main>
    );
  }
  if (!view) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" />
      </main>
    );
  }

  const statusBadge = DOOR_STATUS_MAP[view.status];
  const actionSteps = view.allowedNextSteps.filter((step) => INSTALL_STEP_VALUES.includes(step));

  return (
    <main className="mx-auto max-w-xl space-y-4 p-4 pb-16">
      <header className="space-y-1 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-primary">
          <QrCode size={18} />
          <span className="text-[11px] font-bold uppercase tracking-wider">XT-Tech · Bộ cửa</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          {view.code} {view.name ? `· ${view.name}` : ''}
        </h1>
        <p className="text-xs text-slate-500">
          {view.projectName}
          {view.projectAddress ? ` · ${view.projectAddress}` : ''}
          {view.floorName ? ` · ${view.floorName}` : ''}
        </p>
        <Badge variant={statusBadge?.variant ?? 'default'} size="lg">
          {view.statusLabel}
        </Badge>
      </header>

      <section className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-slate-200 p-2">
          <div className="text-[10px] uppercase text-slate-400">Rộng</div>
          <div className="text-base font-bold text-slate-900">{view.width}</div>
          <div className="text-[10px] text-slate-400">mm</div>
        </div>
        <div className="rounded-lg border border-slate-200 p-2">
          <div className="text-[10px] uppercase text-slate-400">Cao</div>
          <div className="text-base font-bold text-slate-900">{view.height}</div>
          <div className="text-[10px] text-slate-400">mm</div>
        </div>
        <div className="rounded-lg border border-slate-200 p-2">
          <div className="text-[10px] uppercase text-slate-400">Diện tích</div>
          <div className="text-base font-bold text-slate-900">{view.areaM2}</div>
          <div className="text-[10px] text-slate-400">m²</div>
        </div>
        <div className="col-span-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <Ruler size={12} />
          {view.isMeasured
            ? `Đã đo thực tế${view.measuredAt ? ` ngày ${new Date(view.measuredAt).toLocaleDateString('vi-VN')}` : ''}`
            : 'Chưa đo thực tế (đang dùng số đo thiết kế)'}
        </div>
      </section>

      <section className="space-y-1 rounded-lg border border-slate-200 p-3 text-xs text-slate-600">
        {[
          ['Hãng nhôm', view.brandName],
          ['Hệ nhôm', view.seriesName],
          ['Màu', view.colorName],
          ['Kính', view.glassName],
        ].map(([label, value]) =>
          value ? (
            <div key={label} className="flex justify-between">
              <span>{label}</span>
              <b className="text-slate-800">{value}</b>
            </div>
          ) : null,
        )}
      </section>

      {view.designImage && (
         
        <img
          src={mediaUrl(view.designImage)}
          alt="Bản vẽ thiết kế"
          className="w-full rounded-lg border border-slate-200 bg-white object-contain"
        />
      )}

      {view.bars.length > 0 && (
        <section className="space-y-1.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Thanh nhôm ({view.bars.reduce((sum, bar) => sum + (bar.qty || 0), 0)} thanh)
          </h2>
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-xs">
            {view.bars.map((bar, index) => (
              <div key={`${bar.name}-${index}`} className="flex items-center justify-between px-3 py-1.5">
                <span className="text-slate-700">
                  {bar.profileCode ? `${bar.profileCode} · ` : ''}
                  {bar.name}
                </span>
                <span className="font-mono text-slate-900">
                  {bar.length} mm × {bar.qty}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tiến độ</h2>
        <ol className="space-y-2 border-l-2 border-slate-200 pl-3">
          {[...view.timeline].reverse().map((item, index) => (
            <li key={`${item.stepCode}-${index}`} className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className={item.direction === 'backward' ? 'text-amber-500' : 'text-emerald-500'} />
                <b className="text-slate-800">
                  {item.direction === 'backward' ? 'Lùi về: ' : ''}
                  {item.stepLabel}
                </b>
                <span className="text-slate-400">
                  {new Date(item.createdAt).toLocaleString('vi-VN')}
                  {item.updatedBy ? ` · ${item.updatedBy}` : ''}
                </span>
              </div>
              {item.note && <p className="text-slate-500">{item.note}</p>}
              {item.evidenceMedia.length > 0 && (
                <div className="flex gap-1.5">
                  {item.evidenceMedia.map((media) => (
                     
                    <img
                      key={media.url}
                      src={mediaUrl(media.url)}
                      alt={media.name ?? 'Minh chứng'}
                      className="h-14 w-14 rounded-md border border-slate-200 object-cover"
                    />
                  ))}
                </div>
              )}
            </li>
          ))}
          {view.timeline.length === 0 && <li className="text-xs text-slate-400">Chưa có cập nhật tiến độ.</li>}
        </ol>
      </section>

      {isLoggedIn && actionSteps.length > 0 && (
        <section className="space-y-2.5 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <h2 className="text-xs font-bold text-slate-800">Cập nhật tiến độ (đúng vai trò của bạn)</h2>
          <div className="flex flex-wrap gap-2">
            {actionSteps.map((step) => (
              <Button
                key={step}
                size="sm"
                variant={selectedStep === step ? 'primary' : 'outline'}
                onClick={() => setSelectedStep(step)}
              >
                {ACTION_LABEL[step] ?? step}
              </Button>
            ))}
          </div>
          {selectedStep && (
            <div className="space-y-2">
              <Textarea
                label="Ghi chú"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                fullWidth
              />
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  capture="environment"
                  multiple
                  hidden
                  onChange={(e) => void handleUpload(e.target.files)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  loading={isUploading}
                  leftIcon={<Camera size={14} />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Chụp / chọn ảnh minh chứng
                </Button>
                <span className="text-xs text-slate-500">{evidence.length} tệp</span>
              </div>
              <Button size="sm" fullWidth loading={isSubmitting} onClick={handleSubmit}>
                Xác nhận
              </Button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
