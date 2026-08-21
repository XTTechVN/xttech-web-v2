'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function DepartmentIndexPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params.id) {
      router.replace(`/app/departments/${params.id}/positions`);
    }
  }, [params.id, router]);

  return null;
}