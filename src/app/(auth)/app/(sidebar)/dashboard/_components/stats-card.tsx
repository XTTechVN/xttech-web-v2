import { useCan } from '@/hooks';

const StatCart = ({
  title,
  value,
  icon,
  onClick,
  requires,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  onClick?: () => void;
  /** Mã quyền cần có ở phạm vi toàn doanh nghiệp để thấy thẻ (số liệu và trang đích của thẻ đều là dữ liệu quản lý) */
  requires?: string;
}) => {
  const { scopeOf } = useCan();
  if (requires && scopeOf(requires) !== 'org') return null;

  return (
    <div
      className="bg-white rounded-block p-3 md:p-4 flex flex-col gap-3 md:gap-4 hover:border-gray-300 transition-colors w-full cursor-pointer border border-gray-100"
      onClick={onClick}
    >
      <div className="self-start p-2 md:p-3 rounded-control bg-primary/5 text-primary [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5">
        {icon}
      </div>
      <div className="flex flex-col gap-1 md:gap-2">
        <span className="font-heading text-gray-500 text-xs font-medium truncate">{title}</span>
        <span className="text-lg md:text-2xl font-medium tabular-nums text-primary">{value}</span>
      </div>
    </div>
  );
};

export default StatCart;
