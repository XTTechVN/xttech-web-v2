import type { ContractPartyA, ContractPartySnapshot, Customer } from '@/types';

// Backend lưu snapshot Bên A dạng dict thô (snake_case). Đây là NƠI DUY NHẤT ánh xạ sang camelCase của UI.
const STORED_KEYS: Record<keyof ContractPartyA, string> = {
  name: 'name',
  identityCard: 'identity_card',
  birthDate: 'birth_date',
  identityIssuedDate: 'identity_issued_date',
  address: 'address',
  siteAddress: 'site_address',
  phone: 'phone',
};

const PARTY_FIELDS = Object.keys(STORED_KEYS) as (keyof ContractPartyA)[];

// Giá trị mặc định lấy từ khách hàng và địa chỉ dự án (chưa có ngày sinh, ngày cấp CCCD)
export const buildDefaultPartyA = (customer?: Customer | null, siteAddress?: string | null): ContractPartyA => ({
  name: customer?.name ?? '',
  identityCard: customer?.identifyCode ?? '',
  birthDate: '',
  identityIssuedDate: '',
  address: customer?.address ?? '',
  siteAddress: siteAddress ?? '',
  phone: customer?.phone ?? '',
});

// Đọc Bên A từ snapshot đã lưu của hợp đồng; trường nào chưa có thì dùng mặc định
export const readPartyA = (snapshot: ContractPartySnapshot | null | undefined, defaults: ContractPartyA): ContractPartyA => {
  const stored = snapshot?.party_a ?? {};
  return Object.fromEntries(PARTY_FIELDS.map((field) => [field, stored[STORED_KEYS[field]] ?? defaults[field]])) as unknown as ContractPartyA;
};

// Chỉ gửi những trường người dùng đã sửa khác với mặc định (không làm đổi dữ liệu khách hàng)
export const toPartyAOverride = (partyA: ContractPartyA, defaults: ContractPartyA): Record<string, string> =>
  Object.fromEntries(
    PARTY_FIELDS.filter((field) => partyA[field].trim() !== defaults[field]).map((field) => [
      STORED_KEYS[field],
      partyA[field].trim(),
    ]),
  );
