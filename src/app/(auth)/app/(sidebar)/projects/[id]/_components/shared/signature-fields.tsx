'use client';

import React, { useEffect, useState } from 'react';
import { Input, SignaturePad } from '@/components';
import type { SignatureInput } from '@/types';

interface SignatureFieldsProps {
  title: string;
  defaultTitle?: string;
  onChange: (signature: SignatureInput | null) => void;
}

/** Họ tên + chức danh + ô ký tay; chỉ trả về chữ ký khi đã đủ thông tin. */
export function SignatureFields({ title, defaultTitle, onChange }: SignatureFieldsProps) {
  const [signerName, setSignerName] = useState('');
  const [signerTitle, setSignerTitle] = useState(defaultTitle ?? '');
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    onChange(
      image && signerName.trim().length >= 2
        ? { signerName: signerName.trim(), signerTitle: signerTitle.trim() || undefined, signatureImage: image }
        : null,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signerName, signerTitle, image]);

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 p-3">
      <div className="text-xs font-bold text-slate-800">{title}</div>
      <div className="grid grid-cols-2 gap-2">
        <Input label="Họ tên" value={signerName} onChange={(e) => setSignerName(e.target.value)} fullWidth />
        <Input label="Chức danh" value={signerTitle} onChange={(e) => setSignerTitle(e.target.value)} fullWidth />
      </div>
      <SignaturePad onChange={setImage} />
    </div>
  );
}
