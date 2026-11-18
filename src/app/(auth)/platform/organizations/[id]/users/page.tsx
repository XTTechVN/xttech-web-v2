'use client';

import { use } from 'react';
import { UserList } from '../../../_components/user-list';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <UserList orgId={Number(use(params).id)} />;
}
