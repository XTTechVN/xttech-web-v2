# Input Component

Thành phần ô nhập liệu văn bản (text input) tiêu chuẩn, hỗ trợ nhãn (label), thông báo lỗi (error), disabled state và căn chỉnh chiều rộng 100% (fullWidth).

## 1. Input Component

### Quick Start

```tsx
import { Input } from '@/components';

<Input
  label="Họ và tên"
  placeholder="Nhập họ và tên"
/>

<Input
  label="Mật khẩu"
  type="password"
  error="Mật khẩu phải tối thiểu 8 ký tự"
/>
```

### Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `label` | `string` | Không | Nhãn tiêu đề hiển thị phía trên input |
| `error` | `string` | Không | Thông báo lỗi hiển thị phía dưới input (kích hoạt viền đỏ) |
| `fullWidth` | `boolean` | Không | Kích hoạt chiều rộng 100% (Mặc định: `false`) |

---

## 2. CurrencyInput Component

Thành phần chuyên biệt kế thừa từ `Input` để xử lý và hiển thị số tiền theo định dạng VNĐ. Khi gõ, số tiền sẽ tự động thêm các dấu chấm phân cách hàng nghìn. Giá trị trả ra trong sự kiện `onChange` là số nguyên thô (`number`).

### Quick Start

```tsx
import { CurrencyInput } from '@/components';

// Dùng trực tiếp với state thường
const [price, setPrice] = useState<number>(0);
<CurrencyInput
  label="Đơn giá (VNĐ)"
  value={price}
  onChange={(val) => setPrice(val)}
/>

// Dùng trong React Hook Form kết hợp Controller
import { Controller } from 'react-hook-form';

<Controller
  name="price"
  control={control}
  render={({ field }) => (
    <CurrencyInput
      label="Đơn giá (VNĐ) *"
      placeholder="Nhập đơn giá"
      value={field.value}
      onChange={field.onChange}
      error={errors.price?.message}
    />
  )}
/>
```

### Props API Table

| Prop | Kiểu dữ liệu | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| `label` | `string` | Không | Nhãn tiêu đề hiển thị phía trên input |
| `error` | `string` | Không | Thông báo lỗi hiển thị phía dưới input (kích hoạt viền đỏ) |
| `fullWidth` | `boolean` | Không | Kích hoạt chiều rộng 100% |
| `value` | `number \| string` | Không | Giá trị số tiền thô ban đầu |
| `onChange` | `(value: number) => void` | Không | Sự kiện trả về giá trị số thô nguyên bản sau khi đã lược bỏ định dạng |
