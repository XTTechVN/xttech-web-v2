import { TrendingDown, TrendingUp } from 'lucide-react';

const StatCart = ({
  title,
  value,
  icon,
  trend,
  trendType = 'up',
  bgIcon,
  onClick,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: number;
  trendType?: string;
  bgIcon: string;
  onClick?: () => void;
  }) => {
  
  const isUp = trendType === 'up';
  
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-4 hover:shadow-xl transition w-full cursor-pointer" onClick={onClick}>
      <div className="flex items-center relative">
        <div className={`p-3 rounded-xl ${bgIcon}`}>{icon}</div>
        {trend !== undefined && (
          <div
            className={`px-3 py-0.5 absolute right-0 top-0 rounded-full text-xs font-semibold flex items-center gap-1 ${isUp ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
          >
            {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-gray-500 text-xs font-medium truncate whitespace-nowrap overflow-hidden">{title}</span>
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
    </div>
  );
};

export default StatCart;
