# Select Component

Thành phần dropdown select tùy chỉnh giao diện (Combobox), hỗ trợ nhãn (label), thông báo lỗi (error), danh sách tùy chọn (options), và tự động kích hoạt tính năng tìm kiếm trực tiếp trên ô chọn khi danh sách có nhiều phần tử (> 10 items).

## Quick Start

```tsx
import { Select } from '@/components';

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
```

> [!NOTE]
> Khuyến khích truyền dữ liệu qua prop `options` thay vì lồng thẻ `<option>` children để đảm bảo tính năng tìm kiếm và giao diện custom hiển thị chính xác.

## Hướng dẫn sử dụng & Trải nghiệm người dùng

* **Tìm kiếm thông minh (Inline Search):** Khi danh sách `options` có độ dài **lớn hơn 10**, ô chọn sẽ tự động kích hoạt khả năng tìm kiếm. Khi click mở dropdown, người dùng có thể gõ trực tiếp từ bàn phím để lọc các tùy chọn.
* **Tương tác bàn phím (Keyboard Navigation):**
  * Nhấn `Enter` để chọn nhanh tùy chọn phù hợp đầu tiên trong danh sách lọc.
  * Nhấn `Escape` để huỷ bỏ thao tác nhập liệu và đóng nhanh dropdown.
* **Tương thích Form:** Đồng bộ dữ liệu ngầm với thẻ `<select>` ẩn và hỗ trợ đầy đủ `ref` để tương thích hoàn toàn với các thư viện quản lý form như `React Hook Form` hay sự kiện `onChange` tiêu chuẩn.

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
