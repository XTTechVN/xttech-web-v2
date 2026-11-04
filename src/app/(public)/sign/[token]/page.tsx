'use client';

import React, { use, useEffect, useState } from 'react';
import axios from 'axios';
import { Check, CheckCircle2, FileSignature, Loader2, ShieldAlert, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPublicSigningView, submitPublicSignature } from '@/actions';
import { Button, Input, SignaturePad } from '@/components';
import { BASE_MINIO_URL } from '@/config';
import type { AcceptanceItemResult, PublicSigningView } from '@/types';

const formatVnd = (value?: number | null): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value ?? 0);

const mediaUrl = (url: string): string =>
  url.startsWith('http') ? url : `${BASE_MINIO_URL}/${url.replace(/^\//, '')}`;

const getErrorMessage = (error: unknown): string =>
  axios.isAxiosError(error)
    ? (error.response?.data?.details?.message ?? 'Không thể xử lý yêu cầu')
    : 'Không thể xử lý yêu cầu';

const SIGNED_STATUSES = new Set(['signed', 'active', 'completed', 'accepted']);

const SUBJECT_LABEL: Record<PublicSigningView['subjectType'], string> = {
  contract: 'hợp đồng',
  acceptance: 'biên bản nghiệm thu',
  quotation: 'báo giá',
};

const ITEM_RESULT_LABEL: Record<AcceptanceItemResult, string> = {
  passed: 'Đạt',
  failed: 'Không đạt',
};

export default function PublicSigningPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [view, setView] = useState<PublicSigningView | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getPublicSigningView(token)
      .then(setView)
      .catch((error) => setErrorMessage(getErrorMessage(error)));
  }, [token]);

  const handleSubmit = async () => {
    if (!signature || signerName.trim().length < 2 || !isAgreed) {
      toast.error('Vui lòng nhập họ tên, ký tên và xác nhận đồng ý');
      return;
    }
    setIsSubmitting(true);
    try {
      setView(
        await submitPublicSignature(token, {
          signerName: signerName.trim(),
          signatureImage: signature,
          agree: true,
        }),
      );
      toast.success('Đã ký thành công. Cảm ơn Quý khách!');
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

  const isDone = view.signatures.some((s) => s.party === 'customer') || SIGNED_STATUSES.has(view.status);
  const isUnavailable = ['revoked', 'expired', 'cancelled', 'rejected', 'superseded', 'not_chosen'].includes(
    view.status,
  );
  const isContract = view.subjectType === 'contract';
  const isQuotation = view.subjectType === 'quotation';

  return (
    <main className="mx-auto max-w-2xl space-y-5 p-4 pb-16 sm:p-6">
      <header className="space-y-1 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-primary">
          <FileSignature size={20} />
          <span className="text-xs font-bold uppercase tracking-wider">XT-Tech · Ký xác nhận trực tuyến</span>
        </div>
        <h1 className="text-lg font-bold text-slate-900">{view.documentTitle}</h1>
        <p className="text-xs text-slate-500">
          Mã {view.documentCode} · Công trình: <b>{view.projectName}</b>
          {view.projectAddress ? ` · ${view.projectAddress}` : ''}
        </p>
      </header>

      {isContract && (
        <section className="space-y-2 rounded-lg border border-slate-200 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Giá trị hợp đồng</span>
            <b className="text-slate-900">{formatVnd(view.totalAmount)}</b>
          </div>
          {view.milestones.map((m) => (
            <div key={m.name} className="flex justify-between text-xs text-slate-600">
              <span>
                {m.name} ({m.percentage}%)
              </span>
              <span>{formatVnd(m.amount)}</span>
            </div>
          ))}
        </section>
      )}

      {isQuotation && (
        <section className="flex justify-between rounded-lg border border-slate-200 p-4 text-sm">
          <span className="text-slate-500">Tổng giá trị báo giá (đã gồm VAT)</span>
          <b className="text-slate-900">{formatVnd(view.totalAmount)}</b>
        </section>
      )}

      {view.items.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {isContract || isQuotation ? 'Hạng mục cửa' : 'Các bộ cửa nghiệm thu'} ({view.items.length})
          </h2>
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-xs">
            {view.items.map((item, index) => {
              const isFailed = item.result === 'failed';
              return (
                <div key={`${item.code}-${index}`} className="space-y-1 px-3 py-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {item.result && (
                        <span
                          className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                            isFailed ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {isFailed ? <X size={10} /> : <Check size={10} />}
                          {ITEM_RESULT_LABEL[item.result]}
                        </span>
                      )}
                      <span className="font-semibold text-slate-800">
                        {item.code} {item.name ? `· ${item.name}` : ''}
                      </span>
                    </div>
                    <span className="text-slate-500">
                      {item.width} × {item.height} mm
                      {item.sellingPrice != null && (
                        <b className="ml-2 text-slate-800">{formatVnd(item.sellingPrice)}</b>
                      )}
                    </span>
                  </div>
                  {item.note && (
                    <div className={`text-[11px] ${isFailed ? 'text-rose-700' : 'text-slate-500'}`}>
                      Ghi chú: {item.note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {view.photos.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ảnh nghiệm thu thực tế</h2>
          <div className="grid grid-cols-3 gap-2">
            {view.photos.map((photo) => (
              <img
                key={photo.url}
                src={mediaUrl(photo.url)}
                alt={photo.name ?? 'Ảnh nghiệm thu'}
                className="aspect-square w-full rounded-md border border-slate-200 object-cover"
              />
            ))}
          </div>
        </section>
      )}

      {view.signatures.length > 0 && (
        <section className="grid grid-cols-2 gap-3">
          {view.signatures.map((sig) => (
            <div key={sig.id} className="rounded-lg border border-slate-200 p-2 text-center">
              <img src={sig.signatureImage} alt={sig.signerName} className="mx-auto h-16 object-contain" />
              <div className="text-xs font-semibold text-slate-800">{sig.signerName}</div>
              <div className="text-[10px] text-slate-500">
                {sig.party === 'company' ? 'Đại diện công ty' : 'Khách hàng'} ·{' '}
                {new Date(sig.signedAt).toLocaleString('vi-VN')}
              </div>
            </div>
          ))}
        </section>
      )}

      {isDone ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 size={18} /> Chứng từ này đã được ký xác nhận.
        </div>
      ) : isUnavailable ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Liên kết ký không còn hiệu lực. Vui lòng liên hệ XT-Tech để nhận liên kết mới.
        </div>
      ) : (
        <section className="space-y-3 rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-bold text-slate-800">Ký xác nhận của Quý khách</h2>
          <Input
            label="Họ và tên người ký"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            fullWidth
          />
          <SignaturePad label="Chữ ký" onChange={setSignature} />
          <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="mt-0.5"
            />
            Tôi đã đọc và đồng ý với nội dung {SUBJECT_LABEL[view.subjectType]} nêu trên.
          </label>
          <Button
            fullWidth
            loading={isSubmitting}
            disabled={!signature || signerName.trim().length < 2 || !isAgreed}
            onClick={handleSubmit}
          >
            Xác nhận ký
          </Button>
        </section>
      )}
    </main>
  );
}
