# Alert Component

Thành phần hiển thị dải banner thông báo lỗi, cảnh báo hoặc thành công (Alert/Inline Notification) cố định trên giao diện, hỗ trợ 4 trạng thái màu, nút tắt ẩn đi (close), icons tùy chỉnh và hiển thị tiêu đề kèm mô tả.

## Quick Start

```tsx
import { Alert } from '@/components';

<Alert variant="success" title="Đăng ký thành công">
  Chúng tôi đã gửi email xác minh đến hòm thư của bạn.
</Alert>

<Alert
  variant="danger"
  title="Lỗi máy chủ"
  onClose={() => console.log('Closed')}
>
  Không thể kết nối đến cơ sở dữ liệu. Vui lòng thử lại sau.
</Alert>
```

## Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `variant` | `'success' \| 'warning' \| 'danger' \| 'info'` | Không | Phân loại trạng thái màu sắc của thông báo (Mặc định: `'info'`) |
| `title` | `React.ReactNode` | Không | Tiêu đề in đậm của thông báo |
| `icon` | `React.ReactNode` | Không | Icon hiển thị bên trái. Nếu không truyền sẽ tự động hiển thị theo `variant` mặc định |
| `onClose` | `() => void` | Không | Nếu được định nghĩa, hiển thị nút `X` đóng thông báo ở góc phải |
