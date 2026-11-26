const VN_PHONE_REGEX = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Kiểm tra số điện thoại di động Việt Nam (bỏ qua khoảng trắng). */
export function isValidVnPhone(value: string): boolean {
  return VN_PHONE_REGEX.test(value.replace(/\s+/g, ''));
}

/** Kiểm tra định dạng email cơ bản (bỏ khoảng trắng hai đầu). */
export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}
