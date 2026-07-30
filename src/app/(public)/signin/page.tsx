// Các thành phần dùng riêng cho trang đăng nhập
import LoginIntro from './_components/login-intro';
import LoginForm from './_components/login-form';
import LoginOption from './_components/login-option';
import Hero from './_components/hero';
import PreviewSystem from './_components/preview-system';
import StatCard from './_components/stats-card';

const Signin = () => {
  return (
    <div className="w-full m-auto md:h-auto md:w-[95%] md:max-w-300 bg-white md:border md:border-gray-300 md:rounded-lg md:shadow-lg md:shadow-gray-200 p-6 md:p-10 overflow-y-auto md:overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Cột trái: Đăng nhập */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 lg:border-r lg:border-gray-200 lg:pr-10">
          <LoginIntro />
          <LoginForm />
          <LoginOption />
        </div>

        {/* Cột phải: Minh họa hệ thống */}
        <div className="hidden md:flex col-span-12 lg:col-span-7 flex-col gap-8 lg:pl-2 justify-between">
          <Hero />
          <StatCard />
          <PreviewSystem />
        </div>
      </div>
    </div>
  );
};

export default Signin;
