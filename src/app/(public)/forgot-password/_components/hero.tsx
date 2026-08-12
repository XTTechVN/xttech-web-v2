const Hero = () => {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
        Quản lý nội bộ báo cáo an toàn cho
        <br />
        <span className="text-[#006666]">Doanh nghiệp</span>
      </h1>
      <p className="text-xs md:text-sm text-gray-500 leading-relaxed max-w-xl">
        Giải pháp ERP toàn diện giúp doanh nghiệp quản lý dây chuyền sản xuất, theo dõi kho hàng và kiểm soát chất lượng sản phẩm trong thời gian thực.
      </p>
    </div>
  );
};

export default Hero;
