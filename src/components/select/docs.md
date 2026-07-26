# Select Component

Thành phần dropdown select tùy chỉnh giao diện gốc, hỗ trợ nhãn (label), thông báo lỗi (error), danh sách tùy chọn (options) hoặc lồng thẻ `<option>` React truyền thống.

## Quick Start

```tsx
import { Select } from '@/components';

// Cách 1: Sử dụng prop options
const options = [
  { value: 'hn', label: 'Hà Nội' },
  { value: 'hcm', label: 'TP. Hồ Chí Minh' },
];

<Select
  label="Tỉnh / Thành phố"
  placeholder="Chọn tỉnh thành"
  options={options}
  onChange={(e) => console.log(e.target.value)}
/>

// Cách 2: Sử dụng children option truyền thống
<Select label="Giới tính" defaultValue="">
  <option value="" disabled hidden>Chọn giới tính</option>
  <option value="male">Nam</option>
  <option value="female">Nữ</option>
</Select>
```

## Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `label` | `string` | Không | Nhãn tiêu đề hiển thị phía trên select |
| `error` | `string` | Không | Thông báo lỗi hiển thị phía dưới select (kích hoạt viền đỏ) |
| `options` | `SelectOption[]` | Không | Danh sách các tùy chọn `{ value, label, disabled }` |
| `placeholder` | `string` | Không | Nhãn placeholder khi chưa chọn giá trị nào |
| `fullWidth` | `boolean` | Không | Kích hoạt chiều rộng 100% (mặc định: `false`) |

## Advanced Configurations

```typescript
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}
```
