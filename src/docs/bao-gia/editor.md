# note này không được sửa, viết lại docs xuống bên dưới note của tôi

còn ở editor này sử dụng store để quản lý các state thêm sửa xóa cập nhật vào trong quotation

store lưu dữ liệu là payload gửi lên api put cập nhật quotation dạng thô
store cung cấp các hàm chỏ vào trong dữ liệu thô đó để cập nhật lại dữ liệu thô
store cũng cấp hàm saveQuotation để cập nhật lại bằng cách gửi dữ liệu vô đó vào API cập nhật báo giá (action)


store chỉ lưu dữ liệu thô tức là các ids thôi 

{
  "title": "string",
  "code": "string",
  "discountPercentage": 100,
  "status": "string",
  "projectId": 0,
  "reviewBy": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "floors": [
    {
      "name": "string",
      "index": 0,
      "materials": [
        {
          "materialId": 0,
          "name": "string",
          "initPrice": 0,
          "doors": [
            {
              "doorId": 0,
              "code": "string",
              "width": 1,
              "height": 1,
              "quantity": 1,
              "accessoryIds": [
                0
              ],
              "extraOptionIds": [
                0
              ],
              "fomulas": [
                {
                  "fomulaId": 0,
                  "width": 1,
                  "height": 1,
                  "salary": 1
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

nên cần lấy các danh sách dữ liệu có từ trước ở trong page gửi xuống, map vào editor để lấy text hiển thị cho đúng



---

# Tài Liệu Hướng Dẫn: Trình Chỉnh Sửa Báo Giá (Quotation Editor)

Tài liệu này hướng dẫn chi tiết về cơ chế quản lý state (Zustand Store) và cơ chế tra cứu/ánh xạ master data lên giao diện của Trình chỉnh sửa báo giá (Quotation Editor).

---

## 1. Cơ Chế Quản Lý State (Zustand Store)

Trình chỉnh sửa báo giá quản lý toàn bộ trạng thái chỉnh sửa cục bộ thông qua store Zustand mang tên `useQuotationStore`.

### A. Cấu trúc dữ liệu của Store (`useQuotationStore`)
Store chỉ lưu trữ các thông tin cơ bản và danh sách ID của các đối tượng liên kết (dữ liệu dạng thô - raw payload):
* **Thông tin chung:** `title`, `code`, `discountPercentage`, `status`, `projectId`, `reviewBy`.
* **Cấu trúc phân tầng (`floors`):**
  * `Floor`: Tên tầng (`name`), index tầng (`index`), và danh sách các hệ nhôm (`materials`).
  * `Material`: ID hệ nhôm (`materialId`), đơn giá mặc định của hệ nhôm (`initPrice`), và danh sách các cửa (`doors`).
  * `Door`: ID cửa (`doorId`), ký hiệu (`code`), kích thước (`width`, `height`), số lượng (`quantity`), danh sách ID phụ kiện (`accessoryIds`), danh sách ID tùy chọn thêm (`extraOptionIds`), và danh sách công thức/tiền công uốn (`fomulas`).

### B. Các chức năng và thao tác đột biến dữ liệu (Mutations)
Zustand Store cung cấp các Action để thay đổi dữ liệu theo đúng phân cấp:
* **Khởi tạo dữ liệu (`initialize`):** Lấy dữ liệu chi tiết từ API (`QuotationDetail`) và chuyển đổi sang định dạng dữ liệu thô (chỉ giữ lại ID) để lưu vào store.
* **Thao tác Tầng (Floor):** `addFloor`, `removeFloor`, `updateFloorName`.
* **Thao tác Hệ nhôm (Material):** `addMaterial`, `updateMaterial`, `removeMaterial`.
* **Thao tác Cửa (Door):** `addDoor`, `updateDoor` (cập nhật kích thước, số lượng), `removeDoor`.
* **Thao tác Phụ kiện & Tùy chọn (Accessory & ExtraOption):** Thêm/Sửa/Xóa ID liên kết trên từng bộ cửa (`addAccessory`, `removeAccessory`, `addExtraOption`, `removeExtraOption`).
* **Thao tác Công thức (Formula):** `addFormula`, `updateFormula`, `removeFormula`.

### C. Cơ chế đồng bộ và lưu dữ liệu lên API (`saveQuotation`)
* **Lấy dữ liệu Payload (`getPayload`):** Store đóng gói toàn bộ state hiện tại thành định dạng JSON thô (như schema ở note trên).
* **Đồng bộ hóa (`updateQuotation` / `createQuotation`):** Khi người dùng nhấn nút lưu, store sẽ tự động gọi Server Action tương ứng (`apiUpdateQuotation` hoặc `apiCreateQuotation`) và truyền payload thô này lên backend.

---

## 2. Cơ Chế Tra Cứu Và Ánh Xạ Master Data (Editor Components)

### A. Tại sao cần mapping Master Data?
Zustand Store chỉ lưu trữ dữ liệu dạng thô (các ID liên kết như `doorId`, `materialId`, `accessoryId`, `extraOptionId`). Để hiển thị thông tin trực quan cho người dùng trong quá trình chỉnh sửa (ví dụ: hiển thị tên cửa "Cửa đi 1 cánh", hình ảnh cửa, đơn giá phụ kiện...), Editor cần tra cứu thông tin chi tiết từ Master Data.

### B. Cách thức mapping dữ liệu từ Page xuống các Component con
Dữ liệu danh sách Master Data từ API được fetch ở Page-level và truyền xuống dưới dạng Props:
1. **Tại `QuotationEditor`:** Nhận danh sách các master list từ props:
   * `materialsList` (`Material[]`)
   * `doorsList` (`Door[]`)
   * `accessoriesList` (`Accessory[]`)
   * `extraOptionsList` (`ExtraOption[]`)
   * `formulasList` (`Formula[]`)
2. **Truyền dẫn Props (Prop Drilling):** Các danh sách này được chuyển tiếp xuống các component con:
   * `FloorItem` (Quản lý danh sách các hệ nhôm trong tầng)
   * `MaterialItem` (Quản lý các loại cửa thuộc hệ nhôm)
   * `DoorItem` (Quản lý danh sách phụ kiện, tùy chọn, và công thức uốn của từng cửa)
3. **Tra cứu hiển thị:** Tại mỗi component tương ứng, code sử dụng phương thức `.find()` để lấy thông tin chi tiết:
   * **Ví dụ:** Trong `DoorItem`, tìm thông tin phụ kiện để hiển thị tên và đơn giá:
     ```typescript
     const detail = accessoriesList.find(a => a.id === accId);
     const name = detail ? detail.name : "Không xác định";
     ```
   * Việc hiển thị tên, ký hiệu, đơn giá và hình ảnh hoàn toàn dựa trên phép so khớp ID này.
