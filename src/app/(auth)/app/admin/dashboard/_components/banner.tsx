const Banner = () => {
  // Lấy ngày giờ dộng

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 md:gap-4">
        <h1 className="text-2xl md:text-3xl lg:text-4xl text-primary font-bold tracking-tight">
          XTTECH xin chào ! Quyên
        </h1>
      </div>
      <p className="text-xs md:text-sm font-medium">
        Quản lý nội bộ báo cáo an toàn cho doanh nghiệp của bạn
      </p>
    </div>
  );
};

export default Banner;
