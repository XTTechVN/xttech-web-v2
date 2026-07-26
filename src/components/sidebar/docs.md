# Sidebar Component

Thành phần thanh điều hướng bên (Sidebar) cao cấp cho Dashboard, hỗ trợ cấu hình động qua JSON, chuyển đổi thu gọn/mở rộng, phân chia Section, nhóm con Sub-items (kèm nét vẽ cây phân cấp), khối Profile người dùng, và thẻ quảng bá (CTA Card) ở chân trang.

## Quick Start

```tsx
import { useState } from 'react';
import { Sidebar } from '@/components';
import { LayoutDashboard, FileText, Wallet, Bell, Shield, LifeBuoy } from 'lucide-react';

export default function Layout() {
  const [activeId, setActiveId] = useState('dashboard-activity');

  const sections = [
    {
      title: 'Feature',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard size={18} />,
          subItems: [
            { id: 'dashboard-activity', label: 'Activity' },
            { id: 'dashboard-traffic', label: 'Traffic' },
            { id: 'dashboard-statistic', label: 'Statistic' },
          ],
        },
        {
          id: 'invoices',
          label: 'Invoices',
          icon: <FileText size={18} />,
        },
      ],
    },
  ];

  return (
    <Sidebar
      sections={sections}
      activeId={activeId}
      onItemSelect={(id) => setActiveId(id)}
      user={{
        name: 'Andrew Smith',
        role: 'PRODUCT DESIGNER',
        avatar: '/avatar.jpg',
      }}
    />
  );
}
```

## Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `sections` | `SidebarSectionProps[]` | Có | Danh sách cấu hình các phần và các liên kết điều hướng |
| `activeId` | `string` | Không | ID của phần tử đang được chọn hoạt động |
| `onItemSelect` | `(id: string) => void` | Không | Callback khi nhấn chọn các item hoặc sub-item |
| `user` | `{ name: string; role: string; avatar: string; }` | Không | Cấu hình khối thông tin người dùng ở đầu Sidebar |
| `cta` | `{ title: string; description: string; buttonText: string; onButtonClick?: () => void; }` | Không | Cấu hình thẻ kêu gọi hành động (CTA Card) dưới cùng |
