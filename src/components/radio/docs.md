# Radio Component

Thành phần nút chọn một (radio button) trong danh sách nhóm, thiết kế hình tròn (`rounded-full`) và màu sắc đồng bộ theo màu primary thương hiệu.

## Quick Start

```tsx
import { Radio } from '@/components';

<div className="flex flex-col gap-2">
  <Radio
    name="gender"
    label="Nam"
    value="male"
    defaultChecked
  />
  <Radio
    name="gender"
    label="Nữ"
    value="female"
  />
</div>
```

## Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `label` | `string` | Không | Nhãn tiêu đề hiển thị bên cạnh nút chọn |
| `error` | `string` | Không | Thông báo lỗi hiển thị phía dưới radio |
