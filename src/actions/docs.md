# Hướng Dẫn Sử Dụng & Quy Chuẩn Server Actions

Server Actions trong Next.js App Router được sử dụng để xử lý logic phía máy chủ (Server-side) và tương tác với Backend API một cách an toàn và bảo mật.

---

## 1. Khái Niệm & Lợi Ích
*   **Server Actions là gì?** Là các hàm bất đồng bộ chạy trên máy chủ (Server-side) được khai báo bằng chỉ thị `"use server"`.
*   **Lợi ích:**
    *   **Bảo mật:** Không để lộ API credentials, Token hay DB queries xuống Client.
    *   **Tối ưu Bundle:** Giảm thiểu dung lượng JavaScript tải về trình duyệt.
    *   **Tích hợp React:** Tự động đồng bộ hóa UI và quản lý trạng thái tải (loading state) thông qua các React hooks (`useActionState`, `useTransition`).
    *   **Tái sử dụng:** Viết một lần và import sử dụng ở bất kỳ Client/Server component nào.

---

## 2. Quy Chuẩn Đặt Tên Hàm (CRUD Semantics)

Bắt buộc tuân thủ đúng ngữ nghĩa CRUD bằng tiếng Anh ở dạng `camelCase`:

### Nghiệp vụ tài nguyên chính (Main Resources)
*   **Lấy danh sách:** `get[Entities]` (Ví dụ: `getUsers`)
*   **Lấy chi tiết:** `get[Entity]` (Ví dụ: `getUser`)
*   **Tạo mới:** `create[Entity]` (Ví dụ: `createUser`)
*   **Cập nhật:** `update[Entity]` (Ví dụ: `updateUser`)
*   **Xóa:** `delete[Entity]` (Ví dụ: `deleteUser`)

### Nghiệp vụ tài nguyên phụ thuộc (Sub-resources)
*   **Lấy danh sách:** `get[Parent][SubResources]` (Ví dụ: `getUserRoles`)
*   **Gán/Cập nhật:** `assign[Parent][SubResources]` (Ví dụ: `assignUserRoles`)
*   **Gỡ bỏ/Hủy bỏ:** `revoke[Parent][SubResources]` (Ví dụ: `revokeUserRoles`)

---

## 3. Cấu Trúc Code Mẫu

```typescript
'use server';

import { revalidatePath } from 'next/cache';

// 1. Khai báo các hàm xử lý
export const getUsers = async (params?: any) => {
  try {
    // Gọi Backend API hoặc Query Database tại đây
    const res = await fetch(`${process.env.API_URL}/users`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Không thể lấy danh sách người dùng');
  }
};

export const createUser = async (data: any) => {
  try {
    const res = await fetch(`${process.env.API_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
    
    // Refresh dữ liệu trên UI Next.js
    revalidatePath('/users');
    
    return await res.json();
  } catch (error) {
    throw new Error('Tạo người dùng thất bại');
  }
};

export const getUserRoles = async (userId: string) => {
  // Lấy danh sách roles của user (sub-resource)
};

export const assignUserRoles = async (userId: string, roleIds: string[]) => {
  // Gán roles cho user (sub-resource)
  revalidatePath(`/users/${userId}`);
};
```
