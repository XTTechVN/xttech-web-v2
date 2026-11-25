'use client';

import { use } from 'react';
import { CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { SignForm } from './_components/sign-form';
import { SignDoorList } from './_components/sign-door-list';
import { SignHeader } from './_components/sign-header';
import { SignParties } from './_components/sign-parties';
import { SignMilestones, SignPricingSummary, SignTotalBar } from './_components/sign-pricing';
import { SignPhotos, SignSignatures } from './_components/sign-signatures';
import { usePublicSigning } from './_hooks/use-public-signing';

const FORM_ID = 'sign-form';

export default function PublicSigningPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { view, errorMessage, isSubmitting, isDone, isUnavailable, submit } = usePublicSigning(token);

  if (errorMessage) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
        <ShieldAlert className="text-amber-500" size={40} />
        <p className="text-sm text-stone-700">{errorMessage}</p>
      </main>
    );
  }

  if (!view) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </main>
    );
  }

  const canSign = !isDone && !isUnavailable;
  const totalAmount = view.pricing?.totalAmount ?? view.totalAmount ?? null;

  return (
    <div className="min-h-screen bg-primary/5"><main className="mx-auto max-w-3xl space-y-5 p-4 pb-28 sm:p-6 sm:pb-28">
      <SignHeader view={view} />
      <SignParties partyA={view.parties?.partyA} />
      <SignDoorList items={view.items} subjectType={view.subjectType} />
      {view.pricing && <SignPricingSummary pricing={view.pricing} />}
      <SignMilestones milestones={view.milestones} />
      <SignPhotos photos={view.photos} />
      <SignSignatures signatures={view.signatures} />

      {isDone ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-medium text-emerald-900">
          <CheckCircle2 size={18} /> Chứng từ này đã được ký xác nhận.
        </div>
      ) : isUnavailable ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-900">
          Liên kết ký không còn hiệu lực. Vui lòng liên hệ XT-Tech để nhận liên kết mới.
        </div>
      ) : (
        <SignForm id={FORM_ID} subjectType={view.subjectType} isSubmitting={isSubmitting} onSubmit={submit} />
      )}

      {totalAmount != null && view.subjectType !== 'acceptance' && (
        <SignTotalBar totalAmount={totalAmount} targetId={canSign ? FORM_ID : undefined} />
      )}
    </main></div>
  );
}
