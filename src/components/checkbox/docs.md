# Checkbox Component

Thành phần hộp kiểm (checkbox) cho phép chọn một hoặc nhiều lựa chọn, thiết kế bo góc nhỏ (`rounded-sm` - 2px) và màu sắc đồng bộ theo màu primary thương hiệu.

## Quick Start

```tsx
import { Checkbox } from '@/components';

<Checkbox
  label="Tôi đồng ý với điều khoản dịch vụ"
  onChange={(e) => console.log(e.target.checked)}
/>

<Checkbox
  label="Đăng ký nhận tin tức"
  defaultChecked
/>
```

## Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `label` | `string` | Không | Nhãn tiêu đề hiển thị bên cạnh hộp kiểm |
| `error` | `string` | Không | Thông báo lỗi hiển thị phía dưới checkbox |
