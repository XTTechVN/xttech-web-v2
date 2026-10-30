'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDocumentExplorer } from '@/hooks';
import { DocumentExplorerPageLayout } from '@/components/documents';

function MyDocumentsContent({ tab }: { tab: string }) {
  const explorer = useDocumentExplorer({ tab });
  return <DocumentExplorerPageLayout explorer={explorer} />;
}

function MyDocumentsPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'my';

  return <MyDocumentsContent key={tab} tab={tab} />;
}

export default function MyDocumentsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col min-w-0 h-full overflow-hidden bg-white select-none items-center justify-center text-slate-500 text-xs">
          Đang tải dữ liệu...
        </div>
      }
    >
      <MyDocumentsPageContent />
    </Suspense>
  );
}
