'use client';

import { use } from 'react';
import { RoleList } from '../../../_components/role-list';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <RoleList orgId={Number(use(params).id)} />;
}
