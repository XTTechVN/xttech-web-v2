import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';

interface RecordHeadingProps {
  title?: string;
  description?: string;
}

export default function RecordHeading({
  title = 'Danh sách bản ghi',
  description = 'Quản lý lịch sử các bản ghi hình từ hệ thống camera',
}: RecordHeadingProps) {
  return (
    <div>
      <Heading>{title}</Heading>
      <SubHeading>{description}</SubHeading>
    </div>
  );
}
