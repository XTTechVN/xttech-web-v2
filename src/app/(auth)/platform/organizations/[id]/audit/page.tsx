'use client';

import { use } from 'react';
import { AuditList } from '../../../_components/audit-list';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <AuditList orgId={Number(use(params).id)} />;
}
