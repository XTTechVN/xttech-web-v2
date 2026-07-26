# Heading Component

Thành phần tiêu đề chuẩn hóa kích thước chữ (typography) và độ đậm theo quy chuẩn Design System.

## Quick Start

```tsx
import { Heading } from '@/components';

<Heading size="h1">Tiêu đề Trang chính</Heading>
<Heading size="h2" as="h1">Tiêu đề h2 render dưới thẻ h1</Heading>
```

## Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `size` | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6'` | Không | Kích thước chữ theo token (Mặc định: `'h2'`) |
| `as` | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6' \| 'span'` | Không | Thẻ HTML thực tế sẽ được render (Mặc định: khớp theo `size`) |
