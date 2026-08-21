# AppHeader Component

`AppHeader` là component Header điều hướng chính của toàn bộ hệ thống quản trị, tích hợp thanh tìm kiếm toàn cục, breadcrumb tự động theo route, thông báo và menu hồ sơ cá nhân (đổi mật khẩu, xem thông tin tài khoản, đăng xuất).

---

## 1. Quick Start

Tích hợp `AppHeader` vào layout hoặc trang quản trị:

```tsx
import { AppHeader } from '@/components';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader
        onMenuClick={() => setIsMobileOpen(true)}
        userRole="admin"
      />
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
```

---

## 2. Props API Table

### AppHeader Props

| Prop | Kiểu dữ liệu | Bắt buộc? | Mặc định | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| `onMenuClick` | `() => void` | Không | `undefined` | Callback kích hoạt khi bấm nút hamburger menu trên mobile. |
| `userRole` | `UserRole` (`'super' \| 'admin' \| 'hr' \| 'sale' \| 'technician'`) | Không | `undefined` | Quyền hạn của user hiện tại để lọc kết quả tìm kiếm và hiển thị vai trò. |
| `className` | `string` | Không | `undefined` | Class CSS bổ sung cho container header. |

---

## 3. Advanced Configurations

### Cấu trúc thành phần con:
- **`AppBreadcrumb`**: Tự động phân tích pathname và cấu trúc `rawSidebarSections` để render breadcrumb tương ứng.
- **`HeaderSearch`**: Ô tìm kiếm nhanh các chức năng dựa trên quyền truy cập (`userRole`) và hỗ trợ tìm kiếm tiếng Việt không dấu.
- **`HeaderProfile`**: Hiển thị avatar, tên, vai trò và dropdown chức năng: Đổi mật khẩu (`PasswordModal`), Thông tin cá nhân (`ProfileModal`), Đăng xuất.

---

## 4. Examples

### Cơ bản trong Sidebar Layout

```tsx
import React, { useState } from 'react';
import { AppHeader, Sidebar } from '@/components';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          onMenuClick={() => setIsMobileMenuOpen(true)}
          userRole="admin"
        />
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
```
