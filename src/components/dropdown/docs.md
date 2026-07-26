# Dropdown Component

Thành phần dropdown menu thả xuống, hỗ trợ tùy biến nút kích hoạt (trigger), căn lề (align), các tùy chọn có icon, trạng thái vô hiệu hóa (disabled) và nguy hiểm (danger).

## Quick Start

```tsx
import { Dropdown, Button } from '@/components';
import { Settings, User, LogOut } from 'lucide-react';

const menuItems = [
  {
    label: 'Hồ sơ cá nhân',
    icon: <User size={16} />,
    onClick: () => console.log('Profile'),
  },
  {
    label: 'Cài đặt tài khoản',
    icon: <Settings size={16} />,
    onClick: () => console.log('Settings'),
  },
  {
    label: 'Đăng xuất',
    icon: <LogOut size={16} />,
    danger: true,
    onClick: () => console.log('Logout'),
  },
];

<Dropdown
  trigger={<Button>Tài khoản</Button>}
  items={menuItems}
  align="right"
/>
```

## Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `trigger` | `React.ReactNode` | Có | Element kích hoạt hiển thị dropdown menu khi click |
| `items` | `DropdownItemProps[]` | Có | Danh sách tùy chọn hiển thị trong menu dropdown |
| `align` | `'left' \| 'right'` | Không | Căn lề của menu so với trigger (Mặc định: `'left'`) |
| `triggerOn` | `'click' \| 'hover'` | Không | Phương thức kích hoạt mở dropdown (Mặc định: `'click'`) |

## DropdownItemProps API

| Thuộc tính | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `label` | `string` | Có | Tên tùy chọn hiển thị |
| `onClick` | `() => void` | Không | Sự kiện click vào tùy chọn |
| `disabled` | `boolean` | Không | Trạng thái vô hiệu hóa tùy chọn (Mặc định: `false`) |
| `danger` | `boolean` | Không | Trạng thái tùy chọn cảnh báo/nguy hiểm (Mặc định: `false`) |
| `icon` | `React.ReactNode` | Không | Icon hiển thị bên trái của tùy chọn |
