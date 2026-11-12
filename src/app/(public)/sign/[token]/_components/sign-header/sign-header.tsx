import { FileSignature } from 'lucide-react';
import { SIGN_SIGNED_STATUSES, SIGN_SUBJECT_LABEL, SIGN_UNAVAILABLE_STATUSES } from '@/config';
import type { PublicSigningView } from '@/types';
import { cn } from '@/utils/cn';
import { getSignStatusLabel } from '@/utils/public-signing';

export function SignHeader({ view }: { view: PublicSigningView }) {
  const statusLabel = getSignStatusLabel(view.status);
  const isSigned = SIGN_SIGNED_STATUSES.includes(view.status);
  const isUnavailable = SIGN_UNAVAILABLE_STATUSES.includes(view.status);

  return (
    <header className="space-y-2 rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-white shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-white/90">
          <FileSignature size={20} aria-hidden />
          <span className="text-xs font-bold uppercase tracking-wider">XT-Tech · Ký xác nhận trực tuyến</span>
        </div>
        {statusLabel && (
          <span
            className={cn(
              'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold',
              isSigned && 'bg-emerald-100 text-emerald-800',
              isUnavailable && 'bg-rose-100 text-rose-800',
              !isSigned && !isUnavailable && 'bg-amber-100 text-amber-900',
            )}
          >
            {statusLabel}
          </span>
        )}
      </div>
      <h1 className="text-xl font-bold leading-snug">{view.documentTitle}</h1>
      <p className="text-xs text-white/85">
        {SIGN_SUBJECT_LABEL[view.subjectType] ? `Mã ${SIGN_SUBJECT_LABEL[view.subjectType]}` : 'Mã'}{' '}
        <span className="font-mono tabular-nums font-semibold text-white">{view.documentCode}</span> · Công trình:{' '}
        <b className="text-white">{view.projectName}</b>
        {view.projectAddress ? ` · ${view.projectAddress}` : ''}
      </p>
    </header>
  );
}