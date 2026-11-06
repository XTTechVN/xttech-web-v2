'use client';

import React from 'react';
import { Modal } from '@/components';
import type { ProfileBar, Brand } from '@/types';
import { ProfileBarForm } from './profile-bar-form';

interface ProfileBarModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileBar?: ProfileBar | null;
  isCopy?: boolean;
  brands: Brand[];
  defaultBrandId: number | null;
}

export function ProfileBarModal({ isOpen, onClose, profileBar, isCopy = false, brands, defaultBrandId }: ProfileBarModalProps) {
  const isEdit = Boolean(profileBar) && !isCopy;
  const title = isEdit ? 'Sửa profile nhôm' : isCopy ? 'Sao chép profile nhôm' : 'Thêm profile nhôm';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title={title}>
      <ProfileBarForm
        key={isOpen ? `${profileBar?.id ?? 'new'}-${isCopy}` : 'closed'}
        isOpen={isOpen}
        onClose={onClose}
        profileBar={profileBar ?? null}
        isCopy={isCopy}
        brands={brands}
        defaultBrandId={defaultBrandId}
      />
    </Modal>
  );
}
