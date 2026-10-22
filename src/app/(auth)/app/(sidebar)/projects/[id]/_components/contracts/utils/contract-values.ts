import type { ContractPartyA } from '@/types';
import { escapeHtml, formatCurrency, readVietnameseNumber } from '@/utils';

export const BLANK_VALUE = '……………';

export interface ContractInstallment {
  name: string;
  percentage: number;
  amount: number;
  dueDate?: string | null;
}

// Nguồn dữ liệu đã chuẩn hóa để điền vào hợp đồng (dùng chung cho hợp đồng đã lưu và bản nháp trong form)
export interface ContractDocumentSource {
  contractCode?: string | null;
  contractDate?: string | null;
  totalAmount: number;
  quotationCode?: string | null;
  projectName?: string | null;
  installments: ContractInstallment[];
  partyA: ContractPartyA;
}

export type ContractVariableValues = Record<string, string>;

// Danh sách biến người dùng có thể gõ trong nội dung soạn thảo
export const CONTRACT_VARIABLES: { key: string; label: string }[] = [
  { key: 'so_hop_dong', label: 'Số hợp đồng' },
  { key: 'ten_khach_hang', label: 'Tên khách hàng' },
  { key: 'dia_chi_A', label: 'Địa chỉ Bên A' },
  { key: 'dia_chi_cong_trinh_A', label: 'Địa chỉ công trình' },
  { key: 'sdt_A', label: 'SĐT Bên A' },
  { key: 'ma_bao_gia', label: 'Mã báo giá' },
  { key: 'ten_du_an', label: 'Tên dự án' },
  { key: 'tong_gia_tri', label: 'Tổng giá trị' },
  { key: 'tong_gia_tri_bang_chu', label: 'Tổng giá trị bằng chữ' },
  { key: 'lich_thanh_toan', label: 'Lịch thanh toán' },
  { key: 'so_lan_thanh_toan', label: 'Số lần thanh toán' },
  { key: 'ngay_thang_nam', label: 'Ngày tháng năm' },
];

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;
const VARIABLE_PATTERN = /\$([A-Za-z_][A-Za-z0-9_]*)/g;

export function formatDateVN(isoDate?: string | null): string {
  const matched = isoDate ? ISO_DATE_PATTERN.exec(isoDate) : null;
  return matched ? `${matched[3]}/${matched[2]}/${matched[1]}` : '';
}

// Ngày ký hợp đồng; chưa có thì dùng ngày hiện tại
function resolveDateParts(contractDate?: string | null): { day: string; month: string; year: string } {
  const matched = contractDate ? ISO_DATE_PATTERN.exec(contractDate) : null;
  if (matched) return { year: matched[1], month: matched[2], day: matched[3] };

  const today = new Date();
  return {
    year: String(today.getFullYear()),
    month: String(today.getMonth() + 1).padStart(2, '0'),
    day: String(today.getDate()).padStart(2, '0'),
  };
}

const describeInstallment = (installment: ContractInstallment, index: number): string => {
  const dueText = installment.dueDate ? ` (hạn ${formatDateVN(installment.dueDate)})` : '';
  return `Đợt ${index + 1}: ${installment.name} - ${installment.percentage}% - ${formatCurrency(installment.amount)}${dueText}`;
};

// Giá trị dùng cho dòng mô tả từng lần thanh toán
export const buildInstallmentValues = (installment: ContractInstallment, index: number): ContractVariableValues => ({
  lan: String(index + 1),
  ten_dot: installment.name,
  phan_tram: String(installment.percentage),
  so_tien: formatCurrency(installment.amount),
  so_tien_bang_chu: readVietnameseNumber(installment.amount),
});

export function buildContractValues(source: ContractDocumentSource): ContractVariableValues {
  const { partyA, totalAmount } = source;
  const { day, month, year } = resolveDateParts(source.contractDate);

  return {
    so_hop_dong: source.contractCode ?? '',
    ten_khach_hang: partyA.name,
    cccd_A: partyA.identityCard,
    ngay_sinh_A: formatDateVN(partyA.birthDate),
    ngay_cap_cccd_A: formatDateVN(partyA.identityIssuedDate),
    dia_chi_A: partyA.address,
    dia_chi_cong_trinh_A: partyA.siteAddress,
    sdt_A: partyA.phone,
    ngay: day,
    thang: month,
    nam: year,
    ngay_thang_nam: `ngày ${day} tháng ${month} năm ${year}`,
    ma_bao_gia: source.quotationCode ?? '',
    ten_du_an: source.projectName ?? '',
    tong_gia_tri: totalAmount > 0 ? formatCurrency(totalAmount) : '',
    tong_gia_tri_bang_chu: totalAmount > 0 ? readVietnameseNumber(totalAmount) : '',
    lich_thanh_toan: source.installments.map(describeInstallment).join('\n'),
    so_lan_thanh_toan: source.installments.length > 0 ? String(source.installments.length).padStart(2, '0') : '',
  };
}

// Thay $ten_bien bằng giá trị. Biến thiếu giá trị -> dấu chấm; biến không biết -> giữ nguyên.
// Chế độ 'html': escape giá trị để chống chèn mã, xuống dòng thành <br>.
export function fillContractVariables(text: string, values: ContractVariableValues, mode: 'text' | 'html'): string {
  return text.replace(VARIABLE_PATTERN, (matched, key: string) => {
    if (!(key in values)) return matched;

    const value = values[key].trim() || BLANK_VALUE;
    return mode === 'html' ? escapeHtml(value).replace(/\n/g, '<br>') : value;
  });
}
