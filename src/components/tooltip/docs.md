# Tooltip Component

Thành phần tooltip hiển thị chú thích nhỏ khi hover chuột vào phần tử, hỗ trợ 4 hướng căn chỉnh (top, bottom, left, right) và độ trễ hiển thị (delay).

## Quick Start

```tsx
import { Tooltip, Button } from '@/components';

<Tooltip content="Đây là thông tin bổ sung" position="top">
  <Button>Hover Me</Button>
</Tooltip>
```

## Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `content` | `React.ReactNode` | Có | Nội dung chú thích hiển thị trong Tooltip |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | Không | Hướng hiển thị của Tooltip so với phần tử (Mặc định: `'top'`) |
| `delay` | `number` | Không | Độ trễ hiển thị tính bằng milisecond (Mặc định: `0`) |
| `className` | `string` | Không | Custom className cho Tooltip |
