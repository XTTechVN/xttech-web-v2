'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Input, SignaturePad } from '@/components';
import { SIGN_SUBJECT_LABEL } from '@/config';
import type { PublicSigningSubject } from '@/types';

interface SignFormProps {
  id: string;
  subjectType: PublicSigningSubject;
  isSubmitting: boolean;
  onSubmit: (input: { signerName: string; signatureImage: string }) => Promise<void>;
}

export function SignForm({ id, subjectType, isSubmitting, onSubmit }: SignFormProps) {
  const [signerName, setSignerName] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);

  const isValid = Boolean(signature) && signerName.trim().length >= 2 && isAgreed;

  const handleSubmit = async () => {
    if (!signature || !isValid) {
      toast.error('Vui lòng nhập họ tên, ký tên và xác nhận đồng ý');
      return;
    }
    await onSubmit({ signerName: signerName.trim(), signatureImage: signature });
  };

  return (
    <section id={id} className="scroll-mt-4 space-y-3 rounded-2xl border-2 border-primary/30 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-primary">Ký xác nhận của Quý khách</h2>
      <Input label="Họ và tên người ký" value={signerName} onChange={(e) => setSignerName(e.target.value)} fullWidth />
      <SignaturePad label="Chữ ký" onChange={setSignature} />
      <label className="flex min-h-[44px] cursor-pointer items-start gap-2.5 py-1 text-xs text-stone-700">
        <input
          type="checkbox"
          checked={isAgreed}
          onChange={(e) => setIsAgreed(e.target.checked)}
          className="mt-0.5 size-5 shrink-0 accent-primary"
        />
        Tôi đã đọc và đồng ý với nội dung {SIGN_SUBJECT_LABEL[subjectType]} nêu trên.
      </label>
      <Button fullWidth loading={isSubmitting} disabled={!isValid} onClick={handleSubmit}>
        Xác nhận ký
      </Button>
    </section>
  );
}
