// Thành phần dùng chung cho toàn trang
import { Heading } from '@/components';

// Kiểu dữ liệu cho props
interface IntroProps {
  step: 1 | 2;
}

const Intro = ({ step }: IntroProps) => {
  return (
    <div className="flex flex-col gap-4">
      <Heading size="h1" className="text-primary">
        Quên mật khẩu?
      </Heading>
      <p className="text-gray-500 text-sm">
        {step === 1
          ? 'Đừng lo lắng, chúng tôi sẽ gửi mã xác nhận đến email của bạn để lấy lại mật khẩu.'
          : 'Vui lòng nhập mã OTP được gửi đến email và mật khẩu mới của bạn'} {step === 2 && <><br /><span className="text-xs text-primary mt-2">Lưu ý OTP có thời gian trong 5 phút và chỉ dùng được 1 lần</span></>}
      </p>
    </div>
  );
};

export default Intro;
