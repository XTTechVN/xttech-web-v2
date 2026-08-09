# Badge Component

Thành phần hiển thị nhãn trạng thái (badge/tag), hỗ trợ 6 màu sắc trạng thái, 3 cấp kích thước và 2 kiểu bo góc (rounded và pill).

## Quick Start

```tsx
import { Badge } from '@/components';

<Badge variant="success">Hoàn thành</Badge>

<Badge variant="danger" pill>Thất bại</Badge>

<Badge variant="primary" size="sm">Mới</Badge>
```

## Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `variant` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | Không | Màu sắc của Badge (Mặc định: `'default'`) |
| `size` | `'sm' \| 'md' \| 'lg'` | Không | Kích thước của Badge (Mặc định: `'md'`) |
| `pill` | `boolean` | Không | Chuyển đổi bo tròn góc hoàn toàn dạng pill (Mặc định: `false`) |
