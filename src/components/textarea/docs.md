# Textarea Component

Thành phần ô nhập liệu văn bản dài nhiều dòng (textarea) tiêu chuẩn, hỗ trợ nhãn (label), thông báo lỗi (error), disabled state và tùy chỉnh số dòng mặc định hiển thị (rows).

## Quick Start

```tsx
import { Textarea } from '@/components';

<Textarea
  label="Mô tả dự án"
  placeholder="Nhập mô tả chi tiết của dự án..."
  rows={5}
/>

<Textarea
  label="Ghi chú thêm"
  error="Nội dung ghi chú không được vượt quá 500 ký tự."
/>
```

## Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `label` | `string` | Không | Nhãn tiêu đề hiển thị phía trên textarea |
| `error` | `string` | Không | Thông báo lỗi hiển thị phía dưới textarea (kích hoạt viền đỏ) |
| `fullWidth` | `boolean` | Không | Kích hoạt chiều rộng 100% (Mặc định: `false`) |
| `rows` | `number` | Không | Số lượng dòng hiển thị tối thiểu mặc định (Mặc định: `4`) |
