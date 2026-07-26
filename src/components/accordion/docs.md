# Accordion Component

Thành phần xếp gọn nội dung (Accordion/Collapse), hỗ trợ hoạt ảnh đóng mở mượt mà (Framer Motion), thiết lập mở đồng thời nhiều phần tử hoặc chỉ mở tối đa một phần tử.

## Quick Start

```tsx
import { Accordion } from '@/components';

const items = [
  {
    id: 'faq1',
    title: 'Làm thế nào để đổi mật khẩu?',
    content: 'Bạn truy cập vào trang Cấu hình tài khoản, chọn tab Bảo mật và bấm Đổi mật khẩu.'
  },
  {
    id: 'faq2',
    title: 'XTTech có hỗ trợ API không?',
    content: 'Có, chúng tôi hỗ trợ đầy đủ RESTful API cho lập trình viên tích hợp hệ thống.'
  }
];

// Mặc định chỉ mở tối đa 1 phần tử
<Accordion items={items} />

// Cho phép mở nhiều phần tử cùng lúc
<Accordion items={items} allowMultiple />
```

## Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `items` | `AccordionItemProps[]` | Có | Danh sách các câu hỏi/nội dung xếp gọn |
| `allowMultiple` | `boolean` | Không | Cho phép mở nhiều phần tử đồng thời (Mặc định: `false`) |
| `defaultExpandedIds` | `string[]` | Không | Danh sách các `id` phần tử được mở sẵn khi tải trang (Mặc định: `[]`) |

## AccordionItemProps API

| Thuộc tính | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Có | Định danh duy nhất cho từng phần tử |
| `title` | `React.ReactNode` | Có | Tiêu đề hiển thị của thanh bấm |
| `content` | `React.ReactNode` | Có | Nội dung hiển thị khi mở rộng phần tử |
