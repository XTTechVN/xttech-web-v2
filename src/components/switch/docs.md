# Switch Component (Toggle Switch)

Thành phần công tắc gạt (switch) Bật/Tắt trạng thái nhanh, sử dụng màu sắc đồng bộ theo màu primary thương hiệu.

## Quick Start

```tsx
import { Switch } from '@/components';

<Switch
  label="Bật thông báo đẩy"
  onChange={(e) => console.log(e.target.checked)}
/>

<Switch
  label="Chế độ nhà phát triển"
  defaultChecked
/>
```

## Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `label` | `string` | Không | Nhãn tiêu đề hiển thị bên cạnh công tắc gạt |
