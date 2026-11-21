// DỮ LIỆU GIẢ chỉ để xem giao diện mẫu. Bao gồm cả trường hợp xấu nhất (tên rất dài, chuỗi không dấu cách).
export type MockStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface MockQuotationLine {
  name: string;
  amount: number;
}

export interface MockQuotation {
  id: string;
  code: string;
  customer: string;
  date: string;
  total: number;
  status: MockStatus;
  lines: MockQuotationLine[];
}

export const STATUS_LABEL: Record<MockStatus, string> = {
  draft: 'Nháp',
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

export const MOCK_QUOTATIONS: MockQuotation[] = [
  {
    id: '1',
    code: 'BG-0001',
    customer: 'Anh Nguyễn Văn An',
    date: '23/05/2026',
    total: 42_500_000,
    status: 'pending',
    lines: [
      { name: 'Cửa đi 2 cánh mở quay', amount: 18_000_000 },
      { name: 'Cửa sổ trượt 4 cánh', amount: 21_500_000 },
      { name: 'Phụ kiện Kinlong', amount: 3_000_000 },
    ],
  },
  {
    id: '2',
    code: 'BG-0002',
    customer: 'Công ty TNHH Xây dựng và Thương mại Dịch vụ Cường Thịnh Phát Đạt Miền Nam',
    date: '22/05/2026',
    total: 1_250_000_000,
    status: 'approved',
    lines: [
      { name: 'Vách kính mặt dựng tầng 1', amount: 820_000_000 },
      { name: 'Cửa đi tự động', amount: 430_000_000 },
    ],
  },
  {
    id: '3',
    code: 'BG-0003',
    customer: 'Chị Trần Thị Bình',
    date: '20/05/2026',
    total: 6_700_000,
    status: 'draft',
    lines: [{ name: 'Cửa sổ mở hất', amount: 6_700_000 }],
  },
  {
    id: '4',
    code: 'BG-0004',
    customer: 'NguyenVanAnhKhachHangCoTenRatDaiKhongCoDauCachDeThuTranLayout',
    date: '18/05/2026',
    total: 15_900_000,
    status: 'rejected',
    lines: [{ name: 'Cửa đi 1 cánh', amount: 15_900_000 }],
  },
  {
    id: '5',
    code: 'BG-0005',
    customer: 'Anh Lê Hoàng',
    date: '17/05/2026',
    total: 33_000_000,
    status: 'approved',
    lines: [
      { name: 'Cửa đi 4 cánh xếp trượt', amount: 28_000_000 },
      { name: 'Khoá đa điểm', amount: 5_000_000 },
    ],
  },
];

export const formatVnd = (n: number) => `${n.toLocaleString('vi-VN')} ₫`;
