# Danh Sách Tính Năng Cần Phát Triển: Vòng Đời Báo Giá -> Hợp Đồng -> Thanh Toán

Tài liệu bóc tách từ `quotation_contract_lifecycle_guide.md` để triển khai trên Frontend (`xttech-web-v2`).

---

## 1. Tab Báo Giá (`TabQuotations`) - Trải Nghiệm Báo Giá Duy Nhất (Single Living Quotation)

- [ ] **Giao diện cấu hình thông số thương mại 1 lần duy nhất:**
  - [ ] Nhóm đơn giá nhân công: Sản xuất, Lắp đặt, Vệ sinh (`laborProductionRate`, `laborInstallRate`, `laborCleanRate`).
  - [ ] Nhóm tỷ lệ phần trăm: Chi phí quản lý (`managementRatePercent`), Lợi nhuận (`markupPercent`), Thuế VAT (`vatPercent`), Chiết khấu (`discountPercent`).
  - [ ] Chế độ bóc tách phụ kiện (`combined` / `separated`).
- [ ] **Tính thử giá Real-time (Live Preview):**
  - [ ] Gọi `POST /api/v1/projects/{projectId}/quotations/preview` khi thay đổi thông số trên form.
  - [ ] Hiển thị bảng cơ cấu giá chi tiết: Tiền vật tư, nhân công, giá xuất xưởng, lợi nhuận, VAT và tổng tiền dự kiến.
- [ ] **Lưu Báo giá chính thức của dự án:**
  - [ ] Lần đầu: Gọi `POST /api/v1/projects/{projectId}/quotations` -> Hệ thống tự động đặt `isSelected = true`, sinh mã `BG-YYYY-XXXX` v1.
  - [ ] Cập nhật khi chưa ký hợp đồng: Gọi `PUT /api/v1/projects/{projectId}/quotations/{id}`.
  - [ ] Loại bỏ hoàn toàn cơ chế chuyển đổi qua lại giữa các phương án (PA1, PA2) rườm rà.
- [ ] **Xử lý trạng thái khóa khi đã ký Hợp đồng:**
  - [ ] Kiểm tra cờ `isLocked === true` (hoặc `status === 'accepted'`).
  - [ ] Khóa các trường chỉnh sửa đơn giá/tỷ lệ trên form, hiển thị badge "Đã khóa theo HĐ".
- [ ] **Cảnh báo Báo giá lỗi thời (Outdated Banner):**
  - [ ] Gọi `GET /api/v1/projects/{projectId}/quotations/active`.
  - [ ] Kiểm tra cờ `isOutdated === true`.
  - [ ] Hiển thị Banner cảnh báo nổi bật: Hiển thị lý do `outdatedReason` và thống kê `diffSummary` (số cửa thêm mới, sửa, xóa).
- [ ] **Hành động Đồng bộ 1-Click (`Sync Quotation`):**
  - [ ] Nút bấm "Đồng bộ lại báo giá mới" trên banner cảnh báo.
  - [ ] Gọi `POST /api/v1/projects/{projectId}/quotations/sync` (payload rỗng `{}` hoặc kèm ghi chú).
  - [ ] Hệ thống tự động kế thừa 100% thông số cũ, tự động sinh version v2 và chuyển `isSelected = true` sang bản mới.
  - [ ] Tự động ẩn banner cảnh báo sau khi đồng bộ thành công.
- [ ] **Xem lịch sử phiên bản báo giá (Version History Drawer / Dropdown):**
  - [ ] Cho phép xem lại các bản báo giá cũ (v1, v2...) kèm trạng thái (đã chốt theo HĐ nào).

---

## 2. Tab Hợp Đồng (`TabContracts`) - Quản Lý Hợp Đồng & Kế Thừa Tài Chính

- [ ] **Tạo Hợp đồng chính lần đầu:**
  - [ ] Modal lập hợp đồng mới (`POST /api/v1/projects/{projectId}/contracts`).
  - [ ] Tự động liên kết Báo giá đang active (không cần chọn lại báo giá).
  - [ ] Thiết lập các đợt thanh toán (Milestones): Mặc định gợi ý 3 đợt (40% Ký HĐ - 40% Giao hàng - 20% Quyết toán) kèm tính toán số tiền tự động.
- [ ] **Ký kết Hợp đồng (`Sign Contract`):**
  - [ ] Nút "Ký hợp đồng" trên HĐ ở trạng thái `draft`.
  - [ ] Modal ký hợp đồng: Nhập ngày ký `contractDate`, đính kèm link file scan HĐ `contractFileUrl`, ghi chú `note`.
  - [ ] Gọi `POST /api/v1/projects/{projectId}/contracts/{contractId}/sign`.
  - [ ] Đổi trạng thái HĐ sang `signed`, khóa Báo giá tương ứng, cập nhật trạng thái dự án sang `contract`.
- [ ] **Hủy Hợp đồng cũ (Chủ động):**
  - [ ] Nút "Hủy hợp đồng" trên HĐ đang có hiệu lực.
  - [ ] Modal xác nhận hủy: Nhập lý do hủy `reason`.
  - [ ] Gọi `POST /api/v1/projects/{projectId}/contracts/{contractId}/cancel`.
  - [ ] Chuyển HĐ sang trạng thái `cancelled`, giữ nguyên lịch sử và số tiền đã thu trên sổ cái.
- [ ] **Tạo Hợp đồng mới thay thế HĐ cũ (Kế thừa tự động tiền đã thu):**
  - [ ] Nút "Tạo HĐ thay thế" khi Báo giá đã được đồng bộ lên version mới (giá trị thay đổi).
  - [ ] Hệ thống tự động hủy HĐ cũ (nếu chưa hủy), sinh HĐ mới với tổng tiền mới từ Báo giá mới.
  - [ ] Hiển thị thông tin liên kết thay thế: Mã HĐ cũ được thay thế (`replacedContractCode`), số tiền đã kế thừa (`inheritedPaidAmount`).
  - [ ] Hiển thị bảng phân bổ các đợt thanh toán mới:
    - [ ] Đợt 1: Kế thừa trọn vẹn số tiền đã thu ở HĐ cũ, hiển thị trạng thái `completed`.
    - [ ] Đợt 2 & 3: Hiển thị số tiền còn lại sau khi trừ tiền đợt 1, chia theo tỷ lệ tương ứng.
- [ ] **Phân tách danh sách hiển thị Hợp đồng:**
  - [ ] Block trên: Hợp đồng chính hiện hành đang hiệu lực (`signed` hoặc `draft`).
  - [ ] Block dưới / Accordion: Lịch sử các hợp đồng cũ đã hủy (`cancelled`) phục vụ đối soát, tra cứu.

---

## 3. Tab / Module Thanh Toán (`Payments & Ledger`) - Sổ Cái & Thu Tiền

- [ ] **Thẻ tổng quan sổ cái công nợ dự án (`Ledger Summary Card`):**
  - [ ] Gọi `GET /api/v1/projects/{projectId}/payments/ledger-summary`.
  - [ ] Hiển thị: Tổng giá trị hợp đồng (`totalContractValue` - chỉ tính HĐ đang hiệu lực, không cộng dồn HĐ đã hủy).
  - [ ] Hiển thị: Tổng tiền đã thu thực tế (`totalCollected`).
  - [ ] Hiển thị: Công nợ còn phải thu (`remainingDebt`).
- [ ] **Modal Ghi nhận phiếu thu tiền (`Create Payment Transaction`):**
  - [ ] Form tạo phiếu thu: Số tiền thu (`amount`), phương thức (`bank_transfer`, `cash`), mã giao dịch ngân hàng (`bankReference`), ghi chú (`note`).
  - [ ] Tự động gán vào Hợp đồng chính đang hiệu lực và đợt thanh toán đầu tiên chưa thu đủ.
  - [ ] Gọi `POST /api/v1/projects/{projectId}/payments/transactions`.
  - [ ] Cập nhật tiến độ thanh toán của đợt (chuyển sang `completed` khi đủ tiền) và số dư còn lại của Hợp đồng.
- [ ] **Danh sách lịch sử giao dịch (Transaction History):**
  - [ ] Bảng lịch sử các bút toán thu tiền (`TX-YYYY-XXXX`).
  - [ ] Hiển thị ngày thu, số tiền, phương thức, đợt thanh toán liên kết và người thực hiện.

---

## 4. Đồng Bộ Dữ Liệu Liên Module (Inter-Module Data Flow)

- [ ] **Ràng buộc Quyền Sản Xuất từ Hợp Đồng xuống Cửa Dự Án:**
  - [ ] Cửa nằm trong Báo giá của HĐ đã ký -> Có cờ `isContracted === true` -> Cho phép tạo Lệnh sản xuất, bóc tách kính, phụ kiện.
  - [ ] Cửa mới thêm chưa nằm trong HĐ đã ký -> Cảnh báo "Chưa ký hợp đồng bổ sung" trước khi đưa vào sản xuất.
- [ ] **Cập nhật lại Badge trạng thái dự án trên Header Bar:**
  - [ ] Đồng bộ hiển thị badge trạng thái dự án (`surveying` -> `quotation` -> `contract` -> `producing`) ngay khi ký hợp đồng hoặc hủy hợp đồng.