# Lưu Ý Đồng Bộ Dữ Liệu: Editor & Preview Adapter

> [!IMPORTANT]
> **Quy tắc bắt buộc**: Mọi thay đổi về cấu trúc dữ liệu, tên trường hoặc logic tính toán ở **Editor** (hoặc **Backend Response**) đều bắt buộc phải được đồng bộ hóa (sync) với **Preview Adapter** (`adaptQuotationPreview`) và giao diện hiển thị (`QuotationTable`).
> Việc thiếu đồng bộ sẽ dẫn tới sai lệch dữ liệu hiển thị trên giao diện Live Preview hoặc gây lỗi runtime (do cấu hình build hiện tại bỏ qua bước kiểm tra kiểu dữ liệu tĩnh).

## Các điểm cần kiểm tra khi thay đổi dữ liệu

- **Đồng bộ hóa tên trường**:
  - Khi chuyển đổi hoặc cập nhật tên trường (Ví dụ: `totalAmount` -> `totalPrice`, hoặc bổ sung `totalArea`), phải cập nhật đồng bộ ở cả:
    1. Type definitions (`src/types/quotation.ts`).
    2. Logic ánh xạ trong Adapter (`adapter.ts`).
    3. Giao diện bảng (`quotation-table.tsx`).
- **Định dạng hiển thị**:
  - Đảm bảo các logic format đơn giá, thành tiền, ẩn/hiện cột số lượng và khối lượng cho các loại hàng mục phụ trợ (Phụ kiện, Tùy chọn, Công uốn vòm) đồng nhất giữa trạng thái lưu trữ của Editor và hiển thị của Preview.
- **Kiểm tra kiểu tĩnh (Type Checking)**:
  - Do build bỏ qua kiểm tra type, nhà phát triển bắt buộc phải chạy trình kiểm tra hoặc quan sát cảnh báo của IDE trong môi trường Dev để phát hiện lỗi kiểu dữ liệu trước khi bàn giao.
