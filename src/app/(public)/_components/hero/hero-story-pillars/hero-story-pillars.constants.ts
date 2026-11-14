export interface PainPointItem {
  lead: string;
  text: string;
}

// 4 nỗi đau điển hình của xưởng sản xuất nhôm kính & nhà thầu thi công
export const PAIN_POINTS: PainPointItem[] = [
  {
    lead: 'Bóc tách vật tư & báo giá thủ công, dễ sai sót',
    text: ' khi phải tính toán thanh nhôm, kính cường lực và phụ kiện bằng Excel hoặc sổ tay, mất nhiều thời gian và dễ lệch kích thước ô chờ khi chốt phương án với chủ đầu tư.',
  },
  {
    lead: 'Hao hụt phôi nhôm lớn do cắt thủ công thiếu tối ưu',
    text: ', thợ tự chia cây nhôm theo kinh nghiệm khiến đề-xê phát sinh nhiều, khó tận dụng nhôm thừa và không kiểm soát được định mức tiêu hao thực tế tại xưởng.',
  },
  {
    lead: 'Thất thoát kho vật tư & chậm tiến độ giữa xưởng và công trình',
    text: ' khi chạy nhiều đơn hàng cùng lúc, khó theo dõi sát tồn kho nhôm, kính, phụ kiện (Kinlong, Draho...) cũng như tiến độ từ gia công ép góc đến lắp dựng, nghiệm thu.',
  },
  {
    lead: 'Dữ liệu phân tán qua Zalo, giấy tờ rời rạc',
    text: ' từ bản vẽ kỹ thuật, thẻ cắt A4, chấm công thợ đến công nợ nhà cung cấp, khiến chủ xưởng dễ thất lạc số liệu và không nắm rõ lãi/lỗ thực tế của từng công trình.',
  },
];

export type PillarCategory = 'all' | 'workshop' | 'site';

// Bộ lọc nhóm giải pháp cốt lõi
export const PILLAR_FILTERS: { value: PillarCategory; label: string }[] = [
  { value: 'all', label: 'Tất cả giải pháp (08)' },
  { value: 'workshop', label: 'Phân xưởng sản xuất' },
  { value: 'site', label: 'Thi công công trình' },
];

export interface HeroSectionDemoProps {
  onOpenDemo: () => void;
}
