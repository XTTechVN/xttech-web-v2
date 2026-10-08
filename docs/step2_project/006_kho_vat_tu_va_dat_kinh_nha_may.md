# HƯỚNG DẪN TÍCH HỢP FRONTEND: KHO VẬT TƯ & ĐƠN ĐẶT KÍNH NHÀ MÁY (MODULE 006)

Module này kiểm soát toàn bộ chuỗi cung ứng vật tư của xưởng sản xuất: Quản lý nhà cung cấp, **cảnh báo thiếu hụt vật tư tự động (Material Shortage Checker)**, lập phiếu xuất kho theo Lệnh sản xuất với **cơ chế giữ chỗ (`reservedQty`)**, hàng rào bảo vệ **chống xuất âm kho**, quy trình **xuất bù sự cố & thu hồi nhôm đề-xê**, và quản lý chu trình **đặt kính nhà máy tôi nhiệt** kèm hàng rào an toàn bắt buộc khảo sát thực tế.

---

## 1. Luồng Thao Tác Của Người Dùng Trên Frontend (UX Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Storekeeper as Thủ kho / Kỹ thuật
    participant FE as Frontend Dashboard
    participant BE as Backend Warehouse & Glass Service

    Note over Storekeeper, FE: Chặng 1: Kiểm Tra Thiếu Hụt Vật Tư
    Storekeeper->>FE: Chọn Dự Án -> Bấm "Kiểm Tra Thiếu Hụt Vật Tư"
    FE->>BE: GET /api/v1/warehouse/projects/{projectId}/check-shortage
    BE-->>FE: Danh sách vật tư cần vs. Tồn kho thực tế (isFullyStocked: false)
    alt Có vật tư thiếu hụt
        FE->>Storekeeper: Hiển thị Badge Đỏ cảnh báo thiếu vật tư (ví dụ: Thiếu 4 cây nhôm, 6 bản lề)
        Storekeeper->>FE: Bấm "Lập Phiếu Nhập Kho Nhà Cung Cấp"
    end

    Note over Storekeeper, FE: Chặng 2: Xuất Kho Sản Xuất & Cơ Chế Giữ Chỗ
    Storekeeper->>FE: Bấm "Tự động xuất kho theo Lệnh SX"
    FE->>BE: POST /api/v1/warehouse/projects/{projectId}/auto-export {"productionOrderId": 14}
    BE-->>FE: 200 OK (Phiếu xuất kho PXK-2026-XXXX trạng thái draft, vật tư được tạm giữ: reservedQty tăng)
    Storekeeper->>FE: Kiểm đếm xong -> Bấm "Duyệt xuất kho"
    FE->>BE: PUT /api/v1/warehouse/receipts/{id}/approve
    BE-->>FE: 200 OK (Trừ tồn kho chính thức, reservedQty giải phóng về 0)

    Note over Storekeeper, FE: Chặng 3: Xuất Bù Sự Cố (Rework) & Thu Hồi Đề-xê
    Storekeeper->>FE: Thợ cắt hụt cữ nhôm -> Bấm "Xuất bù sự cố & Nhập đề-xê"
    FE->>BE: POST /api/v1/warehouse/receipts/rework-compensation (Payload: lý do, thợ phụ trách, chiều dài đề-xê thu hồi)
    BE-->>FE: 200 OK (Xuất cây nhôm mới, thu hồi thanh đề-xê >= 1.0m vào kho Offcut)

    Note over Storekeeper, FE: Chặng 4: Bóc Tách & Đặt Kính Nhà Máy
    Storekeeper->>FE: Vào tab "Đơn Đặt Kính" -> Bấm "Bóc tách đơn kính gửi nhà máy"
    FE->>BE: POST /api/v1/glass-orders/generate (Payload: projectId, supplierId)
    alt Có bộ cửa chưa đo đạc thực tế (isMeasured = false)
        BE-->>FE: 400 Bad Request: "Các bộ cửa [D1, S1] chưa đo ô chờ thực tế! Kính tôi nhiệt không thể cắt lại!"
        FE->>Storekeeper: Modal Cảnh Báo Nguy Cấp: Yêu cầu đi đo thực tế trước khi đặt kính
    else Đã đo thực tế 100%
        BE-->>FE: 201 Created (Đơn kính DK-2026-XXXX, bóc tách kích thước từng tấm kính)
        Storekeeper->>FE: Gửi email/Zalo nhà máy -> Bấm "Xác nhận gửi nhà máy" (Chuyển sang 'ordered')
        Storekeeper->>FE: Xe chở kính về xưởng -> Bấm "Nghiệm thu nhận kính" (Chuyển sang 'delivered')
    end
```

---

## 2. Chi Tiết Các API Call & Chuẩn Dữ Liệu

### 2.1. Cảnh Báo Thiếu Hụt Vật Tư (Shortage Checker)
- **Endpoint:** `GET /api/v1/warehouse/projects/{projectId}/check-shortage`
- **Tác dụng:** Đối soát giữa tổng định mức vật tư của dự án với lượng tồn kho khả dụng hiện tại (`availableStock = currentStock - reservedQty`).
- **Response Body (200 OK):**
  ```json
  {
    "projectId": 58,
    "isFullyStocked": false,
    "totalShortageItems": 2,
    "shortages": [
      {
        "itemCode": "XF55-KB",
        "itemName": "Khung bao Xingfa 55",
        "requiredQty": 8.0,
        "availableQty": 4.0,
        "shortageQty": 4.0,
        "unit": "bar"
      },
      {
        "itemCode": "ACC-BL4D",
        "itemName": "Bản lề 4D Kinlong",
        "requiredQty": 12.0,
        "availableQty": 6.0,
        "shortageQty": 6.0,
        "unit": "pcs"
      }
    ]
  }
  ```

---

### 2.2. Tự Động Sinh Phiếu Xuất Kho & Giữ Chỗ (Auto Export)
- **Endpoint:** `POST /api/v1/warehouse/projects/{projectId}/auto-export`
- **Tác dụng:** Lập phiếu xuất kho (`PXK-YYYY-XXXX`) theo Lệnh sản xuất.
- **Cơ chế giữ chỗ (Stock Reservation):** Khi phiếu xuất được tạo ở trạng thái `draft`, số lượng tồn khả dụng sẽ bị tạm giữ (`reservedQty += requiredQty`). Thao tác này ngăn chặn các lệnh sản xuất khác tranh chấp hoặc xuất vượt quá lượng tồn kho thực tế.
- **Hàng rào bảo vệ:** Chặn tạo trùng lặp phiếu xuất kho cho cùng một Lệnh sản xuất.

---

### 2.3. Duyệt Xuất Kho Nguyên Tử ACID (Atomic Approval)
- **Endpoint:** `PUT /api/v1/warehouse/receipts/{id}/approve`
- **Bảo vệ chống xuất âm kho:** Backend kiểm tra nghiêm ngặt:
  $$\text{Tồn kho thực tế} \ge \text{Số lượng yêu cầu xuất}$$
  Nếu không đủ tồn kho, Backend lập tức ném lỗi `BadRequestError` (HTTP 400), hủy toàn bộ transaction và bảo vệ kho không bao giờ bị âm.
- **Khi duyệt thành công:** Cập nhật `currentStock -= exportedQty`, giải phóng `reservedQty -= exportedQty`, chuyển trạng thái phiếu xuất sang `approved` và ghi log vào `project_activities`.

---

### 2.4. Xuất Bù Sự Cố (Rework Issue) & Thu Hồi Đề-xê (Offcut)
- **Endpoint:** `POST /api/v1/warehouse/receipts/rework-compensation`
- **Tác dụng:** Khi thợ xưởng làm hỏng hoặc cắt hụt cữ nhôm, lập phiếu xuất bù cây nhôm mới và tự động nhập thanh nhôm thừa (đề-xê) có chiều dài $\ge 1.0m$ vào kho đề-xê tái sử dụng.
- **Request Body:**
  ```json
  {
    "projectId": 58,
    "productionOrderId": 14,
    "reworkReason": "Thợ cắt hụt cữ thanh đứng cánh 40mm do cữ máy bị xô",
    "responsibleWorker": "Trần Văn Cường (Tổ cắt)",
    "replacementItemId": 1,
    "quantity": 1.0,
    "offcut": {
      "profileBarId": 1,
      "colorId": 3,
      "lengthMm": 2510.0,
      "storageLocation": "Giá đề-xê B2"
    }
  }
  ```
- **Response Body (200 OK):**
  ```json
  {
    "receiptCode": "PXK-2026-0016",
    "status": "approved",
    "recoveredOffcut": {
      "id": 4,
      "lengthMm": 2510.0,
      "storageLocation": "Giá đề-xê B2",
      "status": "available"
    }
  }
  ```

---

### 2.5. Đơn Đặt Kính Nhà Máy & Guardrail Đo Thực Tế
- **Endpoint:** `POST /api/v1/glass-orders/generate`
- **Hàng rào an toàn sinh tử (Crucial Guardrail):**
  > **Kính cường lực sau khi tôi nhiệt vĩnh viễn không thể cắt gọt lại.** Do đó, Backend kiểm tra cờ `isMeasured` của tất cả các bộ cửa trong đơn:
  > - Nếu có bất kỳ bộ cửa nào có `isMeasured === false`, Backend ném lỗi HTTP 400: *"Không thể lập đơn kính: Các bộ cửa [D1-01] chưa được khảo sát đo ô chờ thực tế (isMeasured = false)! Bắt buộc phải đo thực tế trước khi đặt kính!"*
- **Request Body:**
  ```json
  {
    "projectId": 58,
    "supplierId": 15,
    "productionOrderId": 14,
    "note": "Kính cường lực Hải Long 8mm mài xiết cạnh"
  }
  ```
- **Response Body (201 Created):**
  ```json
  {
    "id": 6,
    "code": "DK-2026-0006",
    "supplierName": "Nhà máy Kính An Toàn Hải Long",
    "totalPanes": 4,
    "totalAreaM2": 4.3891,
    "totalAmount": 1975095,
    "status": "draft",
    "items": [
      {
        "positionCode": "D1-01",
        "glassType": "Kính cường lực 8mm",
        "widthMm": 550.0,
        "heightMm": 2150.0,
        "areaM2": 1.1825,
        "status": "draft"
      }
    ]
  }
  ```

- **Gửi Đơn Cho Nhà Máy:** `PUT /api/v1/glass-orders/{id}/send-to-supplier` (Trạng thái chuyển sang `ordered`).
- **Nghiệm Thu Kính Về Xưởng:** `PUT /api/v1/glass-orders/{id}/receive` (Trạng thái chuyển sang `delivered`, kèm bằng chứng ảnh giao nhận kính).

---

## 3. Bảng Ánh Xạ Từ Điển (Dictionary Mapping) Cho Frontend

```typescript
export const SUPPLIER_TYPE_MAP: Record<string, string> = {
  aluminum:   'Nhà cung cấp nhôm thanh',
  accessory:  'Nhà cung cấp phụ kiện kim khí',
  glass:      'Nhà máy tôi kính an toàn',
  consumable: 'Vật tư phụ (Keo, gioăng, ốc vít)'
};

export const RECEIPT_REASON_MAP: Record<string, string> = {
  purchase:          'Mua hàng mới',
  production_issue:  'Xuất sản xuất theo lệnh',
  rework_issue:      'Xuất bù sự cố / cắt hỏng',
  offcut_return:     'Nhập kho thu hồi đề-xê',
  adjustment:        'Điều chỉnh kiểm kê kho',
  scrap:             'Thanh lý phế liệu'
};

export const GLASS_ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft:      { label: 'Chờ duyệt',          color: 'default' },
  ordered:    { label: 'Đã gửi nhà máy tôi', color: 'processing' },
  delivered:  { label: 'Đã nhận về xưởng',   color: 'success' },
  cancelled:  { label: 'Đã hủy',             color: 'error' }
};
```
