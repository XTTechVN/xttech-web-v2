import { Users, Building2, ShieldCheck, Zap } from 'lucide-react';

const FEATURES = [
  {
    icon: <Users className="w-6 h-6 text-primary" />,
    title: 'Quản lý nhân sự',
    description: 'Theo dõi thông tin, hiệu suất và lộ trình phát triển của từng nhân viên một cách dễ dàng.',
  },
  {
    icon: <Building2 className="w-6 h-6 text-primary" />,
    title: 'Cơ cấu phòng ban',
    description: 'Xây dựng và tổ chức sơ đồ phòng ban linh hoạt, đáp ứng mọi quy mô doanh nghiệp.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-primary" />,
    title: 'Bảo mật dữ liệu',
    description: 'Dữ liệu được mã hóa và bảo vệ an toàn với các tiêu chuẩn bảo mật hàng đầu thế giới.',
  },
  {
    icon: <Zap className="w-6 h-6 text-primary" />,
    title: 'Hiệu suất vượt trội',
    description: 'Tối ưu hóa tốc độ xử lý giúp tiết kiệm thời gian và nâng cao trải nghiệm người dùng.',
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">Tính năng nổi bật</h2>
          <p className="text-base md:text-xl text-gray-600 leading-relaxed">
            Tất cả những công cụ bạn cần để quản lý đội ngũ và phát triển doanh nghiệp đều có sẵn tại đây.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURES.map((feature, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-primary mb-1.5">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
