# Modal Component (Modal Shell)

Thành phần Modal chung (Modal Shell) quản lý phần khung bọc bên ngoài (lớp nền mờ backdrop, vị trí ở giữa màn hình, hiệu ứng mượt mà, khóa cuộn trang, đóng khi bấm ESC hoặc bấm ra ngoài).

Nội dung nghiệp vụ chi tiết sẽ được các trang truyền vào thông qua `children`, `title` và `footer`.

## Quick Start

```tsx
import { useState } from 'react';
import { Modal, Button } from '@/components';

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Mở Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Thông tin tài khoản"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={() => setIsOpen(false)}>Xác nhận</Button>
          </>
        }
      >
        <p>Đây là phần nội dung truyền từ trang riêng vào children.</p>
      </Modal>
    </>
  );
}
```

## Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `isOpen` | `boolean` | Có | Trạng thái hiển thị mở/đóng của Modal |
| `onClose` | `() => void` | Có | Callback đóng Modal |
| `title` | `React.ReactNode` | Không | Tiêu đề hiển thị ở Header |
| `children` | `React.ReactNode` | Có | Nội dung hiển thị bên trong Body của Modal |
| `footer` | `React.ReactNode` | Không | Thanh chức năng (các Button) hiển thị dưới cùng của Modal |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | Không | Độ rộng tối đa của Modal (Mặc định: `'md'`) |
| `closeOnOverlayClick` | `boolean` | Không | Cho phép đóng modal khi click ra ngoài backdrop (Mặc định: `true`) |
| `disabled` | `boolean` | Không | Vô hiệu hóa đóng modal khi nhấn ESC, click backdrop hoặc bấm nút X (Mặc định: `false`) |
