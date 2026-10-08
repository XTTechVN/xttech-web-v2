# HƯỚNG DẪN TÍCH HỢP FRONTEND: TẦNG, VỊ TRÍ CỬA & KHẢO SÁT HIỆN TRƯỜNG (MODULE 002)

Module này phụ trách việc phân cấp kiến trúc theo **Tầng (Floors)** và danh sách các **Vị trí cửa vật lý (Door Positions)**, hỗ trợ sinh cửa hàng loạt theo ma trận tầng, kiểm soát xung đột dữ liệu bằng **Optimistic Locking (`revisionId`)**, đo đạc kích thước ô chờ thực tế kèm cảnh báo dung sai, và tra cứu hiện trường bằng mã **QR Code**.

---

## 1. Luồng Thao Tác Của Người Dùng Trên Frontend (UX Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Tech as Kỹ sư Thiết kế / Thợ Khảo sát
    participant FE as Frontend Web / Mobile App
    participant BE as Backend API

    Note over Tech, FE: Bước 1: Khởi Tạo Cấu Trúc Tầng
    FE->>BE: GET /api/v1/projects/{projectId}/floors
    BE-->>FE: Danh sách tầng (Tầng 1, Tầng 2, Tầng Mái...)
    Tech->>FE: Bấm "Thêm tầng mới"
    FE->>BE: POST /api/v1/projects/{projectId}/floors {"name": "Tầng 3", "orderIndex": 3}
    BE-->>FE: 200 OK

    Note over Tech, FE: Bước 2: Tạo Cửa Hàng Loạt Theo Ma Trận
    Tech->>FE: Bấm "Thêm cửa nhanh (Bulk Create)"
    User Inputs: Chọn Tầng, Hệ cửa (D1, S1), Kích thước thiết kế WxH, Số lượng
    FE->>BE: POST /api/v1/positions/bulk (Ma trận items)
    BE-->>FE: 200 OK (Tự sinh mã vị trí D1-01, D1-02..., kèm QR Token độc nhất)

    Note over Tech, FE: Bước 3: Khảo Sát Đo Đạc Ô Chờ Thực Tế
    Tech->>FE: Nhập kích thước đo đạc thực tế tại công trình (WxH)
    FE->>BE: PUT /api/v1/positions/{id}/measure {"width": 2835, "height": 2410, "revisionId": 1}
    BE-->>FE: 200 OK (Cảnh báo dung sai tolerance_exceeded nếu lệch > 20mm)
    alt Dung sai vượt ngưỡng (> 20mm)
        FE->>Tech: Hiển thị Banner Cảnh Báo Màu Cam: "Kích thước đo lệch 35mm so với thiết kế. Cần cân nhắc lập phụ lục hợp đồng!"
    end

    Note over Tech, FE: Bước 4: Quét Mã QR Ngoài Hiện Trường
    Tech->>FE: Quét mã QR dán trên khung nhôm bằng Camera điện thoại
    FE->>BE: GET /api/v1/positions/by-qr/{qrToken} (Không cần Bearer Token)
    BE-->>FE: 200 OK (Thông tin cửa, bản vẽ, lịch sử tiến độ tức thì)
```

---

## 2. Chi Tiết Các API Call & Chuẩn Dữ Liệu

### 2.1. Quản Lý Tầng (Floors)
- **Lấy danh sách tầng:** `GET /api/v1/projects/{projectId}/floors`
- **Tạo tầng mới:** `POST /api/v1/projects/{projectId}/floors`
  - **Request Body:**
    ```json
    {
      "name": "Tầng 1",
      "orderIndex": 1,
      "note": "Khu vực phòng khách và gara"
    }
    ```
- **Sửa tầng:** `PUT /api/v1/projects/floors/{id}`
- **Xóa tầng:** `DELETE /api/v1/projects/floors/{id}` *(Backend tự động chặn xóa nếu tầng đang chứa vị trí cửa)*.

---

### 2.2. Thêm Vị Trí Cửa Hàng Loạt (Bulk Create Positions)
- **Endpoint:** `POST /api/v1/positions/bulk`
- **Tác dụng:** Cho phép người dùng nhập nhanh nhiều bộ cửa cùng lúc, tự động gán tầng, tự sinh mã QR token ngẫu nhiên và eager load thông tin tầng (0 lỗi `MissingGreenlet`).
- **Request Body:**
  ```json
  [
    {
      "projectId": 58,
      "floorId": 46,
      "positionCode": "D1-01",
      "doorName": "Cửa đi chính 4 cánh mở quay",
      "doorId": 1,
      "width": 2800.0,
      "height": 2400.0,
      "quantity": 1,
      "locationDescription": "Mặt tiền hướng Nam"
    },
    {
      "projectId": 58,
      "floorId": 46,
      "positionCode": "S1-01",
      "doorName": "Cửa sổ lùa 2 cánh phòng ngủ",
      "doorId": 2,
      "width": 1400.0,
      "height": 1600.0,
      "quantity": 1,
      "locationDescription": "Phòng ngủ tầng 1"
    }
  ]
  ```
- **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 107,
        "projectId": 58,
        "floorId": 46,
        "positionCode": "D1-01",
        "doorName": "Cửa đi chính 4 cánh mở quay",
        "width": 2800.0,
        "height": 2400.0,
        "areaM2": 6.72,
        "revisionId": 1,
        "qrToken": "793a26c6d4824317a224...",
        "status": "draft",
        "floor": {
          "id": 46,
          "name": "Tầng 1"
        }
      }
    ]
  }
  ```

---

### 2.3. Cập Nhật Vị Trí Cửa & Chống Xung Đột Đồng Thời (Optimistic Locking)
- **Endpoint:** `PUT /api/v1/positions/{id}`
- **Quy tắc bắt buộc:** FE **bắt buộc phải gửi kèm trường `revisionId`** đã nhận được từ lần query trước.
- **Request Body:**
  ```json
  {
    "doorName": "Cửa đi chính 4 cánh kính hộp nan hoa đồng",
    "width": 2800.0,
    "height": 2400.0,
    "revisionId": 1
  }
  ```
- **Xử lý mã lỗi HTTP 409 Conflict:**
  - Nếu Backend phát hiện `revisionId` client gửi lên nhỏ hơn giá trị trong DB (nghĩa là đã có người dùng khác chỉnh sửa trước đó), Backend trả về:
    ```json
    {
      "success": false,
      "error": {
        "code": "CONFLICT",
        "message": "Vị trí cửa đã bị sửa đổi bởi người dùng khác (Revision: 2). Vui lòng tải lại trang!"
      }
    }
    ```
  - **Cách xử lý trên FE:** Bắt mã `409`, hiển thị thông báo Modal/Toast cảnh báo và gọi lại API `GET /api/v1/projects/{projectId}/positions` để cập nhật bảng dữ liệu mới nhất.

---

### 2.4. Đo Đạc Ô Chờ Thực Tế & Cảnh Báo Dung Sai (Measure Endpoint)
- **Endpoint:** `PUT /api/v1/positions/{id}/measure`
- **Tác dụng:** Cập nhật số đo thực tế sau khi thợ khảo sát tại công trình. Đánh dấu cờ `isMeasured = true` (đây là điều kiện bắt buộc để bóc tách đơn đặt kính tôi nhiệt ở Phân hệ 5).
- **Request Body:**
  ```json
  {
    "actualWidth": 2835.0,
    "actualHeight": 2410.0,
    "note": "Tường sau trát hơi dạt sang phải 25mm",
    "revisionId": 1
  }
  ```
- **Response Body (200 OK):**
  ```json
  {
    "id": 107,
    "positionCode": "D1-01",
    "isMeasured": true,
    "actualWidth": 2835.0,
    "actualHeight": 2410.0,
    "status": "surveyed",
    "toleranceExceeded": true,
    "toleranceWarning": "Cảnh báo: Kích thước đo lệch 35 mm so với thiết kế ban đầu (2800x2400 -> 2835x2410). Cần cân nhắc lập phụ lục hợp đồng!"
  }
  ```
- **UX Requirement trên FE:**
  Nếu `toleranceExceeded === true`, FE hiển thị `Alert` cảnh báo nổi bật kèm nội dung `toleranceWarning` để nhân viên phụ trách nhận biết và thông báo cho khách hàng trước khi ra lệnh cắt nhôm kính.

---

### 2.5. Tra Cứu Hiện Trường Bằng Mã QR Code Công Khai (Public QR Lookup)
- **Endpoint:** `GET /api/v1/positions/by-qr/{qrToken}`
- **Bảo mật:** Endpoint này được cấu hình **Công khai (`is_public = true`)**, **KHÔNG CẦN Bearer Token**. Bất kỳ ai quét mã QR dán trên tem cửa (chủ nhà, giám sát, thợ phụ) đều xem được thông tin.
- **Response Body (200 OK):**
  ```json
  {
    "id": 107,
    "positionCode": "D1-01",
    "doorName": "Cửa đi chính 4 cánh",
    "width": 2800.0,
    "height": 2400.0,
    "status": "producing",
    "projectName": "Biệt thự E2E Clean Test",
    "floorName": "Tầng 1",
    "lastProgressStep": "producing",
    "lastUpdatedAt": "2026-10-08T09:41:20Z"
  }
  ```

---

## 3. Bảng Ánh Xạ Từ Điển (Dictionary Mapping) Cho Frontend

```typescript
export const DOOR_STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft:        { label: 'Bản vẽ sơ bộ',   color: 'default' },
  surveyed:     { label: 'Đã đo ô chờ',    color: 'processing' },
  producing:    { label: 'Đang gia công',  color: 'warning' },
  factory_done: { label: 'KCS xuất xưởng', color: 'cyan' },
  delivered:    { label: 'Đã giao công trình', color: 'purple' },
  installed:    { label: 'Đã lắp đặt xong', color: 'geekblue' },
  accepted:     { label: 'Đã nghiệm thu',  color: 'success' }
};
```
