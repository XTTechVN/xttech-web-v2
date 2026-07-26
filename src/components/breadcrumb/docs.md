# Breadcrumb Component

Thành phần thanh điều hướng phân cấp (Breadcrumb), hỗ trợ tùy biến dấu phân cách (separator), liên kết (Next.js Link), và các icon đi kèm.

## Quick Start

```tsx
import { Breadcrumb } from '@/components';
import { Home } from 'lucide-react';

const items = [
  { label: 'Trang chủ', href: '/', icon: <Home size={14} /> },
  { label: 'Cài đặt', href: '/settings' },
  { label: 'Cá nhân' },
];

<Breadcrumb items={items} />
```

## Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `items` | `BreadcrumbItem[]` | Có | Danh sách các phần tử điều hướng |
| `separator` | `React.ReactNode` | Không | Dấu phân cách giữa các phần tử (Mặc định: `<ChevronRight size={14} />`) |

## BreadcrumbItem API

| Thuộc tính | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `label` | `string` | Có | Nhãn tiêu đề hiển thị |
| `href` | `string` | Không | Đường dẫn liên kết (Nếu có sẽ sử dụng `next/link`) |
| `icon` | `React.ReactNode` | Không | Icon hiển thị bên trái của nhãn |
