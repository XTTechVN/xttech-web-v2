export interface PainPointItem {
  lead: string;
  text: string;
}

// 4 nỗi đau điển hình của doanh nghiệp ngành nhôm kính & xây lắp
export const PAIN_POINTS: PainPointItem[] = [
  { lead: 'Khó khăn trong quản lý các dự án có quy mô lớn', text: ', nhiều hạng mục cửa và vách nhôm kính, nhiều nhân sự tham gia. Nhiều dự án triển khai đồng thời cũng gây khó để kiểm soát vật tư thanh nhôm, kính và phụ kiện công trình.' },
  { lead: 'Công việc bóc tách bareme phụ thuộc chồng chéo', text: ' gây rối ren khi giám sát tiến độ. Dữ liệu chỉ nằm trong sổ sách hoặc trí nhớ của 1 vài thợ lành nghề, thợ tự tính đề-xê gây hao hụt nhôm nghiêm trọng.' },
  { lead: 'Nguy cơ chậm tiến độ, kéo dài thời gian thi công', text: ' do không giám sát được chặt chẽ tiến độ từng hạng mục nhỏ: từ khảo sát đo đạc ô chờ, gia công ép góc tại xưởng đến lắp dựng và bàn giao hiện trường.' },
  { lead: 'Không có môi trường trao đổi tập trung', text: ', cập nhật thông tin dự án xuyên suốt giữa các bộ phận. Trao đổi, báo cáo qua Zalo, gọi điện, nhắn tin... dẫn đến các thông tin nhận được không đồng nhất, dễ thất lạc số liệu và phát sinh tranh chấp.' },
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
