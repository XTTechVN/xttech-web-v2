'use server';

// 1. Khai báo các hàm xử lý
export const getSignIn = async (params?: any) => {
  try {
    // Gọi Backend API hoặc Query Database tại đây
    const res = await fetch(`${process.env.API_URL}/signin`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Không thể lấy danh sách người dùng');
  }
};