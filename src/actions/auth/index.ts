'use server';

// Khai báo các hàm xử lý
export const getSignIn = async () => {
  try {
    const res = await fetch(`${process.env.API_URL}/signin`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (error) {
    throw new Error('Lỗi hệ thống');
  }
};