# Tabs Component

Thành phần thanh tab chuyển đổi (tabs menu) nội dung, hỗ trợ 2 biến thể hiển thị (line gạch chân và pill bo tròn), các tab đi kèm icon và hỗ trợ khóa tab (disabled).

## Quick Start

```tsx
import { useState } from 'react';
import { Tabs } from '@/components';

export default function Demo() {
  const [active, setActive] = useState('tab1');

  const tabItems = [
    { value: 'tab1', label: 'Cơ bản' },
    { value: 'tab2', label: 'Bảo mật' },
    { value: 'tab3', label: 'Bị khóa', disabled: true },
  ];

  return (
    <Tabs
      tabs={tabItems}
      activeTab={active}
      onChange={(val) => setActive(val)}
    />
  );
}
```

## Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `tabs` | `TabItem[]` | Có | Danh sách các tab chuyển đổi |
| `activeTab` | `string` | Có | Giá trị của tab hiện tại đang hoạt động |
| `onChange` | `(value: string) => void` | Có | Callback khi người dùng chuyển đổi tab |
| `variant` | `'line' \| 'pill'` | Không | Biến thể hiển thị (Mặc định: `'line'`) |

## TabItem API

| Thuộc tính | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `value` | `string` | Có | Giá trị định danh của tab |
| `label` | `string` | Có | Nhãn tiêu đề của tab |
| `icon` | `React.ReactNode` | Không | Icon hiển thị bên trái của tab |
| `disabled` | `boolean` | Không | Trạng thái vô hiệu hóa tab (Mặc định: `false`) |
