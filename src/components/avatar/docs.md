# Avatar Component

Thành phần hiển thị ảnh đại diện đại diện cho người dùng, hỗ trợ tự động hiển thị chữ cái viết tắt của tên (initials) khi không có ảnh hoặc ảnh bị lỗi, tùy chọn các kích thước, bo góc/tròn, và hiển thị trạng thái hoạt động (status indicator).

## Quick Start

```tsx
import { Avatar } from '@/components';

// Hiển thị ảnh đại diện mặc định
<Avatar src="https://example.com/avatar.jpg" name="Nguyễn Văn A" />

// Hiển thị chữ cái viết tắt khi không có ảnh (hiển thị "NV")
<Avatar name="Nguyễn Văn A" size="lg" />

// Hiển thị trạng thái hoạt động
<Avatar name="Trần Thị B" status="online" />
```

## Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `src` | `string` | Không | Đường dẫn ảnh đại diện |
| `alt` | `string` | Không | Mô tả ảnh đại diện (Mặc định: khớp theo `name`) |
| `name` | `string` | Không | Tên hiển thị (dùng để tự động tính toán chữ cái viết tắt nếu không có ảnh) |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | Không | Kích thước của Avatar (Mặc định: `'md'`) |
| `shape` | `'circle' \| 'square'` | Không | Hình dạng của Avatar (Mặc định: `'circle'`) |
| `status` | `'online' \| 'offline' \| 'away' \| 'busy'` | Không | Trạng thái hoạt động hiển thị dưới dạng chấm tròn góc dưới bên phải |
