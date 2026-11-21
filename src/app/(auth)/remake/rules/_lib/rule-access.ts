import type { DocumentItem } from '@/types';

export interface RuleCtx {
  userId: string;
  /** document:publish — ban hành đến mọi người, sửa/xoá văn bản của người khác */
  isPublisher: boolean;
  canApprove: boolean;
  canDelete: boolean;
}

const same = (a?: string | null, b?: string | null) => Boolean(a) && Boolean(b) && String(a) === String(b);

// Thao tác khả dụng theo trạng thái văn bản + quyền (khớp backend): ẩn khi không bao giờ có quyền, còn lại do API kiểm.
export function ruleActions(d: DocumentItem, c: RuleCtx) {
  const creator = same(d.createdById, c.userId);
  const draft = d.status === 'draft';
  const pending = d.status === 'pending';
  const approved = d.status === 'approved';
  const published = d.status === 'published';
  return {
    canEdit: draft && c.isPublisher,
    canDelete: (draft && creator) || (c.canDelete && c.isPublisher),
    canSubmit: draft && c.isPublisher,
    canReview: pending && c.canApprove && !creator && same(d.approverId, c.userId),
    canPublish: (approved || draft || pending) && c.isPublisher,
    canReplace: published && c.isPublisher,
    canAcknowledge: d.canAcknowledge ?? (published && Boolean(d.requiresAcknowledgement) && d.isAcknowledged === false && !creator),
  };
}
