'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { signAcceptanceOnsite } from '@/actions';
import { Button, Modal } from '@/components';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import type { ProjectAcceptance, SignatureInput } from '@/types';
import { SignatureFields } from '../../shared';

interface CustomerSignModalProps {
  projectId: number;
  acceptance: ProjectAcceptance | null;
  onClose: () => void;
}

export function CustomerSignModal({ projectId, acceptance, onClose }: CustomerSignModalProps) {
  return (
    <Modal
      isOpen={!!acceptance}
      onClose={onClose}
      title={`Khách ký biên bản ${acceptance?.code ?? ''}`}
      className="max-w-lg w-full"
    >
      {acceptance && <CustomerSignForm projectId={projectId} acceptance={acceptance} onClose={onClose} />}
    </Modal>
  );
}

function CustomerSignForm({
  projectId,
  acceptance,
  onClose,
}: {
  projectId: number;
  acceptance: ProjectAcceptance;
  onClose: () => void;
}) {
  const [signature, setSignature] = useState<SignatureInput | null>(null);

  const sign = useMutation({
    mutationFn: () => signAcceptanceOnsite(projectId, acceptance.id, signature as SignatureInput),
    onSuccess: () => {
      ['project_acceptances', 'progress_matrix', 'project_positions', 'project', 'project_overview', 'project_warranty'].forEach(
        (key) => queryClient.invalidateQueries({ queryKey: [key, projectId] }),
      );
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Đã đủ chữ ký 2 bên, các cửa đã được nghiệm thu');
      onClose();
    },
    onError: (error) => showErrorToast(error, 'Không ký được biên bản'),
  });

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Nghiệm thu {acceptance.positionCodes.length} bộ cửa: {acceptance.positionCodes.join(', ')}
      </p>
      <SignatureFields title="Khách hàng ký xác nhận" defaultTitle="Chủ nhà" onChange={setSignature} />
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
        <Button size="sm" disabled={!signature} loading={sign.isPending} onClick={() => sign.mutate()}>
          Xác nhận ký
        </Button>
      </div>
    </div>
  );
}
