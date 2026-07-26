# Button Component API Docs

Mã nguồn: [button.tsx](file:///home/trvv/workspace/xttech2/xttech-web-v2/src/components/button/button.tsx)

---

## 1. Quick Start

Cách tích hợp nhanh và sử dụng component Button:

```tsx
import { Button } from '@/components';
import { Plus } from 'lucide-react';

export default function Page() {
  return (
    <div className="flex gap-4">
      {/* Button mặc định */}
      <Button>Click me</Button>
      
      {/* Button có Icon và Loading */}
      <Button 
        variant="outline" 
        size="sm" 
        leftIcon={<Plus size={16} />}
      >
        Add Item
      </Button>
    </div>
  );
}
```

---

## 2. Props API Table

| Prop | Kiểu dữ liệu (Type) | Bắt buộc (Required?) | Giá trị mặc định (Default) | Mô tả (Description) |
| :--- | :--- | :--- | :--- | :--- |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | Không | `'primary'` | Kiểu style/theme hiển thị của button. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | Không | `'md'` | Kích thước của button. |
| `loading` | `boolean` | Không | `false` | Hiển thị hiệu ứng loading spinner và disable tương tác chuột. |
| `fullWidth` | `boolean` | Không | `false` | Chiếm 100% chiều rộng của container cha. |
| `leftIcon` | `React.ReactNode` | Không | `undefined` | Icon hiển thị bên trái của text. |
| `rightIcon` | `React.ReactNode` | Không | `undefined` | Icon hiển thị bên phải của text. |

*Ngoài ra, component kế thừa toàn bộ các props mặc định của thẻ `<button>` trong HTML.*

---

## 3. Examples

### Các loại kích thước (Sizes)
```tsx
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

### Các biến thể giao diện (Variants)
```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
```
