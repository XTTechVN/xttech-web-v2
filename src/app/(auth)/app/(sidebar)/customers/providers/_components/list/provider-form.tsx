'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createCustomerProvider, updateCustomerProvider } from '@/actions';
import { Input } from '@/components';
import type { CustomerProvider } from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';

export const PROVIDER_FORM_ID = 'provider-form';

interface Props {
  /** Có = sửa; không có = thêm mới */
  initial?: CustomerProvider;
  onDone: (provider: CustomerProvider) => void;
  onPendingChange: (pending: boolean) => void;
}

export function ProviderForm({ initial, onDone, onPendingChange }: Props) {
  const [code, setCode] = useState(initial?.code ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const touch = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: '' } : e));

  const save = useMutation({
    mutationFn: async () => {
      const data = { code: code.trim(), name: name.trim() };
      return initial ? updateCustomerProvider(initial.id, data) : createCustomerProvider(data);
    },
    onSuccess: (provider) => {
      queryClient.invalidateQueries({ queryKey: ['customer-providers'] });
      toast.success(initial ? 'Cập nhật nhà cung cấp thành công' : 'Thêm nhà cung cấp thành công');
      onDone(provider);
    },
    onError: (e) => showErrorToast(e, initial ? 'Không thể cập nhật nhà cung cấp' : 'Không thể thêm nhà cung cấp'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next: Record<string, string> = {};
    if (!code.trim()) next.code = 'Vui lòng nhập mã nhà cung cấp';
    if (!name.trim()) next.name = 'Vui lòng nhập tên nhà cung cấp';
    setErrors(next);
    if (Object.keys(next).length) return;
    onPendingChange(true);
    save.mutate(undefined, { onSettled: () => onPendingChange(false) });
  };

  return (
    <form id={PROVIDER_FORM_ID} onSubmit={submit} className="flex flex-col gap-4">
      <Input
        label="Mã nhà cung cấp *"
        placeholder="Ví dụ: NCC-01"
        fullWidth
        value={code}
        error={errors.code}
        onChange={(e) => {
          setCode(e.target.value);
          touch('code');
        }}
      />
      <Input
        label="Tên nhà cung cấp *"
        placeholder="Tên nhà cung cấp hoặc đối tác"
        fullWidth
        value={name}
        error={errors.name}
        onChange={(e) => {
          setName(e.target.value);
          touch('name');
        }}
      />
    </form>
  );
}
