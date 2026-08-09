# Header Component

Thành phần thanh tiêu đề trên đầu (Header) cao cấp cho Dashboard, hỗ trợ căn chỉnh chiều cao cố định đồng bộ từ `src/config/ui.ts`, có sẵn ô tìm kiếm nhanh, các nút biểu tượng (thông báo, tin nhắn kèm badge số lượng), và vị trí chèn nút hành động tùy biến bên phải.

## Quick Start

```tsx
import { Header, Button } from '@/components';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function Page() {
  const [search, setSearch] = useState('');

  return (
    <Header
      title="Inventory"
      searchValue={search}
      onSearchChange={setSearch}
      notificationBadge={3}
      messageBadge="1"
      actionButton={
        <Button className="gap-1.5 h-10 bg-primary hover:bg-primary/90 text-white font-semibold">
          <Plus size={16} />
          Add New Product
        </Button>
      }
    />
  );
}
```

## Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `title` | `React.ReactNode` | Không | Tiêu đề chính hiển thị ở góc trái Header |
| `searchValue` | `string` | Không | Giá trị của ô nhập tìm kiếm |
| `onSearchChange` | `(val: string) => void` | Không | Callback sự kiện thay đổi giá trị ô nhập tìm kiếm (khi truyền prop này, ô tìm kiếm sẽ tự động hiển thị) |
| `searchPlaceholder`| `string` | Không | Văn bản gợi ý trong ô tìm kiếm (Mặc định: `'Search here...'`) |
| `notificationBadge`| `React.ReactNode` | Không | Số hoặc ký tự hiển thị vòng tròn đỏ thông báo (nếu có) |
| `messageBadge` | `React.ReactNode` | Không | Số hoặc ký tự hiển thị vòng tròn đỏ tin nhắn (nếu có) |
| `actionButton` | `React.ReactNode` | Không | React component nút bấm hành động tùy chỉnh nằm ở góc phải |
| `onNotificationClick`| `() => void` | Không | Sự kiện click vào nút thông báo |
| `onMessageClick` | `() => void` | Không | Sự kiện click vào nút tin nhắn |
| `...props` | `React.HTMLAttributes<HTMLElement>` | Không | Kế thừa các thuộc tính và sự kiện HTML cơ bản của thẻ `<header>` |
