// Icon thư viện lucide-react
import { BarChart3, ShieldCheck, Zap } from 'lucide-react';

const StatCard = () => {

  // Dữ liệu mockup statsCard
  const dataStatsCardMockup = [
    {
      icon: <BarChart3 className="text-[#0d9488]" size={20} />,
      iconBg: 'bg-[#0d9488]/10',
      title: 'Phân tích Sản xuất',
      description: 'Theo dõi OEE và sản lượng thực tế.',
    },
    {
      icon: <ShieldCheck className="text-blue-600" size={20} />,
      iconBg: 'bg-blue-50',
      title: 'Quản lý Chuỗi cung ứng',
      description: 'Kiểm soát kho bãi và vận chuyển linh hoạt.',
    },
    {
      icon: <Zap className="text-purple-600" size={20} />,
      iconBg: 'bg-purple-50',
      title: 'Tối ưu Quy trình',
      description: 'Giảm thiểu phế phẩm và thời gian dừng máy.',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {dataStatsCardMockup.map((card, index) => (
        <div 
          key={index} 
          className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3 hover:shadow-md hover:border-gray-200/60 transition duration-300"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
            {card.icon}
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-gray-800 text-xs md:text-sm leading-tight">
              {card.title}
            </h3>
            <p className="text-[10px] md:text-xs text-gray-400 leading-relaxed">
              {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCard;
