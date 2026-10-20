'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  acknowledgeDocument,
  deleteDocument,
  publishDocument,
  reviewDocument,
  submitDocument,
} from '@/actions/document';
import type { PublishDocumentPayload } from '@/types';
import { invalidateDocumentQueries } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-query-keys';
import { RULES_QUERY_KEYS } from '../_utils/rules-constants';

interface UseRuleActionsOptions {
  onDone?: () => void;
}

// Gom toàn bộ mutation nghiệp vụ của cơ chế: gửi duyệt, duyệt/từ chối, ban hành, xác nhận, xóa
export function useRuleActions({ onDone }: UseRuleActionsOptions = {}) {
  const queryClient = useQueryClient();

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: RULES_QUERY_KEYS.root });
    invalidateDocumentQueries(queryClient);
    onDone?.();
  };

  const onError = (error: Error) => {
    toast.error(error.message);
  };

  const submitMutation = useMutation({
    mutationFn: ({ id, approverId }: { id: number; approverId: string }) => submitDocument(id, { approverId }),
    onSuccess: () => {
      toast.success('Đã gửi văn bản đi phê duyệt');
      refreshAll();
    },
    onError,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, isApproved, note }: { id: number; isApproved: boolean; note?: string }) =>
      reviewDocument(id, { approvalStatus: isApproved ? 'approved' : 'rejected', approvalNote: note }),
    onSuccess: (_, variables) => {
      toast.success(variables.isApproved ? 'Đã phê duyệt văn bản' : 'Đã từ chối, văn bản được trả về bản nháp');
      refreshAll();
    },
    onError,
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PublishDocumentPayload }) => publishDocument(id, payload),
    onSuccess: () => {
      toast.success('Đã ban hành văn bản');
      refreshAll();
    },
    onError,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id: number) => acknowledgeDocument(id),
    onSuccess: () => {
      toast.success('Đã xác nhận đã đọc và hiểu');
      refreshAll();
    },
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDocument(id),
    onSuccess: () => {
      toast.success('Đã xóa bản nháp');
      refreshAll();
    },
    onError,
  });

  return {
    submitMutation,
    reviewMutation,
    publishMutation,
    acknowledgeMutation,
    deleteMutation,
    refreshAll,
  };
}
