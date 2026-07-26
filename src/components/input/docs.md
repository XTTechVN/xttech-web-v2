# Input Component

Thành phần ô nhập liệu văn bản (text input) tiêu chuẩn, hỗ trợ nhãn (label), thông báo lỗi (error), disabled state và căn chỉnh chiều rộng 100% (fullWidth).

## Quick Start

```tsx
import { Input } from '@/components';

<Input
  label="Họ và tên"
  placeholder="Nhập họ và tên"
/>

<Input
  label="Mật khẩu"
  type="password"
  error="Mật khẩu phải tối thiểu 8 ký tự"
/>
```

## Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `label` | `string` | Không | Nhãn tiêu đề hiển thị phía trên input |
| `error` | `string` | Không | Thông báo lỗi hiển thị phía dưới input (kích hoạt viền đỏ) |
| `fullWidth` | `boolean` | Không | Kích hoạt chiều rộng 100% (Mặc định: `false`) |
