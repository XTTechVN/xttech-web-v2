import { cn } from '@/utils/cn';
import { STATUS_LABEL, type MockStatus } from '../_mock/mock-quotations';

const TONE: Record<MockStatus, string> = {
  draft: 'bg-rm-bg text-rm-muted',
  pending: 'bg-rm-warning-soft text-rm-warning',
  approved: 'bg-rm-success-soft text-rm-success',
  rejected: 'bg-rm-danger-soft text-rm-danger',
};

export function StatusBadge({ status }: { status: MockStatus }) {
  return (
    <span className={cn('inline-block max-w-full truncate rounded-rm-sm px-2 py-0.5 text-xs font-medium', TONE[status])}>{STATUS_LABEL[status]}</span>
  );
}
