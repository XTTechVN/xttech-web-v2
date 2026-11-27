// Công cụ dev (thanh quyền bên phải, trang ma trận). Bật bằng NEXT_PUBLIC_DEV_TOOLS=true trong .env, và luôn tắt ở production build.
// Biến NEXT_PUBLIC_ được nhúng lúc build: sửa .env xong phải khởi động lại `next dev`.
export const DEV_TOOLS = process.env.NEXT_PUBLIC_DEV_TOOLS === 'true' && process.env.NODE_ENV !== 'production';
