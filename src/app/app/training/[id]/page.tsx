'use client';

import { use } from 'react';
import { Suspense } from 'react';
import LabelCanvas from './_components/LabelCanvas';
import LoadingScreen from '@/components/loading/LoadingScreen';

export default function LabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<LoadingScreen animate />}>
      <LabelCanvas imageId={id} />
    </Suspense>
  );
}
