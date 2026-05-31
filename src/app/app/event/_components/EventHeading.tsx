import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';

interface EventHeadingProps {
  title?: string;
  description?: string;
}

export default function EventHeading({
  title = 'Danh sách sự kiện',
  description = 'Quản lý lịch sử các sự kiện từ hệ thống camera',
}: EventHeadingProps) {
  return (
    <div>
      <Heading>{title}</Heading>
      <SubHeading>{description}</SubHeading>
    </div>
  );
}
