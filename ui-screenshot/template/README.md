# UI mẫu (template) cho /remake

Nguồn: video `Ghim_tr_n_animations.mp4` (720×540, 24 giây), tách 1 khung/giây thành `frame-01.png` … `frame-24.png`.
Đây là bản **tham chiếu phong cách và chuyển động**, không phải thiết kế để chép nguyên (video là desktop, `/remake` làm mobile trước).

## Các khung

| Khung | Nội dung | Học được gì |
|-|----------|----------|
| 01 | Trang danh sách: sidebar trái, tiêu đề + tìm kiếm + người dùng ở đầu, 2 số liệu, tab gạch chân, thanh công cụ, bảng | Bố cục desktop, thứ bậc chữ, khối trắng viền mảnh, không bóng |
| 02–03 | Bấm dòng: dòng mở rộng, các dòng dưới đẩy xuống | Mở rộng tại chỗ, chuyển động mượt |
| 04–05 | Panel chi tiết trượt từ phải, nền mờ | Sheet/panel phải, scrim fade |
| 06–08 | Danh sách chọn mở trong panel | Lựa chọn nhỏ nằm trong panel, không dialog riêng |
| 09–12 | Panel thứ hai trượt chồng lên panel đầu | Chi tiết cấp 2 (chưa làm trong khung) |
| 13–19 | Hộp "Cash": nhập số tiền, nút chính đổi trạng thái khi bấm | Hộp xác nhận ngắn giữa màn, nút chính nổi bật |
| 20–21 | "Please wait" + skeleton | Trạng thái loading |
| 22–24 | "Payment success" | Trạng thái thành công, tóm tắt kết quả |

(Khoảng khung là ước lượng theo ảnh ghép, có thể lệch 1 khung.)

## Đã áp dụng trong khung `/remake`

| Mẫu trong video | Cách làm ở `/remake` |
|-|----------|
| Sidebar trái, logo + tên ở đầu | `_components/sidebar.tsx` (từ 768px), logo XTTech + tên doanh nghiệp |
| Tab gạch chân | `quotations-mock.tsx` (gạch trượt bằng `scaleX`) |
| Panel phải + scrim | `_components/sheet.tsx`: điện thoại trượt từ đáy, từ 768px panel phải |
| Skeleton / trống / lỗi | `_components/state-views.tsx` |
| Khối trắng viền mảnh, không bóng | token `rm-line`, `rounded-rm-xl` |

## Chưa áp dụng

Panel chồng cấp 2, hộp nhập số tiền, màn "thành công", mở rộng dòng tại chỗ. Cần thì làm khi có tính năng thật.

## Cách dùng khi làm trang mới

1. Mở `/remake` xem khung và trang mẫu; token ở `src/styles/remake.css` (màu chính `#045863` giữ từ xttech).
2. Danh sách: dùng mẫu `QuotationRow` (3 dòng gọn, chi tiết mở trong sheet).
3. Trang mới đặt trong `src/app/(auth)/remake/<tính-năng>/`, component để trong `_components/` cạnh trang.
