'use client';

import { useState } from 'react';
import { Modal } from '@/components';
import { AutoTimekeepingSession } from './auto-timekeeping-session';

export interface AutoTimekeepingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  hasCheckedIn?: boolean;
}

export default function AutoTimekeepingModal({
  open,
  onClose,
  onSuccess,
  hasCheckedIn = false,
}: AutoTimekeepingModalProps) {
  const [prevOpen, setPrevOpen] = useState(open);
  const [sessionKey, setSessionKey] = useState(() => (open ? 1 : 0));
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSessionKey((k) => k + 1);
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={open}
      disabled={isSubmitting}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      title={
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {hasCheckedIn ? 'Chấm công Tan ca' : 'Chấm công Vào ca'}
          </span>
        </div>
      }
      size="md"
      className="md:max-w-lg"
      bodyClassName="!p-0 flex flex-col overflow-hidden"
    >
      <AutoTimekeepingSession
        key={sessionKey}
        isOpen={open}
        hasCheckedIn={hasCheckedIn}
        onClose={onClose}
        onSuccess={onSuccess}
        onSubmittingChange={setIsSubmitting}
      />
    </Modal>
  );
}
