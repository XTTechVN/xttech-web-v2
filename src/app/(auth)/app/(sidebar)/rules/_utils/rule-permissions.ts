import type { DocumentItem } from '@/types';

export interface RuleActionContext {
  currentUserId: string;
  isManager: boolean; // super/admin/hr
}

export interface RuleAvailableActions {
  canEdit: boolean;
  canDelete: boolean;
  canSubmit: boolean;
  canReview: boolean;
  canPublish: boolean;
  canReplace: boolean;
  canAcknowledge: boolean;
  canPublishCompany: boolean;
}

const isSameUser = (a?: string | null, b?: string | null): boolean =>
  Boolean(a) && Boolean(b) && String(a) === String(b);

// Quyết định các thao tác khả dụng theo trạng thái văn bản + vai trò người dùng (đồng bộ với backend)
export const getRuleActions = (doc: DocumentItem, ctx: RuleActionContext): RuleAvailableActions => {
  const isCreator = isSameUser(doc.createdById, ctx.currentUserId);
  const isApprover = isSameUser(doc.approverId, ctx.currentUserId);

  const isDraft = doc.status === 'draft';
  const isPending = doc.status === 'pending';
  const isApproved = doc.status === 'approved';
  const isPublished = doc.status === 'published';

  const isUnapproved = isDraft || isPending;

  return {
    canEdit: isDraft && ctx.isManager && (isCreator || ctx.isManager),
    canDelete: ctx.isManager && (isUnapproved || ctx.isManager),
    canSubmit: isDraft && ctx.isManager && isCreator,
    canReview: isPending && ctx.isManager && !isCreator && isApprover,
    canPublish: isApproved && ctx.isManager,
    canReplace: isPublished && ctx.isManager,
    canAcknowledge:
      doc.canAcknowledge !== undefined
        ? doc.canAcknowledge
        : isPublished && Boolean(doc.requiresAcknowledgement) && doc.isAcknowledged === false && !isCreator,
    canPublishCompany: ctx.isManager,
  };
};
