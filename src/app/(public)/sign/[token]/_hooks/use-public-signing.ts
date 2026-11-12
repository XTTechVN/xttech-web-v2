'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getPublicSigningView, submitPublicSignature } from '@/actions';
import { SIGN_SIGNED_STATUSES, SIGN_UNAVAILABLE_STATUSES } from '@/config';
import type { PublicSigningView } from '@/types';
import { getSignErrorMessage } from '@/utils/public-signing';

export interface SignSubmitInput {
  signerName: string;
  signatureImage: string;
}

export function usePublicSigning(token: string) {
  const [view, setView] = useState<PublicSigningView | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getPublicSigningView(token)
      .then(setView)
      .catch((error: unknown) => setErrorMessage(getSignErrorMessage(error)));
  }, [token]);

  const submit = useCallback(
    async ({ signerName, signatureImage }: SignSubmitInput) => {
      setIsSubmitting(true);
      try {
        setView(await submitPublicSignature(token, { signerName, signatureImage, agree: true }));
        toast.success('Đã ký thành công. Cảm ơn Quý khách!');
      } catch (error) {
        toast.error(getSignErrorMessage(error));
      } finally {
        setIsSubmitting(false);
      }
    },
    [token],
  );

  const isDone = view
    ? view.signatures.some((s) => s.party === 'customer') || SIGN_SIGNED_STATUSES.includes(view.status)
    : false;
  const isUnavailable = view ? SIGN_UNAVAILABLE_STATUSES.includes(view.status) : false;

  return { view, errorMessage, isSubmitting, isDone, isUnavailable, submit };
}
