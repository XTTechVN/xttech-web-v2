'use client';

import { DocumentExplorer } from '../documents/_components/document-explorer';

// Tài liệu và thư mục được chia sẻ cho tôi; mở ra là tự đánh dấu đã đọc.
export default function RemakeInboxPage() {
  return <DocumentExplorer tab="shared" title="Được chia sẻ" description="Tài liệu và thư mục người khác gửi cho bạn." />;
}
