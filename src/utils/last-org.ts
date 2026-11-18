// Mã doanh nghiệp dùng lần trước (đăng nhập, đăng ký, quên mật khẩu). Chỉ là tiện ích: lỗi localStorage thì bỏ qua.
const LAST_ORG_KEY = 'xt-last-org';

export const readLastOrg = () => {
  try {
    return localStorage.getItem(LAST_ORG_KEY) ?? '';
  } catch {
    return '';
  }
};

export const saveLastOrg = (orgCode: string) => {
  try {
    localStorage.setItem(LAST_ORG_KEY, orgCode);
  } catch {
    // trình duyệt chặn lưu trữ: không ghi nhớ
  }
};
