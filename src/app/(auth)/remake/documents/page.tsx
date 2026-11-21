'use client';

import { DocumentExplorer } from './_components/document-explorer';

// Tài liệu của tôi: thư mục, lưới/bảng, chuột phải, tải lên, chia sẻ.
export default function RemakeDocumentsPage() {
  return <DocumentExplorer tab="my" title="Tài liệu" description="Tài liệu và thư mục của bạn." />;
}
