'use client';

import { useState } from 'react';
import { Button, Input, Modal } from '@/components';

export type RoleNameMode = { kind: 'create' } | { kind: 'rename'; name: string } | { kind: 'clone'; name: string };

const TITLES = { create: 'Tạo vai trò', rename: 'Đổi tên vai trò', clone: 'Nhân bản vai trò' };

// Một khung dùng chung cho tạo / đổi tên / nhân bản
export const RoleNameModal = ({
  mode,
  loading,
  error,
  onSubmit,
  onClose,
}: {
  mode: RoleNameMode | null;
  loading: boolean;
  error?: string;
  onSubmit: (name: string) => void;
  onClose: () => void;
}) => {
  // Cha gắn `key` mới mỗi lần mở nên giá trị ban đầu luôn đúng
  const [name, setName] = useState(mode?.kind === 'create' || !mode ? '' : mode.kind === 'clone' ? `${mode.name} (bản sao)` : mode.name);

  return (
    <Modal isOpen={!!mode} onClose={onClose} title={mode ? TITLES[mode.kind] : ''} size="sm">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onSubmit(name.trim());
        }}
      >
        <Input label="Tên vai trò" value={name} onChange={(e) => setName(e.target.value)} error={error} maxLength={100} autoFocus className="h-11" />
        <Button type="submit" loading={loading} disabled={!name.trim()} fullWidth className="h-11">
          Lưu
        </Button>
      </form>
    </Modal>
  );
};
